import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendMail = async ({ to, subject, text, html = null }) => {
  const info = {
    from: '"Rahi Omkar" <rahiomkar0189@gmail.com>',
    to,
    subject,
    text,
    html,
  };

  try {
    const response = await transporter.sendMail(info);
    console.log("Message sent: %s", response.messageId);
  } catch (err) {
    console.error("Error sending email: ", err);
  }
};

export default sendMail;
