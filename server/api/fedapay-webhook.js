import express from "express";
import { Order } from "../models/index.js";

const router = express.Router();

// If Fedapay provides a signature header, verify it here (implementation depends on provider).
router.post("/", async (req, res) => {
  try {
    // SECURITY: Verify that the request comes from Fedapay
    // In production, compare a custom secret header or verify IP.
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
    if (secret && req.headers['x-fedapay-secret'] !== secret) {
      console.warn("UNAUTHORIZED WEBHOOK ATTEMPT BLOCKED.");
      return res.status(403).send("Forbidden");
    }

    const payload = req.body;
    // Example : provider may include metadata.order_id
    const orderId = payload?.metadata?.order_id ?? payload?.order_id ?? null;
    const providerStatus = payload?.status ?? payload?.payment_status ?? null;

    if (!orderId) {
      console.warn("webhook received without order_id in payload", payload);
      return res.status(400).send("missing order id");
    }

    // map provider status to your internal statuses
    let payment_status = "en_attente";
    let order_status = "en_attente";

    if (String(providerStatus).toLowerCase() === "paid" || String(providerStatus).toLowerCase() === "successful") {
      payment_status = "payé";
      order_status = "confirmée"; // Passer l'ordre en confirmé dès que c'est payé
    } else if (String(providerStatus).toLowerCase() === "failed" || String(providerStatus).toLowerCase() === "declined") {
      payment_status = "non_payé";
      order_status = "annulée";
    }

    // update order
    await Order.update(
      {
        payment_status: payment_status,
        status: order_status,
        payment_id: payload?.id || orderId, // Stocker l'ID de transaction FedaPay
      },
      { where: { id: orderId } }
    );

    console.log(`[Webhook] Order ${orderId} updated to ${payment_status}/${order_status}`);

    return res.status(200).send("ok");
  } catch (err) {
    console.error("webhook handler error", err);
    return res.status(500).send("error");
  }
});

export default router;