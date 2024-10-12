const jwt = require('jsonwebtoken');
const { isTokenExpired } = require('../utils/tokenUtils');
const prisma = require('../config/db');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  if (isTokenExpired(token)) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assuming the token contains userId
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const checkRolePermission = (requiredRole, requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.user ? req.user.userId : null;
    const developerId = req.headers['x-developer-id'];

    if (!userId && !developerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
      let roles = [];
      let permissions = [];

      if (userId) {
        const userRoles = await prisma.user_roles.findMany({
          where: { user_id: userId },
          include: { roles: true }
        });
        roles = userRoles.map(ur => ur.roles.name);
        const userPermissions = await prisma.role_permissions.findMany({
          where: { role_id: { in: userRoles.map(ur => ur.role_id) } },
          include: { permissions: true }
        });
        permissions = userPermissions.map(up => up.permissions.name);
      } else if (developerId) {
        const developerRoles = await prisma.developer_organizations.findMany({
          where: { developer_id: developerId },
          include: { roles: true }
        });
        roles = developerRoles.map(dr => dr.roles.name);
        const developerPermissions = await prisma.role_permissions.findMany({
          where: { role_id: { in: developerRoles.map(dr => dr.role_id) } },
          include: { permissions: true }
        });
        permissions = developerPermissions.map(dp => dp.permissions.name);
      }

      console.log('Roles:', roles);
      console.log('Permissions:', permissions);

      const hasRequiredRole = roles.includes(requiredRole);
      const hasRequiredPermission = permissions.includes(requiredPermission);

      if (!hasRequiredRole || !hasRequiredPermission) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = {
  authenticate,
  checkRolePermission
};