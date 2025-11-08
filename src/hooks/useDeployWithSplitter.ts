import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { useDeploySplitter } from './useDeploySplitter';
import { useDeployStrategy } from './useDeployStrategy';
import { ProtocolType } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';
import PaymentSplitterFactoryABI from '@/abis/PaymentSplitterFactory.json';
import { SPLITTER_FACTORY_ADDRESS } from '@/utils/constants';

interface DeployParams {
  protocol: ProtocolType;
  name: string;
  recipients: Recipient[];
  userAddress: `0x${string}`;
}

export function useDeployWithSplitter() {
  const [step, setStep] = useState<'idle' | 'deploying_splitter' | 'deploying_strategy' | 'complete'>('idle');
  const [splitterAddress, setSplitterAddress] = useState<`0x${string}` | null>(null);
  const [strategyAddress, setStrategyAddress] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const splitter = useDeploySplitter();
  const strategy = useDeployStrategy();

  // Watch for splitter deployment completion
  useEffect(() => {
    if (step === 'deploying_splitter' && splitter.isSuccess && splitter.hash) {
      // Get the splitter address from transaction receipt
      const getSplitterAddress = async () => {
        try {
          const receipt = await publicClient?.getTransactionReceipt({ hash: splitter.hash });
          if (receipt) {
            console.log('Splitter TX Receipt:', receipt);

            // Find the PaymentSplitterCreated event from Octant's factory
            const splitterCreatedLog = receipt.logs.find(
              log => log.address.toLowerCase() === SPLITTER_FACTORY_ADDRESS.toLowerCase()
            );

            console.log('Splitter Created Log:', splitterCreatedLog);

            if (splitterCreatedLog && splitterCreatedLog.topics[1]) {
              // The splitter address is in the first indexed parameter (topics[1])
              // Event: PaymentSplitterCreated(address indexed splitter, address indexed creator)
              const address = `0x${splitterCreatedLog.topics[1].slice(26)}` as `0x${string}`;
              console.log('Extracted Splitter Address:', address);
              setSplitterAddress(address);
            }
          }
        } catch (err) {
          console.error('Error getting splitter address:', err);
          setError(err as Error);
          setStep('idle');
        }
      };

      getSplitterAddress();
    }
  }, [step, splitter.isSuccess, splitter.hash, publicClient]);

  // Deploy strategy when splitter address is ready
  useEffect(() => {
    if (step === 'deploying_splitter' && splitterAddress && currentDeployParams) {
      setStep('deploying_strategy');

      // Deploy strategy with splitter address as single recipient
      strategy.deployStrategy({
        ...currentDeployParams,
        recipients: [{
          name: 'Yield Splitter',
          address: splitterAddress,
          percentage: 100,
        }],
      });
    }
  }, [splitterAddress, step]);

  // Track strategy deployment completion and extract strategy address
  useEffect(() => {
    if (step === 'deploying_strategy' && strategy.isSuccess && strategy.hash) {
      // Get the strategy address from transaction receipt
      const getStrategyAddress = async () => {
        try {
          const receipt = await publicClient?.getTransactionReceipt({ hash: strategy.hash });
          if (receipt) {
            // The strategy address is typically in the first log's topics or can be extracted from contract creation
            // For factory contracts, the created contract address is usually in the logs
            const strategyCreatedLog = receipt.logs[0];

            if (strategyCreatedLog && strategyCreatedLog.topics[1]) {
              // Extract address from event logs (adjust based on actual event structure)
              const address = `0x${strategyCreatedLog.topics[1].slice(26)}` as `0x${string}`;
              setStrategyAddress(address);
            } else if (receipt.contractAddress) {
              // If it's a direct contract creation
              setStrategyAddress(receipt.contractAddress as `0x${string}`);
            }
          }
          setStep('complete');
        } catch (err) {
          console.error('Error getting strategy address:', err);
          setStep('complete'); // Still mark as complete even if we can't get address
        }
      };

      getStrategyAddress();
    }
  }, [step, strategy.isSuccess, strategy.hash, publicClient]);

  // Store current deployment params for later use
  const [currentDeployParams, setCurrentDeployParams] = useState<DeployParams | null>(null);

  const deploy = (params: DeployParams) => {
    setStep('deploying_splitter');
    setCurrentDeployParams(params);
    setError(null);
    setSplitterAddress(null);

    // Start by deploying the splitter
    splitter.deploySplitter({
      recipients: params.recipients,
      name: params.name,
    });
  };

  return {
    deploy,
    step,
    splitterAddress,
    strategyAddress,
    deployParams: currentDeployParams,
    isPending: splitter.isPending || strategy.isPending,
    isConfirming: splitter.isConfirming || strategy.isConfirming,
    isSuccess: step === 'complete',
    error: error || splitter.error || strategy.error,
    splitterHash: splitter.hash,
    strategyHash: strategy.hash,
  };
}
