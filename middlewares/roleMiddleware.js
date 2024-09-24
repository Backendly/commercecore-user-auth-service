const prisma = require('../config/db');// Prisma instance

async function authorizeRole(requiredRole) {
  return async (req, res, next) => {
    const userId = req.user.userId; // Assuming user is attached via JWT middleware

    const userRoles = await prisma.user_roles.findMany({
      where: { user_id: userId },
      include: { roles: true }
    });

    const hasRole = userRoles.some((ur) => ur.roles.name === requiredRole);

    if (!hasRole) {
      return res.status(403).json({ message: 'Access denied: Insufficient role' });
    }

    next();
  };
}

module.exports = authorizeRole;
