
import React, { useState } from 'react';

interface StartMenuProps {
  onStart: (name: string) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full animate-fadeIn bg-black bg-opacity-40">
      <div className="text-center">
        <h1 className="text-7xl font-serif-jp text-white text-shadow mb-2" style={{color: '#FFB6C1'}}>櫻色回憶</h1>
        <h2 className="text-3xl text-white text-shadow mb-12">Sakura Memories</h2>
      </div>
      <form onSubmit={handleStart} className="flex flex-col items-center gap-4 bg-white/20 backdrop-blur-sm p-8 rounded-lg box-shadow">
        <label htmlFor="playerName" className="text-white text-lg font-bold">請輸入你的名字：</label>
        <input
          id="playerName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="主角"
          className="w-64 p-2 rounded text-center text-lg bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-64 mt-4 px-8 py-3 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
        >
          開始故事
        </button>
      </form>
       <footer className="absolute bottom-4 text-white/50 text-sm">
         由 Gemini API 強力驅動
      </footer>
    </div>
  );
};
