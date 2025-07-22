import type { Affection, Character } from '../types';

// Generic fetch handler for our Vercel serverless function
const callApi = async (action: string, payload: object) => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '發生未知的 API 錯誤。' }));
        throw new Error(errorData.message || '無法從伺服器獲取資料。');
    }

    return response.json();
}

export const generateInitialScene = async (playerName: string, characters: Character[]): Promise<any> => {
    return callApi('generateInitialScene', { playerName, characters });
};

export const generateNextScene = async (playerName: string, currentAffection: Affection, storyHistory: string[]): Promise<any> => {
    return callApi('generateNextScene', { playerName, currentAffection, storyHistory });
};

export const generateEnding = async (playerName: string, finalCharacter: Character, storyHistory: string[]): Promise<any> => {
    return callApi('generateEnding', { playerName, finalCharacter, storyHistory });
};

export const generateImage = async (prompt: string): Promise<string> => {
    const result = await callApi('generateImage', { prompt });
    return result.imageUrl;
};

export const generateBackgroundImage = async (prompt: string): Promise<string> => {
    const result = await callApi('generateBackgroundImage', { prompt });
    return result.imageUrl;
};
