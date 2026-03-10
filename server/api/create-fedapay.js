const express = require("express");
const fetch = require("node-fetch");
const { Order, Payment } = require("../models");

const router = express.Router();
const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET;

if (!FEDAPAY_SECRET) {
  console.warn("Warning: missing FEDAPAY_SECRET in env");
}

router.post("/", async (req, res) => {
  try {
    const { order_id, amount, currency = "XOF", callback_url } = req.body;
    if (!order_id || !amount || !callback_url) {
      return res.status(400).json({ error: "order_id, amount and callback_url are required" });
    }

    // Verify order exists using Sequelize
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(400).json({ error: "Order not found" });

    // Call Fedapay API
    const fedapayResp = await fetch("https://api.fedapay.com/v1/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FEDAPAY_SECRET}`,
      },
      body: JSON.stringify({
        amount,
        currency,
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
        amount,
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

module.exports = router;