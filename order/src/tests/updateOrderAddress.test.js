/**
 * ✅ updateOrderAddress.test.js — final fixed version
 * Fully isolated test — mocks mongoose and orderModel, no DB.
 */

const { updateOrderAddress } = require("../controllers/order.controller");
const orderModel = require("../models/order.model");
const mongoose = require("mongoose");

jest.mock("../models/order.model");

describe("updateOrderAddress Controller", () => {
  let req, res, order;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      params: { id: "oid1" },
      body: { shippingAddress: "New Address" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    order = {
      _id: "oid1",
      user: "user123",
      paymentStatus: "PENDING",
      shippingAddress: "Old Address",
      save: jest.fn().mockResolvedValue(true),
    };

    jest.clearAllMocks();
  });

  it("should update address successfully", async () => {
    // ✅ Correctly mock ObjectId.isValid
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    orderModel.findById.mockResolvedValue(order);

    await updateOrderAddress(req, res);

    expect(orderModel.findById).toHaveBeenCalledWith("oid1");
    expect(order.save).toHaveBeenCalled();
    expect(order.shippingAddress).toBe("New Address");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          shippingAddress: "New Address",
        }),
      })
    );
  });

  it("should return 403 if not owner", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

    order.user = "anotherUser";
    orderModel.findById.mockResolvedValue(order);

    await updateOrderAddress(req, res);

    expect(orderModel.findById).toHaveBeenCalledWith("oid1");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Forbidden"),
      })
    );
  });

  it("should return 400 for invalid id", async () => {
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

    await updateOrderAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid order ID format.",
      })
    );
  });
});
