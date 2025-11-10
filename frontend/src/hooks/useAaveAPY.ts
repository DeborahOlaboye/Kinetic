import { useReadContract } from 'wagmi';
import { useMemo } from 'react';
import AavePoolABI from '@/abis/AavePool.json';
import { AAVE_POOL_ADDRESS } from '@/utils/constants';

/**
 * Hook for fetching real-time APY from Aave v3 Pool
 *
 * @param assetAddress - Address of the asset (USDC, DAI, USDT)
 * @returns APY as a number (e.g., 3.45 for 3.45%)
 *
 * @example
 * ```typescript
 * const { apy, isLoading } = useAaveAPY('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
 * // apy = 3.45 (represents 3.45%)
 * ```
 */
export function useAaveAPY(assetAddress?: `0x${string}`) {
  // Read reserve data from Aave v3 Pool
  const { data: reserveData, isLoading, refetch } = useReadContract({
    address: AAVE_POOL_ADDRESS,
    abi: (AavePoolABI as any).abi || AavePoolABI,
    functionName: 'getReserveData',
    args: assetAddress ? [assetAddress] : undefined,
    query: {
      enabled: !!assetAddress,
      refetchInterval: 60000, // Refetch every minute
    },
  });

  // Calculate APY from liquidityRate (ray units = 1e27)
  const apy = useMemo(() => {
    if (!reserveData) return 0;

    try {
      // reserveData is a struct ReserveData - try both property and array access
      const liquidityRate = (reserveData as any).currentLiquidityRate || (reserveData as any)[2];

      if (!liquidityRate || liquidityRate === 0n) {
        console.warn('No liquidity rate found in reserve data:', reserveData);
        return 0;
      }

      // Convert from ray (1e27) to percentage
      // liquidityRate is annual rate in ray units
      const RAY = BigInt(10 ** 27);
      const rateInBigInt = BigInt(liquidityRate);

      // Convert to percentage with 2 decimal precision
      // Multiply by 10000 to preserve 2 decimal places, then divide
      const apyBigInt = (rateInBigInt * BigInt(10000)) / RAY;
      const apyNumber = Number(apyBigInt) / 100;

      console.log('Aave APY calculated:', {
        liquidityRate: liquidityRate.toString(),
        apyNumber,
      });

      return apyNumber;
    } catch (error) {
      console.error('Error calculating APY:', error, reserveData);
      return 0;
    }
  }, [reserveData]);

  return {
    apy,
    isLoading,
    refetch,
    reserveData,
  };
}

/**
 * Format APY for display
 * @param apy - APY as a number (e.g., 3.45)
 * @returns Formatted string (e.g., "3.45%")
 */
export function formatAPY(apy: number): string {
  const fixed = apy.toFixed(2);
  return fixed + '%';
}
