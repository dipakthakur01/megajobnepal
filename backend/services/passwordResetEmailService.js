const nodemailer = require('nodemailer');

// SMTP configuration (supports cPanel or Gmail App Password)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  tls: { rejectUnauthorized: false },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetUrl - Fully qualified reset URL
 */
const sendPasswordResetMail = async (email, resetUrl) => {
  const mailOptions = {
    from: {
      name: 'MegaJobNepal',
      address: smtpUser,
    },
    to: email,
    subject: 'Reset your MegaJobNepal password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 24px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
          <h2 style="margin: 0 0 12px; color: #111827;">Reset your password</h2>
          <p style="color: #4b5563; line-height: 1.6;">We received a request to reset the password for your MegaJobNepal account. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600;">Set New Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #1f2937; font-size: 14px;">${resetUrl}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Password reset email sent:', info.messageId);
  return { success: true, messageId: info.messageId };
};

module.exports = sendPasswordResetMail;