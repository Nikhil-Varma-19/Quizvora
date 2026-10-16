import nodemailer from "nodemailer";

type MailOptions = { to: string; subject: string; html: string };

export const sendMail = async ({ to, subject, html }: MailOptions) => {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 587,
		secure: Number(process.env.SMTP_PORT) === 465,
		auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
	});

	await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER,
		to,
		subject,
		html,
	});
};
