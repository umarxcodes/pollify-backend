import nodemailer from "nodemailer";
import mailConfig from "../config/mail.config.js";

class MailService {
  #transporter;

  constructor() {
    // Create Nodemailer transporter with SMTP config
    this.#transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth,
    });

    // Fail fast if required SMTP env vars are missing
    if (
      !mailConfig.host ||
      !mailConfig.auth.user ||
      !mailConfig.auth.pass ||
      !mailConfig.from.address
    ) {
      throw new Error(
        "SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM must be configured"
      );
    }
  }

  // Send an email with optional HTML and text bodies
  sendMail = async (options) => {
    const mailOptions = {
      from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    return this.#transporter.sendMail(mailOptions);
  };
}

export const mailService = new MailService();
