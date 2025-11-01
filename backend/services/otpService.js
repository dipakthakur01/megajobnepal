const nodemailer = require('nodemailer');

// Debug: Log environment variables (without exposing the password)
console.log('🔍 Debug - SMTP_USER:', process.env.SMTP_USER || process.env.EMAIL_USER);
console.log('🔍 Debug - SMTP_PASS length:', (process.env.SMTP_PASS || process.env.EMAIL_PASS) ? (process.env.SMTP_PASS || process.env.EMAIL_PASS).length : 'undefined');

// Create transporter using generic SMTP (works with cPanel or Gmail)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS; // App Password for Gmail or mailbox password for cPanel

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000,
  socketTimeout: 10000,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
    console.log('Please ensure you have:');
    console.log('1. If using Gmail: enable 2FA and generate an App Password');
    console.log('2. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in environment');
    console.log('3. Or fallback: set EMAIL_USER and EMAIL_PASS in your environment');
  } else {
    console.log('Email service is ready to send emails');
  }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {number} otp - 6-digit OTP code
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendOtpMail = async (email, otp) => {
  try {
    const mailOptions = {
      from: {
        name: 'MegaJobNepal',
        address: smtpUser
      },
      to: email,
      subject: 'Your OTP for MegaJobNepal Account Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">MegaJobNepal</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Your Gateway to Dream Jobs</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Account Verification</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Hello! Thank you for signing up with MegaJobNepal. To complete your account verification, please use the following One-Time Password (OTP):
            </p>
            
            <div style="background-color: #f0f8ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h3 style="color: #2563eb; margin: 0 0 10px 0; font-size: 18px;">Your OTP Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <div style="background-color: #fef3cd; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> This OTP will expire in 5 minutes. Please do not share this code with anyone.
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin-top: 25px;">
              If you didn't request this verification, please ignore this email or contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © 2024 MegaJobNepal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

module.exports = sendOtpMail;