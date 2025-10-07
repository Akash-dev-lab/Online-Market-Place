const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const orderModel = require("../models/order.model");

let mongoServer;
let token;
let otherToken;
let userId;
let otherUserId;

jest.setTimeout(30000); // ⏱️ Ensure enough time for in-memory DB

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Reset & connect cleanly
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, { dbName: "testDB_cancel_order" });

  // ✅ Mock users
  userId = new mongoose.Types.ObjectId();
  otherUserId = new mongoose.Types.ObjectId();

  token = jwt.sign(
    { id: userId.toString(), role: "user" },
    process.env.JWT_SECRET_KEY || "testsecret"
  );
  otherToken = jwt.sign(
    { id: otherUserId.toString(), role: "user" },
    process.env.JWT_SECRET_KEY || "testsecret"
  );
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await orderModel.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("POST /api/orders/:id/cancel", () => {
  test("✅ should cancel order successfully if pending or paid", async () => {
    const order = await orderModel.create({
      user: userId,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: { amount: 100, currency: "INR" },
        },
      ],
      shippingAddress: {
        name: "Akash",
        street: "123 Main St",
        city: "Ghaziabad",
        state: "UP",
        zip: "201001",
        phone: "9876543210",
        country: "India",
      },
      totalPrice: { amount: 100, currency: "INR" },
      status: "PENDING",
      paymentStatus: "NOT PAID",
    });

    const res = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  test("❌ should return 403 if user tries to cancel another user's order", async () => {
    const order = await orderModel.create({
      user: otherUserId,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: { amount: 200, currency: "INR" },
        },
      ],
      shippingAddress: {
        name: "Other",
        street: "456 Park Ave",
        city: "Noida",
        state: "UP",
        zip: "201301",
        phone: "9999999999",
        country: "India",
      },
      totalPrice: { amount: 200, currency: "INR" },
      status: "PENDING",
      paymentStatus: "NOT PAID",
    });

    const res = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test("❌ should return 400 if order status is shipped or delivered", async () => {
    const shippedOrder = await orderModel.create({
      user: userId,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: { amount: 300, currency: "INR" },
        },
      ],
      shippingAddress: {
        name: "Akash",
        street: "Block A",
        city: "Ghaziabad",
        state: "UP",
        zip: "201001",
        phone: "9876543210",
        country: "India",
      },
      totalPrice: { amount: 300, currency: "INR" },
      status: "SHIPPED",
      paymentStatus: "PAID",
    });

    const res = await request(app)
      .post(`/api/orders/${shippedOrder._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot cancel/i);
  });

  test("❌ should return 400 for invalid order ID format", async () => {
    const res = await request(app)
      .post(`/api/orders/invalid-id/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test("❌ should return 404 for non-existing order", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/orders/${fakeId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
