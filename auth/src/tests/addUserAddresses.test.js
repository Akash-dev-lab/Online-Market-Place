const { addUserAddresses } = require("../controllers/auth.controller");
const userModel = require("../models/user.model");

jest.mock("../models/user.model");

describe("addUserAddresses", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: "uid1" },
      body: {
        name: "John",
        street: "Main",
        city: "NY",
        state: "NY",
        zip: "10001",
        phone: "1234567890",
        country: "USA",
      },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it("should add address successfully", async () => {
    userModel.findByIdAndUpdate.mockResolvedValue({
      addresses: [{ _id: "a1" }],
    });
    await addUserAddresses(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if user not found", async () => {
    userModel.findByIdAndUpdate.mockResolvedValue(null);
    await addUserAddresses(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
