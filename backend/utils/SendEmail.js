import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // 1. ADD LOGGING to prove this function is being called and has the right data.
  console.log("--- Attempting to send an email ---");
  // IMPORTANT: We log the user to verify it's loaded, but NEVER log the password.
  console.log(`Using GMAIL_USER: ${process.env.GMAIL_USER}`);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `DITRICT DINE <${process.env.GMAIL_USER}>`, // Add a sender name
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 2. GET THE "info" OBJECT back from sendMail. This is our proof.
  // This will wait until the email is sent and give us the server's response.
  const info = await transporter.sendMail(mailOptions);

  // 3. LOG THE SUCCESS information.
  console.log("Email sent successfully! Server response:", info.response);
  console.log("Message ID:", info.messageId);
  console.log("Preview URL (for testing):", nodemailer.getTestMessageUrl(info));
};