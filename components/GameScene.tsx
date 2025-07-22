
import React from 'react';
import type { Scene, Choice, Character, Affection } from '../types';

interface GameSceneProps {
  scene: Scene;
  onChoice: (choice: Choice) => void;
  characters: Character[];
  affection: Affection;
  turn: string;
}

const AffectionMeter: React.FC<{ character: Character, value: number }> = ({ character, value }) => (
    <div className="flex items-center gap-2">
        <img src={character.image ?? ''} alt={character.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/50"/>
        <div className="w-24 bg-gray-600 rounded-full h-2.5">
            <div className="bg-pink-400 h-2.5 rounded-full" style={{ width: `${Math.min(value, 100)}%` }}></div>
        </div>
    </div>
);

export const GameScene: React.FC<GameSceneProps> = ({ scene, onChoice, characters, affection, turn }) => {
  const activeCharacter = characters.find(c => scene.character === c.name);

  return (
    <div className="flex flex-col h-full w-full animate-fadeIn">
        <div className="absolute top-4 left-4 bg-black/50 p-2 rounded-lg flex gap-4 z-20">
            {characters.map(char => (
                <AffectionMeter key={char.id} character={char} value={affection[char.id]} />
            ))}
        </div>
        <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg font-bold z-20">
            {turn}
        </div>
      
      {/* Character Sprites */}
      <div className="flex-grow flex items-end justify-center">
        {activeCharacter && activeCharacter.image && (
          <img
            src={activeCharacter.image}
            alt={activeCharacter.name}
            className="h-5/6 max-h-[85vh] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] animate-fadeIn"
          />
        )}
      </div>

      {/* Dialogue and Choices */}
      <div className="flex-shrink-0 z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {scene.choices.map((choice, index) => (
                <button
                key={index}
                onClick={() => onChoice(choice)}
                className="w-full p-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-lg text-lg text-shadow transition-all duration-300 hover:bg-white/40 hover:scale-105 border border-white/30 box-shadow"
                >
                {choice.text}
                </button>
            ))}
        </div>
        <div className="bg-black/60 backdrop-blur-sm p-6 m-4 rounded-xl border border-white/20 box-shadow">
          <h3 className="text-2xl font-bold text-pink-300 mb-2">{scene.character}</h3>
          <p className="text-white text-lg leading-relaxed h-24 overflow-y-auto font-serif-jp">
            {scene.dialogue}
          </p>
        </div>
      </div>
    </div>
  );
};
