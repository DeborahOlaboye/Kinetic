import { useState } from 'react';
import { usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { parseEther } from 'viem';
import AaveVaultProxyDeployerABI from '@/abis/AaveVaultProxyDeployer.json';
import { USDC_ADDRESS, DAI_ADDRESS, USDT_ADDRESS, AAVE_VAULT_PROXY_DEPLOYER } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';

interface DeployVaultParams {
  asset: 'USDC' | 'DAI' | 'USDT';
  recipients: Recipient[];
  userAddress: `0x${string}`;
}

/**
 * Hook for deploying Aave ERC-4626 vaults using proxy pattern
 *
 * Uses lightweight AaveVaultProxyDeployer:
 * 1. Deploys ERC1967Proxy pointing to ATokenVault implementation
 * 2. Initializes with user as owner and 100% fee to public goods
 * 3. User owns the vault and controls revenue distribution
 *
 * NOTE: This creates a vault without built-in multi-recipient splitting.
 * For multi-recipient yield distribution, deploy a PaymentSplitter separately
 * and set it as the vault fee recipient.
 *
 * @example
 * ```typescript
 * const { deployVault, vaultAddress, isPending } = useDeployAaveVault();
 *
 * await deployVault({
 *   asset: 'USDC',
 *   recipients: [], // Not used in proxy pattern
 *   userAddress: '0x...'
 * });
 * ```
 */
export function useDeployAaveVault() {
  const [step, setStep] = useState<'idle' | 'approving_token' | 'deploying_vault' | 'complete'>('idle');
  const [vaultAddress, setVaultAddress] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const deployVault = async (params: DeployVaultParams) => {
    setError(null);

    // Validate proxy deployer is configured
    if (!AAVE_VAULT_PROXY_DEPLOYER || AAVE_VAULT_PROXY_DEPLOYER === '0x0000000000000000000000000000000000000000') {
      const errorMsg = 'Aave Vault Proxy Deployer not configured.';
      toast.error(errorMsg);
      setError(new Error(errorMsg));
      setStep('idle');
      return;
    }

    try {
      // Get asset address and initial deposit amount
      const assetAddress = getAssetAddress(params.asset);
      const initialDeposit = getInitialDeposit(params.asset);

      console.log('Deploying Aave Vault:', {
        deployer: AAVE_VAULT_PROXY_DEPLOYER,
        asset: assetAddress,
        owner: params.userAddress,
        initialDeposit: initialDeposit.toString(),
      });

      // Deploy vault via proxy deployer (approval should already be done via DeployButton)
      setStep('deploying_vault');
      const initialFee = parseEther('1'); // 100% fee to public goods

      toast.info('Deploying Aave vault proxy...');

      const txHash = await writeContractAsync({
        address: AAVE_VAULT_PROXY_DEPLOYER,
        abi: AaveVaultProxyDeployerABI as any,
        functionName: 'deployVault',
        args: [assetAddress, params.userAddress, initialFee],
      });

      // Wait for confirmation
      if (publicClient) {
        toast.info('Waiting for transaction confirmation...');
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // Retrieve deployed vault address
      if (publicClient && params.userAddress) {
        const userVaults = (await publicClient.readContract({
          address: AAVE_VAULT_PROXY_DEPLOYER,
          abi: AaveVaultProxyDeployerABI as any,
          functionName: 'getUserVaults',
          args: [params.userAddress],
        })) as `0x${string}`[];

        if (userVaults && userVaults.length > 0) {
          const newVault = userVaults[userVaults.length - 1];
          setVaultAddress(newVault);

          setStep('complete');
          toast.success('Aave vault deployed successfully!', {
            description: `Vault: ${newVault.slice(0, 10)}...`,
          });
        }
      }
    } catch (err: any) {
      console.error('Vault deployment error:', err);
      setError(err);
      toast.error('Failed to deploy vault', {
        description: err.message || 'Unknown error occurred',
      });
      setStep('idle');
    }
  };

  return {
    deployVault,
    step,
    vaultAddress,
    hash,
    isPending,
    isConfirming,
    isSuccess: step === 'complete',
    error,
  };
}

// Helper to get asset address from symbol
function getAssetAddress(asset: 'USDC' | 'DAI' | 'USDT'): `0x${string}` {
  switch (asset) {
    case 'USDC':
      return USDC_ADDRESS;
    case 'DAI':
      return DAI_ADDRESS;
    case 'USDT':
      return USDT_ADDRESS;
    default:
      throw new Error(`Unsupported asset: ${asset}`);
  }
}

// Helper to get initial deposit amount for each asset
function getInitialDeposit(asset: 'USDC' | 'DAI' | 'USDT'): bigint {
  switch (asset) {
    case 'USDC':
      return BigInt(1_000_000); // 1 USDC (6 decimals)
    case 'DAI':
      return parseEther('1'); // 1 DAI (18 decimals)
    case 'USDT':
      return BigInt(1_000_000); // 1 USDT (6 decimals)
    default:
      throw new Error(`Unsupported asset: ${asset}`);
  }
}
