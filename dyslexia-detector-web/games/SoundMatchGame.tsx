'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameResult } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Headset, RotateCcw, Star, Target, Timer, Volume2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// Interfaces for type safety
interface SoundPair {
	word: string;
	soundFile: string;
	id: string;
}

interface SoundCard {
	id: string;
	content: string;
	type: 'word' | 'sound';
	pairId: string;
	isFlipped: boolean;
	isMatched: boolean;
}

interface SoundMatchGameProps {
	onGameComplete: (result: GameResult) => void;
}

const wordSounds: SoundPair[] = [
	{ word: 'BIRD', soundFile: '/sounds/bird.mp3', id: '1' },
	{ word: 'CAR', soundFile: '/sounds/car.mp3', id: '2' },
	{ word: 'RAIN', soundFile: '/sounds/rain.mp3', id: '3' },
	{ word: 'BELL', soundFile: '/sounds/bell.mp3', id: '4' },
	{ word: 'PHONE', soundFile: '/sounds/phone.mp3', id: '5' },
];

const playSound = (soundFile: string) => {
	// In a real app, you would play the sound here.
	// For this example, we'll just log it.
	console.log(`Playing sound: ${soundFile}`);
	// const audio = new Audio(soundFile);
	// audio.play();
};

const SoundMatchGame: React.FC<SoundMatchGameProps> = ({ onGameComplete }) => {
	const [cards, setCards] = useState<SoundCard[]>([]);
	const [flippedCards, setFlippedCards] = useState<SoundCard[]>([]);
	const [matches, setMatches] = useState<string[]>([]);
	const [score, setScore] = useState(0);
	const [hits, setHits] = useState(0);
	const [misses, setMisses] = useState(0);
	const [totalClicks, setTotalClicks] = useState(0);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [gamePhase, setGamePhase] = useState<'instructions' | 'playing' | 'complete'>('instructions');
	const [attempts, setAttempts] = useState(0);

	const generateCards = useCallback(() => {
		const gameCards: SoundCard[] = [];
		const pairs = wordSounds.slice(0, 4);

		pairs.forEach((pair) => {
			gameCards.push({
				id: `word-${pair.id}`,
				content: pair.word,
				type: 'word',
				pairId: pair.id,
				isFlipped: false,
				isMatched: false,
			});
			gameCards.push({
				id: `sound-${pair.id}`,
				content: pair.soundFile,
				type: 'sound',
				pairId: pair.id,
				isFlipped: false,
				isMatched: false,
			});
		});

		for (let i = gameCards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
		}

		setCards(gameCards);
	}, []);

	useEffect(() => {
		if (gamePhase === 'playing') {
			generateCards();
			const timer = setInterval(() => {
				setTimeElapsed((prev) => prev + 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [gamePhase, generateCards]);

	useEffect(() => {
		if (flippedCards.length === 2) {
			setAttempts((prev) => prev + 1);
			const [first, second] = flippedCards;

			if (first.pairId === second.pairId) {
				setHits((prev) => prev + 1);
				setScore((prev) => prev + 25);
				setMatches((prev) => [...prev, first.pairId]);

				setTimeout(() => {
					setCards((prev) =>
						prev.map((card) => (card.pairId === first.pairId ? { ...card, isMatched: true } : card))
					);
					setFlippedCards([]);
				}, 1000);
			} else {
				setMisses((prev) => prev + 1);
				setScore((prev) => Math.max(0, prev - 10));

				setTimeout(() => {
					setCards((prev) =>
						prev.map((card) =>
							flippedCards.some((fc) => fc.id === card.id) ? { ...card, isFlipped: false } : card
						)
					);
					setFlippedCards([]);
				}, 1500);
			}
		}
	}, [flippedCards]);

	useEffect(() => {
		if (matches.length === 4 && gamePhase === 'playing') {
			setTimeout(() => {
				endGame();
			}, 2000);
		}
	}, [matches, gamePhase]);

	const handleCardClick = (clickedCard: SoundCard) => {
		if (clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2) {
			return;
		}

		setTotalClicks((prev) => prev + 1);
		if (clickedCard.type === 'sound') {
			playSound(clickedCard.content);
		}

		const updatedCard = { ...clickedCard, isFlipped: true };
		setCards((prev) => prev.map((card) => (card.id === clickedCard.id ? updatedCard : card)));
		setFlippedCards((prev) => [...prev, updatedCard]);
	};

	const startGame = () => {
		setGamePhase('playing');
	};

	const endGame = () => {
		const accuracy = attempts > 0 ? Math.round((hits / attempts) * 100) : 0;
		const missRate = attempts > 0 ? Math.round((misses / attempts) * 100) : 0;

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
		onGameComplete(result);
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
							Sound Match
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center space-y-4">
							<p className="text-lg text-gray-700">
								Listen carefully and match the sounds to the correct words.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
								<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
									<Target className="h-6 w-6 text-blue-500 mt-1" />
									<div>
										<h4 className="font-semibold text-blue-700">How to Play</h4>
										<p className="text-sm text-blue-600">
											Flip cards to find pairs. Click the <Volume2 className="inline h-4 w-4" />{' '}
											icon to listen to a sound.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
									<Star className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h4 className="font-semibold text-green-700">Scoring</h4>
										<p className="text-sm text-green-600">
											+25 points for matches, -10 for wrong pairs
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

	if (gamePhase === 'playing') {
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
									<p className="text-sm text-gray-600">Matches</p>
									<p className="text-2xl font-bold text-blue-600">{matches.length}/4</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-600">Attempts</p>
									<p className="text-2xl font-bold text-purple-600">{attempts}</p>
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
					<CardContent className="p-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
							<AnimatePresence>
								{cards.map((card) => (
									<motion.div
										key={card.id}
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0, opacity: 0 }}
										whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
										whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
										className="relative h-32 cursor-pointer"
										onClick={() => handleCardClick(card)}
									>
										<div
											className={`w-full h-full rounded-xl shadow-lg transition-all duration-300 transform ${
												card.isMatched
													? 'bg-gradient-to-r from-green-400 to-emerald-400'
													: card.isFlipped
													? card.type === 'word'
														? 'bg-gradient-to-r from-blue-400 to-cyan-400'
														: 'bg-gradient-to-r from-purple-400 to-pink-400'
													: 'bg-gradient-to-r from-gray-400 to-gray-500'
											}`}
										>
											<div className="w-full h-full flex items-center justify-center p-4">
												{card.isFlipped || card.isMatched ? (
													<div className="text-center">
														{card.type === 'word' ? (
															<p className="font-bold text-white text-xl">
																{card.content}
															</p>
														) : (
															<Volume2 className="h-10 w-10 text-white" />
														)}
														{card.isMatched && (
															<motion.div
																initial={{ scale: 0 }}
																animate={{ scale: 1 }}
																className="absolute top-2 right-2"
															>
																<Check className="h-6 w-6 text-white" />
															</motion.div>
														)}
													</div>
												) : (
													<div className="text-4xl text-white">?</div>
												)}
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
						{matches.length < 4 && (
							<div className="mt-6 text-center">
								<Button onClick={endGame} variant="outline" className="rounded-xl">
									Finish Game
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		);
	}
	return null;
};

export default SoundMatchGame;
