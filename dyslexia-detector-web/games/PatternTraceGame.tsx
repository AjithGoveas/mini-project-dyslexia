'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gamePhase, setGamePhase] = useState<'instructions' | 'playing' | 'complete'>('instructions');
	const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
	const [isTracing, setIsTracing] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [score, setScore] = useState(0);
	const [accuracy, setAccuracy] = useState(100);
	const [hits, setHits] = useState(0);
	const [misses, setMisses] = useState(0);

	const checkPointOnPath = (x: number, y: number): boolean => {
		const currentPattern = patterns[currentPatternIndex];
		// Simplified check: a real implementation would use a more complex algorithm
		// to check if (x,y) is within a tolerance of the SVG path.
		// For this example, we'll just simulate it.
		const tolerance = 20;
		return Math.random() > 0.1; // 90% chance of being "correct"
	};

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
				setAccuracy((prev) => Math.max(0, prev - 0.1));
			}

			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.lineTo(x, y);
				ctx.strokeStyle = isCorrect ? '#4ade80' : '#ef4444';
				ctx.lineWidth = 5;
				ctx.stroke();
			}
		},
		[isTracing, currentPatternIndex]
	);

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsTracing(true);
		const ctx = canvasRef.current?.getContext('2d');
		if (ctx) {
			if (!canvasRef.current) return;
			const rect = canvasRef.current.getBoundingClientRect();
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

	const handleNextPattern = () => {
		if (currentPatternIndex < patterns.length - 1) {
			setCurrentPatternIndex((prev) => prev + 1);
			setScore((prev) => prev + Math.round(accuracy));
			setAccuracy(100); // Reset for next pattern
			const ctx = canvasRef.current?.getContext('2d');
			if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			drawPattern();
		} else {
			endGame();
		}
	};

	const startGame = () => {
		setGamePhase('playing');
		setTimeout(drawPattern, 500); // Wait for canvas to render
	};

	const endGame = () => {
		const finalAccuracy = (hits / (hits + misses)) * 100;
		setScore((prev) => prev + Math.round(finalAccuracy));

		const result: GameResult = {
			gameType: 'pattern-trace',
			score,
			totalClicks: hits + misses,
			hits,
			misses,
			accuracy: finalAccuracy,
			missRate: 100 - finalAccuracy,
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
							transition={{ duration: 1.5, repeat: Infinity }}
							className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl mx-auto mb-4 flex items-center justify-center"
						>
							<PenTool className="h-10 w-10 text-white" />
						</motion.div>
						<CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							Pattern Trace
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center space-y-4">
							<p className="text-lg text-gray-700">Follow the line to trace the shapes and patterns.</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
								<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
									<Target className="h-6 w-6 text-blue-500 mt-1" />
									<div>
										<h4 className="font-semibold text-blue-700">How to Play</h4>
										<p className="text-sm text-blue-600">
											Click and hold to start tracing. Try to stay as close to the line as
											possible.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
									<Star className="h-6 w-6 text-green-500 mt-1" />
									<div>
										<h4 className="font-semibold text-green-700">Scoring</h4>
										<p className="text-sm text-green-600">
											Your score is based on how accurate and fast you are.
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
									<p className="text-sm text-gray-600">Pattern</p>
									<p className="text-2xl font-bold text-blue-600">
										{currentPatternIndex + 1}/{patterns.length}
									</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-600">Accuracy</p>
									<p className="text-2xl font-bold text-purple-600">{Math.round(accuracy)}%</p>
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
						<div className="flex items-center justify-center w-full max-w-lg mx-auto bg-gray-50 rounded-lg shadow-inner">
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
	return null;
};

export default PatternTraceGame;
