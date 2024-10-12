const prisma = require('../config/db');

async function assignRoleToUser(userId, roleName) {
  const role = await prisma.roles.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  await prisma.user_roles.create({
    data: {
      user_id: userId,
      role_id: role.id,
    },
  });
}

async function assignRoleToDeveloper(developerId, appId, roleName) {
  const role = await prisma.roles.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role ${roleName} not found`);
  }

  if (appId) {
    await prisma.developer_organizations.create({
      data: {
        developer_id: developerId,
        app_id: appId,
        role: role.name,
      },
    });
  } else {
    // Handle the case where appId is not available
    await prisma.developer_roles.create({
      data: {
        developer_id: developerId,
        role_id: role.id,
      },
    });
  }
}

module.exports = {
  assignRoleToUser,
  assignRoleToDeveloper,
};