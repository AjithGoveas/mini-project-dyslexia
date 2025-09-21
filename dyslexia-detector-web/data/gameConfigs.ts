// src/data/gameConfigs.ts
import { GameConfig } from '@/types';

export const gameConfigs: GameConfig[] = [
	{
		id: 'letter-maze',
		name: 'Letter Maze',
		description: 'Navigate through a maze of letters to find the correct path',
		icon: 'Zap',
		estimatedTime: 5,
		difficulty: 'medium',
	},
	{
		id: 'word-flip',
		name: 'Word Flip',
		description: 'Flip cards to match words with their meanings',
		icon: 'RotateCcw',
		estimatedTime: 4,
		difficulty: 'easy',
	},
	{
		id: 'sound-match',
		name: 'Sound Match',
		description: 'Match sounds with their corresponding letters or words',
		icon: 'Volume2',
		estimatedTime: 6,
		difficulty: 'hard',
	},
	{
		id: 'pattern-trace',
		name: 'Pattern Trace',
		description: 'Trace patterns and shapes to improve visual processing',
		icon: 'PenTool',
		estimatedTime: 5,
		difficulty: 'medium',
	},
	{
		id: 'mirror-match',
		name: 'Mirror Match',
		description: 'Match pairs of mirrored letters or words',
		icon: 'RefreshCcw',
		estimatedTime: 4,
		difficulty: 'easy',
	},
	{
		id: 'odd-one-out',
		name: 'Odd One Out',
		description: 'Identify the item that does not belong in a group',
		icon: 'Target',
		estimatedTime: 5,
		difficulty: 'medium',
	},
];
