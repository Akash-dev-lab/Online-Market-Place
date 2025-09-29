jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake.jwt.token"),
}));

const request = require("supertest");
const app = require("../app");
const connectDB = require("../db/db");

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    await connectDB();
  });

  it("creates a user and returns 201 with user (no password)", async () => {
    const payload = {
      firstName: "Akash",
      lastName: "God",
      email: "akash@example.com",
      addresses: [
        {
          street: "Sanjya Nagar",
          city: "Ghaziabad",
          state: "Uttar Pradesh",
          zip: "201003",
          country: "India",
        },
      ],
      password: "123456",
      role: "user",
    };

    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBeTruthy();
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects duplicate username/email with 409", async () => {
    const payload = {
      firstName: "Akash",
      lastName: "God",
      email: "akash@example.com",
      addresses: [
        {
          street: "Sanjya Nagar",
          city: "Ghaziabad",
          state: "Uttar Pradesh",
          zip: "201003",
          country: "India",
        },
      ],
      password: "123456",
      role: "user",
    };

    await request(app).post("/api/auth/register").send(payload).expect(201);
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(409);
  });

  it("validates missing fields with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
  });
});
