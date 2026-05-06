import express from "express";
import { Order } from "../models/index.js";



const router = express.Router();
const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET;

if (!FEDAPAY_SECRET) {
  console.warn("Warning: missing FEDAPAY_SECRET in env");
}

router.post("/", async (req, res) => {
  try {
    const { order_id, callback_url } = req.body;
    if (!order_id || !callback_url) {
      return res.status(400).json({ error: "order_id and callback_url are required" });
    }

    // Verify order exists using Sequelize
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(400).json({ error: "Order not found" });

    // SECURITY: Ensure the requester is the owner of the order OR an admin
    const requesterId = req.auth?.userId;
    const requesterRole = req.auth?.role;
    if (order.user_id && order.user_id !== requesterId && requesterRole !== 'admin') {
        console.warn(`[SECURITY] Unauthorized payment attempt for order ${order_id} by user ${requesterId}`);
        return res.status(403).json({ error: "Unauthorized: You can only pay for your own orders." });
    }


    // SECURITY: Use the amount from the database, NOT from the request body!
    const finalAmount = Math.round(parseFloat(order.total_amount));
    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ error: "Invalid order amount" });
    }

    // Call Fedapay API
    const fedapayResp = await fetch("https://api.fedapay.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FEDAPAY_SECRET}`,
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: "XOF",
        callback_url,
        metadata: { order_id },
      }),
    });


    const fedabody = await fedapayResp.json();
    if (!fedapayResp.ok) {
      console.error("Fedapay create error:", fedabody);
      return res.status(502).json({ error: "Failed to create Fedapay session", detail: fedabody });
    }

    const paymentUrl = fedabody?.data?.url ?? fedabody?.payment_url ?? fedabody?.redirect_url;
    if (!paymentUrl) {
      console.error("No payment URL in provider response", fedabody);
      return res.status(502).json({ error: "No payment url from provider", detail: fedabody });
    }

    // Store payment metadata using Sequelize
    try {
      await Payment.create({
        order_id,
        provider: "fedapay",
        provider_id: fedabody?.data?.id ?? fedabody?.id ?? null,
        amount: finalAmount,
        status: "created",
        provider_metadata: fedabody,
      });

    } catch (e) {
      console.warn("Could not insert payment metadata:", e.message || e);
    }

    return res.json({ url: paymentUrl });
  } catch (err) {
    console.error("create-fedapay error", err);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;