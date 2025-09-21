"use client";

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const games: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
	game1: () => import('@/games/LetterMazeGame'),
	game2: () => import('@/games/WordFlipGame'),
	game3: () => import('@/games/MirrorMatchGame'),
	game4: () => import('@/games/SoundMatchGame'),
	game5: () => import('@/games/PatternTraceGame'),
	game6: () => import('@/games/OddOneOutGame'),
	// Add more games here
};

export default function GamePage() {
	const params = useParams();
	const game = params?.game as string | undefined;

	if (!game || typeof game !== 'string') {
		return <div>Loading...</div>;
	}

	const GameComponent = dynamic(games[game] || (() => import('@/components/NotFoundGame')), {
		loading: () => <div>Loading game...</div>,
	});

	return (
		<div className='flex flex-col justify-center items-center p-4 *:mt-8'>
			<h1>Game: {game}</h1>
			<GameComponent />
		</div>
	);
}
