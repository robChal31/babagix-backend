const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmationToken) => {
  console.log("nodemailer testing");
  transport
    .sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Please confirm your e-mail account",
      html: `<h1>Email Confirmation</h1>
  <h2>Hello ${name}</h2>
  <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
  <a href=http://localhost:4000/api/v1/user/confirm/${confirmationToken}> Click here</a>`,
    })
    .catch((err) => console.log(err));
};
