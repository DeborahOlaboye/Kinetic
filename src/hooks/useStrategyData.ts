import { useReadContract } from 'wagmi';
import YieldStrategyABI from '@/abis/YieldDonatingTokenizedStrategy.json';

interface StrategyDataParams {
  strategyAddress: `0x${string}` | undefined;
}

export function useStrategyData({ strategyAddress }: StrategyDataParams) {
  // Fetch total assets managed by the strategy
  const { data: totalAssets, isLoading: isLoadingAssets } = useReadContract({
    address: strategyAddress,
    abi: YieldStrategyABI,
    functionName: 'totalAssets',
    query: {
      enabled: !!strategyAddress,
    },
  });

  // Fetch strategy name
  const { data: name, isLoading: isLoadingName } = useReadContract({
    address: strategyAddress,
    abi: YieldStrategyABI,
    functionName: 'name',
    query: {
      enabled: !!strategyAddress,
    },
  });

  // Fetch underlying asset address
  const { data: asset, isLoading: isLoadingAsset } = useReadContract({
    address: strategyAddress,
    abi: YieldStrategyABI,
    functionName: 'asset',
    query: {
      enabled: !!strategyAddress,
    },
  });

  // Fetch total supply of shares
  const { data: totalSupply, isLoading: isLoadingSupply } = useReadContract({
    address: strategyAddress,
    abi: YieldStrategyABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!strategyAddress,
    },
  });

  // Fetch price per share
  const { data: pricePerShare, isLoading: isLoadingPrice } = useReadContract({
    address: strategyAddress,
    abi: YieldStrategyABI,
    functionName: 'pricePerShare',
    query: {
      enabled: !!strategyAddress,
    },
  });

  const isLoading =
    isLoadingAssets ||
    isLoadingName ||
    isLoadingAsset ||
    isLoadingSupply ||
    isLoadingPrice;

  return {
    totalAssets: totalAssets as bigint | undefined,
    name: name as string | undefined,
    asset: asset as `0x${string}` | undefined,
    totalSupply: totalSupply as bigint | undefined,
    pricePerShare: pricePerShare as bigint | undefined,
    isLoading,
  };
}
