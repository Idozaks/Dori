
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { ImageSize, TTSVoiceName, Language, MirrorTask, LessonCategory } from "../types";
import { UI_STRINGS } from '../i18n/translations';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
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
  MIRROR_TASK_GENERATION: 15000,
  RESULT_GENERATION: 6000,
  PATH_GENERATION: 7000,
};

interface GeminiServiceCallbacks {
  onProgress?: (progress: number, message: string) => void;
  onComplete?: (durationMs: number) => void;
  onError?: (error: Error) => void;
  lang?: Language;
}

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
    const k = 3.2 / estimatedDurationMs;
    let progress = Math.round(100 * (1 - Math.exp(-k * elapsed)));
    progress = Math.min(98, progress);
    onProgress(progress, t[messageKey]);
  }, 120);

  return {
    intervalId,
    stop: () => {
      clearInterval(intervalId);
      onProgress(100, t.complete || 'Complete');
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
    const tools: any[] = [];
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
        parts: [{ inlineData: { mimeType: mimeType, data: base64Data } }, { text: prompt || UI_STRINGS[callbacks?.lang || 'en'].describeImageSimple }]
      }
    });
    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return response.text || UI_STRINGS[callbacks?.lang || 'en'].couldNotAnalyzeImage;
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToAnalyzeImage);
  }
};

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
    const config: any = { imageConfig: { aspectRatio: "1:1" } };
    if (isHighQuality) {
      config.imageConfig.imageSize = imageSize;
    }
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
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
        parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }]
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
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].noEditedImageGenerated || 'No edited image generated');
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
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
    throw new Error(UI_STRINGS[callbacks?.lang || 'en'].failedToGenerateSpeech);
  }
};

export const generateMirrorTask = async (
  userGoal: string,
  lang: Language,
  callbacks?: GeminiServiceCallbacks
): Promise<MirrorTask> => {
  const ai = getClient();
  const startTime = performance.now();
  const estimatedDuration = ESTIMATED_DURATIONS.MIRROR_TASK_GENERATION;
  const progressSimulator = simulateProgress(estimatedDuration, callbacks, 'generatingTask');

  try {
    const systemPrompt = `You are Dori, a compassionate and expert AI guide specialized in breaking down complex life tasks for seniors. Your mission is to provide a "Decision Dashboard" - an active, guided navigation path.

Break down the user's goal into 3-5 clear, simple, sequential steps.
Each step MUST include:
1. "title": A short, clear name for the step. Use emojis to make it friendly and visual (e.g., "🛒 Step 1").
2. "content": A very simple description of what needs to happen. For grocery tasks, make it feel like an interactive list.
3. "doriGuidance": This is the heart of the system. A short message (1-2 sentences) from Dori, speaking at eye-level, offering encouragement or a simplified explanation of a technical/bureaucratic term. Avoid any legal jargon.
4. "button": An interactive element (CLICK, INPUT_TEXT, or SELECT_OPTION) representing the core action. Use playful labels (e.g., "Ready to go! 🚀").

Goal: '${userGoal}'
Respond in ${lang === 'he' ? 'Hebrew' : 'English'}. Use high-quality, encouraging, and clear language.
If the goal is grocery shopping, focus on the "cart" metaphor and adding items.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 24576 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskTitle: { type: Type.STRING, description: 'Overall title of the guided path.' },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  doriGuidance: { type: Type.STRING, description: 'Simplified guidance from Dori at eye-level.' },
                  button: { 
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['CLICK', 'INPUT_TEXT', 'SELECT_OPTION'] },
                      placeholder: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['label', 'type']
                  }
                },
                required: ['title', 'content', 'doriGuidance', 'button']
              }
            }
          },
          required: ['taskTitle', 'steps'],
        }
      },
    });

    const mirrorTask: MirrorTask = JSON.parse(response.text || "{}");
    if (!mirrorTask.taskTitle || !mirrorTask.steps || mirrorTask.steps.length === 0) {
      throw new Error(UI_STRINGS[lang].mirrorWorldError);
    }

    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return mirrorTask;
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    console.error("Error generating mirror task:", error);
    throw new Error(error.message || UI_STRINGS[lang].mirrorWorldError);
  }
};

export const generateFinalResult = async (
  userGoal: string,
  lang: Language,
  callbacks?: GeminiServiceCallbacks
): Promise<{ confirmationTitle: string; summary: string; confirmationCode: string; nextSteps: { text: string, icon: string }[] }> => {
  const ai = getClient();
  const startTime = performance.now();
  const progressSimulator = simulateProgress(ESTIMATED_DURATIONS.RESULT_GENERATION, callbacks, 'generatingResult');

  try {
    const prompt = `The user has just completed a simulated training path for the goal: "${userGoal}".
    Generate a realistic "Final Result" summary that looks like a real confirmation page.
    
    For icons, choose one of these keywords that best fits the step: "clock", "phone", "truck", "mail", "bank", "calendar", "check", "users", "map", "alert".
    
    Return a JSON object:
    {
      "confirmationTitle": "A short official-sounding title (e.g., Application Submitted)",
      "summary": "A 1-2 sentence summary of what was simulated.",
      "confirmationCode": "A realistic alphanumeric code (e.g. AB-123-XY)",
      "nextSteps": [
        {"text": "A step description", "icon": "keyword"},
        {"text": "Another step description", "icon": "keyword"}
      ]
    }
    
    Respond in ${lang === 'he' ? 'Hebrew' : 'English'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confirmationTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            confirmationCode: { type: Type.STRING },
            nextSteps: { 
              type: Type.ARRAY, 
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  icon: { type: Type.STRING }
                },
                required: ['text', 'icon']
              }
            }
          },
          required: ['confirmationTitle', 'summary', 'confirmationCode', 'nextSteps']
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return result;
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    throw error;
  }
};

export const generateAdaptivePath = async (
  interests: LessonCategory[],
  allLessonIds: string[],
  lang: Language,
  callbacks?: GeminiServiceCallbacks
): Promise<{ pathTitle: string; pathIds: string[] }> => {
  const ai = getClient();
  const startTime = performance.now();
  const progressSimulator = simulateProgress(ESTIMATED_DURATIONS.PATH_GENERATION, callbacks, 'generatingPath');

  try {
    const prompt = `Based on the user's interests: ${interests.join(', ')}, select the best 4-6 lessons from this list: [${allLessonIds.join(', ')}] and arrange them in a meaningful, progressive learning path for a senior.
    
    Also, generate an inspiring title for this specific learning path (e.g., "Becoming an AI Pioneer" or "Mastering the Digital World").
    
    Return a JSON object:
    {
      "pathTitle": "The inspiring title",
      "pathIds": ["lesson-id-1", "lesson-id-2", ...]
    }
    
    Respond in ${lang === 'he' ? 'Hebrew' : 'English'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pathTitle: { type: Type.STRING },
            pathIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['pathTitle', 'pathIds']
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    progressSimulator.stop();
    callbacks?.onComplete?.(performance.now() - startTime);
    return result;
  } catch (error: any) {
    progressSimulator.stop();
    callbacks?.onError?.(error);
    throw error;
  }
};
