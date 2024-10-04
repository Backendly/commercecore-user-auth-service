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

// Create a new user profile
exports.createProfile = async (req, res) => {
  try {
    const { user_id, developer_id, first_name, last_name, phone_number, address, profile_picture_url } = req.body;

    const newProfile = await prisma.user_profiles.create({
      data: {
        user_id,
        developer_id,
        first_name,
        last_name,
        phone_number,
        address,
        profile_picture_url,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'An error occurred while creating profile', error: error.message });
  }
};

// Update the authenticated user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming JWT middleware sets the user ID
    const { first_name, last_name, phone_number, address, profile_picture_url } = req.body;

    // Create an object to hold the updated fields
    const updateData = {
      first_name,
      last_name,
      phone_number,
      address,
      updated_at: new Date(),
    };

    // Add profile_picture_url to updateData only if it is provided
    if (profile_picture_url) {
      updateData.profile_picture_url = profile_picture_url;
    }

    const updatedProfile = await prisma.user_profiles.update({
      where: { user_id: userId },
      data: updateData,
    });

    res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'An error occurred while updating profile', error: error.message });
  }
};

// Delete a user profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming JWT middleware sets the user ID

    const deletedProfile = await prisma.user_profiles.delete({
      where: { user_id: userId },
    });

    res.json({ message: 'Profile deleted successfully', profile: deletedProfile });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'An error occurred while deleting profile', error: error.message });
  }
};