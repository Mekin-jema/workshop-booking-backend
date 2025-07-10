// tests/auth.test.js
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = require('./src/app');

// Mock Prisma, bcryptjs, and JWT
jest.mock('@prisma/client', () => {
  const mockUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ user: mockUser })) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashedpassword')),
  compare: jest.fn((plain, hashed) => Promise.resolve(plain === 'correctpassword')),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
}));


describe('Auth Routes (/api/auth)', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        name: 'Mekin',
        email: 'mekin@example.com',
        role: 'CUSTOMER',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Mekin',
          email: 'mekin@example.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toEqual({
        id: 1,
        name: 'Mekin',
        email: 'mekin@example.com',
        role: 'CUSTOMER',
      });
    });

    it('should return 400 if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 999 });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Mekin',
          email: 'mekin@example.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Mekin',
        email: 'mekin@example.com',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'mekin@example.com',
          password: 'correctpassword',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe('fake-jwt-token');
      expect(res.body.user).toEqual({
        id: 1,
        name: 'Mekin',
        email: 'mekin@example.com',
        role: 'CUSTOMER',
      });
    });

    it('should return 401 for invalid credentials', async () => {

      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpass',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});
