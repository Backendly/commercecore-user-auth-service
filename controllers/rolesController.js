const prisma = require('../config/db'); // Import Prisma instance

// Create a new role
exports.createRole = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newRole = await prisma.roles.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'An error occurred while creating role', error: error.message });
  }
};

// Assign a role to a user
exports.assignRoleToUser = async (req, res) => {
  const { roleId, userId } = req.body;

  try {
    const assignedRole = await prisma.user_roles.create({
      data: {
        role_id: roleId,
        user_id: userId,
      },
    });

    res.status(201).json({ message: 'Role assigned to user successfully', userRole: assignedRole });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    res.status(500).json({ message: 'An error occurred while assigning role', error: error.message });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'An error occurred while fetching roles', error: error.message });
  }
};
