import { Button } from '@/components/ui/button';
import { useDeployWithSplitter } from '@/hooks/useDeployWithSplitter';
import { useDeployStrategyDirect } from '@/hooks/useDeployStrategyDirect';
import { ProtocolType, AAVE_VAULT_ADDRESS, USDC_ADDRESS, SUPPORTED_ASSETS } from '@/utils/constants';
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
  const [amountInput, setAmountInput] = useState<string>('1');
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [checkingAllowance, setCheckingAllowance] = useState(false);

  const withSplitter = useDeployWithSplitter();
  const direct = useDeployStrategyDirect();

  // For Aave we always use splitter flow
  const effectiveUseSplitter = protocol === ProtocolType.AAVE ? true : useSplitter;

  // Use the appropriate hook based on toggle
  const { deploy, strategyAddress, deployParams, isPending, isConfirming, isSuccess, error } =
    effectiveUseSplitter ? withSplitter : direct;

  const strategyHash = effectiveUseSplitter ? withSplitter.strategyHash : direct.hash;
  const step = effectiveUseSplitter ? withSplitter.step : undefined;

  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0);
  const isValid = totalPercentage === 100 && recipients.length > 0 && protocol !== null;

  // Aave helpers
  const selectedAsset = SUPPORTED_ASSETS.find(a => a.symbol === selectedSymbol)!;
  const toBaseUnits = (val: string, decimals: number): bigint => {
    const [intPart, fracPartRaw] = val.trim().split('.');
    const fracPart = (fracPartRaw || '').slice(0, decimals);
    const paddedFrac = fracPart.padEnd(decimals, '0');
    const digits = (intPart || '0').replace(/\D/g, '') + paddedFrac.replace(/\D/g, '');
    const clean = digits.replace(/^0+/, '') || '0';
    return BigInt(clean);
  };
  const amountBN = protocol === ProtocolType.AAVE ? toBaseUnits(amountInput || '0', selectedAsset.decimals) : 0n;

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
      const strategyName = `ImpactVault-${protocol}-${Date.now()}`;
      deploy({
        protocol,
        name: strategyName,
        recipients,
        userAddress: address,
        ...(protocol === ProtocolType.AAVE
          ? { assetAddress: selectedAsset.address as `0x${string}`, amount: amountBN }
          : {}),
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
    if (isSuccess && strategyHash && deployParams) {
      console.log('Deployment Success!', {
        strategyHash,
        strategyAddress,
        deployParams,
        hasStrategyAddress: !!strategyAddress,
        usedSplitter: useSplitter
      });

      // Use strategy hash as fallback if we don't have the address yet
      const addressToSave = strategyAddress || strategyHash;

      // Save the strategy to the store
      const recipientsToSave = effectiveUseSplitter
        ? [{ name: 'Payment Splitter', address: (withSplitter.splitterAddress || (PAYMENT_SPLITTER_ADDRESS as `0x${string}`)) as string, percentage: 100 }]
        : deployParams.recipients;

      addStrategy({
        address: addressToSave,
        protocol: deployParams.protocol,
        name: deployParams.name,
        totalDeposited: BigInt(0),
        yieldGenerated: BigInt(0),
        recipients: recipientsToSave,
      });

      console.log('Strategy saved to store!');

      if (useSplitter) {
        toast.success('Strategy deployed successfully!', {
          description: `All ${deployParams.recipients.length} recipients will receive their allocated yield automatically!`,
        });
      } else {
        toast.success('Strategy deployed successfully!', {
          description: `⚠️ Direct mode: Only ${deployParams.recipients[0]?.name} will receive yield.`,
        });
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [isSuccess, strategyHash, deployParams, strategyAddress, addStrategy, navigate, effectiveUseSplitter]);

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
          args: [address, AAVE_VAULT_ADDRESS],
        });
        setAllowance(result as unknown as bigint);
      } catch (e) {
        setAllowance(0n);
      } finally {
        setCheckingAllowance(false);
      }
    };
    run();
  }, [protocol, address, publicClient, selectedAsset.address, approveHash, amountBN]);

  const isDisabled = disabled || !isValid || isPending || isConfirming;
  const needsApprove = protocol === ProtocolType.AAVE && allowance < amountBN;

  return (
    <div className="space-y-4">
      {/* Splitter Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
        <div>
          <p className="text-sm font-medium">Multi-Recipient Distribution</p>
          <p className="text-xs text-gray-500">
            {effectiveUseSplitter
              ? 'Using PaymentSplitter (all recipients get their share)'
              : '⚠️ Direct mode (only first recipient gets yield)'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => protocol === ProtocolType.AAVE ? null : setUseSplitter(!useSplitter)}
          className={`px-3 py-1 rounded ${
            effectiveUseSplitter ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
          } transition-colors text-xs ${protocol === ProtocolType.AAVE ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {effectiveUseSplitter ? 'ON' : 'OFF'}
        </button>
      </div>

      {!useSplitter && recipients.length > 1 && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium">⚠️ Warning</p>
          <p className="text-yellow-300 text-xs mt-1">
            Direct mode is active. Only <strong>{recipients[0]?.name}</strong> will receive yield.
            The other {recipients.length - 1} recipient(s) will not get any funds.
          </p>
        </div>
      )}

      {protocol === ProtocolType.AAVE && (
        <div className="space-y-3 p-3 bg-gray-900 rounded-lg border border-gray-800">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Asset</label>
              <select
                className="mt-1 w-full bg-black border border-gray-700 rounded px-2 py-2 text-sm"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value as any)}
              >
                {SUPPORTED_ASSETS.map(a => (
                  <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Amount</label>
              <input
                type="text"
                inputMode="decimal"
                className="mt-1 w-full bg-black border border-gray-700 rounded px-2 py-2 text-sm"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder={`e.g. 1.0`}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Allowance: {checkingAllowance ? 'checking...' : `${allowance.toString()} base units`} | Needed: {amountBN.toString()}
          </div>

          <Button
            onClick={async () => {
              if (!address) return;
              writeApprove({
                address: selectedAsset.address as `0x${string}`,
                abi: ERC20_ABI as any,
                functionName: 'approve',
                args: [AAVE_VAULT_ADDRESS, amountBN],
              });
            }}
            disabled={isDisabled || checkingAllowance || allowance >= amountBN || amountBN === 0n || isApprovePending || isApproveConfirming}
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
        disabled={isDisabled || (protocol === ProtocolType.AAVE && (amountBN === 0n || allowance < amountBN))}
        className="w-full"
        size="lg"
      >
        {step === 'deploying_splitter' && 'Deploying Splitter...'}
        {step === 'deploying_strategy' && 'Deploying Strategy...'}
        {isPending && 'Preparing Transaction...'}
        {isConfirming && 'Confirming...'}
        {!step && !isPending && !isConfirming && 'Deploy Strategy'}
        {step === 'complete' && 'Deployed Successfully!'}
        {isSuccess && !step && 'Deployed Successfully!'}
      </Button>

      {!address && (
        <p className="text-sm text-yellow-400 text-center">
          Please connect your wallet to deploy
        </p>
      )}

      {address && !isValid && recipients.length > 0 && (
        <p className="text-sm text-yellow-400 text-center">
          Total allocation must equal 100%
        </p>
      )}

      {address && recipients.length === 0 && (
        <p className="text-sm text-yellow-400 text-center">
          Please add at least one recipient
        </p>
      )}
    </div>
  );
}
