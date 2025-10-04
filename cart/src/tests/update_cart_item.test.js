const { updateCartItem } = require("../controllers/cart.controller");
const cartModel = require("../models/cart.model");

jest.mock("../models/cart.model");

describe("updateCartItem controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { productId: "prod123" },
      body: { qty: 5 },
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

    await updateCartItem(req, res);

    expect(cartModel.findOne).toHaveBeenCalledWith({ user: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
  });

  it("should return 404 if item not found in cart", async () => {
    const mockCart = {
      items: [{ productId: { toString: () => "anotherProd" }, quantity: 2 }],
      save: jest.fn(),
    };
    cartModel.findOne.mockResolvedValue(mockCart);

    await updateCartItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Item not found in cart",
    });
  });

  it("should update item quantity and return updated cart", async () => {
    const mockCart = {
      items: [{ productId: { toString: () => "prod123" }, quantity: 2 }],
      save: jest.fn(),
    };
    cartModel.findOne.mockResolvedValue(mockCart);

    await updateCartItem(req, res);

    expect(mockCart.items[0].quantity).toBe(5);
    expect(mockCart.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cart item updated",
      cart: mockCart,
    });
  });
});
