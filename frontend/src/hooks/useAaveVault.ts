import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import AaveATokenVaultABI from '@/abis/AaveATokenVault.json';
import { toast } from 'sonner';

/**
 * Hook for reading Aave ERC-4626 vault data
 *
 * @param vaultAddress - Address of the deployed vault
 * @param userAddress - User's wallet address (optional)
 * @returns Vault data including total assets, user shares, and asset address
 *
 * @example
 * ```typescript
 * const { totalAssets, userShares, userAssets, assetAddress } = useAaveVault(
 *   '0x1234...',
 *   address
 * );
 * ```
 */
export function useAaveVault(vaultAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  // Read total assets in vault
  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: vaultAddress,
    abi: AaveATokenVaultABI as any,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
    },
  });

  // Read user's share balance
  const { data: userShares, refetch: refetchUserShares } = useReadContract({
    address: vaultAddress,
    abi: AaveATokenVaultABI as any,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!vaultAddress && !!userAddress,
    },
  });

  // Read underlying asset address
  const { data: assetAddress } = useReadContract({
    address: vaultAddress,
    abi: AaveATokenVaultABI as any,
    functionName: 'asset',
    query: {
      enabled: !!vaultAddress,
    },
  });

  // Convert user shares to assets
  const { data: userAssets, refetch: refetchUserAssets } = useReadContract({
    address: vaultAddress,
    abi: AaveATokenVaultABI as any,
    functionName: 'convertToAssets',
    args: userShares ? [userShares] : undefined,
    query: {
      enabled: !!vaultAddress && !!userShares && typeof userShares === 'bigint' && userShares > 0n,
    },
  });

  const refetchAll = () => {
    refetchTotalAssets();
    refetchUserShares();
    refetchUserAssets();
  };

  return {
    totalAssets: (totalAssets as bigint) || 0n,
    userShares: (userShares as bigint) || 0n,
    userAssets: (userAssets as bigint) || 0n,
    assetAddress: assetAddress as `0x${string}` | undefined,
    refetchAll,
  };
}

/**
 * Hook for depositing into an Aave vault
 *
 * Requires prior approval of the asset token for the vault address
 * @example
 * ```typescript
 * const { deposit, approve, isPending } = useDepositToVault(vaultAddress, assetAddress);
 *
 * // First approve
 * await approve(depositAmount);
 *
 * // Then deposit
 * await deposit(depositAmount, userAddress);
 * ```
 */
export function useDepositToVault(vaultAddress?: `0x${string}`, assetAddress?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: bigint) => {
    if (!vaultAddress || !assetAddress) {
      toast.error('Vault or asset address not available');
      return;
    }

    try {
      toast.info('Approving token spend...');
      const approvalHash = await writeContractAsync({
        address: assetAddress,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ] as const,
        functionName: 'approve',
        args: [vaultAddress, amount],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approvalHash });
        toast.success('Approval confirmed!');
      }
    } catch (err: any) {
      console.error('Approval error:', err);
      toast.error('Failed to approve: ' + err.message);
      throw err;
    }
  };

  const deposit = async (assets: bigint, receiver: `0x${string}`) => {
    if (!vaultAddress) {
      toast.error('Vault address not available');
      return;
    }

    try {
      toast.info('Depositing to vault...');
      const depositHash = await writeContractAsync({
        address: vaultAddress,
        abi: AaveATokenVaultABI as any,
        functionName: 'deposit',
        args: [assets, receiver],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: depositHash });
        toast.success('Deposit successful!');
      }
    } catch (err: any) {
      console.error('Deposit error:', err);
      toast.error('Failed to deposit: ' + err.message);
      throw err;
    }
  };

  return {
    approve,
    deposit,
    isPending,
    isConfirming,
    isSuccess,
  };
}

/**
 * Hook for claiming Aave rewards from the vault
 *
 * @example
 * ```typescript
 * const { claimRewards, isPending } = useClaimAaveRewards(vaultAddress);
 * await claimRewards();
 * ```
 */
export function useClaimAaveRewards(vaultAddress?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRewards = async () => {
    if (!vaultAddress) {
      toast.error('Vault address not available');
      return;
    }

    try {
      toast.info('Claiming Aave rewards...');
      const claimHash = await writeContractAsync({
        address: vaultAddress,
        abi: AaveATokenVaultABI as any,
        functionName: 'claimRewardsToOwner',
        args: [],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: claimHash });
        toast.success('Rewards claimed successfully!');
      }
    } catch (err: any) {
      console.error('Claim rewards error:', err);
      toast.error('Failed to claim rewards: ' + err.message);
      throw err;
    }
  };

  return {
    claimRewards,
    isPending,
    isConfirming,
    isSuccess,
  };
}
