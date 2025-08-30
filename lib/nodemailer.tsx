import nodemailer from "nodemailer";

const smptConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ADMIN,
    pass: process.env.MAIL_ADMIN_APP,
    scope: "https://www.googleapis.com/auth/gmail.send",
  },
}

export const transporter = nodemailer.createTransport(smptConfig);
// pazy geso otyd huhl

export const mailOption = {
  from: '"Antonio\'s Resort" <antonios.resort.service@gmail.com>',
};
