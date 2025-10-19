// src/tests/setup.js — for isolated Jest controller tests (no DB)

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    connect: jest.fn(),
    connection: { close: jest.fn() },
  };
});

process.env.JWT_SECRET = "test_jwt_secret";

afterEach(() => {
  jest.clearAllMocks();
});
