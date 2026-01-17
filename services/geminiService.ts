import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateWheelList = async (topic: string, count: number = 10): Promise<string[]> => {
  if (!apiKey) {
    throw new Error("API Key chưa được cấu hình.");
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Tạo một danh sách khoảng ${count} mục ngắn gọn (dưới 20 ký tự mỗi mục) cho chủ đề: "${topic}". Đây là nội dung cho một vòng quay may mắn (Lucky Wheel).`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Danh sách các mục cho vòng quay"
            }
          },
          required: ["items"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const data = JSON.parse(jsonText);
    return data.items || [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};