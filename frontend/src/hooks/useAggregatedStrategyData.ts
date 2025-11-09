import { useReadContracts } from 'wagmi';
import { useAppStore } from '@/store';
import { useMemo } from 'react';

export function useAggregatedStrategyData() {
  const { deployedStrategies } = useAppStore();

  // Build contract calls for all strategies
  const contracts = useMemo(() => {
    return deployedStrategies.flatMap((strategy) => [
      {
        address: strategy.address as `0x${string}`,
        abi: [
          {
            name: 'totalAssets',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ type: 'uint256' }],
          },
        ] as const,
        functionName: 'totalAssets' as const,
      },
    ]);
  }, [deployedStrategies]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Aggregate the results
  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalAssets: BigInt(0),
        totalYield: BigInt(0),
        strategies: [],
      };
    }

    let totalAssets = BigInt(0);
    const strategies = deployedStrategies.map((strategy, index) => {
      const result = data[index];
      const currentAssets = result?.status === 'success' && result.result
        ? BigInt(result.result as bigint)
        : BigInt(0);

      const deposited = BigInt(strategy.totalDeposited || '0');
      const yieldGenerated = currentAssets > deposited
        ? currentAssets - deposited
        : BigInt(0);

      totalAssets += currentAssets;

      return {
        ...strategy,
        currentAssets,
        yieldGenerated,
      };
    });

    const totalYield = strategies.reduce(
      (sum, s) => sum + s.yieldGenerated,
      BigInt(0)
    );

    return {
      totalAssets,
      totalYield,
      strategies,
    };
  }, [data, deployedStrategies]);

  return {
    ...aggregatedData,
    isLoading,
  };
}
