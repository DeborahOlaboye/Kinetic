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
import { useUserStrategies } from '@/hooks/useUserStrategies';
import { useUserAaveVaults } from '@/hooks/useUserAaveVaults';
import { toast } from 'sonner';
import { useMemo } from 'react';
import type { Strategy } from '@/store';

export function Dashboard() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { deployedStrategies: localStrategies, clearInvalidStrategies } = useAppStore();

  // Fetch Morpho/Sky strategies from blockchain
  const { strategies: onChainMorphoSky, isLoading: isLoadingMorphoSky } = useUserStrategies(address);

  // Fetch Aave vaults from blockchain
  const { vaults: onChainAave, isLoading: isLoadingAave } = useUserAaveVaults(address);

  // Merge ALL on-chain strategies (Morpho + Sky + Aave), preferring on-chain data
  const deployedStrategies = useMemo(() => {
    const allOnChainStrategies = [...onChainMorphoSky, ...onChainAave];

    // Use on-chain strategies if available, otherwise fall back to localStorage
    if (allOnChainStrategies.length > 0) {
      return allOnChainStrategies;
    }
    // Filter out invalid local strategies
    return localStrategies.filter(s => s.address && s.address.length === 42);
  }, [onChainMorphoSky, onChainAave, localStrategies]);

  // Fetch real on-chain data for all strategies
  const { totalAssets, totalYield } = useAggregatedStrategyData(deployedStrategies);

  // Loading state
  const isLoadingStrategies = isLoadingMorphoSky || isLoadingAave;

  // Check for invalid strategies (transaction hashes instead of addresses)
  const hasInvalidStrategies = deployedStrategies.some(s => !s.address || s.address.length !== 42);
  const invalidCount = deployedStrategies.filter(s => !s.address || s.address.length !== 42).length;

  // Debug logging
  console.log('Dashboard Strategies:', {
    morphoSkyCount: onChainMorphoSky.length,
    aaveCount: onChainAave.length,
    totalCount: deployedStrategies.length,
    strategies: deployedStrategies.map(s => ({
      protocol: s.protocol,
      address: s.address,
      name: s.name,
    })),
  });

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
            {/* Warning banner for invalid strategies */}
            {hasInvalidStrategies && (
              <Card className="p-6 glass-card border-orange-500/50 bg-orange-500/10">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-400 mb-1">Invalid Strategy Addresses Detected</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {invalidCount} {invalidCount === 1 ? 'strategy has an' : 'strategies have'} invalid address
                      (transaction {invalidCount === 1 ? 'hash' : 'hashes'} instead of contract {invalidCount === 1 ? 'address' : 'addresses'}).
                      This prevents reading on-chain data. Click below to remove {invalidCount === 1 ? 'it' : 'them'}.
                    </p>
                    <Button
                      onClick={() => {
                        clearInvalidStrategies();
                        toast.success(`Removed ${invalidCount} invalid ${invalidCount === 1 ? 'strategy' : 'strategies'}`);
                      }}
                      variant="outline"
                      className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                      size="sm"
                    >
                      Clean Up Invalid Strategies
                    </Button>
                  </div>
                </div>
              </Card>
            )}

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
