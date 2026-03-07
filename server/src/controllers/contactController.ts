import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            res.status(400).json({ success: false, msg: "Please provide name, email, and message" });
            return;
        }

        // Configure the transporter using Gmail (or another SMTP if configured)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Standard integration point for Google
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Needs to be authenticated user to bypass spam filters reliably
            replyTo: email, // The actual developer who sent the message
            to: process.env.EMAIL_USER || 'abhineetanand91@gmail.com', // Sending to the owner
            subject: `Portfolio Contact From: ${name}`,
            text: `You have received a new message from your Developer Portfolio.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h3>New Developer Portfolio Contact</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, msg: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, msg: "Failed to send message", error });
    }
};
