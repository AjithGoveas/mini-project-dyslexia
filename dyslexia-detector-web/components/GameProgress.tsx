'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Target, Timer, Trophy, Zap } from 'lucide-react';

interface GameProgressProps {
	currentGame: number;
	totalGames: number;
	score: number;
	hits: number;
	misses: number;
	timeElapsed: number;
}

export default function GameProgress({ currentGame, totalGames, score, hits, misses, timeElapsed }: GameProgressProps) {
	const progressPercentage = (currentGame / totalGames) * 100;
	const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="w-full max-w-4xl mx-auto mb-6"
		>
			<Card className="playful-card">
				<CardContent className="p-6">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
								Game Progress
							</h3>
							<span className="text-sm text-gray-500">
								{currentGame} of {totalGames} games
							</span>
						</div>

						<Progress value={progressPercentage} className="h-3" />

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
								<Trophy className="h-5 w-5 text-purple-500" />
								<div>
									<p className="text-sm text-gray-600">Score</p>
									<p className="font-bold text-purple-600">{score}</p>
								</div>
							</div>

							<div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
								<Target className="h-5 w-5 text-green-500" />
								<div>
									<p className="text-sm text-gray-600">Accuracy</p>
									<p className="font-bold text-green-600">{accuracy}%</p>
								</div>
							</div>

							<div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
								<Zap className="h-5 w-5 text-blue-500" />
								<div>
									<p className="text-sm text-gray-600">Hits</p>
									<p className="font-bold text-blue-600">{hits}</p>
								</div>
							</div>

							<div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
								<Timer className="h-5 w-5 text-orange-500" />
								<div>
									<p className="text-sm text-gray-600">Time</p>
									<p className="font-bold text-orange-600">{formatTime(timeElapsed)}</p>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
