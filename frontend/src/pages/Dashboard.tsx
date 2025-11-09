// src/pages/Dashboard.tsx
import { YieldCounter } from '@/components/YieldCounter';
import { RecipientList } from '@/components/RecipientList';
import { ImpactStories } from '@/components/ImpactStories';
import { ShareButton } from '@/components/ShareButton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Separator } from '@/components/ui/separator';
import { KineticParticles } from '@/components/KineticParticles';
import { ShootingStars } from '@/components/ShootingStars';
import { useAggregatedStrategyData } from '@/hooks/useAggregatedStrategyData';
import type { Strategy } from '@/store';

export function Dashboard() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { deployedStrategies } = useAppStore();

  // Fetch real on-chain data for all strategies
  const { totalAssets, totalYield } = useAggregatedStrategyData();

  const totalRecipients = deployedStrategies.reduce(
    (sum, strategy) => sum + strategy.recipients.length,
    0
  );

  const handleViewDetails = (strategy: Strategy) => {
    navigate(`/strategy/${strategy.address}`);
  };

  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />
      {/* Shooting Stars */}
      <ShootingStars />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Your Impact</h1>
            <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
              Octant V2
            </Badge>
          </div>
          <p className="text-muted-foreground">Track your perpetual funding and impact metrics powered by Octant V2</p>
        </div>


        {!address && (
          <Card className="p-8 text-center glass-card card-elevated">
            <p className="text-muted-foreground mb-4">Connect your wallet to view your dashboard</p>
          </Card>
        )}

        {address && deployedStrategies.length === 0 && (
          <Card className="p-8 text-center glass-card card-elevated">
            <p className="text-muted-foreground mb-4">No strategies deployed yet</p>
            <Button onClick={() => navigate('/deploy')} className="bg-[#78B288] hover:bg-[#5A8F69] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Deploy Your First Strategy
            </Button>
          </Card>
        )}

        {address && deployedStrategies.length > 0 && (
          <>
            <YieldCounter
              totalAssets={totalAssets}
              yieldGenerated={totalYield}
              decimals={18}
            />

            <Separator />

            <ImpactStories
              totalYield={totalYield}
              recipientCount={totalRecipients}
            />

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 glass-card card-elevated">
                <h2 className="text-2xl font-bold mb-4">Your Active Strategies</h2>
                <div className="space-y-4">
                  {deployedStrategies.map((strategy, index) => (
                    <Card key={index} className="p-6 glass-effect glow-on-hover transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{strategy.name}</h3>
                          <p className="text-sm text-muted-foreground">{strategy.protocol} Protocol</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white hover:scale-105 transition-all duration-300"
                          onClick={() => handleViewDetails(strategy)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <RecipientList
                  recipients={deployedStrategies[0]?.recipients || []}
                  totalYield={totalYield}
                />
              </div>
            </div>

            <Separator />

            <ShareButton
              totalYield={totalYield}
              recipientCount={totalRecipients}
            />
          </>
        )}
        </div>
      </div>
    </div>
  );
}
