import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFoundGame: React.FC = () => (
	<div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
		<h3 className="text-red-600">Game Not Found</h3>
		<p className="max-w-md text-muted-foreground"	>
			Sorry, the game you are looking for does not exist or has been removed.
		</p>
		<Link href="/">
			<Button variant="default" className="bg-primary text-white">
				Go to Home
			</Button>
		</Link>
	</div>
);

export default NotFoundGame;
