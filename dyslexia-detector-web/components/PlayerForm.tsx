'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGameStore } from '@/store/gameStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Calendar, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const playerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	age: z.number().min(3, 'Age must be between 3 and 18').max(18, 'Age must be between 3 and 18'),
	email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
	onComplete: () => void;
}

export default function PlayerForm({ onComplete }: PlayerFormProps) {
	const { createPlayer } = useGameStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PlayerFormData>({
		resolver: zodResolver(playerSchema),
	});

	const onSubmit = async (data: PlayerFormData) => {
		setIsSubmitting(true);
		try {
			createPlayer(data.name, data.age, data.email || undefined);
			onComplete();
		} catch (error) {
			console.error('Error creating player:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="w-full max-w-md mx-auto"
		>
			<Card className="playful-card border-2 border-primary/20 shadow-xl">
				<CardHeader className="text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
					>
						{/* Updated icon background with primary/secondary gradient */}
						<div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
							<User className="h-8 w-8 text-primary-foreground" />
						</div>
					</motion.div>
					<CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
						Let's Get Started!
					</CardTitle>
					<CardDescription className="text-muted-foreground mt-2">
						Tell us a bit about yourself to begin your adventure.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name" className="flex items-center gap-2 text-foreground">
								<User className="h-4 w-4 text-primary" />
								What's your name?
							</Label>
							<Input
								id="name"
								placeholder="Enter your name"
								{...register('name')}
								className="rounded-xl border-2 focus-visible:ring-primary focus-visible:border-primary"
							/>
							{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="age" className="flex items-center gap-2 text-foreground">
								<Calendar className="h-4 w-4 text-primary" />
								How old are you?
							</Label>
							<Input
								id="age"
								type="number"
								placeholder="Enter your age"
								{...register('age', { valueAsNumber: true })}
								className="rounded-xl border-2 focus-visible:ring-primary focus-visible:border-primary"
							/>
							{errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="flex items-center gap-2 text-foreground">
								<Mail className="h-4 w-4 text-primary" />
								Email (optional)
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								{...register('email')}
								className="rounded-xl border-2 focus-visible:ring-primary focus-visible:border-primary"
							/>
							{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
						</div>

						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button type="submit" disabled={isSubmitting} className="w-full text-lg shadow-lg">
								{isSubmitting ? 'Starting...' : 'Start My Journey!'}
							</Button>
						</motion.div>
					</form>
				</CardContent>
			</Card>
		</motion.div>
	);
}
