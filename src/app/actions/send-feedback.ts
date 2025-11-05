'use server';

import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import { remark } from 'remark';
import html from 'remark-html';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'feedback']),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
  userEmail: z.string().email(),
});

async function markdownToHtml(markdown: string) {
    const result = await remark().use(html).process(markdown);
    return result.toString();
}

export async function sendFeedback(previousState: { success: boolean; error: string | null }, formData: FormData) {
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
  const sendGridApiKey = process.env.SENDGRID_API_KEY;

  if (!toEmail) {
    console.error('FEEDBACK_EMAIL_TO environment variable is not set.');
    return { success: false, error: 'Server configuration error: Recipient email is missing.' };
  }
  
  if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY environment variable is not set.');
      return { success: false, error: 'Email service is not configured.' };
  }

  sgMail.setApiKey(sendGridApiKey);

  const subjectPrefix = {
    bug: 'Bug Report',
    feature: 'Feature Request',
    feedback: 'General Feedback',
  };

  const htmlContent = await markdownToHtml(message);

  const msg = {
    to: toEmail,
    // It's good practice to use a verified sender email with SendGrid
    from: toEmail, 
    subject: `[${subjectPrefix[type]}] from ${userEmail}`,
    text: `From: ${userEmail}\nType: ${subjectPrefix[type]}\n\n${message}`,
    html: `
        <p><b>From:</b> ${userEmail}</p>
        <p><b>Type:</b> ${subjectPrefix[type]}</p>
        <hr>
        ${htmlContent}
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending feedback email with SendGrid:', error);
    return { success: false, error: 'Could not send feedback.' };
  }
}
