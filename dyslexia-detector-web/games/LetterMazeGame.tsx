'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameResult } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Target, Timer, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface LetterMazeGameProps {
	onGameComplete: (result: GameResult) => void;
}

interface MazeTile {
	letter: string;
	isCorrect: boolean;
	isVisited: boolean;
	x: number;
	y: number;
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const mazeSize = 6;

// Admin/Developer Settings
// The number of words in the sequence that must be found to complete the game.
const numberOfWordsInGame = 5;

// Organized lists of words by length for more control over difficulty and variety.
const wordLists = {
	3: ['CAT', 'DOG', 'SUN', 'HAT', 'CAR'],
	4: ['BLUE', 'GAME', 'LIFE', 'MOON', 'TIME'],
	5: ['APPLE', 'BOARD', 'CABLE', 'DREAM', 'EARTH'],
	6: ['ORANGE', 'PLANET', 'SCHOOL', 'TRAVEL', 'WONDER'],
};

export default function LetterMazeGame({ onGameComplete }: LetterMazeGameProps) {
	const [maze, setMaze] = useState<MazeTile[]>([]);
	const [currentTarget, setCurrentTarget] = useState('');
	const [score, setScore] = useState(0);
	const [hits, setHits] = useState(0);
	const [misses, setMisses] = useState(0);
	const [totalClicks, setTotalClicks] = useState(0);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [gamePhase, setGamePhase] = useState<'instructions' | 'playing' | 'complete'>('instructions');
	const [targetSequence, setTargetSequence] = useState<string[]>([]);
	const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
	const [wordsFound, setWordsFound] = useState(0);

	const generateMaze = useCallback(() => {
		const newMaze: MazeTile[] = [];

		// Choose a word length randomly from the available word lists
		const availableLengths = Object.keys(wordLists).map((len) => parseInt(len, 10));
		const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];

		// Select a random word of that length
		const wordsOfSelectedLength = wordLists[randomLength as keyof typeof wordLists];
		const randomWord = wordsOfSelectedLength[Math.floor(Math.random() * wordsOfSelectedLength.length)];
		const sequence = randomWord.split('');

		setTargetSequence(sequence);
		setCurrentTarget(sequence[0]);
		setCurrentSequenceIndex(0);

		// Create maze grid with random letters
		for (let y = 0; y < mazeSize; y++) {
			for (let x = 0; x < mazeSize; x++) {
				const randomLetter = letters[Math.floor(Math.random() * letters.length)];
				newMaze.push({
					letter: randomLetter,
					isCorrect: false,
					isVisited: false,
					x,
					y,
				});
			}
		}

		// Place the letters of the chosen word randomly in the maze
		const sequenceCopy = [...sequence];
		while (sequenceCopy.length > 0) {
			const letterToPlace = sequenceCopy.pop();
			const availablePositions = newMaze.filter((tile) => !tile.isCorrect);
			if (availablePositions.length === 0) break; // Safety break
			const randomIndex = Math.floor(Math.random() * availablePositions.length);
			const position = availablePositions[randomIndex];
			const mazeIndex = newMaze.findIndex((tile) => tile.x === position.x && tile.y === position.y);
			newMaze[mazeIndex] = {
				...newMaze[mazeIndex],
				letter: letterToPlace || '',
				isCorrect: true,
			};
		}

		setMaze(newMaze);
	}, []);

