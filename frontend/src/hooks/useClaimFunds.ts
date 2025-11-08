import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PAYMENT_SPLITTER_ADDRESS, SPLITTER_CHAIN_ID } from '@/utils/constants';
import PaymentSplitterABI from '@/abis/PaymentSplitter.json';
import { Address } from 'viem';

/**
 * Hook to claim ETH from PaymentSplitter
 */
export function useClaimETH() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimETH = async (payeeAddress: Address, splitterOverride?: Address) => {
    writeContract({
      address: (splitterOverride || PAYMENT_SPLITTER_ADDRESS) as Address,
      abi: PaymentSplitterABI,
      functionName: 'release',
      args: [payeeAddress],
      chainId: SPLITTER_CHAIN_ID,
    });
  };

  return {
    claimETH,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to claim ERC20 tokens from PaymentSplitter
 */
export function useClaimToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimToken = async (tokenAddress: Address, payeeAddress: Address, splitterOverride?: Address) => {
    writeContract({
      address: (splitterOverride || PAYMENT_SPLITTER_ADDRESS) as Address,
      abi: PaymentSplitterABI,
      functionName: 'release',
      args: [tokenAddress, payeeAddress],
      chainId: SPLITTER_CHAIN_ID,
    });
  };

  return {
    claimToken,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
