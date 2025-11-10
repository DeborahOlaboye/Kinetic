import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import MorphoCompounderStrategyABI from '@/abis/MorphoCompounderStrategy.json';
import { toast } from 'sonner';

/**
 * Hook for reading Morpho Compounder Strategy data (Octant V2)
 *
 * @param strategyAddress - Address of the deployed Morpho strategy
 * @param userAddress - User's wallet address (optional)
 * @returns Strategy data including total assets, user shares, and asset address
 *
 * @example
 * ```typescript
 * const { totalAssets, userShares, userAssets, assetAddress } = useMorphoStrategy(
 *   '0x1234...',
 *   address
 * );
 * ```
 */
export function useMorphoStrategy(strategyAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  // Read total assets in strategy
  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: strategyAddress,
    abi: MorphoCompounderStrategyABI as any,
    functionName: 'totalAssets',
    query: {
      enabled: !!strategyAddress,
    },
  });

  // Read user's share balance
  const { data: userShares, refetch: refetchUserShares } = useReadContract({
    address: strategyAddress,
    abi: MorphoCompounderStrategyABI as any,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!strategyAddress && !!userAddress,
    },
  });

  // Read underlying asset address
  const { data: assetAddress } = useReadContract({
    address: strategyAddress,
    abi: MorphoCompounderStrategyABI as any,
    functionName: 'asset',
    query: {
      enabled: !!strategyAddress,
    },
  });

  // Convert user shares to assets
  const { data: userAssets, refetch: refetchUserAssets } = useReadContract({
    address: strategyAddress,
    abi: MorphoCompounderStrategyABI as any,
    functionName: 'convertToAssets',
    args: userShares ? [userShares] : undefined,
    query: {
      enabled: !!strategyAddress && !!userShares && typeof userShares === 'bigint' && userShares > 0n,
    },
  });

  // Read available deposit limit
  const { data: depositLimit } = useReadContract({
    address: strategyAddress,
    abi: MorphoCompounderStrategyABI as any,
    functionName: 'availableDepositLimit',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!strategyAddress && !!userAddress,
    },
  });

  // Read available withdraw limit
  const { data: withdrawLimit } = useReadContract({
    address: strategyAddress,
    abi: MorphoCompounderStrategyABI as any,
    functionName: 'availableWithdrawLimit',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!strategyAddress && !!userAddress,
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
    depositLimit: (depositLimit as bigint) || 0n,
    withdrawLimit: (withdrawLimit as bigint) || 0n,
    refetchAll,
  };
}

/**
 * Hook for depositing into a Morpho strategy
 *
 * Requires prior approval of the asset token for the strategy address
 * @example
 * ```typescript
 * const { deposit, approve, isPending } = useDepositToMorphoStrategy(strategyAddress, assetAddress);
 *
 * // First approve
 * await approve(depositAmount);
 *
 * // Then deposit
 * await deposit(depositAmount, userAddress);
 * ```
 */
export function useDepositToMorphoStrategy(strategyAddress?: `0x${string}`, assetAddress?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: bigint) => {
    if (!strategyAddress || !assetAddress) {
      toast.error('Strategy or asset address not available');
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
        args: [strategyAddress, amount],
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
    if (!strategyAddress) {
      toast.error('Strategy address not available');
      return;
    }

    try {
      toast.info('Depositing to Morpho strategy...');
      const depositHash = await writeContractAsync({
        address: strategyAddress,
        abi: MorphoCompounderStrategyABI as any,
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
 * Hook for withdrawing from a Morpho strategy
 *
 * @example
 * ```typescript
 * const { withdraw, isPending } = useWithdrawFromMorphoStrategy(strategyAddress);
 * await withdraw(withdrawAmount, userAddress, userAddress);
 * ```
 */
export function useWithdrawFromMorphoStrategy(strategyAddress?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (assets: bigint, receiver: `0x${string}`, owner: `0x${string}`) => {
    if (!strategyAddress) {
      toast.error('Strategy address not available');
      return;
    }

    try {
      toast.info('Withdrawing from Morpho strategy...');
      const withdrawHash = await writeContractAsync({
        address: strategyAddress,
        abi: MorphoCompounderStrategyABI as any,
        functionName: 'withdraw',
        args: [assets, receiver, owner],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
        toast.success('Withdrawal successful!');
      }
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      toast.error('Failed to withdraw: ' + err.message);
      throw err;
    }
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
  };
}
