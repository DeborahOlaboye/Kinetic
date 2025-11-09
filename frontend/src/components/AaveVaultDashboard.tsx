import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAaveVault, useDepositToVault, useClaimAaveRewards } from '@/hooks/useAaveVault';
import { useRevenueSplitter } from '@/hooks/useRevenueSplitter';
import { useAaveAPY } from '@/hooks/useAaveAPY';
import { formatUnits, parseUnits } from 'viem';
import { SUPPORTED_ASSETS } from '@/utils/constants';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, TrendingUp, Wallet, Users, Plus, Gift } from 'lucide-react';
import { useAppStore } from '@/store';

/**
 * Aave Vault Dashboard Component
 *
 * Displays vault information, total deposits, APY, and revenue distribution
 */
export function AaveVaultDashboard() {
  const { address } = useAccount();
  const { deployedStrategies } = useAppStore();
  const [depositAmount, setDepositAmount] = useState('');

  // Find the most recently deployed Aave vault
  const activeVault = useMemo(() => {
    const aaveStrategies = deployedStrategies.filter(s => s.protocol === 'Aave');
    return aaveStrategies.length > 0
      ? (aaveStrategies[aaveStrategies.length - 1]?.address as `0x${string}`)
      : null;
  }, [deployedStrategies]);

  // Get vault data
  const { totalAssets, userShares, userAssets, assetAddress, refetchAll } = useAaveVault(
    activeVault || undefined,
    address
  );

  // Deposit and rewards hooks
  const { approve, deposit, isPending: isDepositPending, isSuccess: isDepositSuccess } = useDepositToVault(
    activeVault || undefined,
    assetAddress
  );
  const { claimRewards, isPending: isClaimPending, isSuccess: isClaimSuccess } = useClaimAaveRewards(
    activeVault || undefined
  );

  // Get splitter data from the strategy
  const activeStrategy = useMemo(() => {
    return deployedStrategies.find(s => s.address === activeVault);
  }, [deployedStrategies, activeVault]);

  const splitterAddress = useMemo(() => {
    // In factory deployment, the splitter is stored separately
    // For now, we'll need to get it from the factory's getSplitterForVault
    // TODO: Fetch splitter address from factory
    return null as `0x${string}` | null;
  }, [activeVault]);

  const {
    splitRevenue,
    withdrawFees,
    claimRewards: claimSplitterRewards,
    isPending,
    isConfirming,
    isSuccess,
  } = useRevenueSplitter(splitterAddress || undefined);

  // Show success toast and refetch data
  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction successful!');
      refetchAll();
    }
  }, [isSuccess, refetchAll]);

  // Refetch after deposit success
  useEffect(() => {
    if (isDepositSuccess) {
      refetchAll();
      setDepositAmount('');
    }
  }, [isDepositSuccess, refetchAll]);

  // Refetch after claim success
  useEffect(() => {
    if (isClaimSuccess) {
      refetchAll();
    }
  }, [isClaimSuccess, refetchAll]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!address || !depositAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseUnits(depositAmount, assetDetails?.decimals || 18);
      await approve(amount);
      await deposit(amount, address);
    } catch (err) {
      console.error('Deposit failed:', err);
    }
  };

  // Determine asset details
  const assetDetails = useMemo(() => {
    return SUPPORTED_ASSETS.find(a => a.address === assetAddress);
  }, [assetAddress]);

  // Fetch real-time APY from Aave v3 Pool
  const { apy: currentAPY, isLoading: apyLoading } = useAaveAPY(assetAddress);

  if (!address) {
    return (
      <Card className="p-8 text-center glass-card card-elevated">
        <p className="text-muted-foreground">Connect your wallet to view your Aave vault</p>
      </Card>
    );
  }

  if (!activeVault) {
    return (
      <Card className="p-8 text-center glass-card card-elevated">
        <p className="text-muted-foreground mb-4">No Aave vaults deployed yet</p>
        <p className="text-sm text-muted-foreground">
          Deploy an Aave vault from the Deploy page to start earning yield
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vault Overview */}
      <Card className="p-8 glass-card card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Aave Vault Overview</h2>
          <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
            {assetDetails?.symbol || 'Loading...'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Total Deposits</p>
            </div>
            <p className="text-2xl font-bold">
              {formatUnits(totalAssets, assetDetails?.decimals || 18)} {assetDetails?.symbol}
            </p>
          </div>

          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Current APY</p>
            </div>
            {apyLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#78B288]" />
                <p className="text-lg text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-[#78B288]">
                {currentAPY.toFixed(2)}%
              </p>
            )}
          </div>

          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Recipients</p>
            </div>
            <p className="text-2xl font-bold">{activeStrategy?.recipients.length || 0}</p>
          </div>
        </div>
      </Card>

      {/* How Aave Works */}
      <Card className="p-8 glass-card card-elevated bg-gradient-to-br from-[#78B288]/10 to-transparent">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#78B288]" />
          How This Aave Vault Works
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            💰 <strong>Supply Assets:</strong> Your deposits are supplied to Aave V3, earning yield from borrowers
          </p>
          <p>
            🎁 <strong>Earn Rewards:</strong> Aave distributes incentive rewards (like stkAAVE) that you can claim
          </p>
          <p>
            🌊 <strong>Continuous Yield:</strong> Interest accrues every block - your balance grows automatically
          </p>
          <p>
            🎯 <strong>ERC-4626 Standard:</strong> Your vault shares represent your proportional ownership of all assets + yield
          </p>
        </div>
      </Card>

      {/* Deposit & Claim Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Deposit Card */}
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#78B288]" />
            Add Funds
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Amount ({assetDetails?.symbol})
              </label>
              <Input
                type="number"
                placeholder="0.0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <Button
              onClick={handleDeposit}
              disabled={isDepositPending || !depositAmount || Number(depositAmount) <= 0}
              className="w-full bg-[#78B288] hover:bg-[#5A8F69] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {isDepositPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Deposit to Aave
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Deposits are automatically supplied to Aave V3 and start earning yield immediately
            </p>
          </div>
        </Card>

        {/* Claim Rewards Card */}
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#78B288]" />
            Claim Aave Rewards
          </h3>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Aave distributes incentive rewards (stkAAVE, etc.) to vault depositors. Claim your accumulated rewards here.
            </p>

            <Button
              onClick={claimRewards}
              disabled={isClaimPending}
              className="w-full bg-gradient-to-r from-[#78B288] to-[#5A8F69] hover:scale-105 transition-all duration-300"
            >
              {isClaimPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Claim Rewards
                </>
              )}
            </Button>

            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Rewards are sent to the vault owner address
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* User Position */}
      {userShares > 0n && (
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4">Your Position</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="shimmer p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Shares</p>
              <p className="text-2xl font-bold">{formatUnits(userShares, 18)}</p>
            </div>

            <div className="shimmer p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your Deposited Value</p>
              <p className="text-2xl font-bold text-[#78B288]">
                {formatUnits(userAssets, assetDetails?.decimals || 18)} {assetDetails?.symbol}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Revenue Actions */}
      <Card className="p-8 glass-card card-elevated">
        <h3 className="text-xl font-bold mb-4">Revenue Management</h3>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Withdraw fees and claim rewards from the vault, then split revenue among configured
            recipients.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={withdrawFees}
              disabled={isPending || isConfirming || !splitterAddress}
              className="bg-[#78B288] hover:bg-[#5A8F69] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Withdrawing...' : 'Confirming...'}
                </>
              ) : (
                'Withdraw Fees'
              )}
            </Button>

            <Button
              onClick={claimSplitterRewards}
              disabled={isPending || isConfirming || !splitterAddress}
              variant="outline"
              className="border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white hover:scale-105 transition-all duration-300"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                'Claim Splitter Rewards'
              )}
            </Button>

            <Button
              onClick={splitRevenue}
              disabled={isPending || isConfirming || !splitterAddress}
              variant="default"
              className="bg-gradient-to-r from-[#78B288] to-[#5A8F69] hover:scale-105 transition-all duration-300"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Splitting...
                </>
              ) : (
                'Split Revenue'
              )}
            </Button>
          </div>

          {!splitterAddress && (
            <p className="text-sm text-[#ff9800]">
              Splitter address not yet configured. Revenue management will be available after deployment.
            </p>
          )}
        </div>
      </Card>

      {/* Recipients List */}
      {activeStrategy && activeStrategy.recipients.length > 0 && (
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4">
            Revenue Recipients ({activeStrategy.recipients.length})
          </h3>

          <div className="space-y-3">
            {activeStrategy.recipients.map((recipient, index) => (
              <div
                key={recipient.address}
                className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg glass-effect hover:bg-secondary/70 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{recipient.name}</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      {recipient.address}
                    </code>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="border-[#78B288] text-[#78B288] text-sm"
                  >
                    {recipient.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Vault Address Info */}
      <Card className="p-6 glass-card">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Vault Address</p>
            <code className="text-sm font-mono">{activeVault}</code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(activeVault);
              toast.success('Address copied to clipboard');
            }}
          >
            Copy
          </Button>
        </div>
      </Card>
    </div>
  );
}
