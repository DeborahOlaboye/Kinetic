import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Wallet, Users, ExternalLink, Plus, ArrowDownCircle, Loader2, Send, DollarSign } from 'lucide-react';
import { useAppStore } from '@/store';
import { useUserStrategies } from '@/hooks/useUserStrategies';
import { useMorphoStrategy, useDepositToMorphoStrategy, useWithdrawFromMorphoStrategy } from '@/hooks/useMorphoStrategy';
import { usePaymentSplitter } from '@/hooks/usePaymentSplitter';
import { formatUnits, parseUnits } from 'viem';
import { SUPPORTED_ASSETS, TENDERLY_EXPLORER_URL, PAYMENT_SPLITTER_ADDRESS } from '@/utils/constants';

/**
 * Morpho Dashboard Component (Octant V2 Integration)
 *
 * Displays Morpho strategy information deployed via Octant V2:
 * - Strategy overview and status
 * - How Morpho + Octant V2 works
 * - PaymentSplitter integration
 * - Recipient list
 */
export function MorphoDashboard() {
  const { address } = useAccount();
  const { deployedStrategies: localStrategies } = useAppStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Fetch strategies from blockchain
  const { strategies: onChainStrategies } = useUserStrategies(address);

  // Merge strategies (prefer on-chain)
  const deployedStrategies = useMemo(() => {
    if (onChainStrategies.length > 0) {
      return onChainStrategies;
    }
    return localStrategies.filter(s => s.address && s.address.length === 42);
  }, [onChainStrategies, localStrategies]);

  // Find the most recently deployed Morpho strategy
  const activeStrategy = useMemo(() => {
    const morphoStrategies = deployedStrategies.filter(s => s.protocol === 'Morpho');
    return morphoStrategies.length > 0
      ? morphoStrategies[morphoStrategies.length - 1]
      : null;
  }, [deployedStrategies]);

  const strategyAddress = activeStrategy?.address as `0x${string}` | undefined;

  // Get strategy data
  const { totalAssets, userShares, userAssets, assetAddress, depositLimit, refetchAll } = useMorphoStrategy(
    strategyAddress,
    address
  );

  // Deposit and withdraw hooks
  const { approve, deposit, isPending: isDepositPending, isSuccess: isDepositSuccess } = useDepositToMorphoStrategy(
    strategyAddress,
    assetAddress
  );
  const { withdraw, isPending: isWithdrawPending, isSuccess: isWithdrawSuccess } = useWithdrawFromMorphoStrategy(
    strategyAddress
  );

  // Determine asset details
  const assetDetails = useMemo(() => {
    return SUPPORTED_ASSETS.find(a => a.address === assetAddress);
  }, [assetAddress]);

  // PaymentSplitter integration
  const paymentSplitter = usePaymentSplitter(
    PAYMENT_SPLITTER_ADDRESS,
    assetAddress,
    activeStrategy?.recipients
  );

  // Debug logging
  console.log('MorphoDashboard Debug:', {
    activeStrategyAddress: activeStrategy?.address,
    strategyName: activeStrategy?.name,
    assetAddress,
    paymentSplitterAddress: PAYMENT_SPLITTER_ADDRESS,
    recipientCount: activeStrategy?.recipients.length,
    hasAssetAddress: !!assetAddress,
  });

  // Refetch after deposit success
  useEffect(() => {
    if (isDepositSuccess) {
      refetchAll();
      setDepositAmount('');
      toast.success('Deposit successful!');
    }
  }, [isDepositSuccess, refetchAll]);

  // Refetch after withdraw success
  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchAll();
      setWithdrawAmount('');
      toast.success('Withdrawal successful!');
    }
  }, [isWithdrawSuccess, refetchAll]);

  // Refetch PaymentSplitter balance after distribution
  useEffect(() => {
    if (paymentSplitter.isSuccess) {
      paymentSplitter.refetchBalance();
      toast.success('Yield distributed to all recipients!');
    }
  }, [paymentSplitter.isSuccess]);

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

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!address || !withdrawAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseUnits(withdrawAmount, assetDetails?.decimals || 18);
      await withdraw(amount, address, address);
    } catch (err) {
      console.error('Withdrawal failed:', err);
    }
  };

  if (!address) {
    return (
      <Card className="p-8 text-center glass-card card-elevated">
        <p className="text-muted-foreground">Connect your wallet to view your Morpho strategy</p>
      </Card>
    );
  }

  if (!activeStrategy) {
    return (
      <Card className="p-8 text-center glass-card card-elevated">
        <p className="text-muted-foreground mb-4">No Morpho strategies deployed yet</p>
        <p className="text-sm text-muted-foreground">
          Deploy a Morpho strategy from the Deploy page to start routing yield to public goods
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <Card className="p-8 glass-card card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Morpho Strategy Overview</h2>
          <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
            Octant V2 • {assetDetails?.symbol || 'Loading...'}
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
              <p className="text-sm text-muted-foreground">Yield Routing</p>
            </div>
            <p className="text-2xl font-bold text-[#78B288]">100% to Public Goods</p>
          </div>

          <div className="shimmer p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#78B288]" />
              <p className="text-sm text-muted-foreground">Recipients</p>
            </div>
            <p className="text-2xl font-bold">{activeStrategy.recipients.length}</p>
          </div>
        </div>
      </Card>

      {/* How Morpho + Octant V2 Works */}
      <Card className="p-8 glass-card card-elevated bg-gradient-to-br from-[#78B288]/10 to-transparent">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#78B288]" />
          How This Morpho Strategy Works (Octant V2)
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            💰 <strong>Deposit into Morpho:</strong> Your assets are deposited into Morpho compounder vaults that deploy capital to Morpho lending markets
          </p>
          <p>
            🔄 <strong>Auto-Compounding:</strong> Morpho optimizes yield by routing between lending pools for the best rates
          </p>
          <p>
            🎁 <strong>100% Yield Donation:</strong> Via Octant V2's YieldDonatingTokenizedStrategy, all profits are automatically minted as shares for your PaymentSplitter
          </p>
          <p>
            🌊 <strong>Public Goods Funding:</strong> PaymentSplitter distributes yield to your selected recipients according to configured percentages
          </p>
          <p>
            🎯 <strong>ERC-4626 Standard:</strong> Your strategy shares represent proportional ownership of deposited assets plus accumulated yield
          </p>
        </div>
      </Card>

      {/* Deposit & Withdraw Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Deposit Card */}
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#78B288]" />
            Add Funds to Strategy
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

            <div className="text-xs text-muted-foreground">
              Available deposit limit: {formatUnits(depositLimit, assetDetails?.decimals || 18)} {assetDetails?.symbol}
            </div>

            <Button
              onClick={handleDeposit}
              disabled={isDepositPending || !depositAmount || Number(depositAmount) <= 0}
              className="w-full bg-[#78B288] hover:bg-[#5A8F69] text-white disabled:text-white/70 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {isDepositPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Deposit to Morpho
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Deposits are automatically deployed to Morpho compounder vaults and start earning optimized yield
            </p>
          </div>
        </Card>

        {/* Withdraw Card */}
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-[#78B288]" />
            Withdraw Funds
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Amount ({assetDetails?.symbol})
              </label>
              <Input
                type="number"
                placeholder="0.0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Available to withdraw: {formatUnits(userAssets, assetDetails?.decimals || 18)} {assetDetails?.symbol}
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawPending || !withdrawAmount || Number(withdrawAmount) <= 0 || userShares === 0n}
              variant="outline"
              className="w-full border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white hover:scale-105 transition-all duration-300"
            >
              {isWithdrawPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Withdraw from Strategy
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Withdraw your deposited assets plus accumulated yield. Yield continues to flow to public goods.
            </p>
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

      {/* PaymentSplitter Status */}
      <Card className="p-8 glass-card card-elevated bg-gradient-to-br from-[#78B288]/5 to-transparent">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-[#78B288]" />
          PaymentSplitter - Yield Distribution
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="shimmer p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Splitter Balance</p>
              <p className="text-xl font-bold text-[#78B288]">
                {formatUnits(paymentSplitter.splitterBalance || 0n, assetDetails?.decimals || 18)} {assetDetails?.symbol}
              </p>
              {paymentSplitter.splitterBalance === 0n && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Yield will appear here after the strategy generates returns
                </p>
              )}
            </div>

            <div className="shimmer p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Distributed</p>
              <p className="text-xl font-bold">
                {formatUnits(paymentSplitter.totalReleased || 0n, assetDetails?.decimals || 18)} {assetDetails?.symbol}
              </p>
              {paymentSplitter.totalReleased === 0n && (
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Click "Distribute to All" when yield is available
                </p>
              )}
            </div>

            <div className="shimmer p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Splitter Address</p>
              <code className="text-xs font-mono">
                {PAYMENT_SPLITTER_ADDRESS.slice(0, 6)}...{PAYMENT_SPLITTER_ADDRESS.slice(-4)}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Distribute Yield to Recipients</p>
              <p className="text-xs text-muted-foreground">
                Release accumulated yield from the PaymentSplitter to all configured public goods recipients
              </p>
            </div>
            <Button
              onClick={paymentSplitter.releaseToAll}
              disabled={paymentSplitter.isPending || paymentSplitter.splitterBalance === 0n}
              className="bg-gradient-to-r from-[#78B288] to-[#5A8F69] text-white disabled:text-white/70 hover:scale-105 transition-all duration-300"
            >
              {paymentSplitter.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Distributing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Distribute to All
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-[#78B288]/10 rounded-lg border border-[#78B288]/20">
            <p className="font-semibold text-foreground mb-1">How Yield Distribution Works:</p>
            <p>
              As your Morpho strategy earns yield, 100% of profits are minted as strategy shares to the PaymentSplitter.
              The PaymentSplitter holds these shares and can distribute them proportionally to all configured recipients when you click "Distribute to All".
            </p>
          </div>
        </div>
      </Card>

      {/* Strategy Information */}
      <Card className="p-8 glass-card card-elevated">
        <h2 className="text-2xl font-bold mb-4">Strategy Details</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Strategy Name</p>
            <p className="text-lg font-semibold">{activeStrategy.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Strategy Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-secondary p-2 rounded block flex-1">
                {activeStrategy.address}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(activeStrategy.address);
                  toast.success('Address copied!');
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Asset</p>
            <p className="text-lg font-semibold">{assetDetails?.symbol || 'Loading...'} ({assetAddress?.slice(0, 6)}...{assetAddress?.slice(-4)})</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Protocol</p>
            <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
              Morpho via Octant V2
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">View on Explorer</p>
            <Button
              variant="outline"
              size="sm"
              className="border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white"
              onClick={() => window.open(`${TENDERLY_EXPLORER_URL}/address/${activeStrategy.address}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Tenderly Explorer
            </Button>
          </div>
        </div>
      </Card>

      {/* Recipients List */}
      {activeStrategy.recipients.length > 0 && (
        <Card className="p-8 glass-card card-elevated">
          <h3 className="text-xl font-bold mb-4">
            Yield Recipients ({activeStrategy.recipients.length})
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

      {/* Next Steps */}
      <Card className="p-6 glass-card border-[#78B288]/30">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📊</div>
          <div>
            <h3 className="font-semibold mb-1">Managing Your Strategy</h3>
            <p className="text-sm text-muted-foreground">
              Your Morpho strategy is deployed and actively routing yield to public goods via Octant V2.
              The PaymentSplitter will distribute accumulated yield to your recipients. You can monitor
              the strategy performance on Morpho's analytics dashboard.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
