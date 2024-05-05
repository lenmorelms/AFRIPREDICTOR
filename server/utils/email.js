// utils/email.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'lmslernz@gmail.com', // your Gmail email address
        pass: 'norh sfad fdnq tbtx' // your Gmail password
    }
    // host: 'smtp.zingaz.dev', // Namecheap SMTP server
    // port: 587, // Port for secure SMTP
    // secure: false, // true for 465, false for other ports
    // auth: {
    //     user: 'lmombe@zingaz.dev', // Your Namecheap email address
    //     pass: '#lms#mombe001A' // Your Namecheap email password
    // }
});

const sendVerificationEmail = async (email, verificationToken, source) => {

    const mailOptions = {
        from: 'lmslernz@gmail.com',
        to: email,
        subject: 'Account Verification',
        html: source === "register" ? `<p>Please click <a href="https://afripredictor-fe.vercel.app/verify/${verificationToken}">here</a> to verify your account.</p>` : `<p>Please click <a href="https://afripredictor-fe.vercel.app/reset-password/${verificationToken}">here</a> to reset your password.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

export default sendVerificationEmail;