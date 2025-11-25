import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFloodImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      คุณคือผู้เชี่ยวชาญด้านการกู้ภัยและประเมินสถานการณ์ภัยพิบัติ
      วิเคราะห์รูปภาพน้ำท่วมนี้เพื่อประเมินความต้องการความช่วยเหลือ
      ตอบกลับเป็น JSON Format เท่านั้น โดยมี Key ดังนี้:
      - peopleCount: (number) จำนวนคนที่เห็นในภาพ (ประมาณการ)
      - animalCount: (number) จำนวนสัตว์ที่เห็นในภาพ (ประมาณการ)
      - hasVulnerable: (boolean) มีผู้ป่วยติดเตียง คนชรา เด็กเล็ก หรือผู้พิการที่ไม่สามารถช่วยเหลือตัวเองได้หรือไม่
      - urgency: (string) ระดับความเร่งด่วน เลือกจาก 'Low', 'Medium', 'High', 'Critical'
      - reasoning: (string) เหตุผลประกอบการประเมินความเร่งด่วน (ภาษาไทย สั้นกระชับ)
      - description: (string) รายละเอียดสภาพแวดล้อม ระดับน้ำ หรือสิ่งที่สังเกตเห็น (ภาษาไทย)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity, can be dynamic
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            peopleCount: { type: Type.NUMBER },
            animalCount: { type: Type.NUMBER },
            hasVulnerable: { type: Type.BOOLEAN },
            urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            reasoning: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["peopleCount", "animalCount", "hasVulnerable", "urgency", "reasoning", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง");
  }
};