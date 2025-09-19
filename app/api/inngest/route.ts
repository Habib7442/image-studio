import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateStyledSelfie, deductCredits } from "@/inngest/functions";

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateStyledSelfie,
    deductCredits,
  ],
});
