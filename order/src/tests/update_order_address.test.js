const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app"); // ✅ app.js se import karo
const orderModel = require("../../src/models/order.model");

let mongoServer;
let token, otherToken, userId, otherUserId, order;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // ensure clean connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri, { dbName: "testDB" });

  userId = new mongoose.Types.ObjectId();
  otherUserId = new mongoose.Types.ObjectId();

  process.env.JWT_SECRET_KEY = "testsecret";;
  token = jwt.sign({ id: userId.toString(), role: "user" }, process.env.JWT_SECRET_KEY);
  otherToken = jwt.sign({ id: otherUserId.toString(), role: "user" }, process.env.JWT_SECRET_KEY);
});

afterEach(async () => {
  await orderModel.deleteMany({});
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (err) {
    console.error("Error closing mongoose connection:", err);
  }
  if (mongoServer) await mongoServer.stop();
});

describe("PATCH /api/orders/:id/address", () => {
  beforeEach(async () => {
    // create an order for main user before each test
    order = await orderModel.create({
      user: userId,
      items: [
        { product: new mongoose.Types.ObjectId(), quantity: 1, price: { amount: 100, currency: "INR" } },
      ],
      shippingAddress: {
        name: "Old Address",
        street: "123 Old St",
        city: "Old City",
        state: "OS",
        zip: "111111",
        phone: "9999999999",
        country: "India",
      },
      totalPrice: { amount: 100, currency: "INR" },
      status: "PENDING",
      paymentStatus: "NOT PAID",
    });
  });

  it("should update delivery address successfully before payment capture", async () => {
    const newAddress = {
      name: "New Address",
      street: "456 New St",
      city: "New City",
      state: "NS",
      zip: "222222",
      phone: "8888888888",
      country: "India",
    };

    const res = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddress: newAddress });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.shippingAddress.name).toBe("New Address");
  });

  it("should return 403 if user tries to update another user's order", async () => {
    const res = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ shippingAddress: { name: "Hack" } });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it("should return 400 for invalid order ID format", async () => {
    const res = await request(app)
      .patch("/api/orders/invalid-id/address")
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddress: { name: "Invalid" } });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should return 404 for non-existing order", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/orders/${fakeId}/address`)
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddress: { name: "Fake" } });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should return 400 if order already paid or captured", async () => {
    // update order to PAID
    order.paymentStatus = "PAID";
    await order.save();

    const res = await request(app)
      .patch(`/api/orders/${order._id}/address`)
      .set("Authorization", `Bearer ${token}`)
      .send({ shippingAddress: { name: "Late" } });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot update address/i);
  });
});
