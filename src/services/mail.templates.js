const shell = (title, content) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
    <h2 style="color:#2563eb">${title}</h2>${content}
    <p style="color:#6b7280;font-size:13px">Pollify Team</p>
  </div>`;

export const verificationEmail = (name, otp, expiresIn) => ({
  subject: "Verify your Pollify account",
  text: `Hello ${name}, your verification code is ${otp}. It expires in ${expiresIn}.`,
  html: shell(
    "Verify your Pollify account",
    `<p>Hello ${name},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</p><p>It expires in ${expiresIn}.</p>`
  ),
});

export const passwordResetEmail = (name, resetUrl) => ({
  subject: "Reset your Pollify password",
  text: `Hello ${name}, reset your password using this link: ${resetUrl}. This link expires in 15 minutes.`,
  html: shell(
    "Reset your password",
    `<p>Hello ${name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes.</p>`
  ),
});

export const passwordChangedEmail = (name) => ({
  subject: "Your Pollify password was changed",
  text: `Hello ${name}, your Pollify password was changed. If this was not you, contact support immediately.`,
  html: shell(
    "Password changed",
    `<p>Hello ${name},</p><p>Your password was changed. If this was not you, contact support immediately.</p>`
  ),
});
