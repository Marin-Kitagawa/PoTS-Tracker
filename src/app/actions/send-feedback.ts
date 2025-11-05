'use server';

import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import { remark } from 'remark';
import html from 'remark-html';
import { getFirestore, doc, getDoc, setDoc, increment, Transaction, runTransaction } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/config';
import { format } from 'date-fns';

// Initialize a barebones Firestore instance for server-side use.
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
  
  const statsRef = doc(firestore, 'app_state', 'feedback_stats');
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    await runTransaction(firestore, async (transaction: Transaction) => {
        const statsSnap = await transaction.get(statsRef);

        let dailyCount = 0;
        if (!statsSnap.exists()) {
             // If the document doesn't exist, we will create it with a count of 2.
            dailyCount = 2; // As you requested
        } else {
            const statsData = statsSnap.data();
            if (statsData.lastResetDate === today) {
                dailyCount = statsData.dailyCount;
            } else {
                 // It's a new day, so we reset the counter
                dailyCount = 0;
            }
        }
        
        if (dailyCount >= DAILY_LIMIT) {
          throw new Error('The daily feedback submission limit has been reached. Please try again tomorrow.');
        }

        // --- If limit not reached, proceed with feedback submission ---
        const parsed = feedbackSchema.safeParse({
            type: formData.get('type'),
            message: formData.get('message'),
            userEmail: formData.get('userEmail'),
        });

        if (!parsed.success) {
            throw new Error('Invalid form data.');
        }

        const { type, message, userEmail } = parsed.data;
        const toEmail = process.env.FEEDBACK_EMAIL_TO;
        const sendGridApiKey = process.env.SENDGRID_API_KEY;

        if (!toEmail) {
            console.error('FEEDBACK_EMAIL_TO environment variable is not set.');
            throw new Error('Server configuration error: Recipient email is missing.');
        }
        
        if (!sendGridApiKey) {
            console.error('SENDGRID_API_KEY environment variable is not set.');
            throw new Error('Email service is not configured.');
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
        
        await sgMail.send(msg);

        // --- Increment counter on success ---
        if (!statsSnap.exists() || statsSnap.data().lastResetDate !== today) {
             // First submission of the day or doc doesn't exist
             transaction.set(statsRef, { dailyCount: (dailyCount === 2 ? 2 : 1), lastResetDate: today });
        } else {
             transaction.update(statsRef, { dailyCount: increment(1) });
        }
    });

    return { success: true, error: null };

  } catch (e: any) {
    console.error("Error sending feedback:", e);
    // The specific error from the transaction will be more informative
    if (e.message.includes('limit has been reached')) {
      return { success: false, error: e.message };
    }
    return { success: false, error: 'Could not send feedback. Please try again later.' };
  }
}
