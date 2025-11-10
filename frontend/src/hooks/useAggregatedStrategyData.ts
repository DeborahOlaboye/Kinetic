import { useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import type { Strategy } from '@/store';

export function useAggregatedStrategyData(deployedStrategies: Strategy[] = []) {

  // Filter out invalid addresses (transaction hashes are 66 chars, addresses are 42 chars)
  const validStrategies = useMemo(() => {
    return deployedStrategies.filter(strategy => {
      const isValidAddress = strategy.address && strategy.address.length === 42;
      if (!isValidAddress) {
        console.warn(`Invalid strategy address (likely transaction hash): ${strategy.address}`);
      }
      return isValidAddress;
    });
  }, [deployedStrategies]);

  // Build contract calls for all valid strategies
  const contracts = useMemo(() => {
    return validStrategies.flatMap((strategy) => [
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
  }, [validStrategies]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Debug logging
  console.log('useAggregatedStrategyData Debug:', {
    strategiesCount: deployedStrategies.length,
    validStrategiesCount: validStrategies.length,
    contractsCount: contracts.length,
    dataCount: data?.length,
    strategies: validStrategies.map(s => s.address),
  });

  // Aggregate the results
  const aggregatedData = useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('useAggregatedStrategyData: No data available');
      return {
        totalAssets: BigInt(0),
        totalYield: BigInt(0),
        strategies: [],
      };
    }

    let totalAssets = BigInt(0);
    const strategies = validStrategies.map((strategy, index) => {
      const result = data[index];
      const currentAssets = result?.status === 'success' && result.result
        ? BigInt(result.result as bigint)
        : BigInt(0);

      console.log(`Strategy ${strategy.address}:`, {
        status: result?.status,
        currentAssets: currentAssets.toString(),
        error: result?.status === 'failure' ? result.error : undefined,
      });

      if (result?.status === 'failure') {
        console.error(`Failed to fetch totalAssets for ${strategy.address}:`, result.error);
      }

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
  }, [data, validStrategies]);

  return {
    ...aggregatedData,
    isLoading,
  };
}
