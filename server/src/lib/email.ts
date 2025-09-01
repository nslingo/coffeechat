import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST) {
  throw new Error("SMTP_HOST must be set");
}

if (!process.env.SMTP_PORT) {
  throw new Error("SMTP_PORT must be set");
}

if (!process.env.SMTP_USER) {
  throw new Error("SMTP_USER must be set");
}

if (!process.env.SMTP_PASS) {
  throw new Error("SMTP_PASS must be set");
}

if (!process.env.SMTP_FROM) {
  throw new Error("SMTP_FROM must be set");
}

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailUser {
  email: string;
  name: string;
};

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT!),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(data: EmailData): Promise<void> {
    await this.transporter.sendMail({
      from: `"CoffeeChat" <${process.env.SMTP_FROM}>`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });
  }

  async sendVerificationEmail(user: EmailUser, url: string): Promise<void> {
    const callbackURL = `${process.env.CLIENT_URL}`;
    const modifiedUrl = url.replace('callbackURL=/', `callbackURL=${encodeURIComponent(callbackURL)}`);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Welcome to CoffeeChat!</h2>
        <p>Hi ${user.name}!</p>
        <p>Welcome to CoffeeChat! Click the button below to verify your Cornell email address:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${modifiedUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser: <a href="${modifiedUrl}">${modifiedUrl}</a></p>
        
        <div style="background-color: #fef3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>⚠️ Can't find this email?</strong></p>
          <ol style="margin: 5px 0; font-size: 14px;">
            <li>Check your Junk/Spam folder</li>
            <li>Add noreply@coffeechat.app to your contacts</li>
            <li>Search for "CoffeeChat" in all folders</li>
          </ol>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Still having trouble? Reply to this email for help.<br>
          Best,<br>
          The CoffeeChat Team
        </p>
      </div>
    `;

    const text = `
Hi ${user.name}!

Welcome to CoffeeChat! Click the link below to verify your Cornell email address:
${modifiedUrl}

⚠️ Can't find this email?
1. Check your Junk/Spam folder
2. Add noreply@coffeechat.app to your contacts
3. Search for "CoffeeChat" in all folders

Still having trouble? Reply to this email for help.

Best,
The CoffeeChat Team
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Verify your CoffeeChat account',
      text,
      html
    });
  }

  async sendPasswordResetEmail(user: EmailUser, url: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Reset Your Password</h2>
        <p>Hi ${user.name}!</p>
        <p>Someone requested a password reset for your CoffeeChat account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser: <a href="${url}">${url}</a></p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #dc2626;"><strong>⚠️ Security Notice:</strong></p>
          <p style="margin: 5px 0; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Best,<br>
          The CoffeeChat Team
        </p>
      </div>
    `;

    const text = `
Hi ${user.name}!

Someone requested a password reset for your CoffeeChat account. Click the link below to reset your password:
${url}

⚠️ Security Notice:
If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.

Best,
The CoffeeChat Team
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Reset your CoffeeChat password',
      text,
      html
    });
  }
}

export const emailService = new EmailService();