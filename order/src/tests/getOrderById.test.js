/**
 * ✅ getOrderById.test.js — final fixed version
 * Works without any DB, mocks mongoose + orderModel properly.
 */

const { getOrderById } = require("../controllers/order.controller");
const orderModel = require("../models/order.model");
const mongoose = require("mongoose");

jest.mock("../models/order.model");

describe("getOrderById Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "user123" }, params: { id: "oid1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it("should return order details successfully", async () => {
    // ✅ Correctly mock isValid() to return true
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    // ✅ Mock successful order belonging to same user
    orderModel.findById.mockResolvedValue({
      _id: "oid1",
      user: "user123",
      status: "PENDING",
      createdAt: new Date(),
      totalPrice: { amount: 100, currency: "INR" },
      toObject: () => ({ _id: "oid1", user: "user123" }),
    });

    await getOrderById(req, res);

    expect(orderModel.findById).toHaveBeenCalledWith("oid1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          _id: "oid1",
          paymentSummary: expect.any(Object),
          timeline: expect.any(Array),
        }),
      })
    );
  });

  it("should return 400 for invalid id", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

    await getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid order ID format.",
      })
    );
  });

  it("should return 403 if order not owned by user", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    orderModel.findById.mockResolvedValue({
      _id: "oid1",
      user: "otherUser",
      status: "PENDING",
      createdAt: new Date(),
      totalPrice: { amount: 100, currency: "INR" },
      toObject: () => ({ _id: "oid1", user: "otherUser" }),
    });

    await getOrderById(req, res);

    expect(orderModel.findById).toHaveBeenCalledWith("oid1");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Forbidden"),
      })
    );
  });
});
