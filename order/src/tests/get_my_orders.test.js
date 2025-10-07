const request = require("supertest");
const app = require("../app");
const orderModel = require("../models/order.model");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

let mongoServer;
const mockedUserId = new mongoose.Types.ObjectId("64f3b9c9a5e6f123456789ab");

jest.mock("../middlewares/auth.middleware", () =>
  jest.fn(() => (req, res, next) => {
    req.user = { id: mockedUserId, role: "user" };
    next();
  })
);

// ----- Setup Test DB -----
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoServer.getUri(), {
    dbName: "testDB"
  });
});

afterEach(async () => {
  await orderModel.deleteMany();
  jest.clearAllMocks();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) await mongoServer.stop();
}, 30000);

// ----- Helper Function to Generate Orders -----
const generateOrders = (count, user = mockedUserId) =>
  Array.from({ length: count }).map(() => ({
    user,
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        quantity: 1,
        price: { amount: 500, currency: "INR" },
      },
    ],
    shippingAddress: {
      street: "Main Street",
      city: "Ghaziabad",
      postalCode: "201010",
      country: "India",
    },
    totalPrice: { amount: 500, currency: "INR" },
    status: "PENDING",
  }));

// ----- Tests -----
describe("GET /api/orders/me", () => {
  test("returns paginated orders with meta and default page=1", async () => {
    await orderModel.insertMany(generateOrders(2));

    const res = await request(app)
      .get("/api/orders/me")
      .set("Authorization", `Bearer faketoken`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.data.length).toBe(2);
  });

  test("respects page and limit query parameters", async () => {
    await orderModel.insertMany(generateOrders(15));

    const res = await request(app)
      .get("/api/orders/me?page=2&limit=5")
      .set("Authorization", `Bearer faketoken`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
  });

  test("returns empty list when user has no order", async () => {
    const anotherUserId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get("/api/orders/me")
      .set("Authorization", `Bearer faketoken`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });
});
