const { registerController } = require("../controllers/auth.controller");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { publishToQueue } = require("../broker/broker");

jest.mock("../models/user.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../broker/broker");

describe("registerController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "user",
        password: "123456",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  it("should register user successfully", async () => {
    userModel.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPwd");
    userModel.create.mockResolvedValue({
      _id: "uid1",
      username: { firstName: "John", lastName: "Doe" },
      email: "john@example.com",
      role: "user",
      addresses: [],
    });
    jwt.sign.mockReturnValue("mocktoken");

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "user registered successfully.",
      })
    );
  });

  it("should return 409 if user already exists", async () => {
    userModel.findOne.mockResolvedValue(true);
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should handle internal errors", async () => {
    userModel.findOne.mockRejectedValue(new Error("fail"));
    await registerController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
