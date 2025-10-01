const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')

// Mock the project's redis helper so tests don't connect to a real Redis instance.
// Adjust the path if your redis helper is located elsewhere.
jest.mock('../db/redis.js', () => {
	const mock = {
		del: jest.fn().mockResolvedValue(1),
		on: jest.fn()
	}
	return mock
})

const redis = require('../db/redis')

let app

beforeAll(() => {
	app = express()
	app.use(cookieParser())

	// Load the project's auth router. If it's not present or throws, let the error surface so tests fail.
	const authRouter = require('../routes/auth.routes')

	app.use('/api/auth', authRouter)
})

afterEach(() => {
	jest.clearAllMocks()
})

test('GET /api/auth/logout clears cookie and deletes session in redis', async () => {
	const res = await request(app)
		.get('/api/auth/logout')
		.set('Cookie', 'sid=abc123')
		.expect(200)

	expect(res.body).toEqual({ message: 'Logged out' })
	expect(redis.del).toHaveBeenCalledWith('abc123')

	const setCookie = res.headers['set-cookie']
	expect(setCookie).toBeDefined()
	expect(setCookie.some((s) => /sid=;/i.test(s))).toBe(true)
})

test('GET /api/auth/logout with no session cookie clears cookie and does not call redis.del', async () => {
	const res = await request(app).get('/api/auth/logout').expect(200)

	expect(res.body).toEqual({ message: 'Logged out' })
	expect(redis.del).not.toHaveBeenCalled()

	const setCookie = res.headers['set-cookie']
	expect(setCookie).toBeDefined()
	expect(setCookie.some((s) => /sid=;/i.test(s))).toBe(true)
})

test('GET /api/auth/logout returns 500 when redis.del fails', async () => {
	redis.del.mockRejectedValueOnce(new Error('redis error'))

	const res = await request(app)
		.get('/api/auth/logout')
		.set('Cookie', 'sid=willfail')
		.expect(500)

	expect(res.body).toEqual({ message: 'Logout failed' })
	expect(redis.del).toHaveBeenCalledWith('willfail')
})