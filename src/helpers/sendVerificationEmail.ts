import nodemailer from 'nodemailer';

export async function sendVerificationEmail({ to, username, verifyUrl }: { to: string, username: string, verifyUrl: string }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@ampora.com',
    to,
    subject: 'Verify your Ampora account',
    html: `
      <h2>Welcome to Ampora, ${username}!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>If you did not sign up, you can ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
