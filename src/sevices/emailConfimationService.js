import nodemailer from "nodemailer";

export async function sendEmailService({ to, subject ,message , attachments=[]}={}) {
    
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    service: "gmail",
    secure: false,
    auth: {
      user: "mohamed.719.917@gmail.com",
      pass: "ajtjpeaahsdjmmcq",
    },
  });

  const mailInfo = await transporter.sendMail({
    from: 'mohamed.719.917@gmail.com',
    to: to?to : "",
    subject: subject?subject : "",
    html: message?message :"",
    attachments,
  });
}
