const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')

// Mock the project's redis helper so tests don't connect to a real Redis instance.
// Adjust the path if your redis helper is located elsewhere.
jest.mock('../db/redis.js', () => {
	const mock = {
		set: jest.fn().mockResolvedValue('OK'),
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

test('GET /api/auth/logout clears cookie and blacklists token in redis', async () => {
	const res = await request(app)
		.get('/api/auth/logout')
		.set('Cookie', 'token=abc123')
		.expect(200)

	expect(res.body).toEqual({ message: 'Logged out successfully' })
	expect(redis.set).toHaveBeenCalledWith('blacklist:abc123', 'true', 'EX', 24 * 60 * 60)

	const setCookie = res.headers['set-cookie']
	expect(setCookie).toBeDefined()
	expect(setCookie.some((s) => /token=;/i.test(s))).toBe(true)
})

test('GET /api/auth/logout with no token cookie clears cookie and does not call redis.set', async () => {
	const res = await request(app).get('/api/auth/logout').expect(200)

	expect(res.body).toEqual({ message: 'Logged out successfully' })
	expect(redis.set).not.toHaveBeenCalled()

	const setCookie = res.headers['set-cookie']
	expect(setCookie).toBeDefined()
	expect(setCookie.some((s) => /token=;/i.test(s))).toBe(true)
})

test('GET /api/auth/logout returns 500 when redis.set fails', async () => {
	redis.set.mockRejectedValueOnce(new Error('redis error'))

	await request(app)
		.get('/api/auth/logout')
		.set('Cookie', 'token=willfail')
		.expect(500)

	expect(redis.set).toHaveBeenCalledWith('blacklist:willfail', 'true', 'EX', 24 * 60 * 60)
})