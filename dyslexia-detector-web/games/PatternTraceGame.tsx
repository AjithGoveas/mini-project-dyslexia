'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { GameResult } from '@/types';
import { motion } from 'framer-motion';
import { PenTool, Star, Target, Timer } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface PatternTraceGameProps {
	onGameComplete: (result: GameResult) => void;
}

const patterns = [
	{ name: 'Square', path: 'M 50 50 L 250 50 L 250 250 L 50 250 Z', color: '#3b82f6' },
	{ name: 'Zig-zag', path: 'M 50 200 L 150 100 L 250 200 L 350 100 L 450 200', color: '#ef4444' },
	{
		name: 'Spiral',
		path: 'M 250 250 C 350 150, 450 350, 250 450 S 50 350, 150 150 S 350 50, 450 150 S 50 250',
		color: '#8b5cf6',
	},
];

const PatternTraceGame: React.FC<PatternTraceGameProps> = ({ onGameComplete }) => {
	const { recordGameResult } = useGameStore();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gamePhase, setGamePhase] = useState<'instructions' | 'playing' | 'complete'>('instructions');
	const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
	const [isTracing, setIsTracing] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [totalScore, setTotalScore] = useState(0);
	const [hits, setHits] = useState(0);
	const [misses, setMisses] = useState(0);
	const [currentAccuracy, setCurrentAccuracy] = useState(100);

	const checkPointOnPath = useCallback(
		(x: number, y: number): boolean => {
			const canvas = canvasRef.current;
			if (!canvas) return false;

			const ctx = canvas.getContext('2d');
			if (!ctx) return false;

			const tolerance = 10; // Pixels
			const pattern = patterns[currentPatternIndex];
			const path2d = new Path2D(pattern.path);

			ctx.save();
			ctx.lineWidth = tolerance * 2;
			ctx.strokeStyle = 'rgba(0,0,0,0)';
			ctx.stroke(path2d);

			const isPointOnPath = ctx.isPointInStroke(path2d, x, y);
			ctx.restore();

			return isPointOnPath;
		},
		[currentPatternIndex]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isTracing || !canvasRef.current) return;

			const canvas = canvasRef.current;
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const isCorrect = checkPointOnPath(x, y);

			if (isCorrect) {
				setHits((prev) => prev + 1);
			} else {
				setMisses((prev) => prev + 1);
			}

			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.lineTo(x, y);
				ctx.strokeStyle = isCorrect ? '#4ade80' : '#ef4444';
				ctx.lineWidth = 5;
				ctx.stroke();
			}
		},
		[isTracing, checkPointOnPath]
	);

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsTracing(true);
		const ctx = canvasRef.current?.getContext('2d');
		if (ctx) {
			const rect = canvasRef.current!.getBoundingClientRect();
			ctx.beginPath();
			ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
		}
	};

	const handleMouseUp = () => {
		setIsTracing(false);
	};

	const drawPattern = useCallback(() => {
		const ctx = canvasRef.current?.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		const pattern = patterns[currentPatternIndex];

		const path2d = new Path2D(pattern.path);
		ctx.strokeStyle = pattern.color;
		ctx.lineWidth = 3;
		ctx.stroke(path2d);
	}, [currentPatternIndex]);

	useEffect(() => {
		if (gamePhase === 'playing') {
			drawPattern();
			const timer = setInterval(() => {
				setTimeElapsed((prev) => prev + 1);
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [gamePhase, drawPattern]);

	useEffect(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseMove]);

	useEffect(() => {
		if (hits + misses > 0) {
			setCurrentAccuracy((hits / (hits + misses)) * 100);
		} else {
			setCurrentAccuracy(100);
		}
	}, [hits, misses]);

	const handleNextPattern = () => {
		const patternScore = Math.round(currentAccuracy * (100 / patterns.length));
		setTotalScore((prev) => prev + patternScore);
		setHits(0);
		setMisses(0);

		if (currentPatternIndex < patterns.length - 1) {
			setCurrentPatternIndex((prev) => prev + 1);
		} else {
			endGame();
		}
	};

	const startGame = () => {
		setGamePhase('playing');
		setTotalScore(0);
		setHits(0);
		setMisses(0);
		setCurrentAccuracy(100);
		setTimeElapsed(0);
		setCurrentPatternIndex(0);
		setTimeout(drawPattern, 500);
	};

	const endGame = () => {
		const totalPoints = totalScore;
		const totalClicks = hits + misses;

		const result: GameResult = {
			gameType: 'pattern-trace',
			score: totalPoints,
			totalClicks,
			hits,
			misses,
			accuracy: totalClicks > 0 ? (hits / totalClicks) * 100 : 100,
			missRate: totalClicks > 0 ? (misses / totalClicks) * 100 : 0,
			timeSpent: timeElapsed,
		};
		recordGameResult('PatternTrace', 'completed', result);
		onGameComplete(result);
		setGamePhase('complete');
	};

	if (gamePhase === 'instructions') {
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
				<Card className="playful-card">
					<CardHeader className="text-center">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center"
						>
							<PenTool className="h-10 w-10 text-primary-foreground" />
						</motion.div>
						<CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
							Pattern Trace
						</CardTitle>
						<p className="text-lg text-muted-foreground">Manual dexterity and precision.</p>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center space-y-4">
							<p className="text-lg text-foreground/80">
								Trace the shapes on the screen with your mouse. Stay on the path for a high score!
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
								<div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl">
									<Target className="h-6 w-6 text-primary mt-1" />
									<div>
										<h4 className="font-semibold text-primary">How to Play</h4>
										<p className="text-sm text-muted-foreground">
											Click and hold to start tracing. Your line will turn green for accurate
											tracing and red for errors.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-xl">
									<Star className="h-6 w-6 text-secondary mt-1" />
									<div>
										<h4 className="font-semibold text-secondary">Scoring</h4>
										<p className="text-sm text-muted-foreground">
											Points are based on your tracing accuracy. The more precise you are, the
											higher your score!
										</p>
									</div>
								</div>
							</div>
						</div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button onClick={startGame} variant="game" size="game" className="w-full">
								Start Tracing!
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
									<p className="text-sm text-muted-foreground">Pattern</p>
									<p className="text-2xl font-bold text-primary">
										{currentPatternIndex + 1}/{patterns.length}
									</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-muted-foreground">Accuracy</p>
									<p className="text-2xl font-bold text-secondary">{Math.round(currentAccuracy)}%</p>
								</div>
							</div>
							<div className="flex items-center gap-4 text-sm">
								<div className="text-center">
									<Timer className="h-4 w-4 mx-auto mb-1 text-orange-500" />
									<p className="font-semibold text-foreground">
										{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
									</p>
								</div>
								<div className="text-center">
									<Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
									<p className="font-semibold text-foreground">{totalScore}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="playful-card">
					<CardContent className="p-6">
						<div className="flex items-center justify-center w-full max-w-lg mx-auto bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
							<canvas
								ref={canvasRef}
								width={500}
								height={300}
								className="w-full h-auto rounded-lg"
								onMouseDown={handleMouseDown}
							/>
						</div>
						<div className="mt-6 text-center">
							<Button onClick={handleNextPattern} variant="game" className="rounded-xl">
								{currentPatternIndex < patterns.length - 1 ? 'Next Pattern' : 'Finish Game'}
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	if (gamePhase === 'complete') {
		const finalAccuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 100;
		const finalScore = totalScore + Math.round(finalAccuracy);
		return (
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
				<Card className="playful-card">
					<CardHeader className="text-center">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
							className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center"
						>
							<Star className="h-10 w-10 text-primary-foreground" />
						</motion.div>
						<CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
							Game Complete!
						</CardTitle>
						<p className="text-lg text-muted-foreground">You've completed all patterns.</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center">
								<p className="text-sm font-semibold text-muted-foreground">Time Taken</p>
								<p className="text-xl font-bold text-foreground">
									{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
								</p>
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold text-muted-foreground">Final Score</p>
								<p className="text-xl font-bold text-foreground">{finalScore}</p>
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold text-muted-foreground">Total Clicks</p>
								<p className="text-xl font-bold text-green-500">{hits + misses}</p>
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold text-muted-foreground">Overall Accuracy</p>
								<p className="text-xl font-bold text-blue-500">{finalAccuracy.toFixed(0)}%</p>
							</div>
						</div>
						<Button onClick={startGame} variant="outline" className="w-full">
							Play Again
						</Button>
					</CardContent>
				</Card>
			</motion.div>
		);
	}
	return null;
};

export default PatternTraceGame;
