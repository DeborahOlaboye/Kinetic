import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ATokenVaultRevenueSplitterOwnerABI from '@/abis/ATokenVaultRevenueSplitterOwner.json';
import { SUPPORTED_ASSETS } from '@/utils/constants';

/**
 * Hook for reading revenue splitter data
 *
 * @param splitterAddress - Address of the revenue splitter
 * @returns Recipients list and split revenue function
 *
 * @example
 * ```typescript
 * const { recipients, splitRevenue, isPending } = useRevenueSplitter('0x1234...');
 * ```
 */
export function useRevenueSplitter(splitterAddress?: `0x${string}`) {
  // Read configured recipients
  const { data: recipients, refetch: refetchRecipients } = useReadContract({
    address: splitterAddress,
    abi: ATokenVaultRevenueSplitterOwnerABI as any,
    functionName: 'getRecipients',
    query: {
      enabled: !!splitterAddress,
    },
  });

  // Write contract for splitting revenue
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Splits revenue for the configured assets (USDC, DAI, USDT)
   */
  const splitRevenue = () => {
    if (!splitterAddress) return;

    // Default to splitting all supported assets
    const assetAddresses = SUPPORTED_ASSETS.map(a => a.address);

    writeContract({
      address: splitterAddress,
      abi: ATokenVaultRevenueSplitterOwnerABI as any,
      functionName: 'splitRevenue',
      args: [assetAddresses],
    });
  };

  /**
   * Withdraws fees from the vault to the splitter
   */
  const withdrawFees = () => {
    if (!splitterAddress) return;

    writeContract({
      address: splitterAddress,
      abi: ATokenVaultRevenueSplitterOwnerABI as any,
      functionName: 'withdrawFees',
      args: [],
    });
  };

  /**
   * Claims rewards from the vault to the splitter
   */
  const claimRewards = () => {
    if (!splitterAddress) return;

    writeContract({
      address: splitterAddress,
      abi: ATokenVaultRevenueSplitterOwnerABI as any,
      functionName: 'claimRewards',
      args: [],
    });
  };

  return {
    recipients: recipients as Array<{ addr: string; shareInBps: number }> || [],
    splitRevenue,
    withdrawFees,
    claimRewards,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    refetch: refetchRecipients,
  };
}
