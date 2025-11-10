import { useState, useEffect } from 'react';
import { useDeployStrategy } from './useDeployStrategy';
import { ProtocolType, PAYMENT_SPLITTER_ADDRESS, PAYMENT_SPLITTER_FACTORY_ADDRESS, SPLITTER_CHAIN_ID } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';
import { usePublicClient, useWriteContract } from 'wagmi';
import PaymentSplitterFactoryABI from '@/abis/PaymentSplitterFactory.json';

interface DeployParams {
  protocol: ProtocolType;
  name: string;
  recipients: Recipient[];
  userAddress: `0x${string}`;
  assetAddress?: `0x${string}`;
  amount?: bigint;
}

export function useDeployWithSplitter() {
  const [step, setStep] = useState<'idle' | 'deploying_splitter' | 'deploying_strategy' | 'complete'>('idle');
  const [splitterAddress, setSplitterAddress] = useState<`0x${string}` | null>(null);
  const [splitterHash, setSplitterHash] = useState<`0x${string}` | null>(null);
  const [deployParams, setDeployParams] = useState<DeployParams | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const { writeContractAsync: writeSplitterAsync, isPending: isSplitterPending } = useWriteContract();

  const strategy = useDeployStrategy();

  // Track strategy deployment completion
  useEffect(() => {
    if (step === 'deploying_strategy' && strategy.isSuccess) {
      setStep('complete');
    }
  }, [step, strategy.isSuccess]);

  const deploy = async (params: DeployParams) => {
    setError(null);
    setDeployParams(params);

    // Default to env PaymentSplitter if factory not configured
    let targetSplitter: `0x${string}` = PAYMENT_SPLITTER_ADDRESS;

    const hasFactory = PAYMENT_SPLITTER_FACTORY_ADDRESS && PAYMENT_SPLITTER_FACTORY_ADDRESS !== ('0x0000000000000000000000000000000000000000' as `0x${string}`);

    if (hasFactory && params.recipients?.length) {
      try {
        setStep('deploying_splitter');
        const payees = params.recipients.map((r) => r.address);
        const shares = params.recipients.map((r) => BigInt(r.percentage));

        const hash = await writeSplitterAsync({
          address: PAYMENT_SPLITTER_FACTORY_ADDRESS,
          abi: PaymentSplitterFactoryABI as any,
          functionName: 'createSplitter',
          args: [payees, shares],
          chainId: SPLITTER_CHAIN_ID as 1 | 8 | 11155111 | 8453 | 84532,
        });
        setSplitterHash(hash as `0x${string}`);

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        if (publicClient && params.userAddress) {
          const userSplitters = (await publicClient.readContract({
            address: PAYMENT_SPLITTER_FACTORY_ADDRESS,
            abi: PaymentSplitterFactoryABI as any,
            functionName: 'getUserSplitters',
            args: [params.userAddress],
          })) as `0x${string}`[];
          if (userSplitters && userSplitters.length > 0) {
            targetSplitter = userSplitters[userSplitters.length - 1] as `0x${string}`;
            setSplitterAddress(targetSplitter);
          }
        }
      } catch (e: any) {
        setError(e);
      }
    } else {
      // fallback
      setSplitterAddress(PAYMENT_SPLITTER_ADDRESS);
    }

    // Proceed to deploy strategy using the splitter as the sole recipient
    setStep('deploying_strategy');
    strategy.deployStrategy({
      ...params,
      recipients: [
        {
          name: 'Payment Splitter',
          address: (targetSplitter || PAYMENT_SPLITTER_ADDRESS) as `0x${string}`,
          percentage: 100,
        },
      ],
      assetAddress: params.assetAddress,
      amount: params.amount,
    });
  };

  return {
    deploy,
    step,
    splitterAddress,
    splitterHash,
    strategyAddress: null, // Strategy address is not available in useDeployStrategy
    isPending: isSplitterPending || strategy.isPending,
    isConfirming: strategy.isConfirming,
    isSuccess: step === 'complete',
    error: error || strategy.error,
    strategyHash: strategy.hash,
    deployParams,
  };
}
