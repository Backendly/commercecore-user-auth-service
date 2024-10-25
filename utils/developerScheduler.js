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
async function sendReminderEmail(developer, daysLeft) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: developer.email,
    subject: 'Reminder: Please Verify Your Email',
    text: `Hello ${developer.name},\n\nPlease verify your email to complete your registration. Your verification code is: ${developer.email_verification_token}\n\nYou have ${daysLeft} days left to verify your email. If you do not verify your email within this time, your account will be deleted.\n\nRegards,\nYourApp Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${developer.email}`);
  } catch (error) {
    console.error(`Error sending reminder email to ${developer.email}:`, error);
  }
}

// task scheduled to run daily at midnight to delete unverified developers
cron.schedule(process.env.DEVELOPER_DELETE_SCHEDULE, async () => {
  console.log('Scheduled task started: Checking for unverified developers');

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find and delete developers who registered more than a week ago and have not verified their email
    const deletedDevelopers = await prisma.developers.deleteMany({
      where: {
        email_verified: false,
        created_at: {
          lt: oneWeekAgo
        }
      }
    });

    console.log(`Deleted ${deletedDevelopers.count} unverified developers`);
  } catch (error) {
    console.error('Error deleting unverified developers:', error);
  }

  console.log('Scheduled task completed');
});

//task schedule to run daily at midnight to send reminder emails 3 days after registration
cron.schedule(process.env.DEVELOPER_REMINDER_3_DAYS_SCHEDULE, async () => {
  console.log('Scheduled task started: Sending reminder emails to unverified developers (3 days)');

  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find developers who registered more than 3 days ago and have not verified their email
    const developersToRemind = await prisma.developers.findMany({
      where: {
        email_verified: false,
        created_at: {
          lt: threeDaysAgo
        }
      }
    });

    for (const developer of developersToRemind) {
      await sendReminderEmail(developer, 4); // 4 days left to verify
    }

    console.log(`Sent reminder emails to ${developersToRemind.length} developers`);
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }

  console.log('Scheduled task completed');
});

//task schedule to run daily at midnight to send reminder emails 6 days after registration
cron.schedule(process.env.DEVELOPER_REMINDER_6_DAYS_SCHEDULE, async () => {
  console.log('Scheduled task started: Sending reminder emails to unverified developers (6 days)');

  try {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    // Find developers who registered more than 6 days ago and have not verified their email
    const developersToRemind = await prisma.developers.findMany({
      where: {
        email_verified: false,
        created_at: {
          lt: sixDaysAgo
        }
      }
    });

    for (const developer of developersToRemind) {
      await sendReminderEmail(developer, 1); // 1 day left to verify
    }

    console.log(`Sent reminder emails to ${developersToRemind.length} developers`);
  } catch (error) {
    console.error('Error sending reminder emails:', error);
  }

  console.log('Scheduled task completed');
});