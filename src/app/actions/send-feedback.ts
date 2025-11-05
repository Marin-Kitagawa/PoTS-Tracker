'use server';

import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import { remark } from 'remark';
import html from 'remark-html';
import { getFirestore, doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/config';
import { format } from 'date-fns';

// Initialize a barebones Firestore instance for server-side use.
// This is separate from the client-side instance.
const { firestore } = initializeFirebase();

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'feedback']),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
  userEmail: z.string().email(),
});

async function markdownToHtml(markdown: string) {
    const result = await remark().use(html).process(markdown);
    return result.toString();
}

const DAILY_LIMIT = 100;

export async function sendFeedback(previousState: { success: boolean; error: string | null }, formData: FormData) {
  
  // --- Check daily submission limit ---
  const statsRef = doc(firestore, 'app_state', 'feedback_stats');
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    const statsSnap = await getDoc(statsRef);
    let dailyCount = 0;
    
    if (statsSnap.exists()) {
      const statsData = statsSnap.data();
      if (statsData.lastResetDate === today) {
        dailyCount = statsData.dailyCount;
      }
    }
    
    if (dailyCount >= DAILY_LIMIT) {
      return { success: false, error: 'The daily feedback submission limit has been reached. Please try again tomorrow.' };
    }

  } catch (e) {
    console.error("Error checking feedback stats:", e);
    return { success: false, error: 'Could not verify submission eligibility.' };
  }
  
  // --- Proceed with feedback submission ---
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

    // --- Increment counter on success ---
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists() && statsSnap.data().lastResetDate === today) {
      await setDoc(statsRef, { dailyCount: increment(1) }, { merge: true });
    } else {
      // First submission of the day, or document doesn't exist
      await setDoc(statsRef, { dailyCount: 2, lastResetDate: today });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending feedback email with SendGrid:', error);
    return { success: false, error: 'Could not send feedback.' };
  }
}
