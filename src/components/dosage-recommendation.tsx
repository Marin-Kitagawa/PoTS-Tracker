"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getDosageRecommendation, FormState } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pill, Lightbulb, Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const initialState: FormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Getting Recommendation..." : "Get AI Recommendation"}
    </Button>
  );
}

export function DosageRecommendation() {
  const [state, formAction] = useFormState(getDosageRecommendation, initialState);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Pill className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="font-headline text-xl">AI Dosage Recommendation</CardTitle>
                <CardDescription>Get personalized medication dosage advice. This is not medical advice. Consult your doctor.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicationName">Medication Name</Label>
              <Input id="medicationName" name="medicationName" placeholder="e.g., Propranolol" defaultValue={state.fields?.medicationName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentDosage">Current Dosage</Label>
              <Input id="currentDosage" name="currentDosage" placeholder="e.g., 10mg twice a day" defaultValue={state.fields?.currentDosage} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherMedications">Other Medications & Supplements</Label>
              <Textarea id="otherMedications" name="otherMedications" placeholder="List any other medications or supplements you are taking" defaultValue={state.fields?.otherMedications} />
            </div>
          </div>
          <div className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="symptoms">Current Symptoms</Label>
              <Textarea id="symptoms" name="symptoms" placeholder="Describe your current POTS symptoms" defaultValue={state.fields?.symptoms} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lifestyle">Lifestyle & Diet</Label>
              <Textarea id="lifestyle" name="lifestyle" placeholder="Describe your diet, exercise, and sleep habits" defaultValue={state.fields?.lifestyle}/>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <SubmitButton />
          {state.message === "Invalid form data" && state.issues && (
             <Alert variant="destructive">
                <AlertTitle>Invalid Input</AlertTitle>
                <AlertDescription>
                  <ul>
                    {state.issues.map((issue) => (
                      <li key={issue}>- {issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
       {state.data && (
        <CardContent>
            <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-headline text-lg">AI Recommendation</AlertTitle>
                <AlertDescription className="space-y-4 pt-2">
                    <div>
                        <h3 className="font-semibold text-foreground">Recommendation:</h3>
                        <p>{state.data.recommendation}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-foreground">Reasoning:</h3>
                        <p>{state.data.reasoning}</p>
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-accent/50 p-3 text-accent-foreground">
                        <Lightbulb className="h-5 w-5 mt-0.5 shrink-0" />
                        <p className="text-xs">
                            <strong>Disclaimer:</strong> This is an AI-generated recommendation and does not constitute medical advice. Please consult with your healthcare provider before making any changes to your medication regimen.
                        </p>
                    </div>
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}
