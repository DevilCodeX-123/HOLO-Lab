import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const explainEvent = async (eventDescription: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a friendly, enthusiastic science mentor for children in a HoloLab AR system. 
    Explain the following event concisely and engagingly: ${eventDescription}. 
    Keep it to 2-3 sentences. Use emojis!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Wow! That was quite an interaction. Let's explore more! 🧪✨";
  }
};

export const getSmartSuggestion = async (currentObjects: string[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on these objects currently in the scene: ${currentObjects.join(", ")}, 
    suggest one interesting science experiment or object to add next. 
    Make it a short, catchy question under 10 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Want to try adding an Asteroid? ☄️";
  }
};
