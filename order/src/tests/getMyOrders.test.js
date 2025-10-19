const { getMyOrders } = require("../controllers/order.controller");
const orderModel = require("../models/order.model");

jest.mock("../models/order.model");

describe("getMyOrders Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "user123" }, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should return orders", async () => {
    orderModel.countDocuments.mockResolvedValue(2);
    orderModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ _id: "o1" }]),
    });

    await getMyOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle error", async () => {
    orderModel.countDocuments.mockRejectedValue(new Error("fail"));
    await getMyOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
