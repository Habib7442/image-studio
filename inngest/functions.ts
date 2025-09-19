import { inngest, type Events } from "./client";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { imageStoreService } from "@/lib/image-store";

// Image generation workflow
export const generateStyledSelfie = inngest.createFunction(
  { 
    id: "generate-styled-selfie",
    name: "Generate Styled Selfie",
    retries: 3,
    concurrency: { limit: 5 }
  },
  { event: "selfie/generate" },
  async ({ event, step }) => {
    const { userId, prompt, requestId } = event.data;
    
    // Retrieve the image from the store
    console.log(`Looking for image with requestId: ${requestId}`);
    const selfieImage = imageStoreService.get(requestId);
    if (!selfieImage) {
      console.error(`Image not found for requestId: ${requestId}`);
      throw new Error('Selfie image not found in store');
    }
    console.log(`Found image for requestId: ${requestId}, size: ${selfieImage.length}`);

    try {
      // Step 1: Validate user credits
      const credits = await step.run("validate-credits", async () => {
        const supabase = createServiceRoleClient();
        const { data: profile, error } = await supabase
          .from('users')
          .select('credits_left, total_credits_used')
          .eq('id', userId)
          .single();

        if (error || !profile) {
          throw new Error('User profile not found');
        }

        if (!profile.credits_left || profile.credits_left <= 0) {
          throw new Error('No credits remaining');
        }

        return profile;
      });

      // Send progress update
      await step.run("update-progress", async () => {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/style-my-selfie/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId,
            progress: 20,
            step: "validating-credits",
            message: "Validating user credits..."
          })
        });
      });

      // Step 2: Process and validate selfie image
      const processedImage = await step.run("process-selfie", async () => {
        // Basic validation
        if (!selfieImage.startsWith('data:image/')) {
          throw new Error('Invalid image format');
        }

        // You could add image processing here (resize, optimize, etc.)
        return selfieImage;
      });

      // Send progress update
      await step.run("update-progress", async () => {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/style-my-selfie/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId,
            progress: 40,
            step: "processing-image",
            message: "Processing your selfie..."
          })
        });
      });

      // Step 3: Generate AI variations
      const variations = await step.run("generate-variations", async () => {
        const genAI = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY!
        });

        if (!process.env.GEMINI_API_KEY) {
          throw new Error('AI service not configured');
        }

        const enhancedPrompt = `Create a professional Instagram portrait post of this person (1080x1350 pixels, 4:5 aspect ratio): ${prompt.trim()}. 

STYLE MY SELFIE REQUIREMENTS:
- Transform the person's appearance according to the prompt while maintaining their facial features and identity
- Create a professional, high-quality portrait perfect for Instagram
- Use flattering lighting and composition
- Ensure the styling looks natural and realistic
- Maintain the person's recognizable facial features and characteristics
- Create a visually stunning result that showcases the styling effectively

Make it look natural, high-quality, and perfect for Instagram feed. Use vertical composition that showcases the person beautifully on mobile. CRITICAL: Generate a compressed, web-optimized image with minimal file size for fast loading. IMPORTANT: Do not add any text, watermarks, names, or written content to the image unless specifically requested in the prompt.`;

        const generationRequest = {
          model: 'gemini-2.5-flash-image-preview',
          contents: [
            { text: enhancedPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: selfieImage.replace(/^data:image\/[a-z]+;base64,/, '')
              }
            }
          ]
        };

        const images: string[] = [];
        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            let variationPrompt = enhancedPrompt;
            if (attempt > 1) {
              const variationInstructions = [
                "Create a completely different composition and angle. Change the lighting, background, and pose significantly while keeping the same person. Use different colors, mood, and artistic style.",
                "Generate a unique variation with different camera angle, framing, and setting. Vary the visual elements substantially - different background, lighting, and perspective while maintaining the same person."
              ];
              
              const instruction = variationInstructions[attempt - 2] || variationInstructions[0];
              const randomElements = [
                "Use warm, golden lighting",
                "Use cool, blue lighting", 
                "Use dramatic, high-contrast lighting",
                "Use soft, diffused lighting"
              ];
              
              const randomElement = randomElements[Math.floor(Math.random() * randomElements.length)];
              variationPrompt = `${enhancedPrompt}\n\n${instruction} ${randomElement}.`;
            }

            const variationRequest = {
              ...generationRequest,
              contents: [
                { text: variationPrompt },
                ...generationRequest.contents.slice(1)
              ]
            };

            const result = await genAI.models.generateContent(variationRequest);
            
            if (result.candidates && result.candidates.length > 0) {
              const candidate = result.candidates[0];
              
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData && part.inlineData.data) {
                    const imageData = `data:image/jpeg;base64,${part.inlineData.data}`;
                    images.push(imageData);
                    break;
                  }
                }
              }
            }

            // Add delay between generations
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (error) {
            console.error(`Generation attempt ${attempt} failed:`, error);
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
        }

        if (images.length === 0) {
          throw new Error('No images were generated');
        }

        return images;
      });

      // Send progress update
      await step.run("update-progress", async () => {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/style-my-selfie/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId,
            progress: 80,
            step: "generating-variations",
            message: "Generating AI variations..."
          })
        });
      });

      // Step 4: Deduct credits
      const updatedCredits = await step.run("deduct-credits", async () => {
        const supabase = createServiceRoleClient();
        const { error } = await supabase
          .from('users')
          .update({ 
            credits_left: (credits.credits_left || 0) - 1,
            total_credits_used: (credits.total_credits_used || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          throw new Error('Failed to update credits');
        }

        return (credits.credits_left || 0) - 1;
      });

      // Send progress update
      await step.run("update-progress", async () => {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/style-my-selfie/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId,
            progress: 90,
            step: "finalizing",
            message: "Finalizing your styled selfies..."
          })
        });
      });

      // Step 5: Send completion event (without large image data)
      await step.run("update-progress-complete", async () => {
        // Store the result in the image store instead of passing through step
        imageStoreService.set(`${requestId}_result`, JSON.stringify({
          images: variations,
          creditsLeft: updatedCredits
        }));
        
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/style-my-selfie/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId,
            progress: 100,
            step: "completed",
            message: "Your styled selfies are ready!",
            status: "completed",
            result: {
              // Don't include images here to avoid size limit
              creditsLeft: updatedCredits
            }
          })
        });
      });

      // Clean up the stored image
      imageStoreService.delete(requestId);

      return {
        success: true,
        // Don't return large image data to avoid size limits
        creditsLeft: updatedCredits
      };

    } catch (error) {
      // Clean up the stored image on error
      imageStoreService.delete(requestId);
      
      // Send failure event
      await step.run("update-progress-failed", async () => {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/style-my-selfie/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
            userId,
            progress: 0,
            step: "failed",
            message: "Generation failed",
            status: "failed",
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })
        });
      });

      throw error;
    }
  }
);

// Credit deduction workflow
export const deductCredits = inngest.createFunction(
  { 
    id: "deduct-credits",
    name: "Deduct User Credits",
    retries: 2
  },
  { event: "credits/deduct" },
  async ({ event, step }) => {
    const { userId, amount, reason } = event.data;

    await step.run("deduct-credits", async () => {
      const supabase = createServiceRoleClient();
      
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('credits_left, total_credits_used')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        throw new Error('User profile not found');
      }

      if (!profile.credits_left || profile.credits_left < amount) {
        throw new Error('Insufficient credits');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          credits_left: profile.credits_left - amount,
          total_credits_used: profile.total_credits_used + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update credits');
      }

        return {
          success: true,
          creditsLeft: (profile.credits_left || 0) - amount,
          reason
        };
    });
  }
);
