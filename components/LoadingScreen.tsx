
import React from 'react';
import type { Character } from '../types';

interface LoadingScreenProps {
  message: string;
  characters: Character[];
}

const Spinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
);

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, characters }) => {
  const loadedCharacters = characters.filter(c => c.image);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <Spinner />
      <p className="text-white text-2xl mt-6 text-shadow">{message}</p>
      
      {loadedCharacters.length > 0 && (
        <div className="mt-8">
          <p className="text-white/70 mb-4">登場人物</p>
          <div className="flex gap-4">
            {loadedCharacters.map(char => (
              <div key={char.id} className="text-center animate-fadeIn">
                <img src={char.image!} alt={char.name} className="w-24 h-32 object-cover rounded-lg border-2 border-white/50" />
                <p className="text-white mt-2">{char.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
