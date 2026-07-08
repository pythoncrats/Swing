const nodemailer = require('nodemailer');

// If SMTP credentials are not configured, we fall back to logging the email
// to the console so you can develop/test without a real mail server.
const isSmtpConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    console.log('\n================ DEV EMAIL (SMTP not configured) ================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text}`);
    console.log('===================================================================\n');
    return { dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
};

module.exports = sendEmail;
