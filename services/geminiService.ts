import { GoogleGenAI, Type } from "@google/genai";
import type { Affection, Character } from '../types';

// WARNING: This approach is NOT recommended for production.
// The code below uses `process.env.API_KEY`, which will NOT work when deployed
// directly to a static hosting site like GitHub Pages because browsers do not
// have access to `process.env`. Replacing it with a hardcoded key will expose
// it to anyone visiting your site, creating a major security risk.
// The only recommended approach is to use a secure backend proxy (like Netlify Functions).
if (!process.env.API_KEY) {
    console.error("API_KEY is not defined. The app will fail. Please read the warning in services/geminiService.ts");
}

const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

// Schemas are now defined in the frontend
const storySceneSchema = {
    type: Type.OBJECT,
    properties: {
        sceneId: { type: Type.STRING, description: "A unique ID for this scene, e.g., 'yuki_path_2'." },
        character: { type: Type.STRING, description: "Name of the character featured/speaking (Yuki, Haruka, Aoi, or Narrator for general descriptions)." },
        dialogue: { type: Type.STRING, description: "The dialogue or narrative text for the scene. Must be in Traditional Chinese." },
        backgroundDescription: { type: Type.STRING, description: "A brief description of the background in English for image generation, e.g., 'High school classroom, afternoon sun'." },
        choices: {
            type: Type.ARRAY,
            description: "An array of 2-3 choices for the player.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The text for the player's choice, in Traditional Chinese." },
                    affectionEffect: {
                        type: Type.OBJECT,
                        properties: {
                            yuki: { type: Type.INTEGER, description: "Affection change for Yuki, e.g. 10, -5, 0." },
                            haruka: { type: Type.INTEGER, description: "Affection change for Haruka." },
                            aoi: { type: Type.INTEGER, description: "Affection change for Aoi." }
                        },
                        required: ["yuki", "haruka", "aoi"]
                    }
                },
                required: ["text", "affectionEffect"]
            }
        }
    },
    required: ["sceneId", "character", "dialogue", "backgroundDescription", "choices"]
};

const endingSchema = {
    type: Type.OBJECT,
    properties: {
        endingTitle: { type: Type.STRING, description: "The title of the ending in Traditional Chinese, e.g., '與雪的永恆'." },
        endingText: { type: Type.STRING, description: "The final, conclusive narration for the ending in Traditional Chinese." },
        backgroundImageDescription: { type: Type.STRING, description: "A detailed English description for a romantic final image, e.g., 'Anime couple kissing under a cherry blossom tree at night'." }
    },
    required: ["endingTitle", "endingText", "backgroundImageDescription"]
};

export const generateInitialScene = async (playerName: string, characters: Character[]): Promise<any> => {
    const characterDescriptions = characters.map(c => `${c.name}: ${c.description}`).join('\n');
    const prompt = `這是愛情養成遊戲的開頭。玩家名稱是 ${playerName}。故事發生在日本高中。登場女主角有：\n${characterDescriptions}\n請生成第一個場景，介紹所有角色並讓玩家做出第一個選擇。`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are a creative storyteller for a Japanese anime-style high school romance visual novel. Generate content in Traditional Chinese and follow the requested JSON schema. The story should be engaging and romantic.",
            responseMimeType: "application/json",
            responseSchema: storySceneSchema,
        }
    });

    return JSON.parse(response.text.trim());
};

export const generateNextScene = async (playerName: string, currentAffection: Affection, storyHistory: string[]): Promise<any> => {
    const prompt = `玩家名稱: ${playerName}\n目前好感度: ${JSON.stringify(currentAffection)}\n故事摘要: ${storyHistory.join(' -> ')}\n\n請根據以上內容，生成接下來的場景與選擇。故事應該根據好感度產生微妙的變化。`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are a creative storyteller for a Japanese anime-style high school romance visual novel. Generate content in Traditional Chinese and follow the requested JSON schema. The story should be engaging and romantic.",
            responseMimeType: "application/json",
            responseSchema: storySceneSchema,
        }
    });

    return JSON.parse(response.text.trim());
};

export const generateEnding = async (playerName: string, finalCharacter: Character, storyHistory: string[]): Promise<any> => {
    const prompt = `玩家 ${playerName} 的故事結束了。他與 ${finalCharacter.name} (${finalCharacter.description}) 的關係最為深厚。故事摘要: ${storyHistory.join(' -> ')}\n\n請為他們生成一個浪漫的、決定性的結局。`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are a creative storyteller for a Japanese anime-style high school romance visual novel. Generate a conclusive and emotional ending in Traditional Chinese based on the provided character and context. Follow the requested JSON schema.",
            responseMimeType: "application/json",
            responseSchema: endingSchema,
        }
    });

    return JSON.parse(response.text.trim());
};

export const generateImage = async (prompt: string): Promise<string> => {
    const fullPrompt = `Full body portrait, beautiful Japanese anime character, high-quality digital art, detailed face and eyes, vibrant colors, clean lines. Style of a modern visual novel. ${prompt}`;
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '3:4',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const generateBackgroundImage = async (prompt: string): Promise<string> => {
    const fullPrompt = `Lush, beautiful anime background art, vibrant colors, detailed scenery. Style of a high-budget visual novel. ${prompt}`;
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};
