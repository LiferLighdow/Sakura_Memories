
import React from 'react';
import type { Ending } from '../types';

interface EndingSceneProps {
  endingData: {
    ending: Ending;
    image: string;
  };
  onRestart: () => void;
}

export const EndingScene: React.FC<EndingSceneProps> = ({ endingData, onRestart }) => {
  const { ending, image } = endingData;

  return (
    <div 
        className="flex flex-col items-center justify-center h-full w-full animate-fadeIn"
        style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center bg-black/60 backdrop-blur-sm p-12 rounded-lg max-w-3xl mx-auto box-shadow border border-white/20">
            <h1 className="text-5xl font-serif-jp text-pink-300 text-shadow mb-4">{ending.endingTitle}</h1>
            <p className="text-white text-xl leading-loose mb-12 whitespace-pre-wrap">
                {ending.endingText}
            </p>
            <button
                onClick={onRestart}
                className="px-10 py-4 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-all duration-300 transform hover:scale-105"
            >
                再玩一次
            </button>
        </div>
    </div>
  );
};
