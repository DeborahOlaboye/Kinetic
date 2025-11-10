import { BrowserRouter, Routes, Route, Link } from 'react-router';
import { Home } from './pages/Home';
import { Deploy } from './pages/Deploy';
import { Dashboard } from './pages/Dashboard';
import { StrategyDetails } from './pages/StrategyDetails';
import { ConnectWallet } from './components/ConnectWallet';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-background text-foreground">
				<nav className="border-b border-border p-4 bg-secondary/50">
					<div className="container mx-auto flex justify-between items-center">
						<Link to="/" className="text-2xl font-bold hover:text-secondary-foreground transition-colors">
							Kinetic
						</Link>
						<div className="flex gap-6 items-center">
							<Link to="/deploy" className="hover:text-[#78B288] transition-colors">Deploy Strategy</Link>
							<Link to="/dashboard" className="hover:text-[#78B288] transition-colors">Your Impact</Link>
							<ConnectWallet />
						</div>
					</div>
				</nav>

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/deploy" element={<Deploy />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/strategy/:strategyAddress" element={<StrategyDetails />} />
				</Routes>
				<Toaster />
			</div>
		</BrowserRouter>
	);
}

export default App;
