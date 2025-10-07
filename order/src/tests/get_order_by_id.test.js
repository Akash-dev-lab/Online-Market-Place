const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const orderModel = require("../models/order.model");

let mongoServer;
let token;
let userId;

jest.setTimeout(30000); // ⏱️ Increase global Jest timeout

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Ensure clean connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, { dbName: "testDB" });

  userId = new mongoose.Types.ObjectId();
  token = jwt.sign({ id: userId.toString(), role: "user" }, process.env.JWT_SECRET_KEY || "testsecret");
});

afterEach(async () => {
  // Safe cleanup
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

describe("GET /api/orders/:id", () => {
  test("should return order by ID with success", async () => {
    const order = await orderModel.create({
      user: userId,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: { amount: 500, currency: "INR" },
        },
      ],
      shippingAddress: {
        name: "Home",
        street: "123 Main St",
        city: "Ghaziabad",
        state: "UP",
        zip: "201001",
        phone: "9876543210",
        country: "India",
      },
      totalPrice: { amount: 500, currency: "INR" },
      status: "PENDING",
      paymentStatus: "NOT PAID",
      paymentMethod: "N/A",
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id.toString()).toBe(order._id.toString());
    expect(res.body.data.user.toString()).toBe(userId.toString());
  });

  test("should return 400 for non-existing order", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/orders/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/order not found/i);
  });

  test("should return 403 if user tries to access another user's order", async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const order = await orderModel.create({
      user: otherUserId,
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: { amount: 500, currency: "INR" },
        },
      ],
      shippingAddress: {
        name: "Home",
        street: "123 Main St",
        city: "Ghaziabad",
        state: "UP",
        zip: "201001",
        phone: "9876543210",
        country: "India",
      },
      totalPrice: { amount: 500, currency: "INR" },
      status: "PENDING",
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  test("should return 400 for invalid order ID format", async () => {
    const res = await request(app)
      .get(`/api/orders/invalid-id`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
