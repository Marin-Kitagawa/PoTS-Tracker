'use server';

/**
 * @fileOverview A flow for generating personalized physical countermeasure reminders.
 *
 * - `generateCountermeasureReminder` - A function that generates personalized reminders for physical countermeasures based on user's logged activities.
 * - `PhysicalCountermeasureReminderInput` - The input type for the `generateCountermeasureReminder` function.
 * - `PhysicalCountermeasureReminderOutput` - The return type for the `generateCountermeasureReminder` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhysicalCountermeasureReminderInputSchema = z.object({
  timeSinceLastCountermeasure: z
    .string()
    .describe(
      'How long it has been since the user last performed physical countermeasures.  Examples:  