const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send adoption status notification email
 * @param {string} toEmail - recipient email
 * @param {string} userName - recipient name
 * @param {string} petName - pet name
 * @param {string} status - approved | rejected
 * @param {string} adminNote - optional note from admin
 */
const sendAdoptionStatusEmail = async (toEmail, userName, petName, status, adminNote = "") => {
  const isApproved = status === "approved";
  const subject = isApproved
    ? `🎉 Your adoption application for ${petName} is Approved!`
    : `Update on your adoption application for ${petName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: ${isApproved ? "#2e7d32" : "#c62828"};">
        ${isApproved ? "🎉 Congratulations!" : "Application Update"}
      </h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>
        Your adoption application for <strong>${petName}</strong> has been
        <strong style="color: ${isApproved ? "#2e7d32" : "#c62828"};">${status}</strong>.
      </p>
      ${adminNote ? `<p><strong>Admin Note:</strong> ${adminNote}</p>` : ""}
      ${isApproved
        ? `<p>Our team will contact you shortly with next steps. Welcome to the family! 🐾</p>`
        : `<p>Thank you for your interest. Feel free to browse other pets and apply again.</p>`
      }
      <hr />
      <p style="color: #888; font-size: 12px;">Pet Adoption Management System</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject,
    html,
  });
};

module.exports = { sendAdoptionStatusEmail };