	useEffect(() => {
		if (gamePhase === 'playing') {
			generateMaze();
			const timer = setInterval(() => {
				setTimeElapsed((prev) => prev + 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [gamePhase, generateMaze]);

	const handleTileClick = (clickedTile: MazeTile) => {
		setTotalClicks((prev) => prev + 1);

		if (clickedTile.letter === currentTarget && !clickedTile.isVisited) {
			// Correct click
			setHits((prev) => prev + 1);
			setScore((prev) => prev + 10);

			setMaze((prev) =>
				prev.map((tile) =>
					tile.x === clickedTile.x && tile.y === clickedTile.y ? { ...tile, isVisited: true } : tile
				)
			);

			// Move to next in sequence
			const nextIndex = currentSequenceIndex + 1;
			if (nextIndex < targetSequence.length) {
				setCurrentSequenceIndex(nextIndex);
				setCurrentTarget(targetSequence[nextIndex]);
			} else {
				// Word completed
				setWordsFound((prev) => prev + 1);
				if (wordsFound + 1 >= numberOfWordsInGame) {
					endGame();
				} else {
					setTimeout(() => {
						generateMaze();
					}, 500);
				}
			}
		} else {
			// Incorrect click
			setMisses((prev) => prev + 1);
			setScore((prev) => Math.max(0, prev - 2));
		}
	};

	const startGame = () => {
		setGamePhase('playing');
		setWordsFound(0); // Reset words found for new game
		setScore(0);
		setHits(0);
		setMisses(0);
		setTotalClicks(0);
		setTimeElapsed(0);
	};

	const endGame = () => {
		const accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;
		const missRate = totalClicks > 0 ? Math.round((misses / totalClicks) * 100) : 0;

		const result: GameResult = {
			gameType: 'letter-maze',
			score,
			totalClicks,
			hits,
			misses,
			accuracy,
			missRate,
			timeSpent: timeElapsed,
		};

		onGameComplete(result);
	};

	if (gamePhase === 'instructions') {
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
				<Card className="playful-card">
					<CardHeader className="text-center">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl mx-auto mb-4 flex items-center justify-center"
						>
							<Zap className="h-10 w-10 text-white" />
						</motion.div>
						<CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							Word Maze Adventure!
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center space-y-4">
							<p className="text-lg text-gray-700">
								Find the letters of the secret word in the correct order to earn points!
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
								<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
									<Target className="h-6 w-6 text-blue-500 mt-1" />
									<div>
										<h4 className="font-semibold text-blue-700">Your Mission</h4>
										<p className="text-sm text-blue-600">
											Spell <strong>{numberOfWordsInGame}</strong> words to complete the game.
										</p>{' '}
									</div>
								</div>
								<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
									<Star className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h4 className="font-semibold text-green-700">Scoring</h4>
										<p className="text-sm text-green-600">
											<strong>+10</strong> points for correct clicks, <strong>-2</strong> for wrong ones.
										</p>
									</div>
								</div>
							</div>
						</div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button onClick={startGame} variant="game" size="game" className="w-full">
								Start Adventure!
							</Button>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (gamePhase === 'playing') {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="w-full max-w-4xl mx-auto space-y-6"
			>
				{/* Game Header */}
				<Card className="playful-card">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="text-center">
									<p className="text-sm text-gray-600">Find Letter</p>
									<p className="text-3xl font-bold text-purple-600 bg-purple-100 rounded-xl px-4 py-2">
										{currentTarget}
									</p>
								</div>
								<div className="text-sm text-gray-500">
									<p>
										Word <strong>{wordsFound + 1}</strong> of <strong>{numberOfWordsInGame}</strong>
									</p>
									<div className="flex items-center gap-1">
										{targetSequence.map((letter, index) => (
											<span
												key={letter + index}
												className={`font-semibold ${
													index === currentSequenceIndex
														? 'text-purple-600'
														: index < currentSequenceIndex
														? 'text-green-500'
														: 'text-gray-400'
												}`}
											>
												{letter}
											</span>
										))}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-4 text-sm">
								<div className="text-center">
									<Timer className="h-4 w-4 mx-auto mb-1 text-orange-500" />
									<p className="font-semibold">
										{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
									</p>
								</div>
								<div className="text-center">
									<Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
									<p className="font-semibold">{score}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Maze Grid */}
				<Card className="playful-card">
					<CardContent className="p-6">
						<div className="grid grid-cols-6 gap-3 max-w-lg mx-auto">
							<AnimatePresence>
								{maze.map((tile, index) => (
									<motion.button
										key={`${tile.x}-${tile.y}-${index}`}
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0, opacity: 0 }}
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										transition={{ delay: index * 0.02 }}
										onClick={() => handleTileClick(tile)}
										className={`
                                            h-16 w-16 rounded-xl font-bold text-xl transition-all duration-200
                                            ${
												tile.isVisited
													? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg'
													: 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
											}
                                        `}
									>
										{tile.letter}
									</motion.button>
								))}
							</AnimatePresence>
						</div>
						<div className="mt-6 text-center">
							<Button onClick={endGame} variant="outline" className="rounded-xl">
								Finish Game
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	return null;
}
