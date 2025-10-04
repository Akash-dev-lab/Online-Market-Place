const { clearCart } = require("../controllers/cart.controller");
const cartModel = require("../models/cart.model");

jest.mock("../models/cart.model");

describe("clearCart controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 404 if cart not found", async () => {
    cartModel.findOne.mockResolvedValue(null);

    await clearCart(req, res);

    expect(cartModel.findOne).toHaveBeenCalledWith({ user: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
  });

  it("should clear all items in the cart and return updated cart", async () => {
    const mockCart = {
      items: [
        { productId: { toString: () => "prod123" }, quantity: 2 },
        { productId: { toString: () => "anotherProd" }, quantity: 1 },
      ],
      save: jest.fn(),
    };
    cartModel.findOne.mockResolvedValue(mockCart);

    await clearCart(req, res);

    expect(mockCart.items.length).toBe(0);
    expect(mockCart.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cart cleared successfully",
      cart: mockCart,
    });
  });

  it("should handle already empty cart gracefully", async () => {
    const mockCart = {
      items: [],
      save: jest.fn(),
    };
    cartModel.findOne.mockResolvedValue(mockCart);

    await clearCart(req, res);

    expect(mockCart.items.length).toBe(0);
    expect(mockCart.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cart cleared successfully",
      cart: mockCart,
    });
  });
});
