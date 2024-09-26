const { getRoles } = require('../controllers/rolesController');
const prisma = require('../config/db'); // Adjust the path to your Prisma client instance

jest.mock('../config/db', () => ({
  roles: {
    findMany: jest.fn(),
  },
}));

describe('Roles Controller', () => {
  describe('getRoles', () => {
    it('should fetch all roles successfully', async () => {
      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const mockRoles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ];

      prisma.roles.findMany.mockResolvedValue(mockRoles);

      await getRoles(req, res);

      expect(prisma.roles.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockRoles);
    });

    it('should handle server errors', async () => {
      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const error = new Error('Server error');
      prisma.roles.findMany.mockRejectedValue(error);

      await getRoles(req, res);

      expect(prisma.roles.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'An error occurred while fetching roles',
        error: error.message,
      });
    });
  });
});