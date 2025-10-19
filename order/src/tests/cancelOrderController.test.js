/**
 * ✅ cancelOrderController.test.js — fixed and working version
 * No DB used, mocks mongoose + orderModel correctly.
 */

const { cancelOrderController } = require("../controllers/order.controller");
const orderModel = require("../models/order.model");
const mongoose = require("mongoose");

jest.mock("../models/order.model");

describe("cancelOrderController", () => {
  let req, res, order;

  beforeEach(() => {
    req = { user: { id: "user123" }, params: { id: "oid1" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    order = {
      _id: "oid1",
      user: "user123",
      status: "PENDING",
      totalPrice: { amount: 100, currency: "INR" },
      paymentStatus: "Pending",
      paymentMethod: "COD",
      createdAt: new Date(),
      toObject: () => ({
        _id: "oid1",
        user: "user123",
        status: "CANCELLED",
      }),
      save: jest.fn().mockResolvedValue(true),
    };

    jest.clearAllMocks();
  });

  it("should cancel order successfully", async () => {
    // ✅ Correctly mock ObjectId.isValid
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
    orderModel.findById.mockResolvedValue(order);

    await cancelOrderController(req, res);

    expect(orderModel.findById).toHaveBeenCalledWith("oid1");
    expect(order.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          paymentSummary: expect.any(Object),
          timeline: expect.any(Array),
        }),
      })
    );
  });

  it("should return 404 if order not found", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
    orderModel.findById.mockResolvedValue(null);

    await cancelOrderController(req, res);

    expect(orderModel.findById).toHaveBeenCalledWith("oid1");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Order not found.",
      })
    );
  });

  it("should return 400 for invalid id", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

    await cancelOrderController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid order ID format.",
      })
    );
  });
});
