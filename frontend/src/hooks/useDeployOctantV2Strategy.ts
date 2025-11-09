import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { toast } from 'sonner';
import KineticOctantV2DeployerABI from '@/abis/KineticOctantV2Deployer.json';
import { ProtocolType } from '@/utils/constants';
import { Recipient } from '@/components/RecipientForm';

// This needs to be set after deploying KineticOctantV2Deployer
const KINETIC_OCTANT_V2_DEPLOYER_ADDRESS = (
  import.meta.env.VITE_OCTANT_V2_DEPLOYER_ADDRESS ||
  '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export interface DeployOctantV2Params {
  protocol: ProtocolType;
  name: string;
  paymentSplitterAddress: `0x${string}`;
  enableBurning?: boolean;
}

/**
 * Hook for deploying Octant V2 strategies (Morpho or Sky) with PaymentSplitter integration
 *
 * OCTANT V2 INTEGRATION:
 * - Deploys yield strategies via MorphoCompounderStrategyFactory or SkyCompounderStrategyFactory
 * - Configures PaymentSplitter as donation recipient for 100% of yield
 * - Meets Octant V2 hackathon requirements for programmatic yield allocation
 *
 * @example
 * ```typescript
 * const { deploy, strategyAddress, isPending } = useDeployOctantV2Strategy();
 *
 * await deploy({
 *   protocol: ProtocolType.MORPHO,
 *   name: 'Kinetic-Morpho-USDC-PublicGoods',
 *   paymentSplitterAddress: '0x...',
 *   morphoVault: '0x...', // Optional
 *   enableBurning: false
 * });
 * ```
 */
export function useDeployOctantV2Strategy() {
  const [strategyAddress, setStrategyAddress] = useState<`0x${string}` | null>(null);
  const [deployParams, setDeployParams] = useState<DeployOctantV2Params | null>(null);

  const publicClient = usePublicClient();
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deploy = async (params: DeployOctantV2Params) => {
    if (!KINETIC_OCTANT_V2_DEPLOYER_ADDRESS || KINETIC_OCTANT_V2_DEPLOYER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      toast.error('Octant V2 Deployer not configured. Please deploy the contract first.');
      return;
    }

    setDeployParams(params);

    try {
      let txHash: `0x${string}`;

      if (params.protocol === ProtocolType.MORPHO) {
        // Deploy Morpho strategy (vault is hardcoded in factory)
        toast.info('Deploying Morpho yield strategy via Octant V2...');

        txHash = await writeContractAsync({
          address: KINETIC_OCTANT_V2_DEPLOYER_ADDRESS,
          abi: KineticOctantV2DeployerABI as any,
          functionName: 'deployMorphoStrategy',
          args: [
            params.name,
            params.paymentSplitterAddress,
            params.enableBurning || false,
          ],
        });
      } else if (params.protocol === ProtocolType.SKY) {
        // Deploy Sky strategy
        toast.info('Deploying Sky yield strategy via Octant V2...');

        txHash = await writeContractAsync({
          address: KINETIC_OCTANT_V2_DEPLOYER_ADDRESS,
          abi: KineticOctantV2DeployerABI as any,
          functionName: 'deploySkyStrategy',
          args: [
            params.name,
            params.paymentSplitterAddress,
            params.enableBurning || false,
          ],
        });
      } else {
        throw new Error('Unsupported protocol. Use MORPHO or SKY.');
      }

      // Wait for transaction confirmation
      if (publicClient && txHash) {
        toast.info('Waiting for transaction confirmation...');
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Parse StrategyDeployed event to get strategy address
        if (receipt.logs && receipt.logs.length > 0) {
          // The StrategyDeployed event emits strategyAddress as indexed param
          // For now, we'll fetch it from the contract
          // TODO: Parse event logs properly
          toast.success('Octant V2 strategy deployed successfully!');
        }
      }
    } catch (error: any) {
      console.error('Octant V2 deployment error:', error);
      toast.error(`Failed to deploy Octant V2 strategy: ${error.message}`);
      throw error;
    }
  };

  return {
    deploy,
    strategyAddress,
    deployParams,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}
