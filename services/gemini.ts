
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ImageSize, ProgressionStep } from "../types";

export const getGeminiChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a world-class music theory professor. You explain complex concepts like microtonality, complex polyrhythms, and jazz functional harmony in an engaging, accessible way. Always provide examples in your explanations.",
    },
  });
};

export const suggestProgression = async (mood: string, key: string): Promise<ProgressionStep[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest a 4-chord progression in the key of ${key} that feels "${mood}". Use standard Note names (C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B) and common chord types (Major, Minor, Major 7th, Minor 7th, Dominant 7th, m7b5). Return JSON only.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          progression: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                root: { type: Type.STRING, description: "The root note, e.g., C, Eb" },
                variety: { type: Type.STRING, description: "The chord type, e.g., Minor 7th" },
                numeral: { type: Type.STRING, description: "The Roman numeral analysis, e.g., ii7" }
              },
              required: ["root", "variety", "numeral"]
            }
          }
        },
        required: ["progression"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return data.progression;
};

export const suggestChordVoicing = async (root: string, variety: string): Promise<(number | null)[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest a standard, playable guitar chord voicing for a ${root} ${variety} chord in standard tuning (E2 A2 D3 G3 B3 E4). Return a JSON array of 6 numbers representing the fret for each string from Low E (6th) to High E (1st). Use null for muted strings. Ensure the voicing is common and playable (within a 4-5 fret span).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          voicing: {
            type: Type.ARRAY,
            items: {
              type: ["number", "null"],
              description: "Fret number or null for muted"
            },
            minItems: 6,
            maxItems: 6
          }
        },
        required: ["voicing"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return data.voicing;
};

export const generateTheoryImage = async (prompt: string, size: ImageSize) => {
  if (!(await window.aistudio.hasSelectedApiKey())) {
    await window.aistudio.openSelectKey();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from model");
};
