import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, location, videoUrl } = body;

        // Skip if no email provided or misconfigured
        if (!email || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            return NextResponse.json({ success: true, message: "Skipped email notification" });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Treat delivered to Snickers! 🐈",
            html: `
                <h2>Great news!</h2>
                <p>Snickers was spotted at <strong>${location}</strong> and has received her treat!</p>
                <p>You can watch the treat video here: <a href="${videoUrl}">View Video</a></p>
                <br />
                <p>Thanks for using the Snickers Community Tracker!</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, message: "Email sent" });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
}
