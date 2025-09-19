import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "image-studio-lab-app",
  name: "ImageStudioLab"
});

// Event types for type safety
export type Events = {
  "selfie/generate": {
    data: {
      userId: string;
      prompt: string;
      requestId: string;
    };
  };
  "selfie/generation-progress": {
    data: {
      requestId: string;
      userId: string;
      progress: number;
      step: string;
      message: string;
    };
  };
  "selfie/generation-complete": {
    data: {
      requestId: string;
      userId: string;
      images: string[];
      creditsLeft: number;
    };
  };
  "selfie/generation-failed": {
    data: {
      requestId: string;
      userId: string;
      error: string;
    };
  };
  "credits/deduct": {
    data: {
      userId: string;
      amount: number;
      reason: string;
    };
  };
};
