// controllers/profileController.js
const prisma = require('../config/db'); // Import Prisma instance
const deleteProfileQueue = require('../queues/deleteProfileQueue'); // Import the queue
const { publishProfileDeleted } = require('../publishers/profilePublisher'); // Import the publisher

// Get the authenticated user's or developer's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null; // Assuming JWT middleware sets the user ID
    const developerId = req.headers['x-developer-id']; // Developer ID provided in headers

    let profile;
    let response;

    if (userId) {
      profile = await prisma.user_profiles.findUnique({
        where: { user_id: userId },
        include: { users: true }, // To include user details
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Customize the response for user profile
      response = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        address: profile.address,
        profile_picture_url: profile.profile_picture_url,
        email: profile.users.email, // Include user email
      };
    } else if (developerId) {
      profile = await prisma.developer_profiles.findUnique({
        where: { developer_id: developerId },
        include: { developers: true }, // To include developer details
      });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Customize the response for developer profile
      response = {
        name: profile.name,
        phone_number: profile.phone_number,
        address: profile.address,
        profile_picture_url: profile.profile_picture_url,
        email: profile.developers.email, // Include developer email
      };
    } else {
      return res.status(400).json({ message: 'User ID or Developer ID is required' });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'An error occurred while fetching the profile', error: error.message });
  }
};

// Update the authenticated user's or developer's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null; // Assuming JWT middleware sets the user ID
    const developerId = req.headers['x-developer-id']; // Developer ID provided in headers
    const { first_name, last_name, phone_number, address, profile_picture_url, name } = req.body;

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

    let updatedProfile;
    let response;

    if (userId) {
      updatedProfile = await prisma.user_profiles.update({
        where: { user_id: userId },
        data: updateData,
      });

      // Customize the response for user profile
      response = {
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        phone_number: updatedProfile.phone_number,
        address: updatedProfile.address,
        profile_picture_url: updatedProfile.profile_picture_url,
      };
    } else if (developerId) {
      const developerUpdateData = {
        name,
        phone_number,
        address,
        profile_picture_url,
        updated_at: new Date(),
      };

      updatedProfile = await prisma.developer_profiles.update({
        where: { developer_id: developerId },
        data: developerUpdateData,
      });

      // Customize the response for developer profile
      response = {
        name: updatedProfile.name,
        phone_number: updatedProfile.phone_number,
        address: updatedProfile.address,
        profile_picture_url: updatedProfile.profile_picture_url,
      };
    }

    res.json({ message: 'Profile updated successfully', profile: response });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'An error occurred while updating profile', error: error.message });
  }
};

// Delete a user or developer profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null; // Assuming JWT middleware sets the user ID
    const developerId = req.headers['x-developer-id']; // Developer ID provided in headers

    if (userId) {
      // Delete user profile
      await prisma.user_profiles.delete({
        where: { user_id: userId },
      });

      // Delete user record
      await prisma.users.delete({
        where: { id: userId },
      });

      // Optionally, delete related tokens and other data
      await prisma.tokens.deleteMany({
        where: { user_id: userId },
      });
      await prisma.otp_tokens.deleteMany({
        where: { user_id: userId },
      });
      await prisma.password_reset_tokens.deleteMany({
        where: { user_id: userId },
      });

      // Publish the user profile deleted event
      await publishProfileDeleted('user', userId);

    } else if (developerId) {
      // Mark developer profile as deleted
      await prisma.developer_profiles.update({
        where: { developer_id: developerId },
        data: { deleted_at: new Date() },
      });

      // Mark developer record as deleted
      await prisma.developers.update({
        where: { id: developerId },
        data: { deleted_at: new Date() },
      });

      // Optionally, mark related tokens and other data as deleted
      await prisma.tokens.updateMany({
        where: { developer_id: developerId },
        data: { deleted_at: new Date() },
      });

      // Add a job to the queue to delete the profile after 60 days
      await deleteProfileQueue.add(
        { developerId },
        { delay: 60 * 24 * 60 * 60 * 1000 } // 60 days in milliseconds
      );

      // Publish the developer profile deleted event
      await publishProfileDeleted('developer', developerId);
    }

    res.json({ message: 'Profile marked as deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'An error occurred while deleting profile', error: error.message });
  }
};