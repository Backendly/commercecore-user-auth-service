const bcrypt = require('bcrypt');
const prisma = require('../config/db'); // Correct path to Prisma client instance
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Signup
async function signup(req, res) {
  const { email, password, first_name, last_name, user_type, app_id, api_token } = req.body;

  if (!api_token) {
    return res.status(400).json({ message: 'Developer API token is required for signup.' });
  }

  if (!app_id) {
    return res.status(400).json({ message: 'Organization ID (app_id) is required for signup.' });
  }

  try {
    // Fetch the developer by API token
    const developer = await prisma.developers.findUnique({
      where: { api_token: api_token, is_active: true },
      include: {
        developer_organizations: {
          include: {
            organizations: true
          }
        }
      }
    });

    if (!developer) {
      return res.status(403).json({ message: 'Invalid or inactive developer token.' });
    }

    // Check if the organization belongs to the developer
    const organization = developer.developer_organizations.find(org => org.app_id === app_id);

    if (!organization) {
      return res.status(400).json({ message: 'Organization not found.' });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        user_type,
        organization_id: app_id,
        developer_id: developer.id
      }
    });

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Service',
      text: `Hello ${first_name},\n\nThank you for signing up!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'An error occurred during signup.' });
  }
}

// Login
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await prisma.tokens.create({
      data: {
        user_id: user.id,
        token
      }
    });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login.' });
  }
}

// Logout
async function logout(req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    await prisma.tokens.deleteMany({
      where: { token }
    });
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'An error occurred during logout.' });
  }
}

// Password Reset
async function requestPasswordReset(req, res) {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    await prisma.password_reset_tokens.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt
      }
    });

    // Send email with reset token
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Hello ${user.first_name},\n\nYou requested a password reset. Use the following token to reset your password: ${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(200).json({ message: 'Password reset token generated' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    const resetToken = await prisma.password_reset_tokens.findUnique({ where: { token } });
    if (!resetToken || resetToken.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: resetToken.user_id },
      data: { password_hash: hashedPassword }
    });

    await prisma.password_reset_tokens.delete({ where: { id: resetToken.id } });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Validate User ID
async function validateUserId(req, res) {
  const { userId } = req.params;

  try {
    const user = await prisma.users.findUnique({ where: { id: parseInt(userId, 10) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User ID is valid', user });
  } catch (error) {
    console.error('Error validating user ID:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
module.exports = {
  signup,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  validateUserId 
};