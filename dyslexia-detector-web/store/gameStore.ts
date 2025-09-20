// src/store/gameStore.ts
import { generateId } from '@/lib/utils';
import { GameResult, GameSession, GameType, Player, TestSession } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
	// Player management
	currentPlayer: Player | null;
	players: Player[];

	// Session management
	currentTestSession: TestSession | null;
	gameSessions: GameSession[];
	testSessions: TestSession[];

	// Game state
	currentGame: GameType | null;
	isGameActive: boolean;
	gameStartTime: Date | null;

	// Actions
	setCurrentPlayer: (player: Player) => void;
	createPlayer: (name: string, age: number, email?: string) => Player;
	startTestSession: (playerId: string) => TestSession;
	startGame: (gameType: GameType) => void;
	endGame: (result: GameResult) => GameSession;
	completeTestSession: () => void;

	// Data persistence
	saveToStorage: () => void;
	loadFromStorage: () => void;
}

export const useGameStore = create<GameState>()(
	persist(
		(set, get) => ({
			// Initial state
			currentPlayer: null,
			players: [],
			currentTestSession: null,
			gameSessions: [],
			testSessions: [],
			currentGame: null,
			isGameActive: false,
			gameStartTime: null,

			// Actions
			setCurrentPlayer: (player) => {
				set({ currentPlayer: player });
			},

			createPlayer: (name, age, email) => {
				const player: Player = {
					id: generateId(),
					name,
					age,
					email,
					createdAt: new Date(),
				};
				set((state) => ({
					players: [...state.players, player],
					currentPlayer: player,
				}));
				return player;
			},

			startTestSession: (playerId) => {
				const testSession: TestSession = {
					id: generateId(),
					playerId,
					startTime: new Date(),
					completedGames: [],
					currentGameIndex: 0,
					isCompleted: false,
				};
				set({ currentTestSession: testSession });
				return testSession;
			},

			startGame: (gameType) => {
				set({
					currentGame: gameType,
					isGameActive: true,
					gameStartTime: new Date(),
				});
			},

			endGame: (result) => {
				const state = get();
				if (!state.currentPlayer || !state.currentTestSession) {
					throw new Error('No active player or test session');
				}

				const gameSession: GameSession = {
					id: generateId(),
					playerId: state.currentPlayer.id,
					gameType: result.gameType,
					startTime: state.gameStartTime || new Date(),
					endTime: new Date(),
					score: result.score,
					totalClicks: result.totalClicks,
					hits: result.hits,
					misses: result.misses,
					accuracy: result.accuracy,
					missRate: result.missRate,
					timeSpent: result.timeSpent,
					gameData: {},
				};

				const updatedTestSession: TestSession = {
					...state.currentTestSession,
					completedGames: [...state.currentTestSession.completedGames, gameSession],
					currentGameIndex: state.currentTestSession.currentGameIndex + 1,
				};

				set({
					gameSessions: [...state.gameSessions, gameSession],
					currentTestSession: updatedTestSession,
					currentGame: null,
					isGameActive: false,
					gameStartTime: null,
				});

				return gameSession;
			},

			completeTestSession: () => {
				const state = get();
				if (!state.currentTestSession) return;

				const completedTestSession: TestSession = {
					...state.currentTestSession,
					endTime: new Date(),
					isCompleted: true,
				};

				set({
					testSessions: [...state.testSessions, completedTestSession],
					currentTestSession: null,
				});
			},

			saveToStorage: () => {
				const state = get();
				// In a real app, this would save to a backend
				console.log('Saving to storage:', state);
			},

			loadFromStorage: () => {
				// In a real app, this would load from a backend
				console.log('Loading from storage');
			},
		}),
		{
			name: 'game-storage',
			partialize: (state) => ({
				players: state.players,
				gameSessions: state.gameSessions,
				testSessions: state.testSessions,
			}),
		}
	)
);
