const { getProducts } = require("../controllers/product.controller");
const Product = require("../models/product.model");

jest.mock("../models/product.model");

describe("getProducts Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { query: { skip: 0, limit: 10 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should return products successfully", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ _id: "1" }])
    });

    await getProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle server error", async () => {
    Product.find.mockImplementation(() => { throw new Error("fail"); });
    await getProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
