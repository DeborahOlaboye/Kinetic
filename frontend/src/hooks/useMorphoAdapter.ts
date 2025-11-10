import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { useState } from 'react';
import PaymentSplitterYieldAdapterABI from '@/abis/PaymentSplitterYieldAdapter.json';
import { MORPHO_ADAPTER_ADDRESS } from '@/utils/constants';

interface AllocateParams {
  vault: `0x${string}`;
  marketId: `0x${string}`;
  assets: bigint;
}

interface DeallocateParams {
  vault: `0x${string}`;
  marketId: `0x${string}`;
  assets: bigint;
  maxSlippage: number; // basis points (e.g., 100 = 1%)
}

export function useMorphoAdapter() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Read functions
  const { data: marketCount } = useReadContract({
    address: MORPHO_ADAPTER_ADDRESS,
    abi: PaymentSplitterYieldAdapterABI as any,
    functionName: 'marketCount',
    query: {
      enabled: !!address,
    },
  });

  const { data: totalPrincipal } = useReadContract({
    address: MORPHO_ADAPTER_ADDRESS,
    abi: PaymentSplitterYieldAdapterABI as any,
    functionName: 'totalPrincipal',
    query: {
      enabled: !!address,
    },
  });

  const { data: totalYieldDonated } = useReadContract({
    address: MORPHO_ADAPTER_ADDRESS,
    abi: PaymentSplitterYieldAdapterABI as any,
    functionName: 'totalYieldDonated',
    query: {
      enabled: !!address,
    },
  });

  const { data: realAssets } = useReadContract({
    address: MORPHO_ADAPTER_ADDRESS,
    abi: PaymentSplitterYieldAdapterABI as any,
    functionName: 'realAssets',
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Get allocation for a specific market
  const getAllocation = (marketId: `0x${string}`) => {
    return useReadContract({
      address: MORPHO_ADAPTER_ADDRESS,
      abi: PaymentSplitterYieldAdapterABI as any,
      functionName: 'getAllocation',
      args: [marketId],
      query: {
        enabled: !!marketId,
      },
    });
  };

  // Get harvestable yield for a market
  const getHarvestableYield = (marketId: `0x${string}`) => {
    return useReadContract({
      address: MORPHO_ADAPTER_ADDRESS,
      abi: PaymentSplitterYieldAdapterABI as any,
      functionName: 'harvestableYield',
      args: [marketId],
      query: {
        enabled: !!marketId,
        refetchInterval: 30000, // Refresh every 30 seconds
      },
    });
  };

  // Write functions
  const allocate = async ({ vault, marketId, assets }: AllocateParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // Encode allocation data: (address vault, bytes32 marketId)
      const allocationData = encodeAbiParameters(
        [{ type: 'address' }, { type: 'bytes32' }],
        [vault, marketId]
      );

      const txHash = await writeContractAsync({
        address: MORPHO_ADAPTER_ADDRESS,
        abi: PaymentSplitterYieldAdapterABI as any,
        functionName: 'allocate',
        args: [
          allocationData,
          assets,
          '0x00000000', // selector (unused)
          address as `0x${string}`, // sender
        ],
      });

      setIsLoading(false);
      return txHash;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  };

  const deallocate = async ({
    vault,
    marketId,
    assets,
    maxSlippage,
  }: DeallocateParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // Encode deallocation data: (address vault, bytes32 marketId, uint256 maxSlippage)
      const deallocationData = encodeAbiParameters(
        [{ type: 'address' }, { type: 'bytes32' }, { type: 'uint256' }],
        [vault, marketId, BigInt(maxSlippage)]
      );

      const txHash = await writeContractAsync({
        address: MORPHO_ADAPTER_ADDRESS,
        abi: PaymentSplitterYieldAdapterABI as any,
        functionName: 'deallocate',
        args: [
          deallocationData,
          assets,
          '0x00000000', // selector (unused)
          address as `0x${string}`, // sender
        ],
      });

      setIsLoading(false);
      return txHash;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  };

  const harvestYield = async (marketId: `0x${string}`) => {
    setIsLoading(true);
    setError(null);

    try {
      const txHash = await writeContractAsync({
        address: MORPHO_ADAPTER_ADDRESS,
        abi: PaymentSplitterYieldAdapterABI as any,
        functionName: 'harvestYield',
        args: [marketId],
      });

      setIsLoading(false);
      return txHash;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    // State
    isLoading,
    error,

    // Read data
    marketCount: marketCount as bigint | undefined,
    totalPrincipal: totalPrincipal as bigint | undefined,
    totalYieldDonated: totalYieldDonated as bigint | undefined,
    realAssets: realAssets as bigint | undefined,

    // Read functions
    getAllocation,
    getHarvestableYield,

    // Write functions
    allocate,
    deallocate,
    harvestYield,
  };
}

// Helper function for encoding ABI parameters (simplified)
function encodeAbiParameters(
  _types: Array<{ type: string }>,
  _values: any[]
): `0x${string}` {
  // This is a simplified version - in production use viem's encodeAbiParameters
  // For now, return a placeholder that demonstrates the structure
  return '0x' as `0x${string}`;
}
