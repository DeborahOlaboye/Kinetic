import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useState, useEffect } from 'react';
import { OCTANT_V2_DEPLOYER_ADDRESS, ProtocolType } from '@/utils/constants';
import KineticOctantV2DeployerABI from '@/abis/KineticOctantV2Deployer.json';
import { decodeEventLog } from 'viem';

interface DeployParams {
  protocol: ProtocolType.MORPHO | ProtocolType.SKY;
  name: string;
  paymentSplitterAddress: `0x${string}`;
  enableBurning: boolean;
}

/**
 * Hook for deploying Octant V2 strategies (Morpho or Sky)
 *
 * Simplified flow:
 * 1. User provides PaymentSplitter address (should be pre-deployed)
 * 2. Deploy Morpho/Sky strategy using Octant V2 deployer
 * 3. Strategy routes 100% yield to PaymentSplitter
 */
export function useDeployOctantV2Strategy() {
  const { data: hash, writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  const [deployParams, setDeployParams] = useState<DeployParams | null>(null);
  const [strategyAddress, setStrategyAddress] = useState<string | null>(null);

  // Extract strategy address from transaction receipt when deployment succeeds
  useEffect(() => {
    if (isSuccess && receipt && receipt.logs.length > 0) {
      try {
        // Try multiple methods to get the strategy address

        // Method 1: Parse the StrategyDeployed event from logs
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: KineticOctantV2DeployerABI as any,
              data: log.data,
              topics: log.topics,
            });

            if ((decoded as any).eventName === 'StrategyDeployed') {
              const args = (decoded as any).args;
              const deployedStrategyAddress = args.strategyAddress;
              console.log('✅ Strategy address from event:', deployedStrategyAddress);

              // Validate it's a proper address (42 chars)
              if (deployedStrategyAddress && deployedStrategyAddress.length === 42) {
                setStrategyAddress(deployedStrategyAddress);
                return; // Success!
              } else {
                console.error('Invalid address from event:', deployedStrategyAddress);
              }
            }
          } catch (e) {
            // This log doesn't match our event, continue
            continue;
          }
        }

        // Method 2: If event parsing failed, try to get from contract creation logs
        // Look for the first contract creation in the receipt
        const contractCreationLog = receipt.logs.find(log =>
          log.address && log.address !== OCTANT_V2_DEPLOYER_ADDRESS
        );

        if (contractCreationLog && contractCreationLog.address) {
          console.log('✅ Strategy address from contract creation:', contractCreationLog.address);
          if (contractCreationLog.address.length === 42) {
            setStrategyAddress(contractCreationLog.address);
            return;
          }
        }

        console.warn('⚠️ Could not extract strategy address from receipt');
      } catch (error) {
        console.error('Error decoding strategy address from receipt:', error);
      }
    }
  }, [isSuccess, receipt]);

  const deploy = async (params: DeployParams) => {
    setDeployParams(params);
    setStrategyAddress(null); // Reset previous address

    const functionName = params.protocol === ProtocolType.MORPHO
      ? 'deployMorphoStrategy'
      : 'deploySkyStrategy';

    try {
      const txHash = await writeContractAsync({
        address: OCTANT_V2_DEPLOYER_ADDRESS,
        abi: KineticOctantV2DeployerABI as any,
        functionName,
        args: [params.name, params.paymentSplitterAddress, params.enableBurning],
      });

      return txHash;
    } catch (error) {
      console.error('Octant V2 deployment error:', error);
      throw error;
    }
  };

  return {
    deploy,
    hash,
    strategyAddress,
    deployParams,
    isPending,
    isConfirming,
    isSuccess,
  };
}
