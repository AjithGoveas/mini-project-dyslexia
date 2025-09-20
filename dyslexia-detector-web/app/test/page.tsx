'use client';

import GameCard from '@/components/GameCard';
import GameProgress from '@/components/GameProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { gameConfigs } from '@/data/gameConfigs';
import LetterMazeGame from '@/games/LetterMazeGame';
import PatternTraceGame from '@/games/PatternTraceGame';
import SoundMatchGame from '@/games/SoundMatchGame';
import WordFlipGame from '@/games/WordFlipGame';
import { useGameStore } from '@/store/gameStore';
import { GameResult, GameType } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestPage() {
	const {
		currentPlayer,
		currentTestSession,
		startTestSession,
		startGame,
		endGame,
		completeTestSession,
		currentGame,
		isGameActive,
	} = useGameStore();

	const [currentGameIndex, setCurrentGameIndex] = useState(0);
	const [testPhase, setTestPhase] = useState<'welcome' | 'game-select' | 'playing' | 'results'>('welcome');
	const [sessionStats, setSessionStats] = useState({
		totalScore: 0,
		totalHits: 0,
		totalMisses: 0,
		totalTime: 0,
	});

	const router = useRouter();
	const availableGames = gameConfigs.slice(0, 4); // Use first 4 games

	useEffect(() => {
		if (!currentPlayer && !currentTestSession) {
			// If no player is set, redirect to home
			router.push('/');
		}
	}, [currentPlayer, currentTestSession, router]);

	const handleStartTest = () => {
		if (currentPlayer) {
			startTestSession(currentPlayer.id);
		}
		setTestPhase('game-select');
	};

	const handleGameSelect = (gameType: GameType) => {
		startGame(gameType);
		setTestPhase('playing');
	};

	const handleGameComplete = (result: GameResult) => {
		const gameSession = endGame(result);

		setSessionStats((prev) => ({
			totalScore: prev.totalScore + result.score,
			totalHits: prev.totalHits + result.hits,
			totalMisses: prev.totalMisses + result.misses,
			totalTime: prev.totalTime + result.timeSpent,
		}));

		// Move to next game or complete test
		if (currentGameIndex < availableGames.length - 1) {
			setCurrentGameIndex((prev) => prev + 1);
			setTestPhase('game-select');
		} else {
			completeTestSession();
			setTestPhase('results');
		}
	};

	const handleFinishTest = () => {
		router.push('/results');
	};

	const renderGame = () => {
		if (!currentGame) return null;

		switch (currentGame) {
			case 'letter-maze':
				return <LetterMazeGame onGameComplete={handleGameComplete} />;
			case 'word-flip':
				return <WordFlipGame onGameComplete={handleGameComplete} />;
			case 'sound-match':
				return <SoundMatchGame onGameComplete={handleGameComplete} />;
			case 'pattern-trace':
				return <PatternTraceGame onGameComplete={handleGameComplete} />;
			default:
				return (
					<div className="text-center py-20">
						<h2 className="text-2xl font-bold mb-4">Game Coming Soon!</h2>
						<p className="text-gray-600 mb-6">This game is still in development.</p>
						<Button onClick={() => setTestPhase('game-select')}>Back to Game Selection</Button>
					</div>
				);
		}
	};

	if (testPhase === 'welcome') {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-2xl mx-auto"
				>
					<Card className="playful-card">
						<CardHeader className="text-center">
							<motion.div
								animate={{ y: [0, -10, 0] }}
								transition={{ duration: 2, repeat: Infinity }}
								className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl"
							>
								<Play className="h-10 w-10 text-white" />
							</motion.div>
							<CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
								Ready for Adventure?
							</CardTitle>
							<CardDescription className="text-lg">
								{currentPlayer
									? `Hi ${currentPlayer.name}! Let's start your reading adventure.`
									: "Welcome! Let's explore your reading skills through fun games."}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="text-center space-y-4">
								<p className="text-gray-700">
									You'll play {availableGames.length} different games that test various reading and
									cognitive skills. Each game is designed to be fun and engaging!
								</p>
								<div className="bg-blue-50 p-4 rounded-xl">
									<h4 className="font-semibold text-blue-700 mb-2">What to Expect:</h4>
									<ul className="text-sm text-blue-600 space-y-1">
										<li>• Letter recognition and sequencing</li>
										<li>• Word-meaning associations</li>
										<li>• Visual pattern recognition</li>
										<li>• Memory and attention tasks</li>
									</ul>
								</div>
							</div>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button onClick={handleStartTest} variant="game" size="game" className="w-full">
									Let's Begin!
								</Button>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	if (testPhase === 'game-select') {
		const currentGameConfig = availableGames[currentGameIndex];
		const progress = (currentGameIndex / availableGames.length) * 100;

		return (
			<div className="min-h-screen p-4">
				<div className="container mx-auto max-w-6xl">
					{/* Progress Header */}
					<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
						<Card className="playful-card">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
										Game {currentGameIndex + 1} of {availableGames.length}
									</h2>
									<div className="text-sm text-gray-500">{Math.round(progress)}% Complete</div>
								</div>
								<Progress value={progress} className="h-3" />
							</CardContent>
						</Card>
					</motion.div>

					{/* Current Game Showcase */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md mx-auto"
					>
						<GameCard
							game={currentGameConfig}
							onSelect={() => handleGameSelect(currentGameConfig.id)}
							isActive={true}
						/>
					</motion.div>

					{/* Upcoming Games Preview */}
					{currentGameIndex < availableGames.length - 1 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="mt-12"
						>
							<h3 className="text-xl font-semibold text-center mb-6 text-gray-700">Coming Up Next</h3>
							<div className="grid md:grid-cols-3 gap-4 opacity-60">
								{availableGames.slice(currentGameIndex + 1).map((game) => (
									<GameCard key={game.id} game={game} onSelect={() => {}} />
								))}
							</div>
						</motion.div>
					)}
				</div>
			</div>
		);
	}

	if (testPhase === 'playing') {
		return (
			<div className="min-h-screen p-4">
				<div className="container mx-auto">
					<GameProgress
						currentGame={currentGameIndex + 1}
						totalGames={availableGames.length}
						score={sessionStats.totalScore}
						hits={sessionStats.totalHits}
						misses={sessionStats.totalMisses}
						timeElapsed={sessionStats.totalTime}
					/>
					{renderGame()}
				</div>
			</div>
		);
	}

	if (testPhase === 'results') {
		const totalAttempts = sessionStats.totalHits + sessionStats.totalMisses;
		const overallAccuracy = totalAttempts > 0 ? Math.round((sessionStats.totalHits / totalAttempts) * 100) : 0;

		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-2xl mx-auto"
				>
					<Card className="playful-card">
						<CardHeader className="text-center">
							<motion.div
								animate={{ rotate: [0, 360] }}
								transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
								className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl"
							>
								<Trophy className="h-10 w-10 text-white" />
							</motion.div>
							<CardTitle className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
								Amazing Work!
							</CardTitle>
							<CardDescription className="text-lg">
								You've completed all the games. Here's how you did:
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<div className="text-center p-4 bg-purple-50 rounded-xl">
									<div className="text-2xl font-bold text-purple-600">{sessionStats.totalScore}</div>
									<div className="text-sm text-purple-500">Total Score</div>
								</div>
								<div className="text-center p-4 bg-green-50 rounded-xl">
									<div className="text-2xl font-bold text-green-600">{overallAccuracy}%</div>
									<div className="text-sm text-green-500">Accuracy</div>
								</div>
								<div className="text-center p-4 bg-blue-50 rounded-xl">
									<div className="text-2xl font-bold text-blue-600">{sessionStats.totalHits}</div>
									<div className="text-sm text-blue-500">Correct Answers</div>
								</div>
								<div className="text-center p-4 bg-orange-50 rounded-xl">
									<div className="text-2xl font-bold text-orange-600">
										{Math.floor(sessionStats.totalTime / 60)}:
										{(sessionStats.totalTime % 60).toString().padStart(2, '0')}
									</div>
									<div className="text-sm text-orange-500">Time Taken</div>
								</div>
							</div>

							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button onClick={handleFinishTest} variant="game" size="game" className="w-full">
									<ArrowRight className="mr-2 h-5 w-5" />
									View Detailed Results
								</Button>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	return null;
}
