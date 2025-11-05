'use server';

import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import { remark } from 'remark';
import html from 'remark-html';
import { getFirestore, doc, Transaction, runTransaction, increment } from 'firebase/firestore';
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

const generateEmailHtml = (type: 'bug' | 'feature' | 'feedback', userEmail: string, messageHtml: string) => {
    const titles = {
        bug: 'Bug Report',
        feature: 'Feature Request',
        feedback: 'General Feedback',
    };
    
    // A single, more elegant header color
    const headerColor = '#FADADD'; // A soft, feminine pink/rose color
    const title = titles[type];

    // Email-safe styles and font stack
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    background-color: #f0f4f8;
                    font-family: 'Alegreya', Georgia, Cambria, 'Times New Roman', Times, serif;
                    color: #334155;
                }
                .wrapper {
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .header {
                    background-color: ${headerColor};
                    padding: 32px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-family: 'Belleza', 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
                    font-size: 36px;
                    font-weight: normal;
                    color: #4A5568;
                    letter-spacing: 1px;
                }
                .content {
                    padding: 32px;
                }
                .content h2 {
                    font-family: 'Belleza', 'Trebuchet MS', sans-serif;
                    font-size: 24px;
                    color: #1e293b;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 8px;
                    margin-top: 0;
                    margin-bottom: 24px;
                    font-weight: normal;
                }
                .info-box {
                    background-color: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                }
                .info-box p {
                    margin: 4px 0;
                    font-size: 14px;
                }
                .info-box strong {
                    color: #1e293b;
                    font-weight: 700;
                }
                .message-content {
                    font-size: 16px;
                    line-height: 1.7;
                }
                .message-content h1, .message-content h2, .message-content h3 { color: #1e293b; font-family: 'Belleza', sans-serif; font-weight: normal; }
                .message-content p { margin: 1em 0; }
                .message-content ul, .message-content ol { padding-left: 20px; }
                .message-content blockquote { border-left: 4px solid #cbd5e1; padding-left: 16px; margin-left: 0; color: #64748b; font-style: italic; }
                .message-content pre { background-color: #f1f5f9; padding: 16px; border-radius: 6px; white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', Courier, monospace; }
                .message-content code { font-family: 'Courier New', Courier, monospace; background-color: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; }
                .footer {
                    padding: 24px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>POTS Tracker</h1>
                    </div>
                    <div class="content">
                        <h2>New Feedback Submission</h2>
                        <div class="info-box">
                            <p><strong>From:</strong> ${userEmail}</p>
                            <p><strong>Type:</strong> ${title}</p>
                        </div>
                        <div class="message-content">
                            ${messageHtml}
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the POTS Tracker application.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};


export async function sendFeedback(previousState: { success: boolean; error: string | null }, formData: FormData) {
  
  const statsRef = doc(firestore, 'app_state', 'feedback_stats');
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    await runTransaction(firestore, async (transaction: Transaction) => {
        const statsSnap = await transaction.get(statsRef);

        let dailyCount = 0;
        if (!statsSnap.exists()) {
             // If the document doesn't exist, we will create it with the correct initial count.
            dailyCount = 0;
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

        const messageHtml = await markdownToHtml(message);
        const emailHtml = generateEmailHtml(type, userEmail, messageHtml);
        
        const subjectPrefix = {
            bug: 'Bug Report',
            feature: 'Feature Request',
            feedback: 'General Feedback',
        };

        const msg = {
            to: toEmail,
            from: toEmail, 
            subject: `[${subjectPrefix[type]}] from ${userEmail}`,
            text: `From: ${userEmail}\nType: ${subjectPrefix[type]}\n\n${message}`, // Plain text fallback
            html: emailHtml,
        };
        
        await sgMail.send(msg);

        // --- Increment counter on success ---
        if (!statsSnap.exists()) {
             // First submission ever, accounting for the 2 you sent
             transaction.set(statsRef, { dailyCount: 2, lastResetDate: today });
        } else if (statsSnap.data().lastResetDate !== today) {
             // First submission of a new day
             transaction.set(statsRef, { dailyCount: 1, lastResetDate: today });
        } else {
             // Subsequent submission on the same day
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
     if (e.message.includes('permission-denied')) {
        return { success: false, error: 'Could not verify submission eligibility. Please check security rules.' };
    }
    return { success: false, error: 'Could not send feedback. Please try again later.' };
  }
}
