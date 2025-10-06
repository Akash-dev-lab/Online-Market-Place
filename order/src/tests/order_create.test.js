const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const orderModel = require('../models/order.model');
const { createOrder } = require('../controllers/order.controller');
const axios = require('axios');

jest.mock('axios'); // Mock axios
jest.mock('../models/order.model'); // Mock Mongoose model

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Mock auth middleware
  app.use((req, res, next) => {
    req.user = { id: 'user123' };
    next();
  });

  app.post('/api/orders', createOrder);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Order Controller - createOrder', () => {
  it('should create order successfully', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('cart')) {
        return Promise.resolve({
          data: {
            cart: {
              items: [
                { productId: 'prod1', quantity: 2 },
                { productId: 'prod2', quantity: 1 },
              ],
            },
          },
        });
      } else if (url.includes('products')) {
        return Promise.resolve({
          data: {
            products: [
              { _id: 'prod1', title: 'Product 1', stock: 10, price: { amount: 100, currency: 'INR' } },
              { _id: 'prod2', title: 'Product 2', stock: 5, price: { amount: 50, currency: 'INR' } },
            ],
          },
        });
      }
    });

    orderModel.create.mockResolvedValue({
      _id: 'order123',
      user: 'user123',
      items: [
        { product: 'prod1', quantity: 2, price: { amount: 200, currency: 'INR' } },
        { product: 'prod2', quantity: 1, price: { amount: 50, currency: 'INR' } },
      ],
      totalPrice: { amount: 250, currency: 'INR' },
      status: 'PENDING',
      shippingAddress: '123 Test Street',
    });

    const res = await request(app)
      .post('/api/orders')
      .send({ shippingAddress: '123 Test Street' })
      .set('Cookie', ['token=mocktoken']);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Order created successfully');
    expect(res.body.order).toHaveProperty('_id', 'order123');
  });

  it('should return 404 if product not found', async () => {
    axios.get.mockResolvedValueOnce({
      data: { cart: { items: [{ productId: 'nonexistent', quantity: 1 }] } },
    });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    const res = await request(app)
      .post('/api/orders')
      .send({ shippingAddress: '123 Test Street' })
      .set('Cookie', ['token=mocktoken']);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: 'Product not found for ID: nonexistent',
    });
  });

  it('should return 400 if product out of stock', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('cart')) {
        return Promise.resolve({
          data: { cart: { items: [{ productId: 'prod1', quantity: 10 }] } },
        });
      } else if (url.includes('products')) {
        return Promise.resolve({
          data: {
            products: [{ _id: 'prod1', title: 'Product 1', stock: 5, price: { amount: 100, currency: 'INR' } }],
          },
        });
      }
    });

    const res = await request(app)
      .post('/api/orders')
      .send({ shippingAddress: '123 Test Street' })
      .set('Cookie', ['token=mocktoken']);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: 'Out of Stock: Only 5 left for "Product 1"',
    });
  });

  it('should handle internal server errors', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const res = await request(app)
      .post('/api/orders')
      .send({ shippingAddress: '123 Test Street' })
      .set('Cookie', ['token=mocktoken']);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message', 'Internal server error');
    expect(res.body).toHaveProperty('error', 'Network error');
  });
});
