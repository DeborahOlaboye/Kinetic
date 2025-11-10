import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { AAVE_VAULT_ADDRESS, USDC_ADDRESS, DAI_ADDRESS, USDT_ADDRESS } from '@/utils/constants';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

/**
 * Standard ERC-20 ABI for token approvals
 */
const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
] as const;

/**
 * Hook for managing token approvals for Aave Vault
 *
 * Before depositing into the vault, users must approve the vault
 * to spend their tokens (USDC, DAI, or USDT)
 */
export function useAaveApproval(userAddress?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [allowances, setAllowances] = useState<{
    USDC: bigint;
    DAI: bigint;
    USDT: bigint;
  }>({
    USDC: 0n,
    DAI: 0n,
    USDT: 0n,
  });

  const [checkingAllowance, setCheckingAllowance] = useState(false);

  /**
   * Approve the vault to spend tokens
   * @param amount Amount to approve (in base units)
   * @param assetSymbol Asset to approve (USDC, DAI, or USDT)
   */
  const approveVault = async (amount: bigint, assetSymbol: 'USDC' | 'DAI' | 'USDT') => {
    if (!AAVE_VAULT_ADDRESS || AAVE_VAULT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      toast.error('Aave Vault not deployed');
      return;
    }

    const assetAddresses = {
      USDC: USDC_ADDRESS,
      DAI: DAI_ADDRESS,
      USDT: USDT_ADDRESS,
    };

    const assetAddress = assetAddresses[assetSymbol];

    try {
      writeContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [AAVE_VAULT_ADDRESS, amount],
      });

      toast.info(`Approving ${assetSymbol} for Aave Vault...`);
    } catch (err) {
      console.error('Approval error:', err);
      toast.error('Failed to approve token');
    }
  };

  /**
   * Check current allowance for all supported assets
   */
  const checkAllowances = async () => {
    if (!userAddress || !publicClient || !AAVE_VAULT_ADDRESS) return;

    setCheckingAllowance(true);

    try {
      const [usdcAllowance, daiAllowance, usdtAllowance] = await Promise.all([
        publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [userAddress, AAVE_VAULT_ADDRESS],
        }),
        publicClient.readContract({
          address: DAI_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [userAddress, AAVE_VAULT_ADDRESS],
        }),
        publicClient.readContract({
          address: USDT_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [userAddress, AAVE_VAULT_ADDRESS],
        }),
      ]);

      setAllowances({
        USDC: usdcAllowance as bigint,
        DAI: daiAllowance as bigint,
        USDT: usdtAllowance as bigint,
      });
    } catch (err) {
      console.error('Error checking allowances:', err);
      setAllowances({ USDC: 0n, DAI: 0n, USDT: 0n });
    } finally {
      setCheckingAllowance(false);
    }
  };

  /**
   * Check if approval is needed
   * @param amount Amount user wants to deposit
   * @param assetSymbol Asset symbol
   * @returns true if approval is needed
   */
  const needsApproval = (amount: bigint, assetSymbol: 'USDC' | 'DAI' | 'USDT'): boolean => {
    return allowances[assetSymbol] < amount;
  };

  // Auto-check allowances when user address changes
  useEffect(() => {
    if (userAddress) {
      checkAllowances();
    }
  }, [userAddress, publicClient, AAVE_VAULT_ADDRESS]);

  // Refresh allowances after successful approval
  useEffect(() => {
    if (isSuccess && hash) {
      setTimeout(() => {
        checkAllowances();
      }, 2000);
    }
  }, [isSuccess, hash]);

  return {
    approveVault,
    allowances,
    checkingAllowance,
    needsApproval,
    checkAllowances,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
