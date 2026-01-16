
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatio, ImageStyle } from "./types";

const STYLE_PROMPTS: Record<ImageStyle, string> = {
  [ImageStyle.NONE]: "",
  [ImageStyle.CINEMATIC]: "cinematic lighting, dramatic shadows, highly detailed, 8k resolution, movie still",
  [ImageStyle.ANIME]: "anime style, vibrant colors, clean lines, high quality illustration, studio ghibli inspired",
  [ImageStyle.DIGITAL_ART]: "digital art, concept art, smooth gradients, trending on artstation, masterpiece",
  [ImageStyle.PHOTOREALISTIC]: "photorealistic, hyper-detailed, 8k, raw photo, f/1.8, high dynamic range",
  [ImageStyle.OIL_PAINTING]: "thick oil painting, textured brush strokes, classical art style, museum quality",
  [ImageStyle.CYBERPUNK]: "cyberpunk aesthetic, neon lights, futuristic, rainy night, high-tech, glowing elements",
  [ImageStyle.MINIMALIST]: "minimalist, clean, flat design, simple shapes, elegant, negative space",
  [ImageStyle.SKETCH]: "pencil sketch, hand-drawn, charcoal, artistic, expressive lines",
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY não encontrada no ambiente.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const generateAIImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  style: ImageStyle
): Promise<string> => {
  const ai = getAIClient();
  const modelName = 'gemini-2.5-flash-image';
  const enhancedPrompt = `${prompt}. ${STYLE_PROMPTS[style]}`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Nenhuma imagem foi gerada.");
  } catch (error: any) {
    console.error("Erro na geração de imagem:", error);
    throw error;
  }
};

export const generatePromptIdea = async (): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Sugira uma ideia criativa e detalhada para uma imagem AI. Responda apenas com o prompt em português, sem introduções ou explicações.',
      config: {
        systemInstruction: 'Você é um assistente criativo que gera prompts para IA em português do Brasil.',
        temperature: 1.0,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar ideia:", error);
    throw error;
  }
};
