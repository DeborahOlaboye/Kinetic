import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router';
import { KineticParticles } from '@/components/KineticParticles';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">Kinetic</h1>
          <p className="text-xl text-secondary-foreground mb-2">
            Capital in motion for public goods
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Deploy yield strategies across Morpho, Sky & Aave. Fund Ethereum's builders perpetually.
          </p>
        </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="p-8 hover:border-[#78B288] transition-all duration-300 cursor-pointer hover:shadow-lg"
          onClick={() => navigate('/deploy')}>
          <h2 className="text-2xl font-bold mb-4">Deploy Strategy</h2>
          <p className="text-muted-foreground mb-6">
            Select protocol → Add recipients → Deploy. Fund public goods perpetually in 3 clicks.
          </p>
          <Button className="w-full bg-[#78B288] hover:bg-[#5A8F69] text-white">Deploy Capital →</Button>
        </Card>

        <Card className="p-8 hover:border-[#78B288] transition-all duration-300 cursor-pointer hover:shadow-lg"
          onClick={() => navigate('/dashboard')}>
          <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
          <p className="text-muted-foreground mb-6">
            Monitor active strategies and track real-time public goods funding
          </p>
          <Button className="w-full" variant="outline">View Dashboard →</Button>
        </Card>
      </div>
      </div>
    </div>
  );
}
