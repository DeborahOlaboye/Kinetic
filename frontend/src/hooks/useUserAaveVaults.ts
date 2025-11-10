import { useReadContract } from 'wagmi';
import { useMemo } from 'react';
import AaveVaultProxyDeployerABI from '@/abis/AaveVaultProxyDeployer.json';
import { AAVE_VAULT_PROXY_DEPLOYER, ProtocolType } from '@/utils/constants';
import type { Strategy } from '@/store';

/**
 * Hook to fetch user's deployed Aave vaults from the blockchain
 *
 * Fetches from AaveVaultProxyDeployer contract
 *
 * @param userAddress - User's wallet address
 * @returns Array of Aave vault strategies deployed by the user
 */
export function useUserAaveVaults(userAddress?: `0x${string}`) {
  // Fetch vaults from AaveVaultProxyDeployer contract
  const { data: onChainVaults, isLoading, refetch } = useReadContract({
    address: AAVE_VAULT_PROXY_DEPLOYER,
    abi: AaveVaultProxyDeployerABI as any,
    functionName: 'getUserVaults',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!AAVE_VAULT_PROXY_DEPLOYER,
      refetchInterval: 15000, // Refetch every 15 seconds
    },
  });

  // Transform on-chain data to match our Strategy interface
  const vaults: Strategy[] = useMemo(() => {
    if (!onChainVaults || !Array.isArray(onChainVaults)) {
      return [];
    }

    return onChainVaults.map((vaultAddress: string) => {
      return {
        address: vaultAddress,
        protocol: ProtocolType.AAVE,
        name: `Aave Vault ${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}`,
        totalDeposited: '0', // Will be fetched from vault contract
        yieldGenerated: '0', // Will be fetched from vault contract
        recipients: [
          {
            name: 'Public Goods (100% fee)',
            address: userAddress || '0x0000000000000000000000000000000000000000',
            percentage: 100,
          },
        ],
      };
    });
  }, [onChainVaults, userAddress]);

  console.log('On-chain Aave vaults fetched:', {
    userAddress,
    vaultsCount: vaults.length,
    vaults: vaults.map(v => ({
      address: v.address,
      name: v.name,
    })),
  });

  return {
    vaults,
    isLoading,
    refetch,
  };
}
