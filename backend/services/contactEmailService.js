const nodemailer = require('nodemailer');

// SMTP configuration (supports cPanel mailboxes or Gmail App Password)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS; // App Password for Gmail or mailbox password for cPanel

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
 * Send contact form email to configured recipient
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email address (admin-configured)
 * @param {string} params.fromEmail - Sender's email from the form
 * @param {string} params.name - Sender's full name
 * @param {string} params.subject - Subject from the form
 * @param {string} params.category - Selected category
 * @param {string} params.message - Message body
 */
async function sendContactEmail({ toEmail, fromEmail, name, subject, category, message }) {
  const mailOptions = {
    from: {
      name: 'MegaJobNepal Contact',
      address: smtpUser || toEmail,
    },
    to: toEmail,
    replyTo: fromEmail,
    subject: `[Contact] ${subject || 'New message'}${category ? ` - ${category}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; background: #f9fafb;">
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <h2 style="margin: 0 0 12px; color: #111827;">New Contact Message</h2>
          <p style="margin: 0 0 8px; color: #374151;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin: 0 0 8px; color: #374151;"><strong>Email:</strong> ${escapeHtml(fromEmail)}</p>
          ${category ? `<p style="margin: 0 0 8px; color: #374151;"><strong>Category:</strong> ${escapeHtml(category)}</p>` : ''}
          <p style="margin: 12px 0 6px; color: #374151;"><strong>Subject:</strong> ${escapeHtml(subject || 'No subject')}</p>
          <div style="margin-top: 10px; padding: 12px; background: #f3f4f6; border-radius: 6px; color: #1f2937; white-space: pre-wrap;">${escapeHtml(message)}</div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
          <p style="color:#6b7280;font-size:12px;margin:0;">This email was generated from the MegaJobNepal contact form.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { sendContactEmail };