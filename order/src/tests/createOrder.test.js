const { createOrder } = require("../controllers/order.controller");
const orderModel = require("../models/order.model");
const axios = require("axios");

jest.mock("../models/order.model");
jest.mock("axios");

describe("createOrder Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      cookies: { token: "fake-token" },
      headers: {},
      body: { shippingAddress: "Test Address" },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should create an order successfully", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { cart: { items: [{ productId: "p1", quantity: 1 }] } } })
      .mockResolvedValueOnce({
        data: {
          products: [{ _id: "p1", title: "Product", stock: 10, price: { amount: 100, currency: "INR" } }],
        },
      });

    orderModel.create.mockResolvedValue({ _id: "o1", status: "PENDING" });

    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Order created successfully" })
    );
  });

  it("should return 404 if product not found", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { cart: { items: [{ productId: "p1", quantity: 1 }] } } })
      .mockResolvedValueOnce({ data: { products: [] } });

    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle server error", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network fail"));
    await createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
