import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMorphoAdapter } from '@/hooks/useMorphoAdapter';
import { formatUnits } from 'viem';
import { SUPPORTED_ASSETS, MORPHO_ADAPTER_ADDRESS, MORPHO_VAULT_ADDRESS } from '@/utils/constants';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, Wallet, Users, BarChart3, RefreshCw } from 'lucide-react';

/**
 * Morpho Vaults V2 Dashboard Component
 *
 * Displays Morpho adapter information, total assets, yield donated, and market allocations
 */
export function MorphoDashboard() {
  const { address } = useAccount();
  const [selectedMarketId, setSelectedMarketId] = useState<`0x${string}` | null>(null);

  const {
    isLoading,
    error,
    marketCount,
    totalPrincipal,
    totalYieldDonated,
    realAssets,
    getAllocation,
    getHarvestableYield,
    harvestYield,
  } = useMorphoAdapter();

  // For demo purposes - in production, you'd fetch actual market IDs from the contract
  // This would typically come from events or a separate query
  const [marketIds, setMarketIds] = useState<`0x${string}`[]>([]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.message}`);
    }
  }, [error]);

  const handleHarvest = async (marketId: `0x${string}`) => {
    try {
      toast.loading('Harvesting yield...');
      const txHash = await harvestYield(marketId);
      toast.success(`Yield harvested! Tx: ${txHash}`);
    } catch (err) {
      toast.error(`Failed to harvest: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!address) {
    return (
      <Card className="p-8 text-center glass-card card-elevated">
        <p className="text-muted-foreground">Connect your wallet to view Morpho Vaults V2</p>
      </Card>
    );
  }

  // Check if adapter is deployed
  if (MORPHO_ADAPTER_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return (
      <Card className="p-8 text-center glass-card card-elevated">
        <p className="text-muted-foreground mb-4">Morpho adapter not yet deployed</p>
        <p className="text-sm text-muted-foreground">
          Deploy the PaymentSplitterYieldAdapter contract to start using Morpho Vaults V2
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adapter Overview */}
      <Card className="p-8 glass-card card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Morpho Vaults V2 Adapter</h2>
          <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
            Active Markets: {marketCount?.toString() || '0'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Total Assets</p>
            </div>
            {realAssets !== undefined ? (
              <p className="text-2xl font-bold">
                {formatUnits(realAssets, 6)} USDC
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#78B288]" />
                <p className="text-lg text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>

          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Total Principal</p>
            </div>
            {totalPrincipal !== undefined ? (
              <p className="text-2xl font-bold">
                {formatUnits(totalPrincipal, 6)} USDC
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#78B288]" />
                <p className="text-lg text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>

          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Total Yield Donated</p>
            </div>
            {totalYieldDonated !== undefined ? (
              <p className="text-2xl font-bold text-[#78B288]">
                {formatUnits(totalYieldDonated, 6)} USDC
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#78B288]" />
                <p className="text-lg text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Yield Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Yield vs Principal Ratio</p>
            <p className="text-xl font-bold text-[#78B288]">
              {totalPrincipal && totalYieldDonated && totalPrincipal > 0n
                ? ((Number(totalYieldDonated) / Number(totalPrincipal)) * 100).toFixed(2)
                : '0.00'}
              %
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All yield goes to public goods
            </p>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Allocation</p>
            <p className="text-xl font-bold">
              {realAssets && totalPrincipal && realAssets > 0n
                ? ((Number(totalPrincipal) / Number(realAssets)) * 100).toFixed(2)
                : '100.00'}
              %
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Principal protected, yield donated
            </p>
          </div>
        </div>
      </Card>

      {/* Active Markets */}
      {marketCount !== undefined && marketCount > 0n && (
        <Card className="p-8 glass-card card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Active Markets</h3>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#78B288]" />
              <span className="text-sm text-muted-foreground">
                {marketCount.toString()} {Number(marketCount) === 1 ? 'market' : 'markets'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Markets are deployed ERC-4626 vaults where your assets generate yield. You can
              harvest yield from any market at any time.
            </p>

            {/* Market List - In production, this would be fetched from events */}
            {marketIds.length === 0 ? (
              <div className="p-6 bg-secondary/30 rounded-lg text-center">
                <p className="text-muted-foreground mb-2">
                  No market allocations found
                </p>
                <p className="text-xs text-muted-foreground">
                  Market IDs would be displayed here after allocations are made
                </p>
              </div>
            ) : (
              marketIds.map((marketId) => (
                <MarketCard
                  key={marketId}
                  marketId={marketId}
                  getAllocation={getAllocation}
                  getHarvestableYield={getHarvestableYield}
                  onHarvest={handleHarvest}
                  isLoading={isLoading}
                />
              ))
            )}
          </div>
        </Card>
      )}

      {/* No Markets Message */}
      {(marketCount === undefined || marketCount === 0n) && (
        <Card className="p-8 text-center glass-card card-elevated">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">No active markets yet</p>
          <p className="text-sm text-muted-foreground">
            Allocate assets to underlying vaults to start generating yield for public goods
          </p>
        </Card>
      )}

      {/* Contract Addresses */}
      <Card className="p-6 glass-card">
        <h4 className="text-sm font-semibold mb-4">Contract Addresses</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Adapter Address</p>
              <code className="text-xs font-mono">{MORPHO_ADAPTER_ADDRESS}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(MORPHO_ADAPTER_ADDRESS);
                toast.success('Adapter address copied');
              }}
            >
              Copy
            </Button>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Morpho Vault Address</p>
              <code className="text-xs font-mono">{MORPHO_VAULT_ADDRESS}</code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(MORPHO_VAULT_ADDRESS);
                toast.success('Vault address copied');
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 glass-card bg-gradient-to-r from-[#78B288]/10 to-[#5A8F69]/10 border-[#78B288]/30">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-[#78B288]/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#78B288]" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">How Morpho Vaults V2 Works</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your principal is deposited into ERC-4626 vaults (Aave, etc.) where it generates
              yield. The adapter uses high-watermark accounting to track your principal separately
              from yield. 100% of realized yield is automatically routed to the PaymentSplitter
              for distribution to public goods recipients. Your principal can always be withdrawn
              in full.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Individual Market Card Component
 */
interface MarketCardProps {
  marketId: `0x${string}`;
  getAllocation: (marketId: `0x${string}`) => any;
  getHarvestableYield: (marketId: `0x${string}`) => any;
  onHarvest: (marketId: `0x${string}`) => void;
  isLoading: boolean;
}

function MarketCard({
  marketId,
  getAllocation,
  getHarvestableYield,
  onHarvest,
  isLoading,
}: MarketCardProps) {
  const allocationData = getAllocation(marketId);
  const harvestableData = getHarvestableYield(marketId);

  return (
    <div className="p-6 bg-secondary/50 rounded-lg glass-effect hover:bg-secondary/70 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Market ID</p>
          <code className="text-xs font-mono">{marketId.slice(0, 10)}...{marketId.slice(-8)}</code>
        </div>
        <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
          Active
        </Badge>
      </div>

      {allocationData?.data && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Principal Deposited</p>
            <p className="text-sm font-semibold">
              {formatUnits(allocationData.data.principalDeposited, 6)} USDC
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Shares</p>
            <p className="text-sm font-semibold">
              {formatUnits(allocationData.data.totalShares, 18)}
            </p>
          </div>
        </div>
      )}

      <Separator className="my-4" />

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Harvestable Yield</p>
          {harvestableData?.data !== undefined ? (
            <p className="text-lg font-bold text-[#78B288]">
              {formatUnits(harvestableData.data, 6)} USDC
            </p>
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-[#78B288]" />
          )}
        </div>

        <Button
          onClick={() => onHarvest(marketId)}
          disabled={isLoading || !harvestableData?.data || harvestableData.data === 0n}
          className="bg-[#78B288] hover:bg-[#5A8F69] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Harvesting...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Harvest Yield
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
