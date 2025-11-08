import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ProtocolType, MORPHO_FACTORY_ADDRESS, SKY_FACTORY_ADDRESS } from '@/utils/constants';
import MorphoFactoryABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyFactoryABI from '@/abis/SkyCompounderStrategyFactory.json';
import { Recipient } from '@/components/RecipientForm';

interface DeployStrategyParams {
  protocol: ProtocolType;
  name: string;
  recipients: Recipient[];
  userAddress: `0x${string}`;
}

export function useDeployStrategy() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deployStrategy = async ({
    protocol,
    name,
    recipients,
    userAddress,
  }: DeployStrategyParams) => {
    // For MVP, use the first recipient as the main donation address
    // In production, you'd deploy a splitter contract to distribute to all recipients
    const donationAddress = recipients[0]?.address as `0x${string}`;

    if (!donationAddress) {
      throw new Error('At least one recipient is required');
    }

    // Use user's address for management, keeper, and emergency admin
    const management = userAddress;
    const keeper = userAddress;
    const emergencyAdmin = userAddress;
    const enableBurning = false;

    // Zero address for tokenized strategy (can be configured later)
    const tokenizedStrategyAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;

    if (protocol === ProtocolType.MORPHO) {
      // Morpho requires a compounder vault address
      // For MVP, using zero address - should be configured in production
      const compounderVault = '0x0000000000000000000000000000000000000000' as `0x${string}`;

      writeContract({
        address: MORPHO_FACTORY_ADDRESS,
        abi: MorphoFactoryABI,
        functionName: 'createStrategy',
        args: [
          compounderVault,
          name,
          management,
          keeper,
          emergencyAdmin,
          donationAddress,
          enableBurning,
          tokenizedStrategyAddress,
        ],
      });
    } else if (protocol === ProtocolType.SKY) {
      writeContract({
        address: SKY_FACTORY_ADDRESS,
        abi: SkyFactoryABI,
        functionName: 'createStrategy',
        args: [
          name,
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

  return {
    deployStrategy,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
