const cron = require('node-cron');
const prisma = require('../config/db'); // Adjust the path as needed
const nodemailer = require('nodemailer');

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send reminder email
async function sendReminderEmail(user, daysLeft) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Reminder: Please Verify Your Email',
    text: `Hello ${user.first_name},\n\nPlease verify your email to complete your registration. Your verification code is: ${user.email_verification_token}\n\nYou have ${daysLeft} days left to verify your email. If you do not verify your email within this time, your account will be deleted.\n\nRegards,\nYourApp Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending reminder email to ${user.email}:`, error);
  }
}

// task scheduled to run daily at midnight to delete unverified users
cron.schedule(process.env.USER_DELETE_SCHEDULE, async () => {
  console.log('Scheduled task started: Checking for unverified users');

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find and delete users who registered more than a week ago and have not verified their email
    const deletedUsers = await prisma.users.deleteMany({
      where: {
        email_verified: false,
        created_at: {
          lt: oneWeekAgo
        }
      }
    });

    console.log(`Deleted ${deletedUsers.count} unverified users`);
  } catch (error) {
    console.error('Error deleting unverified users:', error);
  }

  console.log('Scheduled task completed');
});

// task scheduled to run daily at midnight to send reminder emails 3 days after registration
cron.schedule(process.env.USER_REMINDER_3_DAYS_SCHEDULE, async () => {
  console.log('Scheduled task started: Sending reminder emails to unverified users (3 days)');

  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find users who registered more than 3 days ago and have not verified their email
    const usersToRemind = await prisma.users.findMany({
      where: {
        email_verified: false,
        created_at: {
          lt: threeDaysAgo
        }
      }
    });

    for (const user of usersToRemind) {
      await sendReminderEmail(user, 4); // 4 days left to verify
    }

    console.log(`Sent reminder emails to ${usersToRemind.length} users`);
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }

  console.log('Scheduled task completed');
});

// task scheduled to run daily at midnight to send reminder emails 6 days after registration
cron.schedule(process.env.USER_REMINDER_6_DAYS_SCHEDULE, async () => {
  console.log('Scheduled task started: Sending reminder emails to unverified users (6 days)');

  try {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    // Find users who registered more than 6 days ago and have not verified their email
    const usersToRemind = await prisma.users.findMany({
      where: {
        email_verified: false,
        created_at: {
          lt: sixDaysAgo
        }
      }
    });

    for (const user of usersToRemind) {
      await sendReminderEmail(user, 1); // 1 day left to verify
    }

    console.log(`Sent reminder emails to ${usersToRemind.length} users`);
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }

  console.log('Scheduled task completed');
});