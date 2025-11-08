import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Deploy } from './pages/Deploy';
import { Dashboard } from './pages/Dashboard';
import { StrategyDetail } from './pages/StrategyDetail';
import { PaymentSplitterPage } from './pages/PaymentSplitter';
import { ConnectWallet } from './components/ConnectWallet';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-[#0d0d0d] text-white">
				<nav className="border-b border-gray-800 p-4">
					<div className="container mx-auto flex justify-between items-center">
						<a href="/" className="text-2xl font-bold">ImpactVault</a>
						<div className="flex gap-6 items-center">
							<a href="/deploy" className="hover:text-blue-400">Deploy</a>
							<a href="/dashboard" className="hover:text-green-400">Dashboard</a>
							<a href="/splitter" className="hover:text-purple-400">Splitter</a>
							<ConnectWallet />
						</div>
					</div>
				</nav>

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/deploy" element={<Deploy />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/strategy/:address" element={<StrategyDetail />} />
					<Route path="/splitter" element={<PaymentSplitterPage />} />
				</Routes>
				<Toaster />
			</div>
		</BrowserRouter>
	);
}

export default App;
