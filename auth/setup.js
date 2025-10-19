// src/tests/setup.js

// Mock mongoose to prevent real DB connections:
jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
    connection: {
      close: jest.fn(() => Promise.resolve()),
      on: jest.fn(),
      db: { collections: jest.fn().mockResolvedValue([]) },
    },
  };
});

process.env.JWT_SECRET_KEY = "test_secret";
process.env.JWT_SECRET = "test_secret";
process.env.REDIS_URL = "redis://mock";

afterEach(() => {
  jest.clearAllMocks();
});

// ✅ Ensures no open handles (Jest clean exit)
afterAll(async () => {
  const mongoose = require("mongoose");
  if (mongoose.connection.close) await mongoose.connection.close();
  jest.restoreAllMocks();
});
