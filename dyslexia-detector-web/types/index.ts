// src/types/index.ts
export interface Player {
	id: string;
	name: string;
	age: number;
	email?: string;
	createdAt: Date;
	lastPlayed?: Date;
}

export interface GameSession {
	id: string;
	playerId: string;
	gameType: GameType;
	startTime: Date;
	endTime?: Date;
	score: number;
	totalClicks: number;
	hits: number;
	misses: number;
	accuracy: number;
	missRate: number;
	timeSpent: number;
	gameData: Record<string, any>;
}

export interface TestSession {
	id: string;
	playerId: string;
	startTime: Date;
	endTime?: Date;
	completedGames: GameSession[];
	currentGameIndex: number;
	isCompleted: boolean;
}

export type GameType = 'letter-maze' | 'word-flip' | 'sound-match' | 'pattern-trace';

export interface GameConfig {
	id: GameType;
	name: string;
	description: string;
	icon: string;
	estimatedTime: number;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameResult {
	gameType: GameType;
	score: number;
	totalClicks: number;
	hits: number;
	misses: number;
	accuracy: number;
	missRate: number;
	timeSpent: number;
}
