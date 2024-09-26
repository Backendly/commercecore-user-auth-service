const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { signup, login, logout, requestPasswordReset, resetPassword, validateUserId } = require('../controllers/authController');
const prisma = require('../config/db'); // Adjust the path to your Prisma client instance

jest.mock('../config/db', () => ({
  developers: {
    findUnique: jest.fn(),
  },
  users: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  tokens: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  password_reset_tokens: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('nodemailer');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should sign up a new user', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          first_name: 'First',
          last_name: 'Last',
          user_type: 'user',
          app_id: 'app-id',
          api_token: 'developer-token',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockDeveloper = {
        id: 1,
        api_token: 'developer-token',
        is_active: true,
        developer_organizations: [
          {
            app_id: 'app-id',
            organizations: {},
          },
        ],
      };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);
      bcrypt.hash.mockResolvedValue('hashed-password');
      prisma.users.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        first_name: 'First',
        last_name: 'Last',
        organization_id: 'app-id',
        developer_id: 1,
      });

      const transporter = {
        sendMail: jest.fn((mailOptions, callback) => callback(null, { response: 'Email sent' })),
      };
      nodemailer.createTransport.mockReturnValue(transporter);

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: {
          id: 1,
          email: 'test@example.com',
          firstname: 'First',
          lastname: 'Last',
          appid: 'app-id',
          developerid: 1,
        },
      });
    });

    it('should return 400 if developer API token is missing', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          first_name: 'First',
          last_name: 'Last',
          user_type: 'user',
          app_id: 'app-id',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Developer API token is required for signup.' });
    });

    // Add more tests for other scenarios...
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'user',
      };

      prisma.users.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('jwt-token');
      prisma.tokens.create.mockResolvedValue({});

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'jwt-token',
      });
    });

    it('should return 400 if email or password is missing', async () => {
      const req = {
        body: {
          email: 'test@example.com',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    // Add more tests for other scenarios...
  });

  describe('logout', () => {
    it('should log out a user', async () => {
      const req = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.tokens.deleteMany.mockResolvedValue({});

      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });

    // Add more tests for other scenarios...
  });

  describe('requestPasswordReset', () => {
    it('should request a password reset', async () => {
      const req = {
        body: {
          email: 'test@example.com',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'First',
      };

      prisma.users.findUnique.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue(Buffer.from('reset-token'));
      prisma.password_reset_tokens.create.mockResolvedValue({});

      const transporter = {
        sendMail: jest.fn((mailOptions, callback) => callback(null, { response: 'Email sent' })),
      };
      nodemailer.createTransport.mockReturnValue(transporter);

      await requestPasswordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset token generated' });
    });

    // Add more tests for other scenarios...
  });

  describe('resetPassword', () => {
    it('should reset the password', async () => {
      const req = {
        body: {
          token: 'reset-token',
          newPassword: 'newpassword123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockResetToken = {
        id: 1,
        token: 'reset-token',
        user_id: 1,
        expires_at: new Date(Date.now() + 3600000),
      };

      prisma.password_reset_tokens.findUnique.mockResolvedValue(mockResetToken);
      bcrypt.hash.mockResolvedValue('hashed-new-password');
      prisma.users.update.mockResolvedValue({});
      prisma.password_reset_tokens.delete.mockResolvedValue({});

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successful' });
    });

    // Add more tests for other scenarios...
  });

  describe('validateUserId', () => {
    it('should validate a user ID', async () => {
      const req = {
        params: {
          userId: 1,
        },
        headers: {
          'x-api-token': 'developer-token',
          'x-app-id': 'app-id',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockDeveloper = {
        id: 1,
        api_token: 'developer-token',
        is_active: true,
        developer_organizations: [
          {
            app_id: 'app-id',
            organizations: {},
          },
        ],
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'First',
        last_name: 'Last',
        organization_id: 'app-id',
        developer_id: 1,
      };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);
      prisma.users.findUnique.mockResolvedValue(mockUser);

      await validateUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User ID is valid',
        user: {
          id: 1,
          email: 'test@example.com',
          firstname: 'First',
          lastname: 'Last',
          appid: 'app-id',
          developerid: 1,
        },
      });
    });

    // Add more tests for other scenarios...
  });
});