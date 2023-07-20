import nodemailer from "nodemailer";

export async function sendEmailService({ to, subject ,message , attachments=[]}={}) {
    
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 587,
    service: "gmail",
    secure: false,
    auth: {
      user: "mohamed.elking27001@gmail.com",
      pass: "kltposwikkraxmmg",
    },
  });

  const mailInfo = await transporter.sendMail({
    from: 'mohamed.elking27001@gmail.com',
    to: to?to : "",
    subject: subject?subject : "",
    html: message?message :"",
    attachments,
  });
}
