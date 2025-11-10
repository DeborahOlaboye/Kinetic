import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AaveVaultDashboard } from '@/components/AaveVaultDashboard';
import { MorphoDashboard } from '@/components/MorphoDashboard';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { KineticParticles } from '@/components/KineticParticles';
import { ShootingStars } from '@/components/ShootingStars';
import { useAccount } from 'wagmi';
import { useUserStrategies } from '@/hooks/useUserStrategies';
import { useUserAaveVaults } from '@/hooks/useUserAaveVaults';
import { useMemo, useEffect } from 'react';

export function StrategyDetails() {
  const { strategyAddress } = useParams<{ strategyAddress: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { deployedStrategies: localStrategies, syncStrategies } = useAppStore();

  // Fetch strategies from blockchain (same as Dashboard)
  const { strategies: onChainMorphoSky } = useUserStrategies(address);
  const { vaults: onChainAave } = useUserAaveVaults(address);

  // Merge all strategies (on-chain + localStorage)
  const allStrategies = useMemo(() => {
    const allOnChainStrategies = [...onChainMorphoSky, ...onChainAave];

    // Prefer on-chain data, fallback to localStorage
    if (allOnChainStrategies.length > 0) {
      return allOnChainStrategies;
    }
    return localStrategies.filter(s => s.address && s.address.length === 42);
  }, [onChainMorphoSky, onChainAave, localStrategies]);

  // Cache blockchain data to localStorage for faster subsequent loads
  useEffect(() => {
    const allOnChainStrategies = [...onChainMorphoSky, ...onChainAave];
    if (allOnChainStrategies.length > 0) {
      syncStrategies(allOnChainStrategies);
    }
  }, [onChainMorphoSky, onChainAave, syncStrategies]);

  const strategy = allStrategies.find(s => s.address === strategyAddress);

  if (!strategy) {
    return (
      <div className="relative">
        <KineticParticles />
        <ShootingStars />

        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center glass-card card-elevated">
              <p className="text-muted-foreground mb-4">Strategy not found</p>
              <Button onClick={() => navigate('/dashboard')} className="bg-[#78B288] hover:bg-[#5A8F69]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <KineticParticles />
      <ShootingStars />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mb-4 hover:bg-[#78B288]/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">{strategy.name}</h1>
                <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
                  {strategy.protocol}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                Manage your {strategy.protocol} strategy and view detailed analytics
              </p>
            </div>
          </div>

          <Separator />

          {/* Protocol-Specific Dashboard */}
          {strategy.protocol === 'Aave' && <AaveVaultDashboard />}

          {strategy.protocol === 'Morpho' && <MorphoDashboard />}

          {strategy.protocol !== 'Aave' && strategy.protocol !== 'Morpho' && (
            <div className="space-y-6">
              <Card className="p-8 glass-card card-elevated">
                <h2 className="text-2xl font-bold mb-4">Strategy Information</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Strategy Address</p>
                    <code className="text-sm font-mono bg-secondary p-2 rounded block">
                      {strategy.address}
                    </code>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Protocol</p>
                    <p className="text-lg font-semibold">{strategy.protocol}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 glass-card card-elevated">
                <h2 className="text-2xl font-bold mb-4">Recipients ({strategy.recipients.length})</h2>

                <div className="space-y-3">
                  {strategy.recipients.map((recipient: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg glass-effect">
                      <div>
                        <p className="font-semibold">{recipient.name}</p>
                        <code className="text-xs text-muted-foreground font-mono">
                          {recipient.address}
                        </code>
                      </div>
                      <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
                        {recipient.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
