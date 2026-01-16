
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export enum ImageStyle {
  NONE = "Padrão",
  CINEMATIC = "Cinematográfico",
  ANIME = "Anime",
  DIGITAL_ART = "Arte Digital",
  PHOTOREALISTIC = "Fotorrealista",
  OIL_PAINTING = "Pintura a Óleo",
  CYBERPUNK = "Cyberpunk",
  MINIMALIST = "Minimalista",
  SKETCH = "Esboço",
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: AspectRatio;
  style: ImageStyle;
}

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  style: ImageStyle;
}
