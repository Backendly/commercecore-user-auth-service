const { getProfile } = require('../controllers/profileController');
const prisma = require('../config/db'); // Adjust the path to your Prisma client instance

jest.mock('../config/db', () => ({
  user_profiles: {
    findUnique: jest.fn(),
  },
}));

describe('Profile Controller', () => {
  describe('getProfile', () => {
    it('should fetch the authenticated user\'s profile', async () => {
      const req = {
        user: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUserProfile = {
        user_id: 1,
        bio: 'This is a bio',
        users: {
          id: 1,
          email: 'test@example.com',
          first_name: 'First',
          last_name: 'Last',
        },
      };

      prisma.user_profiles.findUnique.mockResolvedValue(mockUserProfile);

      await getProfile(req, res);

      expect(prisma.user_profiles.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: { users: true },
      });
      expect(res.json).toHaveBeenCalledWith(mockUserProfile);
    });

    it('should return 404 if profile is not found', async () => {
      const req = {
        user: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      prisma.user_profiles.findUnique.mockResolvedValue(null);

      await getProfile(req, res);

      expect(prisma.user_profiles.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: { users: true },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Profile not found' });
    });

    it('should handle server errors', async () => {
      const req = {
        user: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const error = new Error('Server error');
      prisma.user_profiles.findUnique.mockRejectedValue(error);

      await getProfile(req, res);

      expect(prisma.user_profiles.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: { users: true },
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
});