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

const html = (heading, message, link) => {
    return (
        `<div class="container">
        <div class="content">
            <h1>${heading}</h1>
            <p>${message}</p>
            <a href=${link} class="activation-button">Activate Account</a>
            <p>If you did not sign up for this account, you can ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 AfriPredictor. All rights reserved.</p>
        </div>
    </div>`
    )
};

const sendVerificationEmail = async (email, verificationToken, source) => {

    const mailOptions = {
        from: 'lmslernz@gmail.com',
        to: email,
        subject: 'Account Verification',
        html: source === "register" ? html(`Activate Your Account`, `Thank you for signing up! Please click the button below to activate your account:`, `https://afripredictor.com/verify/${verificationToken}`) : html(`Reset Your Password`, `Please click the button below to reset your password:`, `https://afripredictor.com/reset-password/${verificationToken}`)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

export default sendVerificationEmail;