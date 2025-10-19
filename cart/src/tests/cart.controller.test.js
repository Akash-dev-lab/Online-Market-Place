/**
 * ✅ cart.controller.test.js — isolated tests (no DB, mocks only)
 */

const {
  addItemToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} = require("../controllers/cart.controller");

const cartModel = require("../models/cart.model");
const axios = require("axios");

jest.mock("../models/cart.model");
jest.mock("axios");

describe("Cart Controller", () => {
  let req, res, mockCart;

  beforeEach(() => {
    req = {
      user: { id: "user123" },
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockCart = {
      user: "user123",
      items: [
        { productId: "p1", quantity: 2 },
        { productId: "p2", quantity: 1 },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    jest.clearAllMocks();
  });

  // -------------------- addItemToCart --------------------
  describe("addItemToCart", () => {
    beforeEach(() => {
      req.body = { productId: "p1", qty: 1 };
    });

    it("should add item successfully", async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: { product: { title: "Test Product", price: { amount: 100 }, Images: [] } },
      });

      cartModel.findOne.mockResolvedValue(null);
      cartModel.mockImplementation(() => mockCart);

      await addItemToCart(req, res);

      expect(cartModel.findOne).toHaveBeenCalledWith({ user: "user123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Item added to cart" })
      );
    });

    it("should return 400 if qty missing", async () => {
      req.body = { productId: "p1" };
      await addItemToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if product not found", async () => {
      axios.get.mockResolvedValue({ status: 404 });
      cartModel.findOne.mockResolvedValue(mockCart);
      await addItemToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // -------------------- getCart --------------------
  describe("getCart", () => {
    it("should return cart with totals", async () => {
      cartModel.findOne.mockResolvedValue(mockCart);
      await getCart(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cart: expect.any(Object),
          totals: expect.objectContaining({ itemCount: 2 }),
        })
      );
    });

    it("should return 404 if no cart", async () => {
      cartModel.findOne.mockResolvedValue(null);
      await getCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // -------------------- updateCartItem --------------------
  describe("updateCartItem", () => {
    beforeEach(() => {
      req.params = { productId: "p1" };
      req.body = { qty: 5 };
    });

    it("should update item quantity successfully", async () => {
      cartModel.findOne.mockResolvedValue(mockCart);
      await updateCartItem(req, res);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if cart not found", async () => {
      cartModel.findOne.mockResolvedValue(null);
      await updateCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 404 if item not found", async () => {
      mockCart.items = [];
      cartModel.findOne.mockResolvedValue(mockCart);
      await updateCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // -------------------- deleteCartItem --------------------
  describe("deleteCartItem", () => {
    beforeEach(() => {
      req.params = { productId: "p1" };
    });

    it("should remove item successfully", async () => {
      cartModel.findOne.mockResolvedValue(mockCart);
      await deleteCartItem(req, res);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if cart not found", async () => {
      cartModel.findOne.mockResolvedValue(null);
      await deleteCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 404 if item missing", async () => {
      mockCart.items = [];
      cartModel.findOne.mockResolvedValue(mockCart);
      await deleteCartItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // -------------------- clearCart --------------------
  describe("clearCart", () => {
    it("should clear all items successfully", async () => {
      cartModel.findOne.mockResolvedValue(mockCart);
      await clearCart(req, res);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockCart.items.length).toBe(0);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if cart not found", async () => {
      cartModel.findOne.mockResolvedValue(null);
      await clearCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
