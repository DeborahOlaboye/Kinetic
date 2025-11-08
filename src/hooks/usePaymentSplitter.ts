import { useReadContract, useReadContracts } from 'wagmi';
import { PAYMENT_SPLITTER_ADDRESS, SPLITTER_CHAIN_ID } from '@/utils/constants';
import PaymentSplitterABI from '@/abis/PaymentSplitter.json';
import { Address } from 'viem';

/**
 * Hook to read PaymentSplitter contract data
 */
export function usePaymentSplitter(payeeAddress?: Address, splitterOverride?: Address) {
  const splitter = (splitterOverride || PAYMENT_SPLITTER_ADDRESS) as Address;

  // Get total shares
  const { data: totalShares } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'totalShares',
    chainId: SPLITTER_CHAIN_ID,
  });

  // Get payee shares
  const { data: shares } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'shares',
    args: payeeAddress ? [payeeAddress] : undefined,
    chainId: SPLITTER_CHAIN_ID,
    query: {
      enabled: !!payeeAddress,
    },
  });

  // Get releasable ETH amount
  const { data: releasableETH, refetch: refetchReleasableETH } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'releasable',
    args: payeeAddress ? [payeeAddress] : undefined,
    chainId: SPLITTER_CHAIN_ID,
    query: {
      enabled: !!payeeAddress,
    },
  });

  // Get released ETH amount
  const { data: releasedETH } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'released',
    args: payeeAddress ? [payeeAddress] : undefined,
    chainId: SPLITTER_CHAIN_ID,
    query: {
      enabled: !!payeeAddress,
    },
  });

  // Get total released ETH
  const { data: totalReleased } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'totalReleased',
    chainId: SPLITTER_CHAIN_ID,
  });

  // Calculate percentage if we have both shares and totalShares
  const percentage = totalShares && shares
    ? Number((BigInt(shares.toString()) * 10000n) / BigInt(totalShares.toString())) / 100
    : 0;

  return {
    // Contract state
    totalShares: totalShares as bigint | undefined,
    shares: shares as bigint | undefined,
    percentage,

    // ETH balances
    releasableETH: releasableETH as bigint | undefined,
    releasedETH: releasedETH as bigint | undefined,
    totalReleased: totalReleased as bigint | undefined,

    // Refetch functions
    refetchReleasableETH,
  };
}

/**
 * Hook to get releasable ERC20 token amount
 */
export function useReleasableToken(tokenAddress?: Address, payeeAddress?: Address, splitterOverride?: Address) {
  const splitter = (splitterOverride || PAYMENT_SPLITTER_ADDRESS) as Address;

  const { data: releasableToken, refetch } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'releasable',
    args: tokenAddress && payeeAddress ? [tokenAddress, payeeAddress] : undefined,
    chainId: SPLITTER_CHAIN_ID,
    query: {
      enabled: !!(tokenAddress && payeeAddress),
    },
  });

  const { data: releasedToken } = useReadContract({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'released',
    args: tokenAddress && payeeAddress ? [tokenAddress, payeeAddress] : undefined,
    chainId: SPLITTER_CHAIN_ID,
    query: {
      enabled: !!(tokenAddress && payeeAddress),
    },
  });

  return {
    releasableToken: releasableToken as bigint | undefined,
    releasedToken: releasedToken as bigint | undefined,
    refetch,
  };
}

/**
 * Hook to get all payees
 */
export function usePaymentSplitterPayees(splitterOverride?: Address) {
  const splitter = (splitterOverride || PAYMENT_SPLITTER_ADDRESS) as Address;

  // We'll try to get up to 10 payees (adjust as needed)
  const payeeQueries = Array.from({ length: 10 }, (_, index) => ({
    address: splitter,
    abi: PaymentSplitterABI,
    functionName: 'payee',
    args: [BigInt(index)],
    chainId: SPLITTER_CHAIN_ID,
  }));

  const { data: payeesData } = useReadContracts({
    contracts: payeeQueries,
  });

  // Filter out failed queries to get actual payees
  const payees = payeesData
    ?.filter(result => result.status === 'success' && result.result)
    .map(result => result.result as Address) || [];

  return { payees };
}
