
import React, { useState, useCallback, useEffect } from 'react';
import type { Affection, Character, Choice, Scene, Ending } from './types';
import { GameState } from './types';
import { generateInitialScene, generateNextScene, generateEnding, generateImage, generateBackgroundImage } from './services/geminiService';
import { StartMenu } from './components/StartMenu';
import { GameScene } from './components/GameScene';
import { EndingScene } from './components/EndingScene';
import { LoadingScreen } from './components/LoadingScreen';

const MAX_TURNS = 7;

const initialCharacters: Character[] = [
    { id: 'yuki', name: 'Yuki (雪)', description: '冰山美人學生會長，銀色長髮，看似冷漠但內心溫柔。', image: null },
    { id: 'haruka', name: 'Haruka (陽菜)', description: '活潑開朗的青梅竹馬，運動社團的王牌，總是充滿活力。', image: null },
    { id: 'aoi', name: 'Aoi (碧)', description: '文靜的圖書委員，喜歡讀書和安靜的地方，有點害羞。', image: null },
];

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.MENU);
    const [playerName, setPlayerName] = useState<string>('');
    const [characters, setCharacters] = useState<Character[]>(initialCharacters);
    const [affection, setAffection] = useState<Affection>({ yuki: 0, haruka: 0, aoi: 0 });
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [storyHistory, setStoryHistory] = useState<string[]>([]);
    const [backgroundImage, setBackgroundImage] = useState<string>('https://picsum.photos/1920/1080?blur=5');
    const [endingData, setEndingData] = useState<{ ending: Ending, image: string } | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    const preloadCharacterImages = useCallback(async () => {
        setLoadingMessage('正在繪製角色...');
        const updatedCharacters = [...initialCharacters];
        for (let i = 0; i < updatedCharacters.length; i++) {
            try {
                const image = await generateImage(updatedCharacters[i].description + ', wearing a Japanese school uniform');
                updatedCharacters[i] = { ...updatedCharacters[i], image };
                setCharacters([...updatedCharacters]);
            } catch (error) {
                console.error(`Failed to generate image for ${updatedCharacters[i].name}:`, error);
                // Use a placeholder if generation fails
                updatedCharacters[i] = { ...updatedCharacters[i], image: 'https://picsum.photos/600/800' };
                setCharacters([...updatedCharacters]);
            }
        }
    }, []);

    const startGame = useCallback(async (name: string) => {
        setPlayerName(name);
        setGameState(GameState.LOADING);

        await preloadCharacterImages();

        try {
            setLoadingMessage('正在編寫故事開頭...');
            const initialScene = await generateInitialScene(name, characters);
            setCurrentScene(initialScene);
            setStoryHistory([initialScene.dialogue]);
            
            setLoadingMessage('正在繪製背景...');
            const bgImage = await generateBackgroundImage(initialScene.backgroundDescription);
            setBackgroundImage(bgImage);

            setCurrentTurn(1);
            setGameState(GameState.PLAYING);
        } catch (error) {
            console.error("Failed to start game:", error);
            alert("遊戲啟動失敗，請檢查API金鑰並刷新頁面。");
            setGameState(GameState.MENU);
        }
    }, [characters, preloadCharacterImages]);

    const handleChoice = useCallback(async (choice: Choice) => {
        setGameState(GameState.LOADING);

        const newAffection: Affection = { ...affection };
        Object.keys(choice.affectionEffect).forEach(charId => {
            const key = charId as keyof Affection;
            newAffection[key] += choice.affectionEffect[key] || 0;
        });
        setAffection(newAffection);

        const newHistory = [...storyHistory, choice.text];
        setStoryHistory(newHistory);

        if (currentTurn + 1 > MAX_TURNS) {
            // Go to ending
            try {
                setLoadingMessage('正在迎接你的命運...');
                const finalCharacterId = Object.keys(newAffection).reduce((a, b) => newAffection[a as keyof Affection] > newAffection[b as keyof Affection] ? a : b) as keyof Affection;
                const finalCharacter = characters.find(c => c.id === finalCharacterId)!;

                const ending = await generateEnding(playerName, finalCharacter, newHistory);
                setLoadingMessage('正在繪製結局畫面...');
                const endingImage = await generateBackgroundImage(ending.backgroundImageDescription);
                
                setEndingData({ ending, image: endingImage });
                setGameState(GameState.ENDING);
            } catch (error) {
                console.error("Failed to generate ending:", error);
                alert("產生結局時發生錯誤，將返回主選單。");
                resetGame();
            }
        } else {
            // Go to next scene
            try {
                setLoadingMessage('故事正在繼續...');
                const nextScene = await generateNextScene(playerName, newAffection, newHistory);
                setCurrentScene(nextScene);
                setStoryHistory(prev => [...prev, nextScene.dialogue]);

                setLoadingMessage('正在變換場景...');
                const bgImage = await generateBackgroundImage(nextScene.backgroundDescription);
                setBackgroundImage(bgImage);

                setCurrentTurn(prev => prev + 1);
                setGameState(GameState.PLAYING);
            } catch (error) {
                console.error("Failed to fetch next scene:", error);
                alert("加載下一個場景失敗，請重試。");
                setGameState(GameState.PLAYING); // Revert to playing to allow retry
            }
        }
    }, [affection, currentTurn, storyHistory, characters, playerName]);

    const resetGame = () => {
        setGameState(GameState.MENU);
        setPlayerName('');
        setCharacters(initialCharacters);
        setAffection({ yuki: 0, haruka: 0, aoi: 0 });
        setCurrentScene(null);
        setCurrentTurn(0);
        setStoryHistory([]);
        setBackgroundImage('https://picsum.photos/1920/1080?blur=5');
        setEndingData(null);
        setLoadingMessage('');
    };
    
    const renderSakura = () => {
        return Array.from({ length: 15 }).map((_, i) => (
            <div
                key={i}
                className="absolute text-2xl"
                style={{
                    left: `${Math.random() * 100}vw`,
                    animation: `sakura ${10 + Math.random() * 10}s linear ${Math.random() * 5}s infinite`,
                    top: '-30px',
                    zIndex: 50,
                }}
            >
                🌸
            </div>
        ));
    };

    const renderContent = () => {
        switch (gameState) {
            case GameState.MENU:
                return <StartMenu onStart={startGame} />;
            case GameState.LOADING:
                return <LoadingScreen message={loadingMessage} characters={characters} />;
            case GameState.PLAYING:
                return currentScene && (
                    <GameScene
                        scene={currentScene}
                        onChoice={handleChoice}
                        characters={characters}
                        affection={affection}
                        turn={`${currentTurn}/${MAX_TURNS}`}
                    />
                );
            case GameState.ENDING:
                return endingData && <EndingScene endingData={endingData} onRestart={resetGame} />;
            default:
                return <StartMenu onStart={startGame} />;
        }
    };

    return (
        <main className="relative w-screen h-screen overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{ backgroundImage: `url(${gameState === GameState.ENDING ? endingData?.image : backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
            {gameState !== GameState.MENU && renderSakura()}
            <div className="relative z-10 h-full">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;
