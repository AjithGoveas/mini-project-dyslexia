'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { BarChart3, Brain, CheckCircle, Clock, Download, Home, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResultsPage() {
	const { currentPlayer, testSessions } = useGameStore();
	const [latestSession, setLatestSession] = useState<any>(null);
	const router = useRouter();

	useEffect(() => {
		if (!currentPlayer) {
			router.push('/');
			return;
		}

		// Get the most recent completed test session for current player
		const playerSessions = testSessions
			.filter((session) => session.playerId === currentPlayer.id && session.isCompleted)
			.sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());

		if (playerSessions.length > 0) {
			setLatestSession(playerSessions[0]);
		}
	}, [currentPlayer, testSessions, router]);

	const handleDownload = () => {
		if (!latestSession || !currentPlayer) return;

		const dataToSave = {
			player: {
				id: currentPlayer.id,
				name: currentPlayer.name,
				email: currentPlayer.email,
				createdAt: currentPlayer.createdAt,
			},
			session: latestSession,
		};
		const jsonString = JSON.stringify(dataToSave, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `mind-flow-results-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	if (!latestSession) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="playful-card max-w-md mx-auto">
					<CardContent className="p-8 text-center">
						<Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
						<h2 className="text-xl font-bold mb-2">No Results Found</h2>
						<p className="text-gray-600 mb-4">Complete a test session to view your results here.</p>
						<Button onClick={() => router.push('/test')} variant="game">
							Take a Test
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const sessionGames = latestSession.completedGames || [];
	const totalScore = sessionGames.reduce((sum: number, game: any) => sum + game.score, 0);
	const totalHits = sessionGames.reduce((sum: number, game: any) => sum + game.hits, 0);
	const totalMisses = sessionGames.reduce((sum: number, game: any) => sum + game.misses, 0);
	const totalTime = sessionGames.reduce((sum: number, game: any) => sum + game.timeSpent, 0);
	const totalClicks = sessionGames.reduce((sum: number, game: any) => sum + game.totalClicks, 0);

	const overallAccuracy = totalClicks > 0 ? Math.round((totalHits / totalClicks) * 100) : 0;
	const averageResponseTime = totalClicks > 0 ? Math.round((totalTime / totalClicks) * 10) / 10 : 0;

	const getPerformanceLevel = (accuracy: number) => {
		if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
		if (accuracy >= 75) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
		if (accuracy >= 60) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
		return { level: 'Needs Practice', color: 'text-orange-600', bgColor: 'bg-orange-50' };
	};

	const performance = getPerformanceLevel(overallAccuracy);

	return (
		<div className="min-h-screen p-4">
			<div className="container mx-auto max-w-6xl">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-8"
				>
					<h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Your Results
					</h1>
					<p className="text-gray-600">
						Assessment completed on {formatDate(new Date(latestSession.endTime))}
					</p>
				</motion.div>

				{/* Overall Performance Card */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<Card className="playful-card">
						<CardHeader className="text-center">
							<div
								className={`w-20 h-20 ${performance.bgColor} rounded-full mx-auto mb-4 flex items-center justify-center`}
							>
								<Trophy className={`h-10 w-10 ${performance.color}`} />
							</div>
							<CardTitle className="text-2xl">Overall Performance</CardTitle>
							<CardDescription>
								<span className={`text-lg font-semibold ${performance.color}`}>
									{performance.level}
								</span>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								<div className="text-center p-4 bg-purple-50 rounded-xl">
									<Star className="h-6 w-6 mx-auto mb-2 text-purple-500" />
									<div className="text-2xl font-bold text-purple-600">{totalScore}</div>
									<div className="text-sm text-purple-500">Total Score</div>
								</div>
								<div className="text-center p-4 bg-green-50 rounded-xl">
									<Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
									<div className="text-2xl font-bold text-green-600">{overallAccuracy}%</div>
									<div className="text-sm text-green-500">Accuracy</div>
								</div>
								<div className="text-center p-4 bg-blue-50 rounded-xl">
									<CheckCircle className="h-6 w-6 mx-auto mb-2 text-blue-500" />
									<div className="text-2xl font-bold text-blue-600">{totalHits}</div>
									<div className="text-sm text-blue-500">Correct Responses</div>
								</div>
								<div className="text-center p-4 bg-orange-50 rounded-xl">
									<Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
									<div className="text-2xl font-bold text-orange-600">
										{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
									</div>
									<div className="text-sm text-orange-500">Total Time</div>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span>Overall Accuracy</span>
									<span>{overallAccuracy}%</span>
								</div>
								<Progress value={overallAccuracy} className="h-2" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Individual Game Results */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="mb-8"
				>
					<h2 className="text-2xl font-bold mb-4 text-gray-800">Game Breakdown</h2>
					<div className="grid gap-4">
						{sessionGames.map((game: any, index: number) => {
							const gameAccuracy =
								game.totalClicks > 0 ? Math.round((game.hits / game.totalClicks) * 100) : 0;
							const gamePerformance = getPerformanceLevel(gameAccuracy);

							return (
								<motion.div
									key={game.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card className="playful-card">
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div>
													<h3 className="text-lg font-semibold capitalize">
														{game.gameType.replace('-', ' ')}
													</h3>
													<p className={`text-sm ${gamePerformance.color}`}>
														{gamePerformance.level}
													</p>
												</div>
												<div className="text-right">
													<div className="text-2xl font-bold text-purple-600">
														{game.score}
													</div>
													<div className="text-sm text-gray-500">points</div>
												</div>
											</div>

											<div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
												<div>
													<div className="font-semibold text-green-600">{game.hits}</div>
													<div className="text-gray-500">Hits</div>
												</div>
												<div>
													<div className="font-semibold text-red-600">{game.misses}</div>
													<div className="text-gray-500">Misses</div>
												</div>
												<div>
													<div className="font-semibold text-blue-600">{gameAccuracy}%</div>
													<div className="text-gray-500">Accuracy</div>
												</div>
												<div>
													<div className="font-semibold text-orange-600">
														{Math.floor(game.timeSpent / 60)}:
														{(game.timeSpent % 60).toString().padStart(2, '0')}
													</div>
													<div className="text-gray-500">Time</div>
												</div>
											</div>

											<Progress value={gameAccuracy} className="h-2" />
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				</motion.div>

				{/* Recommendations */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="mb-8"
				>
					<Card className="playful-card">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="h-6 w-6 text-blue-500" />
								Recommendations
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{overallAccuracy >= 90 ? (
									<div className="p-4 bg-green-50 rounded-xl">
										<h4 className="font-semibold text-green-700 mb-2">Excellent Performance!</h4>
										<p className="text-green-600 text-sm">
											Great job! Your performance shows strong reading and cognitive skills.
											Continue practicing with challenging reading materials to maintain your
											skills.
										</p>
									</div>
								) : overallAccuracy >= 75 ? (
									<div className="p-4 bg-blue-50 rounded-xl">
										<h4 className="font-semibold text-blue-700 mb-2">Good Performance</h4>
										<p className="text-blue-600 text-sm">
											You're doing well! Consider practicing more challenging exercises to improve
											your speed and accuracy further.
										</p>
									</div>
								) : (
									<div className="p-4 bg-orange-50 rounded-xl">
										<h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
										<p className="text-orange-600 text-sm">
											Consider working with a learning specialist to develop targeted strategies.
											Regular practice with reading exercises can help improve performance.
										</p>
									</div>
								)}

								<div className="p-4 bg-purple-50 rounded-xl">
									<h4 className="font-semibold text-purple-700 mb-2">Next Steps</h4>
									<ul className="text-purple-600 text-sm space-y-1">
										<li>• Share these results with parents or teachers</li>
										<li>• Consider retaking the assessment in a few weeks</li>
										<li>• Practice reading activities regularly</li>
										<li>• Consult with educational professionals if needed</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className="flex flex-col sm:flex-row gap-4 justify-center"
				>
					<Button onClick={() => router.push('/')} variant="outline" size="lg" className="rounded-xl">
						<Home className="mr-2 h-5 w-5" />
						Back to Home
					</Button>
					<Button onClick={() => router.push('/test')} variant="game" size="lg">
						<BarChart3 className="mr-2 h-5 w-5" />
						Take Test Again
					</Button>
					<Button onClick={() => window.print()} variant="outline" size="lg" className="rounded-xl">
						<Download className="mr-2 h-5 w-5" />
						Print Results
					</Button>
					{/* The new download button with the handleDownload function */}
					<Button onClick={handleDownload} variant="game" size="lg">
						<Download className="mr-2 h-5 w-5" />
						Download Results
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
