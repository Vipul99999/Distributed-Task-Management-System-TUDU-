// Email templates for various authentication flows

interface EmailTemplate {
  subject: string;
  text: (params: { [key: string]: string }) => string;
  html: (params: { [key: string]: string }) => string;
}

// Common styling variables
const styles = {
  colors: {
    primary: "#0070f3",
    text: "#333333",
    background: "#ffffff",
    border: "#eaeaea",
  },
  fonts: {
    main: "Arial, sans-serif",
  },
};

// Signup verification email template
export const signupVerification: EmailTemplate = {
  subject: "Verify Your Email",
  text: ({ confirmLink }) => `
Welcome to Base Auth!

Thank you for creating an account with us. To complete your registration, please verify your email address by clicking the button below:
${confirmLink}

This link will expire in 15 minutes.

If you didn't create an account, you can safely ignore this email.

Best regards,
Auth Team
  `,
  html: ({ confirmLink }) => `
    <div style="
      font-family: ${styles.fonts.main};
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: ${styles.colors.background};
      border: 1px solid ${styles.colors.border};
      border-radius: 5px;
    ">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: ${styles.colors.primary}; margin: 0;">Welcome to Base Auth!</h2>
      </div>
      
      <div style="color: ${styles.colors.text}; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
        <p>Thank you for creating an account with us. To complete your registration, please verify your email address by clicking the button below:</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${confirmLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: ${styles.colors.primary};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Verify Email Address</a>
      </div>

      <div style="color: ${styles.colors.text}; font-size: 14px; line-height: 20px;">
        <p>This will expire in <span style="font-weight: bold;">15 minutes</span>. If you didn't create an account, you can safely ignore this email.</p>
        <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: ${styles.colors.primary};">${confirmLink}</p>
      </div>

      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid ${styles.colors.border};
        color: ${styles.colors.text};
        font-size: 14px;
        text-align: center;
      ">
        <p>Best regards,<br>Auth Team</p>
      </div>
    </div>
  `,
};

// Password reset email template
export const passwordReset: EmailTemplate = {
  subject: "Password Reset Request",
  text: ({ resetLink }) => `
Password Reset Request

We received a request to reset your password. Click the link below to set a new password:
${resetLink}

This link will expire in 10 minutes.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
Auth Team
  `,
  html: ({ resetLink }) => `
    <div style="
      font-family: ${styles.fonts.main};
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: ${styles.colors.background};
      border: 1px solid ${styles.colors.border};
      border-radius: 5px;
    ">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: ${styles.colors.primary}; margin: 0;">Password Reset Request</h2>
      </div>
      
      <div style="color: ${styles.colors.text}; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: ${styles.colors.primary};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Reset Password</a>
      </div>

      <div style="color: ${styles.colors.text}; font-size: 14px; line-height: 20px;">
        <p>This link will expire in <span style="font-weight: bold;">10 minutes</span>. If you didn't request a password reset, you can safely ignore this email.</p>
        <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: ${styles.colors.primary};">${resetLink}</p>
      </div>

      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid ${styles.colors.border};
        color: ${styles.colors.text};
        font-size: 14px;
        text-align: center;
      ">
        <p>Best regards,<br>Auth Team</p>
      </div>
    </div>
  `,
};

// Resend verification email template
export const resendVerification: EmailTemplate = {
  subject: "Verify Your Email",
  text: ({ confirmLink }) => `
Action Required: Email Verification

We received a request to verify your email address. Please verify your email address by clicking the link below:
${confirmLink}

This link will expire in 15 minutes.

If you didn't request this verification email, you can safely ignore it.

Best regards,
The Team
  `,
  html: ({ confirmLink }) => `
    <div style="
      font-family: ${styles.fonts.main};
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: ${styles.colors.background};
      border: 1px solid ${styles.colors.border};
      border-radius: 5px;
    ">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: ${styles.colors.primary}; margin: 0;">Email Verification Required</h2>
      </div>
      
      <div style="color: ${styles.colors.text}; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
        <p>We received a request to verify your email address. Please click the button below to verify your email:</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${confirmLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: ${styles.colors.primary};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Verify Email Address</a>
      </div>

      <div style="color: ${styles.colors.text}; font-size: 14px; line-height: 20px;">
        <p>This will expire in <span style="font-weight: bold;">15 minutes</span>. If you didn't request this verification email, you can safely ignore it.</p>
        <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: ${styles.colors.primary};">${confirmLink}</p>
      </div>

      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid ${styles.colors.border};
        color: ${styles.colors.text};
        font-size: 14px;
        text-align: center;
      ">
        <p>Best regards,<br>Auth Team</p>
      </div>
    </div>
  `,
};
