'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameConfig } from '@/types';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Clock, Star } from 'lucide-react';

interface GameCardProps {
	game: GameConfig;
	onSelect: () => void;
	isActive?: boolean;
}

export default function GameCard({ game, onSelect, isActive = false }: GameCardProps) {
	const IconComponent = (LucideIcons as any)[game.icon] || LucideIcons.GamepadIcon;

	const difficultyColors = {
		easy: 'from-green-400 to-emerald-400',
		medium: 'from-yellow-400 to-orange-400',
		hard: 'from-red-400 to-pink-400',
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.05, y: -5 }}
			whileTap={{ scale: 0.95 }}
			transition={{ duration: 0.2 }}
		>
			<Card
				className={`playful-card h-full cursor-pointer ${
					isActive ? 'ring-4 ring-purple-400 ring-opacity-50' : ''
				}`}
			>
				<CardHeader className="text-center pb-4">
					<motion.div
						initial={{ rotate: 0 }}
						whileHover={{ rotate: 10 }}
						className={`w-16 h-16 bg-gradient-to-r ${
							difficultyColors[game.difficulty]
						} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}
					>
						<IconComponent className="h-8 w-8 text-white" />
					</motion.div>
					<CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						{game.name}
					</CardTitle>
					<CardDescription className="text-gray-600">{game.description}</CardDescription>
				</CardHeader>

				<CardContent className="pt-0">
					<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
						<div className="flex items-center gap-1">
							<Clock className="h-4 w-4" />
							<span>{game.estimatedTime} min</span>
						</div>
						<div className="flex items-center gap-1">
							<Star className="h-4 w-4" />
							<span className="capitalize">{game.difficulty}</span>
						</div>
					</div>

					<Button onClick={onSelect} variant="game" className="w-full">
						Play Now
					</Button>
				</CardContent>
			</Card>
		</motion.div>
	);
}
