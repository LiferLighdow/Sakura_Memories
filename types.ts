
export enum GameState {
  MENU,
  LOADING,
  PLAYING,
  ENDING
}

export interface Character {
  id: 'yuki' | 'haruka' | 'aoi';
  name: string;
  description: string;
  image: string | null;
}

export type Affection = {
  [key in Character['id']]: number;
};

export interface Choice {
  text: string;
  affectionEffect: Partial<Affection>;
}

export interface Scene {
  sceneId: string;
  character: 'Yuki' | 'Haruka' | 'Aoi' | 'Narrator';
  dialogue: string;
  backgroundDescription: string;
  choices: Choice[];
}

export interface Ending {
    endingTitle: string;
    endingText: string;
    backgroundImageDescription: string;
}
