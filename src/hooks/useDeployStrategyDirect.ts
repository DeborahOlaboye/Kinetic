import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { usePublicClient } from 'wagmi';
import { useState, useEffect } from 'react';
import { ProtocolType, MORPHO_FACTORY_ADDRESS, SKY_FACTORY_ADDRESS } from '@/utils/constants';
import MorphoFactoryABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyFactoryABI from '@/abis/SkyCompounderStrategyFactory.json';
import { Recipient } from '@/components/RecipientForm';

interface DeployParams {
  protocol: ProtocolType;
  name: string;
  recipients: Recipient[];
  userAddress: `0x${string}`;
}

/**
 * TEMPORARY: Direct deployment without splitter
 * Use this if the PaymentSplitterFactory isn't deployed on Tenderly fork
 *
 * LIMITATION: Only the FIRST recipient will receive yield
 */
export function useDeployStrategyDirect() {
  const [strategyAddress, setStrategyAddress] = useState<`0x${string}` | null>(null);
  const [deployParams, setDeployParams] = useState<DeployParams | null>(null);

  const publicClient = usePublicClient();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deploy = async (params: DeployParams) => {
    console.log('⚠️ DEPLOYING WITHOUT SPLITTER - Only first recipient will receive yield!');

    setDeployParams(params);

    // Use the first recipient as donation address
    const donationAddress = params.recipients[0]?.address as `0x${string}`;

    if (!donationAddress) {
      throw new Error('At least one recipient is required');
    }

    const management = params.userAddress;
    const keeper = params.userAddress;
    const emergencyAdmin = params.userAddress;
    const enableBurning = false;
    const tokenizedStrategyAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;

    if (params.protocol === ProtocolType.MORPHO) {
      const compounderVault = '0x0000000000000000000000000000000000000000' as `0x${string}`;

      writeContract({
        address: MORPHO_FACTORY_ADDRESS,
        abi: MorphoFactoryABI,
        functionName: 'createStrategy',
        args: [
          compounderVault,
          params.name,
          management,
          keeper,
          emergencyAdmin,
          donationAddress,
          enableBurning,
          tokenizedStrategyAddress,
        ],
      });
    } else if (params.protocol === ProtocolType.SKY) {
      writeContract({
        address: SKY_FACTORY_ADDRESS,
        abi: SkyFactoryABI,
        functionName: 'createStrategy',
        args: [
          params.name,
          management,
          keeper,
          emergencyAdmin,
          donationAddress,
          enableBurning,
          tokenizedStrategyAddress,
        ],
      });
    }
  };

  // Extract strategy address when deployment succeeds
  useEffect(() => {
    if (isSuccess && hash) {
      const getStrategyAddress = async () => {
        try {
          const receipt = await publicClient?.getTransactionReceipt({ hash });
          if (receipt && receipt.logs[0]?.topics[1]) {
            const address = `0x${receipt.logs[0].topics[1].slice(26)}` as `0x${string}`;
            setStrategyAddress(address);
          }
        } catch (err) {
          console.error('Error getting strategy address:', err);
        }
      };
      getStrategyAddress();
    }
  }, [isSuccess, hash, publicClient]);

  return {
    deploy,
    strategyAddress,
    deployParams,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
