
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

export const generateAIImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  style: ImageStyle
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Usando o modelo gemini-2.5-flash-image que não exige seleção manual de chave paga
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
          // imageSize removido pois não é suportado no 2.5-flash-image
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Nenhuma imagem foi gerada nas partes da resposta.");
  } catch (error: any) {
    console.error("Erro na geração de imagem:", error);
    throw error;
  }
};

export const generatePromptIdea = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Sugira uma ideia criativa e detalhada para uma imagem AI. Responda apenas com o prompt em português, sem introduções ou explicações. Seja variado.',
      config: {
        systemInstruction: 'Você é um assistente criativo. Responda apenas o texto do prompt em português do Brasil.',
        temperature: 1.0,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar ideia:", error);
    throw error;
  }
};
