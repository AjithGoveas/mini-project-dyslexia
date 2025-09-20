'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { BarChart3, Download, Search, Target, Trophy, Users } from 'lucide-react';
import { useState } from 'react';

export default function AdminPage() {
	const { players, testSessions, gameSessions } = useGameStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

	const filteredPlayers = players.filter(
		(player) =>
			player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			player.email?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getPlayerSessions = (playerId: string) => {
		return testSessions
			.filter((session) => session.playerId === playerId && session.isCompleted)
			.sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
	};

	const getPlayerStats = (playerId: string) => {
		const playerGameSessions = gameSessions.filter((session) => session.playerId === playerId);

		return {
			totalSessions: getPlayerSessions(playerId).length,
			totalScore: playerGameSessions.reduce((sum, session) => sum + session.score, 0),
			totalHits: playerGameSessions.reduce((sum, session) => sum + session.hits, 0),
			totalMisses: playerGameSessions.reduce((sum, session) => sum + session.misses, 0),
			totalTime: playerGameSessions.reduce((sum, session) => sum + session.timeSpent, 0),
			averageAccuracy:
				playerGameSessions.length > 0
					? Math.round(
							playerGameSessions.reduce((sum, session) => sum + session.accuracy, 0) /
								playerGameSessions.length
					  )
					: 0,
		};
	};

	const exportData = () => {
		const data = {
			players,
			testSessions,
			gameSessions,
			exportDate: new Date().toISOString(),
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `dyslexia-assessment-data-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="min-h-screen p-4">
			<div className="container mx-auto max-w-7xl">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
								Admin Dashboard
							</h1>
							<p className="text-gray-600 mt-2">Manage players and view assessment results</p>
						</div>
						<Button onClick={exportData} variant="outline" className="rounded-xl">
							<Download className="mr-2 h-4 w-4" />
							Export Data
						</Button>
					</div>
				</motion.div>

				{/* Stats Overview */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
				>
					<Card className="playful-card">
						<CardContent className="p-6">
							<div className="flex items-center">
								<Users className="h-8 w-8 text-blue-500" />
								<div className="ml-4">
									<p className="text-2xl font-bold text-blue-600">{players.length}</p>
									<p className="text-sm text-gray-500">Total Players</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="playful-card">
						<CardContent className="p-6">
							<div className="flex items-center">
								<BarChart3 className="h-8 w-8 text-green-500" />
								<div className="ml-4">
									<p className="text-2xl font-bold text-green-600">
										{testSessions.filter((s) => s.isCompleted).length}
									</p>
									<p className="text-sm text-gray-500">Completed Tests</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="playful-card">
						<CardContent className="p-6">
							<div className="flex items-center">
								<Trophy className="h-8 w-8 text-yellow-500" />
								<div className="ml-4">
									<p className="text-2xl font-bold text-yellow-600">{gameSessions.length}</p>
									<p className="text-sm text-gray-500">Games Played</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="playful-card">
						<CardContent className="p-6">
							<div className="flex items-center">
								<Target className="h-8 w-8 text-purple-500" />
								<div className="ml-4">
									<p className="text-2xl font-bold text-purple-600">
										{gameSessions.length > 0
											? Math.round(
													gameSessions.reduce((sum, s) => sum + s.accuracy, 0) /
														gameSessions.length
											  )
											: 0}
										%
									</p>
									<p className="text-sm text-gray-500">Avg Accuracy</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Search and Filter */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="mb-6"
				>
					<Card className="playful-card">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="flex-1">
									<Label htmlFor="search">Search Players</Label>
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
										<Input
											id="search"
											placeholder="Search by name or email..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 rounded-xl"
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Players List */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="grid gap-4"
				>
					<h2 className="text-2xl font-bold text-gray-800">Players ({filteredPlayers.length})</h2>

					{filteredPlayers.length === 0 ? (
						<Card className="playful-card">
							<CardContent className="p-8 text-center">
								<Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
								<h3 className="text-xl font-bold mb-2">No Players Found</h3>
								<p className="text-gray-600">
									{searchTerm
										? 'No players match your search criteria.'
										: 'No players have registered yet.'}
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-4">
							{filteredPlayers.map((player) => {
								const stats = getPlayerStats(player.id);
								const sessions = getPlayerSessions(player.id);

								return (
									<motion.div
										key={player.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										whileHover={{ scale: 1.02 }}
									>
										<Card
											className="playful-card cursor-pointer"
											onClick={() =>
												setSelectedPlayer(selectedPlayer === player.id ? null : player.id)
											}
										>
											<CardContent className="p-6">
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<h3 className="text-lg font-semibold">{player.name}</h3>
														<p className="text-gray-600">Age: {player.age}</p>
														{player.email && (
															<p className="text-sm text-gray-500">{player.email}</p>
														)}
														<p className="text-xs text-gray-400">
															Registered: {formatDate(player.createdAt)}
														</p>
													</div>

													<div className="grid grid-cols-4 gap-4 text-center">
														<div>
															<div className="text-lg font-bold text-blue-600">
																{stats.totalSessions}
															</div>
															<div className="text-xs text-gray-500">Tests</div>
														</div>
														<div>
															<div className="text-lg font-bold text-green-600">
																{stats.averageAccuracy}%
															</div>
															<div className="text-xs text-gray-500">Accuracy</div>
														</div>
														<div>
															<div className="text-lg font-bold text-purple-600">
																{stats.totalScore}
															</div>
															<div className="text-xs text-gray-500">Score</div>
														</div>
														<div>
															<div className="text-lg font-bold text-orange-600">
																{Math.floor(stats.totalTime / 60)}m
															</div>
															<div className="text-xs text-gray-500">Time</div>
														</div>
													</div>
												</div>

												{selectedPlayer === player.id && sessions.length > 0 && (
													<motion.div
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: 'auto' }}
														exit={{ opacity: 0, height: 0 }}
														className="mt-6 pt-6 border-t border-gray-200"
													>
														<h4 className="font-semibold mb-4">Recent Sessions</h4>
														<div className="space-y-2">
															{sessions.slice(0, 3).map((session) => (
																<div
																	key={session.id}
																	className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
																>
																	<div>
																		<p className="font-medium">
																			{session.completedGames?.length || 0} games
																			completed
																		</p>
																		<p className="text-sm text-gray-500">
																			{formatDate(new Date(session.endTime!))}
																		</p>
																	</div>
																	<div className="text-right">
																		<p className="font-bold text-purple-600">
																			{session.completedGames?.reduce(
																				(sum: number, game: any) =>
																					sum + game.score,
																				0
																			) || 0}
																		</p>
																		<p className="text-xs text-gray-500">points</p>
																	</div>
																</div>
															))}
														</div>
													</motion.div>
												)}
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}
