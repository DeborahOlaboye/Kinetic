import { useState, useEffect } from 'react';
import { useDeployStrategy } from './useDeployStrategy';
import { ProtocolType, PAYMENT_SPLITTER_ADDRESS } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';

interface DeployParams {
  protocol: ProtocolType;
  name: string;
  recipients: Recipient[];
  userAddress: `0x${string}`;
  assetAddress?: `0x${string}`;
  amount?: bigint;
}

export function useDeployWithSplitter() {
  const [step, setStep] = useState<'idle' | 'deploying_strategy' | 'complete'>('idle');
  const [strategyAddress, setStrategyAddress] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const strategy = useDeployStrategy();

  // Use the already-deployed PaymentSplitter address
  const splitterAddress = PAYMENT_SPLITTER_ADDRESS;

  // Track strategy deployment completion
  useEffect(() => {
    if (step === 'deploying_strategy' && strategy.isSuccess) {
      setStep('complete');
    }
  }, [step, strategy.isSuccess]);

  const deploy = (params: DeployParams) => {
    setStep('deploying_strategy');
    setError(null);

    console.log('Deploying strategy with PaymentSplitter as recipient:', {
      protocol: params.protocol,
      splitterAddress,
      userAddress: params.userAddress,
    });

    // Deploy strategy with the PaymentSplitter as the single recipient
    // All yield will go to the PaymentSplitter, which distributes to configured payees
    strategy.deployStrategy({
      ...params,
      recipients: [{
        name: 'Payment Splitter',
        address: splitterAddress,
        percentage: 100,
      }],
      assetAddress: params.assetAddress,
      amount: params.amount,
    });
  };

  return {
    deploy,
    step,
    splitterAddress, // The already-deployed PaymentSplitter address
    strategyAddress,
    isPending: strategy.isPending,
    isConfirming: strategy.isConfirming,
    isSuccess: step === 'complete',
    error: error || strategy.error,
    strategyHash: strategy.hash,
  };
}
