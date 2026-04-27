import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text, html = null) => {
  try {
    // 🔐 Check credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured");
    }

    if (!to || !subject || !text) {
      throw new Error("Missing email fields");
    }

    // 🔥 Create transporter INSIDE function (fixes env issue)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Smart Society" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Email sent:", info.messageId);

    return info;

  } catch (error) {
    console.error("❌ Email Error:", error);
    throw new Error(error.message || "Email not sent");
  }
};

export default sendEmail;