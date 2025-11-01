const nodemailer = require("nodemailer");

// Create reusable transporter using SMTP environment variables (works with cPanel or Gmail)
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"; // true for 465
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS; // App Password for Gmail or cPanel mailbox password

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

const sendOtpMail = async (email, otp) => {
  try {

    const mailOptions = {
      from: `"MegaJobNepal" <${smtpUser}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family:Arial,sans-serif; padding:10px;">
          <h2>OTP Verification</h2>
          <p>Your verification code is:</p>
          <h3 style="color:#007bff;">${otp}</h3>
          <p>This code will expire in 5 minutes.</p>
          <p>Thank you for registering at MegaJobNepal!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully to:", email);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendOtpMail;