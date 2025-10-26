"use server";

import { z } from "zod";
import { dosageRecommendations, DosageRecommendationsInput } from "@/ai/flows/dosage-recommendations";

const dosageSchema = z.object({
    medicationName: z.string().min(1, "Medication name is required."),
    currentDosage: z.string().min(1, "Current dosage is required."),
    symptoms: z.string().min(1, "Symptoms description is required."),
    otherMedications: z.string().min(1, "Other medications are required."),
    lifestyle: z.string().min(1, "Lifestyle description is required."),
});

export type FormState = {
    message: string;
    fields?: Record<string, string>;
    issues?: string[];
    data?: {
      recommendation: string;
      reasoning: string;
    };
};

export async function getDosageRecommendation(
    prevState: FormState,
    data: FormData
): Promise<FormState> {
    const formData = Object.fromEntries(data);
    const parsed = dosageSchema.safeParse(formData);

    if (!parsed.success) {
        const fields: Record<string, string> = {};
        for (const key of Object.keys(formData)) {
            fields[key] = formData[key].toString();
        }
        return {
            message: "Invalid form data",
            fields,
            issues: parsed.error.issues.map((issue) => issue.message),
        };
    }

    try {
        const result = await dosageRecommendations(parsed.data as DosageRecommendationsInput);
        return {
            message: "success",
            data: result,
        };
    } catch (error) {
        return {
            message: "An error occurred while getting the recommendation. Please try again.",
        };
    }
}
