import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import PaymentSplitterABI from '@/abis/PaymentSplitter.json';
import { toast } from 'sonner';

/**
 * Hook for reading payee list from PaymentSplitter
 * Note: Returns empty array for now - would need to be implemented with proper contract calls
 */
export function usePaymentSplitterPayees(_splitterAddress?: `0x${string}`) {
  // Simplified implementation - in production would need to properly fetch payees
  return { payees: [] as `0x${string}`[], payeeCount: 0n };
}

/**
 * Hook for reading releasable token amounts for a specific payee
 */
export function useReleasableToken(
  tokenAddress?: `0x${string}`,
  payeeAddress?: `0x${string}`,
  splitterAddress?: `0x${string}`
) {
  const { data: releasableToken } = useReadContract({
    address: splitterAddress,
    abi: PaymentSplitterABI as any,
    functionName: 'releasable',
    args: tokenAddress && payeeAddress ? [tokenAddress, payeeAddress] : undefined,
    query: {
      enabled: !!splitterAddress && !!tokenAddress && !!payeeAddress,
      refetchInterval: 10000,
    },
  });

  const { data: releasedToken } = useReadContract({
    address: splitterAddress,
    abi: PaymentSplitterABI as any,
    functionName: 'released',
    args: tokenAddress && payeeAddress ? [tokenAddress, payeeAddress] : undefined,
    query: {
      enabled: !!splitterAddress && !!tokenAddress && !!payeeAddress,
      refetchInterval: 10000,
    },
  });

  return {
    releasableToken: (releasableToken as bigint) || 0n,
    releasedToken: (releasedToken as bigint) || 0n,
  };
}

/**
 * Hook for reading PaymentSplitter data (Octant V2 integration)
 *
 * @param splitterAddress - Address of the PaymentSplitter contract
 * @param assetAddress - Address of the token (e.g., USDC)
 * @param recipients - List of recipient addresses to check balances for
 * @returns PaymentSplitter data and release functions
 */
export function usePaymentSplitter(
  splitterAddress?: `0x${string}`,
  assetAddress?: `0x${string}`,
  recipients?: Array<{ address: string; name: string; percentage: number }>
) {
  const publicClient = usePublicClient();

  // Read total shares
  const { data: totalShares } = useReadContract({
    address: splitterAddress,
    abi: PaymentSplitterABI as any,
    functionName: 'totalShares',
    query: {
      enabled: !!splitterAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Read total released for the asset
  const { data: totalReleased } = useReadContract({
    address: splitterAddress,
    abi: PaymentSplitterABI as any,
    functionName: 'totalReleased',
    args: assetAddress ? [assetAddress] : undefined,
    query: {
      enabled: !!splitterAddress && !!assetAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Read PaymentSplitter's token balance
  const { data: splitterBalance, refetch: refetchBalance } = useReadContract({
    address: assetAddress,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const,
    functionName: 'balanceOf',
    args: splitterAddress ? [splitterAddress] : undefined,
    query: {
      enabled: !!splitterAddress && !!assetAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Debug logging
  console.log('PaymentSplitter Hook Debug:', {
    splitterAddress,
    assetAddress,
    recipientCount: recipients?.length,
    totalShares: totalShares?.toString(),
    totalReleased: totalReleased?.toString(),
    splitterBalance: splitterBalance?.toString() || '0',
    balanceQueryEnabled: !!splitterAddress && !!assetAddress,
    explanation: splitterBalance === undefined
      ? 'Balance is still loading or query failed'
      : splitterBalance === 0n
      ? 'PaymentSplitter has 0 balance - no yield deposited yet'
      : 'PaymentSplitter has funds ready to distribute',
  });

  // Write contract for releasing payments
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Release funds to a specific recipient
   */
  const releaseToRecipient = async (recipientAddress: `0x${string}`) => {
    if (!splitterAddress || !assetAddress) {
      toast.error('Splitter or asset address not available');
      return;
    }

    try {
      toast.info(`Releasing funds to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}...`);
      const releaseHash = await writeContractAsync({
        address: splitterAddress,
        abi: PaymentSplitterABI as any,
        functionName: 'release',
        args: [assetAddress, recipientAddress],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: releaseHash });
        toast.success('Funds released successfully!');
        refetchBalance();
      }
    } catch (err: any) {
      console.error('Release error:', err);
      toast.error('Failed to release funds: ' + err.message);
      throw err;
    }
  };

  /**
   * Release funds to all recipients
   */
  const releaseToAll = async () => {
    if (!splitterAddress || !assetAddress || !recipients || recipients.length === 0) {
      toast.error('Missing required data for batch release');
      return;
    }

    try {
      toast.info(`Releasing funds to all ${recipients.length} recipients...`);

      // Release to each recipient sequentially
      for (const recipient of recipients) {
        await releaseToRecipient(recipient.address as `0x${string}`);
      }

      toast.success(`Successfully released funds to all ${recipients.length} recipients!`);
    } catch (err: any) {
      console.error('Batch release error:', err);
      toast.error('Failed to release to all recipients');
      throw err;
    }
  };

  return {
    totalShares: (totalShares as bigint) || 0n,
    totalReleased: (totalReleased as bigint) || 0n,
    splitterBalance: (splitterBalance as bigint) || 0n,
    releaseToRecipient,
    releaseToAll,
    isPending,
    isConfirming,
    isSuccess,
    refetchBalance,
  };
}
