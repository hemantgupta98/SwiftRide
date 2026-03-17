import nodemailer from "nodemailer";

const getMailerConfig = () => {
  const gmailUser = process.env.EMAIL_APP_USER;
  const gmailPass = process.env.EMAIL_APP_PASS;

  if (gmailUser && gmailPass) {
    return {
      mode: "gmail",
      transport: {
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      },
      from: process.env.EMAIL_FROM || gmailUser,
    };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return {
      mode: "smtp",
      transport: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      },
      from: process.env.EMAIL_FROM || smtpUser,
    };
  }

  return null;
};

export const isMailConfigured = () => Boolean(getMailerConfig());

export const sendMailSafe = async ({
  to,
  subject,
  text,
  html,
  context = "mail",
}) => {
  const config = getMailerConfig();

  if (!config) {
    return {
      success: false,
      reason: "mail_not_configured",
      mode: "disabled",
      message: "Email service is not configured",
    };
  }

  try {
    const transporter = nodemailer.createTransport(config.transport);
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      reason: null,
      mode: config.mode,
      context,
      messageId: info.messageId,
      message: `${context} email sent successfully`,
    };
  } catch (error) {
    console.error(`Mail send failed for ${context}:`, error.message);

    return {
      success: false,
      reason: "mail_send_failed",
      mode: config.mode,
      message: error.message,
    };
  }
};
