import { Button } from '@/components/ui/button';
import { useDeployWithSplitter } from '@/hooks/useDeployWithSplitter';
import { useDeployStrategyDirect } from '@/hooks/useDeployStrategyDirect';
import { ProtocolType } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';
import { useAccount } from 'wagmi';
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
  const { addStrategy } = useAppStore();

  // Toggle: Use direct deployment (single recipient) or splitter (multi-recipient)
  const [useSplitter, setUseSplitter] = useState(true);

  const withSplitter = useDeployWithSplitter();
  const direct = useDeployStrategyDirect();

  // Use the appropriate hook based on toggle
  const { deploy, strategyAddress, deployParams, isPending, isConfirming, isSuccess, error } =
    useSplitter ? withSplitter : direct;

  const strategyHash = useSplitter ? withSplitter.strategyHash : direct.hash;
  const step = useSplitter ? withSplitter.step : undefined;

  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0);
  const isValid = totalPercentage === 100 && recipients.length > 0 && protocol !== null;

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
    if (step === 'deploying_strategy' && useSplitter) {
      const splitterHash = withSplitter.splitterHash;
      toast.info('Step 2: Deploying yield strategy...', {
        description: splitterHash ? `Splitter: ${splitterHash.slice(0, 10)}...${splitterHash.slice(-8)}` : undefined,
      });
    }
  }, [step, useSplitter, withSplitter.splitterHash]);

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
      addStrategy({
        address: addressToSave,
        protocol: deployParams.protocol,
        name: deployParams.name,
        totalDeposited: BigInt(0), // Will be updated when user deposits
        yieldGenerated: BigInt(0), // Will be updated from contract
        recipients: deployParams.recipients,
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
  }, [isSuccess, strategyHash, deployParams, strategyAddress, addStrategy, navigate, useSplitter]);

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

  const isDisabled = disabled || !isValid || isPending || isConfirming;

  return (
    <div className="space-y-4">
      {/* Splitter Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
        <div>
          <p className="text-sm font-medium">Multi-Recipient Distribution</p>
          <p className="text-xs text-gray-500">
            {useSplitter
              ? 'Using PaymentSplitter (all recipients get their share)'
              : '⚠️ Direct mode (only first recipient gets yield)'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUseSplitter(!useSplitter)}
          className={`px-3 py-1 rounded ${
            useSplitter ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
          } transition-colors text-xs`}
        >
          {useSplitter ? 'ON' : 'OFF'}
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

      <Button
        onClick={handleDeploy}
        disabled={isDisabled}
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
