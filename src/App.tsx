import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Deploy } from './pages/Deploy';
import { Dashboard } from './pages/Dashboard';
import { StrategyDetail } from './pages/StrategyDetail';
import { ConnectWallet } from './components/ConnectWallet';
import { ThemeToggle } from './components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore } from './store';
import './App.css';

function App() {
	const { theme } = useAppStore();

	return (
		<BrowserRouter>
			<div className={`min-h-screen transition-colors duration-300 ${
				theme === 'light'
					? 'bg-gray-50 text-gray-900'
					: 'bg-[#0d0d0d] text-white'
			}`}>
				<nav className={`border-b p-4 ${
					theme === 'light' ? 'border-gray-200 bg-white/80 backdrop-blur' : 'border-gray-800 bg-[#0d0d0d]/80 backdrop-blur'
				}`}>
					<div className="container mx-auto flex justify-between items-center">
						<a href="/" className="flex items-center gap-2">
							<span className="text-xl">⚡</span>
							<span className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00D9FF] bg-clip-text text-transparent">
								Kinetic
							</span>
						</a>
						<div className="flex gap-4 items-center">
							<a href="/deploy" className="hover:text-[#0066FF] transition-colors">Deploy</a>
							<a href="/dashboard" className="hover:text-[#00D9FF] transition-colors">Dashboard</a>
							<ThemeToggle />
							<ConnectWallet />
						</div>
					</div>
				</nav>

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/deploy" element={<Deploy />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/strategy/:address" element={<StrategyDetail />} />
				</Routes>
				<Toaster />
			</div>
		</BrowserRouter>
	);
}

export default App;
