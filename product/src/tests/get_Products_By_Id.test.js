const { getProductsById } = require("../controllers/product.controller");
const Product = require("../models/product.model");

jest.mock("../models/product.model");

describe("getProductsById Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: "123" } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should return product if found", async () => {
    Product.findById.mockResolvedValue({ _id: "123" });
    await getProductsById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if not found", async () => {
    Product.findById.mockResolvedValue(null);
    await getProductsById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
