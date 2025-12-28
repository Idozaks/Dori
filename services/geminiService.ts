
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageSize } from "../types";

// Helper to create a new client instance with the current API key.
// Creating a new instance right before use ensures the latest API key from the dialog is used.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates text response using Gemini 3 Flash.
 * Supports "Thinking Mode" for complex queries.
 */
export const generateTextResponse = async (
  prompt: string,
  useThinkingMode: boolean
): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    const ai = getClient();
    
    const config: any = {};
    
    if (useThinkingMode) {
      // Thinking budget set for Flash model (max 24576)
      config.thinkingConfig = { thinkingBudget: 24576 };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: config
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to get a response from the AI assistant.");
  }
};

/**
 * Analyzes an uploaded image using Gemini 3 Flash.
 */
export const analyzeImageContent = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    const ai = getClient();

    // Remove the data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.split(',')[1];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt || "Describe this image in simple terms."
          }
        ]
      }
    });

    return response.text || "I couldn't analyze this image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze the image.");
  }
};

/**
 * Generates an image based on a prompt using gemini-3-pro-image-preview.
 * This model supports 1K, 2K, and 4K resolutions and requires a paid API key.
 */
export const generateImage = async (
  prompt: string,
  imageSize: ImageSize = '1K'
): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: imageSize
        },
      },
    });

    // Iterate through response parts to find the generated image (inlineData).
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("No image was generated. Please try a different description.");
  } catch (error: any) {
    console.error("Error generating image:", error);
    // Specific check for missing or unauthorized API key/project
    if (error.message && error.message.includes("Requested entity was not found")) {
      throw new Error("API_KEY_REQUIRED");
    }
    throw new Error("Failed to generate image. Please try again later.");
  }
};
