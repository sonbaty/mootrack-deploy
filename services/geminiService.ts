import { GoogleGenAI } from "@google/genai";
import { JournalEntry, MoodLevel } from "../types";
import { ACTIVITIES, GEMINI_MODEL } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateReflection = async (
  mood: MoodLevel,
  activityIds: string[],
  note: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Unable to connect to AI service.";

  const activityLabels = activityIds
    .map((id) => ACTIVITIES.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(", ");

  const prompt = `
    You are a compassionate and insightful journaling assistant.
    
    User's current state:
    - Mood Level: ${mood} (1 is terrible, 5 is amazing)
    - Activities done today: ${activityLabels || "None specified"}
    - User's note: "${note}"

    Based on this, provide a short, 2-sentence reflection or piece of advice. 
    If the mood is low, be supportive. If the mood is high, celebrate it. 
    Address the specific activities if relevant.
    Keep the tone warm and human.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    
    return response.text || "Could not generate reflection.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Thinking service currently unavailable.";
  }
};
