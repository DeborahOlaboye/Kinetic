import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router';
import { useAppStore } from '@/store';

export function Home() {
  const navigate = useNavigate();
  const { theme } = useAppStore();

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="mb-4">
          <span className="text-5xl">⚡</span>
        </div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#0066FF] to-[#00D9FF] bg-clip-text text-transparent">
          Kinetic
        </h1>
        <p className={`text-2xl mb-3 font-medium ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Capital in motion for public goods
        </p>
        <p className={`text-lg max-w-2xl mx-auto ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          Deploy yield strategies across Morpho, Sky & Aave. Fund Ethereum's builders perpetually.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className={`p-8 hover:border-[#0066FF] transition-colors cursor-pointer ${
          theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900/50'
        }`}
          onClick={() => navigate('/deploy')}>
          <h2 className="text-2xl font-bold mb-4">Deploy Strategy</h2>
          <p className={`mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Select protocol → Add recipients → Deploy. Done in 3 clicks.
          </p>
          <Button className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white">Get Started →</Button>
        </Card>

        <Card className={`p-8 hover:border-[#00D9FF] transition-colors cursor-pointer ${
          theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900/50'
        }`}
          onClick={() => navigate('/dashboard')}>
          <h2 className="text-2xl font-bold mb-4">Track Impact</h2>
          <p className={`mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Real-time yield tracking. See exactly how much you're funding public goods.
          </p>
          <Button className="w-full" variant="outline">View Dashboard →</Button>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
          Built on <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Octant v2</span> • Secured by Aave, Morpho & Sky
        </p>
      </div>
    </div>
  );
}
