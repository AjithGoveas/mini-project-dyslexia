'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { GameResult } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Headset, RotateCcw, Star, Target, Timer, Volume2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// Interfaces for type safety
interface SoundPair {
	word: string;
	soundFile: string;
	id: string;
}

interface WordCard {
	word: string;
	isCorrect: boolean;
	id: string;
}

interface SoundMatchGameProps {
	onGameComplete: (result: GameResult) => void;
}

const wordSounds: SoundPair[] = [
	{ word: 'BIRD', soundFile: '/assets/sounds/bird.mp3', id: '1' },
	{ word: 'CAR', soundFile: '/assets/sounds/car.mp3', id: '2' },
	{ word: 'RAIN', soundFile: '/assets/sounds/rain.mp3', id: '3' },
	{ word: 'BELL', soundFile: '/assets/sounds/bell.mp3', id: '4' },
	{ word: 'PHONE', soundFile: '/assets/sounds/phone.mp5', id: '5' },
];

const playSound = (soundFile: string) => {
	// In a real app, you would play the sound here.
	// For this example, we'll just log it.
	console.log(`Playing sound: ${soundFile}`);
	const audio = new Audio(soundFile);
	audio.play().catch((err) => console.error('Audio playback failed:', err));
};

const SoundMatchGame: React.FC<SoundMatchGameProps> = ({ onGameComplete }) => {
	const { recordGameResult } = useGameStore();
	const [currentSound, setCurrentSound] = useState<SoundPair | null>(null);
	const [options, setOptions] = useState<WordCard[]>([]);
	const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
	const [score, setScore] = useState(0);
	const [hits, setHits] = useState(0);
	const [misses, setMisses] = useState(0);
	const [totalClicks, setTotalClicks] = useState(0);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [gamePhase, setGamePhase] = useState<'instructions' | 'playing' | 'complete'>('instructions');
	const [roundsCompleted, setRoundsCompleted] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [matches, setMatches] = useState<string[]>([]);

	const selectNewSound = useCallback(() => {
		const availableSounds = wordSounds.filter((sound) => !matches.includes(sound.id));
		if (availableSounds.length === 0) {
			endGame();
			return;
		}

		const sound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
		setCurrentSound(sound);

		const correctWord = { word: sound.word, isCorrect: true, id: sound.id };
		const incorrectWords = wordSounds
			.filter((s) => s.id !== sound.id)
			.sort(() => Math.random() - 0.5)
			.slice(0, 3)
			.map((s) => ({ word: s.word, isCorrect: false, id: s.id }));

		const allOptions = [correctWord, ...incorrectWords].sort(() => Math.random() - 0.5);
		setOptions(allOptions);
		setFeedback(null);
		setIsProcessing(false);
	}, [matches]);

	useEffect(() => {
		if (gamePhase === 'playing') {
			selectNewSound();
			const timer = setInterval(() => {
				setTimeElapsed((prev) => prev + 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [gamePhase, selectNewSound]);

	const handleWordCardClick = (clickedCard: WordCard) => {
		if (isProcessing) return;

		setIsProcessing(true);
		setTotalClicks((prev) => prev + 1);

		if (clickedCard.isCorrect) {
			setFeedback('correct');
			setScore((prev) => prev + 25);
			setHits((prev) => prev + 1);
			setRoundsCompleted((prev) => prev + 1);
			setMatches((prev) => [...prev, clickedCard.id]);
		} else {
			setFeedback('incorrect');
			setScore((prev) => Math.max(0, prev - 10));
			setMisses((prev) => prev + 1);
		}

		setTimeout(() => {
			selectNewSound();
		}, 1500);
	};

	const startGame = () => {
		setGamePhase('playing');
	};

	const endGame = () => {
		const accuracy = roundsCompleted > 0 ? Math.round((hits / roundsCompleted) * 100) : 0;
		const missRate = roundsCompleted > 0 ? Math.round((misses / roundsCompleted) * 100) : 0;

		const result: GameResult = {
			gameType: 'sound-match',
			score,
			totalClicks,
			hits,
			misses,
			accuracy,
			missRate,
			timeSpent: timeElapsed,
		};
		recordGameResult('SoundMatch', 'completed', result);
		onGameComplete(result);
		setGamePhase('complete');
	};

	if (gamePhase === 'instructions') {
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
				<Card className="playful-card">
					<CardHeader className="text-center">
						<motion.div
							animate={{ rotate: [0, -10, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl mx-auto mb-4 flex items-center justify-center"
						>
							<Headset className="h-10 w-10 text-white" />
						</motion.div>
						<CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
							Sound Test
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center space-y-4">
							<p className="text-lg text-gray-700">Listen to the sound and select the correct word.</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
								<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
									<Target className="h-6 w-6 text-blue-500 mt-1" />
									<div>
										<h4 className="font-semibold text-blue-700">How to Play</h4>
										<p className="text-sm text-blue-600">
											Click the <Volume2 className="inline h-4 w-4" /> button to hear the sound,
											then choose the word that matches.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
									<Star className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h4 className="font-semibold text-green-700">Scoring</h4>
										<p className="text-sm text-green-600">
											+25 points for correct answers, -10 for wrong ones.
										</p>
									</div>
								</div>
							</div>
						</div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button onClick={startGame} variant="game" size="game" className="w-full">
								Start Listening!
							</Button>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (gamePhase === 'playing' && currentSound) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="w-full max-w-4xl mx-auto space-y-6"
			>
				<Card className="playful-card">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="text-center">
									<p className="text-sm text-gray-600">Rounds</p>
									<p className="text-2xl font-bold text-blue-600">{roundsCompleted}/4</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-600">Correct</p>
									<p className="text-2xl font-bold text-green-600">{hits}</p>
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
				<Card className="playful-card">
					<CardContent className="p-6 space-y-8">
						<div className="flex justify-center">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="w-40 h-40 flex items-center justify-center cursor-pointer rounded-full bg-purple-400/50 hover:bg-purple-400 transition-colors duration-300"
								onClick={() => playSound(currentSound.soundFile)}
							>
								<Volume2 className="h-20 w-20 text-white" />
							</motion.div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<AnimatePresence>
								{options.map((option) => (
									<motion.div
										key={option.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										whileHover={{ scale: isProcessing ? 1 : 1.05 }}
										whileTap={{ scale: isProcessing ? 1 : 0.95 }}
										onClick={() => handleWordCardClick(option)}
										className={`p-6 text-center text-lg font-semibold rounded-xl shadow-lg cursor-pointer transition-colors duration-300
                                            ${
												feedback === 'correct' && option.isCorrect
													? 'bg-green-500 text-white'
													: feedback === 'incorrect' && !option.isCorrect
													? 'bg-gray-400 text-gray-700'
													: feedback === 'incorrect' && option.isCorrect
													? 'bg-green-500 text-white'
													: 'bg-white text-gray-800'
											}`}
									>
										{option.word}
										{feedback && (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="absolute top-2 right-2"
											>
												{option.isCorrect ? (
													<Check className="h-6 w-6 text-white" />
												) : (
													<X className="h-6 w-6 text-white" />
												)}
											</motion.div>
										)}
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (gamePhase === 'complete') {
		const accuracy = roundsCompleted > 0 ? Math.round((hits / roundsCompleted) * 100) : 0;
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="w-full max-w-2xl mx-auto text-center"
			>
				<Card className="playful-card">
					<CardHeader>
						<CardTitle className="text-3xl font-bold text-green-600">Game Over!</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-xl">You completed all the sounds!</p>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600">Total Score</p>
								<p className="text-3xl font-bold text-blue-600">{score}</p>
							</div>
							<div className="bg-purple-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600">Accuracy</p>
								<p className="text-3xl font-bold text-purple-600">{accuracy}%</p>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600">Correct Answers</p>
								<p className="text-3xl font-bold text-green-600">{hits}</p>
							</div>
							<div className="bg-red-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600">Time Spent</p>
								<p className="text-3xl font-bold text-red-600">
									{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
								</p>
							</div>
						</div>
						<Button onClick={() => window.location.reload()} variant="game" className="w-full mt-4">
							<RotateCcw className="mr-2 h-4 w-4" /> Play Again
						</Button>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	return null;
};

export default SoundMatchGame;
