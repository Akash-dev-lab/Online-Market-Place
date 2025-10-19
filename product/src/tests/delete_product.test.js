const { deleteProduct } = require("../controllers/product.controller");
const Product = require("../models/product.model");

jest.mock("../models/product.model");

describe("deleteProduct Controller", () => {
  let req, res, mockProduct;

  beforeEach(() => {
    req = { params: { id: "1" }, user: { id: "seller123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockProduct = { seller: "seller123" };
  });

  it("should delete product successfully", async () => {
    Product.findById.mockResolvedValue(mockProduct);
    Product.findByIdAndDelete.mockResolvedValue(true);
    await deleteProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if product not found", async () => {
    Product.findById.mockResolvedValue(null);
    await deleteProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 if user not owner", async () => {
    mockProduct.seller = "other";
    Product.findById.mockResolvedValue(mockProduct);
    await deleteProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
