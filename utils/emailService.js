const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmailService = async(toEmail, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.outlookemail,
        pass: process.env.outlookpassword,
      },
    });

    const mailOptions = {
      from: process.env.outlookemail,
      to: `${toEmail}`,
      subject: `${subject}`,
      html: `${body}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { sendEmailService };
