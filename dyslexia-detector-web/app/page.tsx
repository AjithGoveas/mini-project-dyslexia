'use client';

import PlayerForm from '@/components/PlayerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import { BarChart3, Brain, Sparkles, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
	const [showPlayerForm, setShowPlayerForm] = useState(false);
	const { currentPlayer } = useGameStore();
	const router = useRouter();

	const handlePlayerFormComplete = () => {
		router.push('/test');
	};

	const handleContinueAsGuest = () => {
		router.push('/test');
	};

	if (showPlayerForm) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<PlayerForm onComplete={handlePlayerFormComplete} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1 }}
				className="relative overflow-hidden pt-20 pb-40"
			>
				{/* Animated Gradient Background */}
				<motion.div
					initial={{ scale: 1.2, rotate: 0 }}
					animate={{ scale: 1, rotate: 360 }}
					transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
					className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 opacity-30 blur-3xl rounded-full"
				/>

				<div className="relative z-10 container mx-auto px-4 py-20 text-center">
					<div className="max-w-4xl mx-auto">
						<motion.div
							initial={{ y: -50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.8 }}
						>
							<div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl">
								<Brain className="h-12 w-12 text-primary-foreground" />
							</div>
						</motion.div>

						<motion.h1
							initial={{ y: 30, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.4, duration: 0.8 }}
							className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
						>
							<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
								Reading
							</span>
							<br />
							<span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
								Adventure
							</span>
						</motion.h1>

						<motion.p
							initial={{ y: 30, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.6, duration: 0.8 }}
							className="text-xl md:text-2xl text-foreground/80 mb-12 leading-relaxed max-w-2xl mx-auto"
						>
							Discover your unique reading style through fun, interactive games designed to help identify
							learning differences early.
						</motion.p>

						<motion.div
							initial={{ y: 30, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.8, duration: 0.8 }}
							className="flex flex-col sm:flex-row gap-4 justify-center"
						>
							<Button
								onClick={() => setShowPlayerForm(true)}
								variant="game"
								size="game"
								className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<Sparkles className="mr-2 h-5 w-5 animate-pulse" />
								Start Your Journey
							</Button>
							<Button
								onClick={handleContinueAsGuest}
								variant="outline"
								size="lg"
								className="text-lg px-8 py-6 rounded-2xl border-2 hover:bg-muted/50 transition-colors duration-300"
							>
								Try as Guest
							</Button>
						</motion.div>
					</div>
				</div>
			</motion.div>
			
			{/* Features Section */}
			<div className="container mx-auto px-4 py-20">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					viewport={{ once: true }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						Why Choose Our Platform?
					</h2>
					<p className="text-xl text-foreground/80 max-w-2xl mx-auto">
						Our scientifically-designed games make learning assessment fun and engaging for children.
					</p>
				</motion.div>

				<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{[
						{
							icon: Brain,
							title: 'Science-Based',
							description: 'Games designed with input from learning specialists and educators',
							color: 'from-primary/70 to-primary',
						},
						{
							icon: Users,
							title: 'Kid-Friendly',
							description: 'Engaging, colorful interfaces that children love to interact with',
							color: 'from-accent/70 to-accent',
						},
						{
							icon: BarChart3,
							title: 'Clear Results',
							description: 'Easy-to-understand reports for parents and educators',
							color: 'from-secondary/70 to-secondary',
						},
					].map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.2, duration: 0.6 }}
							viewport={{ once: true }}
							className="h-full"
						>
							<Card className="playful-card h-full p-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
								<CardHeader className="text-center pb-4">
									<div
										className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}
									>
										<feature.icon className="h-8 w-8 text-primary-foreground" />
									</div>
									<CardTitle className="text-2xl font-bold text-foreground">
										{feature.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-muted-foreground text-center leading-relaxed">
										{feature.description}
									</CardDescription>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}
