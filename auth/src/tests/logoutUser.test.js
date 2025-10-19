const { logoutUser } = require("../controllers/auth.controller");
const redis = require("../db/redis");

jest.mock("../db/redis", () => ({ set: jest.fn() }));

describe("logoutUser", () => {
  it("should logout successfully", async () => {
    const req = { cookies: { token: "mocktoken" } };
    const res = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await logoutUser(req, res);
    expect(redis.set).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
