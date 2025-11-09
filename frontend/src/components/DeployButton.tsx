import { Button } from '@/components/ui/button';
import { useDeployWithSplitter } from '@/hooks/useDeployWithSplitter';
import { useDeployStrategyDirect } from '@/hooks/useDeployStrategyDirect';
import { useDeployAaveVault } from '@/hooks/useDeployAaveVault';
import { useDeployOctantV2Strategy } from '@/hooks/useDeployOctantV2Strategy';
import { ProtocolType, AAVE_VAULT_PROXY_DEPLOYER, USDC_ADDRESS, SUPPORTED_ASSETS, PAYMENT_SPLITTER_ADDRESS } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router';

interface DeployButtonProps {
  protocol: ProtocolType | null;
  recipients: Recipient[];
  disabled?: boolean;
}

export function DeployButton({ protocol, recipients, disabled }: DeployButtonProps) {
  const navigate = useNavigate();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { addStrategy } = useAppStore();

  // Local approval flow (for Aave)
  const ERC20_ABI = [
    {
      type: 'function',
      name: 'approve',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'uint256', internalType: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    },
  ] as const;

  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  // Toggle: Use direct deployment (single recipient) or splitter (multi-recipient)
  const [useSplitter, setUseSplitter] = useState(true);

  // Aave input state
  const [selectedSymbol, setSelectedSymbol] = useState<'USDC' | 'DAI' | 'USDT'>('USDC');
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [checkingAllowance, setCheckingAllowance] = useState(false);

  const withSplitter = useDeployWithSplitter();
  const direct = useDeployStrategyDirect();
  const aaveVault = useDeployAaveVault();
  const octantV2 = useDeployOctantV2Strategy();

  // For Aave we always use vault deployment
  const effectiveUseSplitter = protocol === ProtocolType.AAVE ? true : useSplitter;

  // Determine if we should use Octant V2 deployer (for Morpho/Sky)
  const isUsingOctantV2 = protocol === ProtocolType.MORPHO || protocol === ProtocolType.SKY;
  const isUsingAave = protocol === ProtocolType.AAVE;

  // Use the appropriate hook based on protocol
  const { deploy, strategyAddress, deployParams, isPending, isConfirming, isSuccess, error } =
    isUsingAave ? {
      deploy: () => {}, // Not used, we call aaveVault.deployVault directly
      strategyAddress: aaveVault.vaultAddress,
      deployParams: null,
      isPending: aaveVault.isPending,
      isConfirming: aaveVault.isConfirming,
      isSuccess: aaveVault.isSuccess,
      error: aaveVault.error
    } : isUsingOctantV2 ? {
      deploy: () => {}, // Not used, we call octantV2.deploy directly
      strategyAddress: octantV2.strategyAddress,
      deployParams: octantV2.deployParams,
      isPending: octantV2.isPending,
      isConfirming: octantV2.isConfirming,
      isSuccess: octantV2.isSuccess,
      error: null // octantV2 hook doesn't expose error
    } : effectiveUseSplitter ? withSplitter : direct;

  const strategyHash = isUsingAave ? aaveVault.hash : isUsingOctantV2 ? octantV2.hash : (effectiveUseSplitter ? withSplitter.strategyHash : direct.hash);
  const step = isUsingAave ? aaveVault.step : (effectiveUseSplitter ? withSplitter.step : undefined);

  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0);
  const isValid = totalPercentage === 100 && recipients.length > 0 && protocol !== null;

  // Aave helpers
  const selectedAsset = SUPPORTED_ASSETS.find(a => a.symbol === selectedSymbol)!;

  // Initial lock deposit amounts (fixed per asset for vault factory)
  const getInitialLockDeposit = (symbol: 'USDC' | 'DAI' | 'USDT'): bigint => {
    switch (symbol) {
      case 'USDC': return BigInt(1e6); // 1 USDC (6 decimals)
      case 'DAI': return BigInt(1e18); // 1 DAI (18 decimals)
      case 'USDT': return BigInt(1e6); // 1 USDT (6 decimals)
    }
  };

  const initialLockDeposit = protocol === ProtocolType.AAVE ? getInitialLockDeposit(selectedSymbol) : 0n;

  const handleDeploy = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!protocol) {
      toast.error('Please select a protocol');
      return;
    }

    if (!isValid) {
      toast.error('Please ensure recipients total 100%');
      return;
    }

    try {
      // Aave vault deployment (different flow)
      if (protocol === ProtocolType.AAVE) {
        await aaveVault.deployVault({
          asset: selectedSymbol,
          recipients,
          userAddress: address,
        });
        return;
      }

      // Octant V2 deployment (Morpho/Sky) - NEW FLOW
      if (isUsingOctantV2) {
        const strategyName = `Kinetic-${protocol}-${Date.now()}`;

        // For Octant V2, we need a PaymentSplitter address
        // Use the deployed PAYMENT_SPLITTER_ADDRESS or deploy a new one
        const paymentSplitterAddress = PAYMENT_SPLITTER_ADDRESS;

        if (!paymentSplitterAddress || paymentSplitterAddress === '0x0000000000000000000000000000000000000000') {
          toast.error('Please deploy a PaymentSplitter contract first');
          return;
        }

        await octantV2.deploy({
          protocol: protocol as ProtocolType.MORPHO | ProtocolType.SKY,
          name: strategyName,
          paymentSplitterAddress: paymentSplitterAddress as `0x${string}`,
          enableBurning: false,
        });

        return;
      }

      // Legacy deployment (for backwards compatibility)
      const strategyName = `Kinetic-${protocol}-${Date.now()}`;
      deploy({
        protocol,
        name: strategyName,
        recipients,
        userAddress: address,
      });

      if (useSplitter) {
        toast.info('Step 1: Deploying recipient splitter contract...');
      } else {
        toast.info('Deploying yield strategy (direct mode)...');
      }
    } catch (err) {
      console.error('Deploy error:', err);
      toast.error('Failed to deploy strategy');
    }
  };

  // Show step-based progress notifications
  useEffect(() => {
    if (step === 'deploying_strategy' && effectiveUseSplitter) {
      const splitterHash = withSplitter.splitterHash;
      toast.info('Step 2: Deploying yield strategy...', {
        description: splitterHash ? `Splitter: ${splitterHash.slice(0, 10)}...${splitterHash.slice(-8)}` : undefined,
      });
    }
  }, [step, effectiveUseSplitter, withSplitter.splitterHash]);

  useEffect(() => {
    if (isSuccess && strategyHash) {
      console.log('Deployment Success!', {
        strategyHash,
        strategyAddress,
        deployParams,
        hasStrategyAddress: !!strategyAddress,
        usedSplitter: useSplitter,
        isUsingOctantV2
      });

      // Use strategy hash as fallback if we don't have the address yet
      const addressToSave = strategyAddress || strategyHash;

      // Determine recipients based on deployment type
      let recipientsToSave = recipients;
      let protocolToSave = protocol;
      let nameToSave = `Kinetic-${protocol}-${Date.now()}`;

      if (isUsingOctantV2) {
        // Octant V2 deployment - 100% goes to PaymentSplitter
        recipientsToSave = [{
          name: 'Payment Splitter (Public Goods)',
          address: (PAYMENT_SPLITTER_ADDRESS as `0x${string}`) as string,
          percentage: 100
        }];
        protocolToSave = protocol!;
        nameToSave = octantV2.deployParams?.name || nameToSave;
      } else if (deployParams && 'recipients' in deployParams) {
        // Legacy deployment (has recipients field)
        recipientsToSave = effectiveUseSplitter
          ? [{ name: 'Payment Splitter', address: (withSplitter.splitterAddress || (PAYMENT_SPLITTER_ADDRESS as `0x${string}`)) as string, percentage: 100 }]
          : deployParams.recipients;
        protocolToSave = deployParams.protocol;
        nameToSave = deployParams.name;
      }

      addStrategy({
        address: addressToSave,
        protocol: protocolToSave!,
        name: nameToSave,
        totalDeposited: BigInt(0),
        yieldGenerated: BigInt(0),
        recipients: recipientsToSave,
      });

      console.log('Strategy saved to store!');

      if (isUsingOctantV2) {
        toast.success('Octant V2 Strategy deployed successfully!', {
          description: `${protocol} strategy now routing 100% yield to public goods via PaymentSplitter.`,
        });
      } else if (useSplitter) {
        toast.success('Strategy deployed successfully!', {
          description: `Now funding ${recipients.length} public goods projects perpetually.`,
        });
      } else {
        toast.success('Strategy deployed successfully!', {
          description: `⚠️ Direct mode: Only ${recipients[0]?.name} will receive perpetual funding.`,
        });
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [isSuccess, strategyHash, deployParams, strategyAddress, addStrategy, navigate, effectiveUseSplitter, isUsingOctantV2, protocol, recipients, octantV2.deployParams]);

  useEffect(() => {
    if (error) {
      let errorMessage = error.message;

      // Parse common error messages for better UX
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
      }

      toast.error('Deployment failed', {
        description: errorMessage,
      });
    }
  }, [error]);

  // Refresh allowance for Aave inputs
  useEffect(() => {
    const run = async () => {
      if (protocol !== ProtocolType.AAVE || !address || !publicClient) return;
      setCheckingAllowance(true);
      try {
        const result = await publicClient.readContract({
          address: selectedAsset.address as `0x${string}`,
          abi: [
            {
              type: 'function',
              name: 'allowance',
              stateMutability: 'view',
              inputs: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
              ],
              outputs: [
                { name: '', type: 'uint256' },
              ],
            },
          ] as const,
          functionName: 'allowance',
          args: [address, AAVE_VAULT_PROXY_DEPLOYER],
        });
        setAllowance(result as unknown as bigint);
      } catch (e) {
        setAllowance(0n);
      } finally {
        setCheckingAllowance(false);
      }
    };
    run();
  }, [protocol, address, publicClient, selectedAsset.address, approveHash, initialLockDeposit]);

  const isDisabled = disabled || !isValid || isPending || isConfirming;
  const needsApprove = protocol === ProtocolType.AAVE && allowance < initialLockDeposit;

  return (
    <div className="space-y-4">
      {/* Splitter Toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
        <div>
          <p className="text-sm font-medium">
            {isUsingOctantV2 ? 'Octant V2 Yield Routing' : 'Multi-Recipient Distribution'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isUsingOctantV2
              ? '✅ 100% yield automatically routed to PaymentSplitter (Octant V2 requirement)'
              : effectiveUseSplitter
              ? 'Using PaymentSplitter (all recipients get funding)'
              : '⚠️ Direct mode (only first recipient gets funding)'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (protocol === ProtocolType.AAVE || isUsingOctantV2) ? null : setUseSplitter(!useSplitter)}
          className={`px-3 py-1 rounded ${
            effectiveUseSplitter || isUsingOctantV2 ? 'bg-[#78B288] hover:bg-[#5A8F69]' : 'bg-[#ff9800] hover:bg-[#f57c00]'
          } transition-colors text-xs text-white ${(protocol === ProtocolType.AAVE || isUsingOctantV2) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {effectiveUseSplitter || isUsingOctantV2 ? 'ON' : 'OFF'}
        </button>
      </div>

      {!useSplitter && recipients.length > 1 && (
        <div className="p-3 bg-[#ff9800]/10 border border-[#ff9800] rounded-lg">
          <p className="text-[#ff9800] text-sm font-medium">⚠️ Warning</p>
          <p className="text-muted-foreground text-xs mt-1">
            Direct mode is active. Only <strong>{recipients[0]?.name}</strong> will receive perpetual funding.
            The other {recipients.length - 1} recipient(s) will not get any funds.
          </p>
        </div>
      )}

      {protocol === ProtocolType.AAVE && (
        <div className="space-y-3 p-3 bg-secondary rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Asset</label>
              <select
                className="mt-1 w-full bg-input border border-border rounded px-2 py-2 text-sm text-foreground"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value as any)}
              >
                {SUPPORTED_ASSETS.map(a => (
                  <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Initial Deposit (Fixed)</label>
              <input
                type="text"
                className="mt-1 w-full bg-secondary border border-border rounded px-2 py-2 text-sm text-muted-foreground cursor-not-allowed"
                value={selectedSymbol === 'DAI' ? '1.0 DAI' : `1.0 ${selectedSymbol}`}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Allowance: {checkingAllowance ? 'checking...' : `${allowance.toString()} base units`} | Needed: {initialLockDeposit.toString()}
          </div>

          <Button
            onClick={async () => {
              if (!address || !publicClient) return;

              try {
                // First, reset allowance to 0 (required for some tokens like USDC)
                if (allowance > 0n) {
                  toast.info('Resetting allowance to 0...');
                  const resetHash = await writeApprove({
                    address: selectedAsset.address as `0x${string}`,
                    abi: ERC20_ABI as any,
                    functionName: 'approve',
                    args: [AAVE_VAULT_PROXY_DEPLOYER, 0n],
                  });
                  await publicClient.waitForTransactionReceipt({ hash: resetHash });
                }

                // Then approve the required amount
                toast.info('Approving USDC spend...');
                const approvalAmount = initialLockDeposit * BigInt(2); // Approve 2x for safety
                await writeApprove({
                  address: selectedAsset.address as `0x${string}`,
                  abi: ERC20_ABI as any,
                  functionName: 'approve',
                  args: [AAVE_VAULT_PROXY_DEPLOYER, approvalAmount],
                });
              } catch (err) {
                console.error('Approval error:', err);
                toast.error('Failed to approve');
              }
            }}
            disabled={isDisabled || checkingAllowance || allowance >= initialLockDeposit || initialLockDeposit === 0n || isApprovePending || isApproveConfirming}
            className="w-full"
            size="sm"
          >
            {isApprovePending && 'Approving...'}
            {isApproveConfirming && 'Confirming Approval...'}
            {!isApprovePending && !isApproveConfirming && 'Approve'}
          </Button>
        </div>
      )}

      <Button
        onClick={handleDeploy}
        disabled={isDisabled || (protocol === ProtocolType.AAVE && (initialLockDeposit === 0n || allowance < initialLockDeposit))}
        className="w-full"
        size="lg"
      >
        {step === 'deploying_splitter' && 'Deploying Splitter...'}
        {step === 'deploying_strategy' && 'Deploying Strategy...'}
        {step === 'deploying_vault' && 'Deploying Aave Vault...'}
        {isPending && !isUsingOctantV2 && 'Preparing Transaction...'}
        {isPending && isUsingOctantV2 && 'Deploying Octant V2 Strategy...'}
        {isConfirming && 'Confirming...'}
        {!step && !isPending && !isConfirming && (
          protocol === ProtocolType.AAVE ? 'Deploy Aave Vault' :
          isUsingOctantV2 ? `Deploy ${protocol} Strategy (Octant V2)` :
          'Deploy Strategy'
        )}
        {step === 'complete' && 'Deployed Successfully!'}
        {isSuccess && !step && 'Deployed Successfully!'}
      </Button>

      {!address && (
        <p className="text-sm text-[#ff9800] text-center">
          Please connect your wallet to deploy
        </p>
      )}

      {address && !isValid && recipients.length > 0 && (
        <p className="text-sm text-[#ff9800] text-center">
          Total allocation must equal 100%
        </p>
      )}

      {address && recipients.length === 0 && (
        <p className="text-sm text-[#ff9800] text-center">
          Please add at least one recipient
        </p>
      )}
    </div>
  );
}
