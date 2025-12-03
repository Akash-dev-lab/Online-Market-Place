// listener.js (FINAL OPTIMIZED)
const sellerModel = require("../models/seller.model");
const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const paymentModel = require("../models/payment.model");

const { subscribeToQueue } = require("./broker");

// Removes any _id before insert/update
function stripId(obj) {
  const clone = { ...obj };
  delete clone._id;
  return clone;
}

module.exports = async function () {
  console.log("📡 Seller Dashboard Listener Started...");

  // -----------------------------
  // 🟦 USER CREATED (Seller)
  // -----------------------------
  subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
    const clean = stripId(user);

    await sellerModel.updateOne(
      { email: clean.email },         // find existing seller
      { $setOnInsert: clean },        // only insert if not exists
      { upsert: true }                // avoids duplicate email
    );

    console.log("✔ Seller synced:", clean.email);
  });

  // -----------------------------
  // 🟧 PRODUCT CREATED
  // -----------------------------
  subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", async (product) => {
    const clean = stripId(product);

    await productModel.updateOne(
      { productId: clean._Id }, // unique field from product service
      { $set: clean },
      { upsert: true }
    );

    console.log("✔ Product synced:", clean.productId);
  });

  // -----------------------------
  // 🟩 ORDER CREATED
  // -----------------------------
  subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async (order) => {
    const clean = stripId(order);

    await orderModel.updateOne(
      { orderId: clean.orderId },
      { $set: clean },
      { upsert: true }
    );

    console.log("✔ Order synced:", clean.orderId);
  });

  // -----------------------------
  // 🟪 PAYMENT CREATED
  // -----------------------------
  subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", async (payment) => {
    const clean = stripId(payment);

    await paymentModel.updateOne(
      { orderId: clean.orderId },
      { $set: clean },
      { upsert: true }
    );

    console.log("✔ Payment Created Synced:", clean.orderId);
  });

  // -----------------------------
  // 🟫 PAYMENT UPDATE
  // -----------------------------
  subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATE", async (payment) => {
    const clean = stripId(payment);

    await paymentModel.updateOne(
      { orderId: clean.orderId },
      { $set: clean }
    );

    console.log("✔ Payment Updated Synced:", clean.orderId);
  });
};
