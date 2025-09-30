// ensure JWT secret is available for controllers that sign tokens
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'test_jwt_secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../app');
const connectDB = require('../db/db');
const userModel = require('../models/user.model');

describe('GET /api/auth/me', () => {
    beforeAll(async () => {
        await connectDB();
    });

    it('returns 401 when no auth cookie is provided', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token in cookie', async () => {
        const fakeToken = jwt.sign({ id: '000000000000000000000000' }, 'wrong_secret');
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [ `token=${fakeToken}` ]);
        expect(res.status).toBe(401);
    });

    it('returns 200 and current user when valid token cookie is present', async () => {
        const password = 'Secret123!';
        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username: { firstName: 'Me', lastName: 'User' },
            email: 'me@example.com',
            password: hash,
        });

       
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'me@example.com', password });
        expect(loginRes.status).toBe(200);
        const setCookie = loginRes.headers[ 'set-cookie' ];
        expect(setCookie).toBeDefined();


        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', setCookie);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.id).toBe(user._id.toString());
        expect(res.body.user.email).toBe('me@example.com');
        // username is an object with firstName/lastName
        expect(res.body.user.username).toBeDefined();
        expect(res.body.user.username.firstName).toBe('Me');
        expect(res.body.user.username.lastName).toBe('User');
    });
});