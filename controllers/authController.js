const bcrypt = require('bcrypt');
const prisma = require('../config/db'); // Correct path to Prisma client instance
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy'); // Add speakeasy
const { cacheData, getCachedData } = require('../middlewares/cache'); // Adjust the path as needed

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to generate a numeric OTP using speakeasy
function generateNumericOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: 'base32',
    digits: 6
  });
}

// Signup
async function signup(req, res) {
  const { email, password, first_name, last_name, user_type, app_id, api_token } = req.body;

  if (!api_token || !app_id) {
    return res.status(400).json({ message: 'Developer API token and Organization ID (app_id) are required for signup.' });
  }

  try {
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

    const organization = developer.developer_organizations.find(org => org.app_id === app_id);
    if (!organization) {
      return res.status(400).json({ message: 'Organization not found.' });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateNumericOTP();

    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name,
        last_name,
        user_type,
        organizations: {
          connect: { app_id: app_id }
        },
        developers: {
          connect: { id: developer.id }
        },
        email_verification_token: emailVerificationToken,
        email_verified: false
      }
    });

    // Create user profile
    await prisma.user_profiles.create({
      data: {
        user_id: user.id,
        developer_id: developer.id,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Hello ${user.first_name},\n\nYour email verification code is: ${emailVerificationToken}\n\nPlease note that this code will expire in 24 hours.\n\nRegards,\nYourApp Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      user: {
        id: user.id,
        email: user.email,
        firstname: user.first_name,
        lastname: user.last_name,
        appid: user.organization_id,
        developerid: user.developer_id
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'An error occurred during signup.' });
  }
}

// Email Confirmation
async function emailConfirmation(req, res) {
  const { email, token } = req.body;

  try {
    const cacheKey = `emailConfirmation:${email}`;
    const cachedUser = await req.cache.get(cacheKey);

    if (cachedUser && cachedUser.email_verification_token === token) {
      await prisma.users.update({
        where: { email },
        data: { email_verified: true, email_verification_token: null }
      });

      return res.status(200).json({ message: 'Email verified successfully (from cache)' });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || user.email_verification_token !== token) {
      return res.status(400).json({ message: 'Invalid token or email' });
    }

    await prisma.users.update({
      where: { email },
      data: { email_verified: true, email_verification_token: null }
    });

    await req.cache.set(cacheKey, user);

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email confirmation error:', error);
    return res.status(500).json({ message: 'An error occurred during email confirmation.' });
  }
}

