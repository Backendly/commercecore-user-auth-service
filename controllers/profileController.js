const prisma = require('../config/db'); // Import Prisma instance

// Get the authenticated user's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming JWT middleware sets the user ID

    const userProfile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
      include: { users: true }, // To include user details
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'An error occurred while fetching profile', error: error.message });
  }
};

// Update the authenticated user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming JWT middleware sets the user ID
    const { first_name, last_name, phone_number, address, profile_picture_url } = req.body;

    const updatedProfile = await prisma.user_profiles.update({
      where: { user_id: userId },
      data: {
        first_name,
        last_name,
        phone_number,
        address,
        profile_picture_url,
        updated_at: new Date(),
      },
    });

    res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'An error occurred while updating profile', error: error.message });
  }
};
