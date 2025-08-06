import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default class EmailService {
    static async sendEmail(to: string, subject: string, text: string) {
        const mailOptions = {
            from: 'steve@mail.thegreenasterisk.com',
            to,
            subject,
            text,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}