'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameResult } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Play, Star, Target, Timer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface OddOneOutGameProps {
	onGameComplete: (result: GameResult) => void;
}

interface Option {
	id: string;
	text: string;
	isOdd: boolean;
}

const gameData = [
	{ normal: ['cat', 'dog', 'rabbit'], odd: 'car' },
	{ normal: ['red', 'blue', 'green'], odd: 'apple' },
	{ normal: ['circle', 'square', 'triangle'], odd: 'happy' },
	{ normal: ['1', '2', '3'], odd: 'tree' },
	{ normal: ['apple', 'banana', 'orange'], odd: 'chair' },
	{ normal: ['sunny', 'rainy', 'cloudy'], odd: 'book' },
];

export default function OddOneOutGame({ onGameComplete }: OddOneOutGameProps) {
	const [gamePhase, setGamePhase] = useState<'instructions' | 'playing' | 'complete'>('instructions');
	const [round, setRound] = useState(0);
	const [options, setOptions] = useState<Option[]>([]);
	const [feedback, setFeedback] = useState('');
	const [score, setScore] = useState(0);
	const [hits, setHits] = useState(0);
	const [misses, setMisses] = useState(0);
	const [startTime, setStartTime] = useState<Date | null>(null);
	const [timeElapsed, setTimeElapsed] = useState(0);

	const formatTime = useMemo(() => {
		const mins = Math.floor(timeElapsed / 60);
		const secs = timeElapsed % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}, [timeElapsed]);

	const shuffleArray = <T,>(array: T[]): T[] => {
		const copy = [...array];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	};

	const generateOptions = useCallback(() => {
		const data = gameData[round];
		const opts: Option[] = [
			...data.normal.map((text, i) => ({ id: `n-${i}`, text, isOdd: false })),
			{ id: 'odd', text: data.odd, isOdd: true },
		];
		setOptions(shuffleArray(opts));
		setFeedback('');
	}, [round]);

	const endGame = useCallback(() => {
		const totalClicks = hits + misses;
		const result: GameResult = {
			gameType: 'odd-one-out',
			score,
			totalClicks,
			hits,
			misses,
			accuracy: totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0,
			missRate: totalClicks > 0 ? Math.round((misses / totalClicks) * 100) : 0,
			timeSpent: timeElapsed,
		};
		onGameComplete(result);
		setGamePhase('complete');
	}, [score, hits, misses, timeElapsed, onGameComplete]);

	useEffect(() => {
		if (gamePhase === 'playing') {
			setStartTime(new Date());
			generateOptions();
		}
	}, [gamePhase, generateOptions]);

	useEffect(() => {
		if (!startTime) return;
		const timer = setInterval(() => {
			setTimeElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
		}, 1000);
		return () => clearInterval(timer);
	}, [startTime]);

	const handleClick = (option: Option) => {
		if (option.isOdd) {
			setHits((h) => h + 1);
			setScore((s) => s + 20);
			setFeedback('Correct!');
			setTimeout(() => {
				if (round + 1 < gameData.length) {
					setRound((r) => r + 1);
					generateOptions();
				} else {
					endGame();
				}
			}, 1000);
		} else {
			setMisses((m) => m + 1);
			setScore((s) => Math.max(0, s - 5));
			setFeedback('Try again!');
		}
	};

	const startGame = () => {
		setGamePhase('playing');
		setRound(0);
		setScore(0);
		setHits(0);
		setMisses(0);
		setTimeElapsed(0);
		setStartTime(new Date());
	};

	if (gamePhase === 'instructions') {
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
				<Card className="playful-card">
					<CardHeader className="text-center">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl mx-auto mb-4 flex items-center justify-center"
						>
							<Eye className="h-10 w-10 text-white" />
						</motion.div>
						<CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							Odd One Out
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center space-y-4">
							<p className="text-lg text-gray-700">
								Spot the word that doesn’t belong in the group. Think fast, choose wisely!
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
								<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
									<Target className="h-6 w-6 text-blue-500 mt-1" />
									<div>
										<h4 className="font-semibold text-blue-700">Your Mission</h4>
										<p className="text-sm text-blue-600">
											Each round shows 4 words—3 belong to the same category, 1 is different.
										</p>
										<p className="text-sm text-blue-600 mt-1">
											Click the odd one out to move forward. Complete all{' '}
											<strong>{gameData.length}</strong> rounds!
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
									<Star className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h4 className="font-semibold text-green-700">Scoring</h4>
										<p className="text-sm text-green-600">
											<strong>+20</strong> points for correct answers
										</p>
										<p className="text-sm text-green-600">
											<strong>-5</strong> points for incorrect guesses (but you can try again!)
										</p>
										<p className="text-sm text-green-600 mt-1">
											Time and accuracy are tracked—stay sharp!
										</p>
									</div>
								</div>
							</div>
						</div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button onClick={startGame} variant="game" size="game" className="w-full">
								<Play className="inline mr-2 h-5 w-5" /> Start Challenge!
							</Button>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (gamePhase === 'playing') {
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
				<Card>
					<CardContent className="flex justify-between items-center p-4">
						<div className="text-center">
							<p className="text-sm text-gray-500">Round</p>
							<p className="text-xl font-bold text-blue-600">
								{round + 1}/{gameData.length}
							</p>
						</div>
						<div className="flex gap-6 text-sm">
							<div className="text-center">
								<Timer className="h-4 w-4 mx-auto text-orange-500" />
								<p className="font-semibold">{formatTime}</p>
							</div>
							<div className="text-center">
								<Star className="h-4 w-4 mx-auto text-yellow-500" />
								<p className="font-semibold">{score}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<h2 className="text-xl font-semibold text-center mb-4">Which one is different?</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<AnimatePresence>
								{options.map((opt) => (
									<motion.button
										key={opt.id}
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => handleClick(opt)}
										className="p-6 rounded-xl bg-white text-lg font-semibold shadow hover:bg-gray-100 transition"
									>
										{opt.text}
									</motion.button>
								))}
							</AnimatePresence>
						</div>
						{feedback && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className={`mt-6 text-center text-lg font-semibold ${
									feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'
								}`}
							>
								{feedback}
							</motion.div>
						)}
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
