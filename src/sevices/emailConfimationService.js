import nodemailer from "nodemailer";

export async function sendEmalService({ to, subject }) {
    
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 587,
    service: "gmail",
    secure: false,
    auth: {
      user: "mee9978331@gmail.com",
      pass: "jwimvtplyvkcsinv",
    },
  });

  const mailInfo = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to: to || "",
    subject: subject || "",
    text: "Hello world?",
    html: "<b>Hello world?</b>",
  });
}
