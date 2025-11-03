'use server';

import { z } from 'zod';
import * as nodemailer from 'nodemailer';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'feedback']),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
  userEmail: z.string().email(),
});

export async function sendFeedback(formData: FormData) {
  const parsed = feedbackSchema.safeParse({
    type: formData.get('type'),
    message: formData.get('message'),
    userEmail: formData.get('userEmail'),
  });

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data.' };
  }

  const { type, message, userEmail } = parsed.data;
  const toEmail = process.env.FEEDBACK_EMAIL_TO;

  if (!toEmail) {
    console.error('FEEDBACK_EMAIL_TO environment variable is not set.');
    return { success: false, error: 'Server configuration error.' };
  }
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP environment variables are not fully configured.');
      return { success: false, error: 'Email service is not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subjectPrefix = {
    bug: 'Bug Report',
    feature: 'Feature Request',
    feedback: 'General Feedback',
  };

  const mailOptions = {
    from: `"POTS Tracker Feedback" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `[${subjectPrefix[type]}] from ${userEmail}`,
    text: message,
    html: `<p><b>From:</b> ${userEmail}</p><p><b>Type:</b> ${subjectPrefix[type]}</p><hr><p>${message.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending feedback email:', error);
    return { success: false, error: 'Could not send feedback.' };
  }
}
