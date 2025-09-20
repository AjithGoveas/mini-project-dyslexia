import type { Metadata } from 'next';
import { Fira_Code, Inter, Lora, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const poppins = Poppins({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-poppins',
});

const lora = Lora({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-lora',
});

const fira_code = Fira_Code({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-fira-code',
});

export const metadata: Metadata = {
	title: 'Dyslexia Detection App',
	description: 'A playful, interactive app for dyslexia screening through cognitive games',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${poppins.variable} ${lora.variable} ${fira_code.variable} antialiased`}>
				<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">{children}</div>
			</body>
		</html>
	);
}
