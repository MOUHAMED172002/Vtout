const express = require("express");
const { Order, Payment } = require("../models");

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

    // map provider status to your statuses
    let paymentStatus = "pending";
    if (String(providerStatus).toLowerCase() === "paid" || String(providerStatus).toLowerCase() === "successful") {
      paymentStatus = "paid";
    } else if (String(providerStatus).toLowerCase() === "failed") {
      paymentStatus = "failed";
    }

    // update payments row(s)
    await Payment.update(
      {
        status: paymentStatus,
        provider_metadata: payload,
      },
      { where: { order_id: orderId } }
    );

    // update order status if paid
    if (paymentStatus === "paid") {
      await Order.update({ status: "paid" }, { where: { id: orderId } });
    } else if (paymentStatus === "failed") {
      await Order.update({ status: "payment_failed" }, { where: { id: orderId } });
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error("webhook handler error", err);
    return res.status(500).send("error");
  }
});

module.exports = router;