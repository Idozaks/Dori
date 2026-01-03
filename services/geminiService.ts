
import { GoogleGenAI, GenerateContentResponse, Modality, Tool } from "@google/genai";
import { ImageSize, TTSVoiceName, Language } from "../types";
import { UI_STRINGS } from '../i18n/translations';

// Helper to create a new client instance with the current API key.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Decodes a base64 string into a Uint8Array.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ESTIMATED_DURATIONS = {
  TEXT_RESPONSE: 4000,
  THINKING_TEXT_RESPONSE: 8000,
  IMAGE_ANALYSIS: 6000,
  IMAGE_GENERATION: 5000,
  PRO_IMAGE_GENERATION: 12000,
  IMAGE_EDITING: 8000,
  SPEECH_GENERATION: 3000,
};

interface GeminiServiceCallbacks {
  onProgress?: (progress: number, message: string) => void;
  onComplete?: (durationMs: number) => void;
  onError?: (error: Error) => void;
  lang?: Language;
}

/**
 * More realistic progress simulator.
 * Starts fast, slows down as it approaches 100.
 * Never hits 100 until 'stop' is called.
 */
const simulateProgress = (
  estimatedDurationMs: number,
  callbacks: GeminiServiceCallbacks | undefined,
  messageKey: keyof typeof UI_STRINGS.en,
): { intervalId: ReturnType<typeof setInterval> | null; stop: () => void } => {
  const t = UI_STRINGS[callbacks?.lang || 'en'];
  const onProgress = callbacks?.onProgress;

  if (!onProgress) {
    return { intervalId: null, stop: () => {} };
  }

  const startTime = Date.now();
  onProgress(0, t[messageKey]);

  const intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    
    // Asymptotic progress: progress = 100 * (1 - e^(-k * elapsed))
    // We want it to reach roughly 90% at the estimatedDuration
    // 0.9 = 1 - e^(-k * estimatedDuration)
    // e^(-k * estimatedDuration) = 0.1
    // -k * estimatedDuration = ln(0.1)
    // k = -ln(0.1) / estimatedDuration
    const k = 2.3025 / estimatedDurationMs;
    let progress = Math.round(100 * (1 - Math.exp(-k * elapsed)));
    
    // Cap at 99 until finished
    progress = Math.min(99, progress);
    
    onProgress(progress, t[messageKey]);

    // If it takes way too long, show a different message
    if (elapsed > estimatedDurationMs * 2.5) {
      onProgress(progress, t.longWait);
    }
  }, 150);

  return {
    intervalId,
    stop: () => {
      clearInterval(intervalId);
      onProgress(100, t.complete);
    }
  };
};

export const generateTextResponse = async (
  prompt: string,
  useThinkingMode: boolean,
  useSearchGrounding: boolean = false,
  callbacks?: GeminiServiceCallbacks
): Promise<{ text: string; groundingChunks?: any[] }> => {
  const ai = getClient();
  const startTime = performance.now();
  const estimatedDuration = useThinkingMode ? ESTIMATED_DURATIONS.THINKING_TEXT_RESPONSE : ESTIMATED_DURATIONS.TEXT_RESPONSE;
  
  const progressMessageKey: keyof typeof UI_STRINGS.en = useThinkingMode 
    ? 'thinkingDeeply' 
    : (useSearchGrounding ? 'fetchingSources' : 'generatingTextResponse');

  const progressSimulator = simulateProgress(estimatedDuration, callbacks, progressMessageKey);

  try {
    const modelId = 'gemini-3-flash-preview';
    
    const config: any = {};
    if (useThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 24576 };
    }

    const tools: Tool[] = [];
    if (useSearchGrounding) {
      tools.push({ googleSearch: {} });
    }
    if (tools.length > 0) {
      config.tools = tools;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: config
    });

    const text = response.text || UI_STRINGS[callbacks?.lang || 'en'].aiResponseError;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return { text, groundingChunks };
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    console.error("Error generating text:", error);
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToGetResponse);
  }
};

export const analyzeImageContent = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  callbacks?: GeminiServiceCallbacks
): Promise<string> => {
  const ai = getClient();
  const startTime = performance.now();
  const estimatedDuration = ESTIMATED_DURATIONS.IMAGE_ANALYSIS;
  const progressSimulator = simulateProgress(estimatedDuration, callbacks, 'analyzingImage');

  try {
    const modelId = 'gemini-3-flash-preview';
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
            text: prompt || UI_STRINGS[callbacks?.lang || 'en'].describeImageSimple
          }
        ]
      }
    });

    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return response.text || UI_STRINGS[callbacks?.lang || 'en'].couldNotAnalyzeImage;
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    console.error("Error analyzing image:", error);
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToAnalyzeImage);
  }
};

/**
 * Generates an image. Uses 'gemini-2.5-flash-image' for standard quality (fast)
 * and 'gemini-3-pro-image-preview' for higher resolutions.
 */
export const generateImage = async (
  prompt: string,
  isHighQuality: boolean = false,
  imageSize: ImageSize = '1K',
  callbacks?: GeminiServiceCallbacks
): Promise<string> => {
  const ai = getClient();
  const startTime = performance.now();
  const estimatedDuration = isHighQuality ? ESTIMATED_DURATIONS.PRO_IMAGE_GENERATION : ESTIMATED_DURATIONS.IMAGE_GENERATION;
  const progressSimulator = simulateProgress(estimatedDuration, callbacks, 'generatingImage');

  try {
    const modelId = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const config: any = {
      imageConfig: {
        aspectRatio: "1:1"
      },
    };

    if (isHighQuality) {
      config.imageConfig.imageSize = imageSize;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }],
      },
      config: config,
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          progressSimulator.stop();
          callbacks?.onComplete?.(performance.now() - startTime);
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].noImageGenerated);
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    console.error("Error generating image:", error);
    if (error.message && error.message.includes("Requested entity was not found")) {
      throw new Error("API_KEY_REQUIRED");
    }
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToGenerateImage);
  }
};

export const generateNanoBananaImage = async (
  prompt: string,
  callbacks?: GeminiServiceCallbacks
): Promise<string> => {
  return generateImage(prompt, false, '1K', callbacks);
};

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  callbacks?: GeminiServiceCallbacks
): Promise<string> => {
  const ai = getClient();
  const startTime = performance.now();
  const estimatedDuration = ESTIMATED_DURATIONS.IMAGE_EDITING;
  const progressSimulator = simulateProgress(estimatedDuration, callbacks, 'editingImage');

  try {
    const modelId = 'gemini-2.5-flash-image';
    const base64Data = base64Image.split(',')[1];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          progressSimulator.stop();
          callbacks?.onComplete?.(performance.now() - startTime);
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].noEditedImageGenerated);
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    console.error("Error editing image:", error);
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToEditImage);
  }
};

export const generateSpeech = async (
  text: string,
  voiceName: TTSVoiceName = 'Zephyr',
  callbacks?: GeminiServiceCallbacks
): Promise<string> => {
  const ai = getClient();
  const startTime = performance.now();
  const estimatedDuration = ESTIMATED_DURATIONS.SPEECH_GENERATION;
  const progressSimulator = simulateProgress(estimatedDuration, callbacks, 'generatingSpeech');

  try {
    const modelId = 'gemini-2.5-flash-preview-tts';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error(UI_STRINGS[callbacks?.lang || 'en'].noAudioDataReceived);
    }
    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return base64Audio;
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    console.error("Error generating speech:", error);
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToGenerateSpeech);
  }
};

export { decodeAudioData, decode };
