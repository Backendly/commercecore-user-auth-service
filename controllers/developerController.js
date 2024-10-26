const prisma = require("../config/db"); // Use Prisma client instance
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate a numeric OTP using speakeasy
function generateNumericOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: "base32",
    digits: 6,
  });
}

// Register a developer
exports.registerDeveloper = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "name, email, and password are required",
    });
  }

  const dbUser = await prisma.developers.findFirst({ where: { email } });

  if (dbUser) {
    return res.status(409).json({
      error: "A developer with this email already exists.",
      statusCode: 409,
      success: false,
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateNumericOTP();

    // create the developer account
    await prisma.developers.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        is_active: false, // Initially inactive until email is verified
        email_verification_token: emailVerificationToken,
      },
    });

    // Send email verification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      text:
        `Hello ${name},\n\n` +
        `Your email verification code is: ${emailVerificationToken}\n\n` +
        `Please note that this code will expire in 24 hours.\n\n` +
        `Regards,\nBackendly Solutions.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      message: "Developer registered successfully. Please verify your email.",
      statusCode: 201,
      success: true,
    });
  } catch (error) {
    console.error("Error registering developer:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Email Confirmation
exports.emailConfirmation = async (req, res) => {
  const { email, token } = req.body;

  try {
    const developer = await prisma.developers.findUnique({ where: { email } });

    if (!developer || developer.email_verification_token !== token) {
      return res.status(400).json({ message: "Invalid token or email" });
    }

    const apiToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    await prisma.developers.update({
      where: { email },
      data: {
        is_active: true,
        email_verification_token: null,
        email_verified: true,
        api_token: apiToken,
        token_expires_at: expiresAt,
      }, // Ensure email_verified is set to true after a successful verification
    });

    res.status(200).json({
      message: "Email verified successfully",
      apiToken,
      expiresAt,
    });
  } catch (error) {
    console.error("Email confirmation error:", error);
    res.status(500).json({
      error: "An error occurred during email confirmation.",
      nextSteps: "Please try again, contact support if the error persists",
      success: false,
      statusCode: 500,
    });
  }
};
// Retrieve API token
exports.retrieveToken = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const cacheKey = `token:${email}`;
    const cachedToken = await req.cache.get(cacheKey);

    if (cachedToken) {
      return res.status(200).json({
        message: "Token retrieved successfully",
        developer: {
          id: cachedToken.id,
          api_token: cachedToken.api_token,
          expires_at: cachedToken.expires_at,
        },
      });
    }

    const developer = await prisma.developers.findUnique({
      where: { email, is_active: true },
    });

    if (!developer) {
      return res.status(404).json({ error: "Developer not found or inactive" });
    }

    if (!developer.email_verified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      developer.password_hash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const expiresAt = developer.token_expires_at;
    await req.cache.set(cacheKey, {
      id: developer.id,
      api_token: developer.api_token,
      expires_at: expiresAt,
    });

    res.status(200).json({
      message: "Token retrieved successfully",
      developer: {
        id: developer.id,
        api_token: developer.api_token,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving token:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Regenerate API token
exports.regenerateToken = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const developer = await prisma.developers.findUnique({
      where: { email, is_active: true },
    });

    if (!developer) {
      return res.status(404).json({ error: "Developer not found or inactive" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      developer.password_hash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const newApiToken = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    await prisma.developers.update({
      where: { id: developer.id },
      data: { api_token: newApiToken, token_expires_at: expiresAt },
    });

    const cacheKey = `token:${email}`;
    await req.cache.set(cacheKey, {
      id: developer.id,
      api_token: newApiToken,
      expires_at: expiresAt,
    });

    res.status(200).json({
      message: "Token regenerated successfully",
      developer: {
        id: developer.id,
        api_token: newApiToken,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    console.error("Error regenerating token:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email and new password are required" });
  }

  try {
    const developer = await prisma.developers.findUnique({
      where: { email },
    });

    if (!developer) {
      return res.status(404).json({ error: "Developer not found" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.developers.update({
      where: { email },
      data: { password_hash: passwordHash },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Validate developer's API token
exports.validateToken = async (req, res) => {
  const apiToken = req.headers["x-api-token"]; // API token provided in headers

  if (!apiToken) {
    return res.status(400).json({ error: "API token is required" });
  }

  try {
    const cacheKey = `validate:${apiToken}`;
    const cachedDeveloper = await req.cache.get(cacheKey);

    if (cachedDeveloper) {
      return res.status(200).json({
        message: "Valid API token (from cache)",
        developer: { id: cachedDeveloper.id },
      });
    }

    // Fetch developer by API token
    const developer = await prisma.developers.findUnique({
      where: { api_token: apiToken, is_active: true },
    });

    if (!developer) {
      return res
        .status(403)
        .json({ error: "Invalid or inactive developer token" });
    }

    await req.cache.set(cacheKey, { id: developer.id });

    res.status(200).json({
      message: "Valid API token",
      developer: { id: developer.id }, // Return developer's ID
    });
  } catch (error) {
    console.error("Error validating API token:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
