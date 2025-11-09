// src/pages/Dashboard.tsx
import { YieldCounter } from '@/components/YieldCounter';
import { RecipientList } from '@/components/RecipientList';
import { ImpactStories } from '@/components/ImpactStories';
import { ShareButton } from '@/components/ShareButton';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Separator } from '@/components/ui/separator';
import { KineticParticles } from '@/components/KineticParticles';
import { ShootingStars } from '@/components/ShootingStars';

export function Dashboard() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { deployedStrategies } = useAppStore();


  // Calculate total assets and yield from deployed strategies
  // In production, this would fetch real values from contracts
  const totalAssets = deployedStrategies.reduce(
    (sum, strategy) => sum + BigInt(strategy.totalDeposited || '0'),
    BigInt(0)
  );

  const totalYield = deployedStrategies.reduce(
    (sum, strategy) => sum + BigInt(strategy.yieldGenerated || '0'),
    BigInt(0)
  );

  // Use mock data if no real data yet
  const displayTotalAssets = totalAssets > BigInt(0) ? totalAssets : BigInt(1000000000000000000); // 1 ETH worth
  const displayYieldGenerated = totalYield > BigInt(0) ? totalYield : BigInt(50000000000000000); // 0.05 ETH worth

  const totalRecipients = deployedStrategies.reduce(
    (sum, strategy) => sum + strategy.recipients.length,
    0
  );

  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />
      {/* Shooting Stars */}
      <ShootingStars />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Impact</h1>
          <p className="text-muted-foreground">Track your perpetual funding and impact metrics</p>
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
              totalAssets={displayTotalAssets}
              yieldGenerated={displayYieldGenerated}
              decimals={18}
            />

            <Separator />

            <ImpactStories
              totalYield={displayYieldGenerated}
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
                        <Button variant="outline" size="sm" className="border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white hover:scale-105 transition-all duration-300">
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
                  totalYield={displayYieldGenerated}
                />
              </div>
            </div>

            <Separator />

            <ShareButton
              totalYield={displayYieldGenerated}
              recipientCount={totalRecipients}
            />
          </>
        )}
        </div>
      </div>
    </div>
  );
}
