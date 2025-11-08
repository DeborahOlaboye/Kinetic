import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">ImpactVault</h1>
        <p className="text-xl text-gray-400">
          Deploy & Track DeFi Yield for Public Goods
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="p-8 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => navigate('/deploy')}>
          <h2 className="text-2xl font-bold mb-4">Deploy Strategy</h2>
          <p className="text-gray-400 mb-6">
            Create a new yield-generating vault that funds public goods
          </p>
          <Button className="w-full">Get Started →</Button>
        </Card>

        <Card className="p-8 hover:border-green-500 transition-colors cursor-pointer"
          onClick={() => navigate('/dashboard')}>
          <h2 className="text-2xl font-bold mb-4">Track Impact</h2>
          <p className="text-gray-400 mb-6">
            Monitor your vaults and see real-time public goods funding
          </p>
          <Button className="w-full" variant="outline">View Dashboard →</Button>
        </Card>
      </div>
    </div>
  );
}
