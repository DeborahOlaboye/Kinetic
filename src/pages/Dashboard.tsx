// src/pages/Dashboard.tsx
import { YieldCounter } from '@/components/YieldCounter';
import { RecipientList } from '@/components/RecipientList';
import { ImpactStories } from '@/components/ImpactStories';
import { ShareButton } from '@/components/ShareButton';
import { DebugStore } from '@/components/DebugStore';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Separator } from '@/components/ui/separator';

export function Dashboard() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { deployedStrategies } = useAppStore();

  // Debug logging
  console.log('Dashboard - Deployed Strategies:', deployedStrategies);
  console.log('Dashboard - Strategy Count:', deployedStrategies.length);
  console.log('Dashboard - Wallet Address:', address);

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
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your impact and yield generation</p>
        </div>

        {/* Debug component - remove in production */}
        <DebugStore />

        {!address && (
          <Card className="p-8 text-center">
            <p className="text-gray-400 mb-4">Connect your wallet to view your dashboard</p>
          </Card>
        )}

        {address && deployedStrategies.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-400 mb-4">No strategies deployed yet</p>
            <Button onClick={() => navigate('/deploy')}>
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
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4">Your Strategies</h2>
                <div className="space-y-4">
                  {deployedStrategies.map((strategy, index) => (
                    <Card key={index} className="p-6 border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{strategy.name}</h3>
                          <p className="text-sm text-gray-500">{strategy.protocol} Protocol</p>
                        </div>
                        <Button variant="outline" size="sm">
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
  );
}
