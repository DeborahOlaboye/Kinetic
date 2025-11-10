import { useReadContract } from 'wagmi';
import { useMemo } from 'react';
import KineticOctantV2DeployerABI from '@/abis/KineticOctantV2Deployer.json';
import { OCTANT_V2_DEPLOYER_ADDRESS, PAYMENT_SPLITTER_ADDRESS, ProtocolType } from '@/utils/constants';
import type { Strategy } from '@/store';

/**
 * Hook to fetch user's deployed strategies from the blockchain
 *
 * Replaces localStorage with on-chain data from KineticOctantV2Deployer
 *
 * @param userAddress - User's wallet address
 * @returns Array of strategies deployed by the user
 */
export function useUserStrategies(userAddress?: `0x${string}`) {
  // Fetch strategies from KineticOctantV2Deployer contract
  const { data: onChainStrategies, isLoading, refetch } = useReadContract({
    address: OCTANT_V2_DEPLOYER_ADDRESS,
    abi: KineticOctantV2DeployerABI as any,
    functionName: 'getUserStrategies',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!OCTANT_V2_DEPLOYER_ADDRESS,
      refetchInterval: 15000, // Refetch every 15 seconds
    },
  });

  // Transform on-chain data to match our Strategy interface
  const strategies: Strategy[] = useMemo(() => {
    if (!onChainStrategies || !Array.isArray(onChainStrategies)) {
      return [];
    }

    return onChainStrategies.map((strategy: any) => {
      // Map protocol enum: 0 = MORPHO, 1 = SKY
      const protocolType = strategy.protocol === 0 ? ProtocolType.MORPHO : ProtocolType.SKY;

      return {
        address: strategy.strategyAddress as string,
        protocol: protocolType,
        name: strategy.name as string,
        totalDeposited: '0', // Will be fetched from strategy contract
        yieldGenerated: '0', // Will be fetched from strategy contract
        recipients: [
          {
            name: 'Payment Splitter (Public Goods)',
            address: strategy.donationRecipient || PAYMENT_SPLITTER_ADDRESS,
            percentage: 100,
          },
        ],
      };
    });
  }, [onChainStrategies]);

  console.log('On-chain strategies fetched:', {
    userAddress,
    strategiesCount: strategies.length,
    strategies: strategies.map(s => ({
      address: s.address,
      name: s.name,
      protocol: s.protocol,
    })),
  });

  return {
    strategies,
    isLoading,
    refetch,
  };
}