// Regenerate Email Verification OTP
async function regenerateEmailVerificationOTP(req, res) {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const emailVerificationToken = generateNumericOTP(); // Generate a new 6-digit numeric OTP

    await prisma.users.update({
      where: { email },
      data: {
        email_verification_token: emailVerificationToken
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Email Verification Code',
      text: `Hello ${user.first_name},\n\nYour new email verification code is: ${emailVerificationToken}\n\nPlease note that this code will expire in 24 hours.\n\nRegards,\nYourApp Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(200).json({ message: 'New email verification OTP sent to your email' });
  } catch (error) {
    console.error('Error regenerating email verification OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const cacheKey = `login:${email}`;
    const cachedUser = await req.cache.get(cacheKey);

    if (cachedUser) {
      return res.status(200).json({
        message: 'Login successful (from cache)',
        user: cachedUser
      });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { otp_tokens: true } // Include otp_tokens relation
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.email_verified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    const loginVerificationToken = generateNumericOTP(); // Generate a 6-digit numeric OTP

    await prisma.otp_tokens.create({
      data: {
        user_id: user.id,
        otp: loginVerificationToken,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login Verification',
      text: `Hello ${user.first_name},\n\nYour login verification code is: ${loginVerificationToken}\n\nRegards,\nYourApp Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    await req.cache.set(cacheKey, user);

    return res.status(200).json({ message: 'Login verification code sent to your email' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login.' });
  }
}

// Login Validation
async function loginValidation(req, res) {
  const { email, otp, rememberMe } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const cacheKey = `loginValidation:${email}`;
    const cachedUser = await req.cache.get(cacheKey);

    if (cachedUser) {
      const otpToken = cachedUser.otp_tokens.find(token => token.otp === otp && token.expires_at > new Date());
      if (otpToken) {
        const token = jwt.sign({ userId: cachedUser.id, role: cachedUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        if (rememberMe) {
          const rememberToken = jwt.sign({ userId: cachedUser.id, role: cachedUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
          await prisma.tokens.create({
            data: {
              user_id: cachedUser.id,
              token: rememberToken,
              type: 'remember',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          });
        }

        await prisma.tokens.create({
          data: {
            user_id: cachedUser.id,
            token,
            type: 'auth',
            expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
          }
        });

        return res.status(200).json({ message: 'Login successful (from cache)', token });
      }
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { otp_tokens: true } // Include otp_tokens relation
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    const otpToken = user.otp_tokens.find(token => token.otp === otp && token.expires_at > new Date());
    if (!otpToken) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    if (rememberMe) {
      const rememberToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      await prisma.tokens.create({
        data: {
          user_id: user.id,
          token: rememberToken,
          type: 'remember',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
    }

    await prisma.tokens.create({
      data: {
        user_id: user.id,
        token,
        type: 'auth',
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
      }
    });

    await req.cache.set(cacheKey, user);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login validation error:', error);
    return res.status(500).json({ message: 'An error occurred during login validation.' });
  }
}

// Regenerate OTP
async function regenerateOTP(req, res) {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const loginVerificationToken = generateNumericOTP(); // Generate a new 6-digit numeric OTP

    await prisma.otp_tokens.create({
      data: {
        user_id: user.id,
        otp: loginVerificationToken,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Login Verification Code',
      text: `Hello ${user.first_name},\n\nYour new login verification code is: ${loginVerificationToken}\n\nPlease note that this code will expire in 10 minutes.\n\nRegards,\nYourApp Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(200).json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Error regenerating OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Logout
async function logout(req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // Find the user associated with the token
    const userToken = await prisma.tokens.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!userToken || !userToken.user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const user = userToken.user;

    // Check if the user is logged in
    if (!user.is_logged_in) {
      return res.status(403).json({ message: 'User is not logged in' });
    }

    // Delete the token
    await prisma.tokens.deleteMany({ where: { token } });

    // Update the user's is_logged_in status to false
    await prisma.users.update({
      where: { id: user.id },
      data: { is_logged_in: false }
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

    await prisma.tokens.create({
      data: {
        user_id: user.id,
        token,
        type: 'password_reset',
        expires_at: expiresAt
      }
    });

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

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const resetToken = await prisma.tokens.findUnique({ where: { token, type: 'password_reset' } });
    if (!resetToken || resetToken.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: resetToken.user_id },
      data: { password_hash: hashedPassword }
    });

    await prisma.tokens.delete({ where: { id: resetToken.id } });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Validate User ID
async function validateUserId(req, res) {
  const { userId } = req.params;
  const developerToken = req.headers['x-api-token'];
  const organizationId = req.headers['x-app-id'];

  if (!developerToken || !organizationId) {
    return res.status(400).json({ message: 'Developer API token and Organization ID are required' });
  }

  try {
    const cacheKey = `validateUserId:${userId}`;
    const cachedUser = await req.cache.get(cacheKey);

    if (cachedUser) {
      return res.status(200).json({ message: 'User ID is valid' });
    }

    const developer = await prisma.developers.findUnique({
      where: { api_token: developerToken, is_active: true },
      include: {
        developer_organizations: {
          include: {
            organizations: true
          }
        }
      }
    });

    if (!developer) {
      return res.status(403).json({ message: 'Invalid or inactive developer token' });
    }

    const organization = developer.developer_organizations.find(org => org.app_id === organizationId);
    if (!organization) {
      return res.status(400).json({ message: 'Organization not found' });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ message: 'User email not verified' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'User is not active' });
    }

    if (!user.is_logged_in) {
      return res.status(403).json({ message: 'User is not logged in' });
    }

    // Create a new object with only the fields to be cached
    const userToCache = {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      is_logged_in: user.is_logged_in,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    await req.cache.set(cacheKey, userToCache);

    return res.status(200).json({ message: 'User ID is valid' });
  } catch (error) {
    console.error('Error validating user ID:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  signup,
  emailConfirmation,
  login,
  loginValidation,
  logout,
  requestPasswordReset,
  resetPassword,
  validateUserId,
  regenerateOTP,
  regenerateEmailVerificationOTP
};