import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ProtocolType, MORPHO_FACTORY_ADDRESS, SKY_FACTORY_ADDRESS, AAVE_VAULT_ADDRESS, USDC_ADDRESS, SPLITTER_CHAIN_ID } from '@/utils/constants';
import MorphoFactoryABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyFactoryABI from '@/abis/SkyCompounderStrategyFactory.json';
import { Recipient } from '@/components/RecipientForm';

const AaveVaultABI = [
  { type: 'function', name: 'asset', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { type: 'function', name: 'totalAssets', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'convertToShares', stateMutability: 'view', inputs: [{ name: 'assets', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'convertToAssets', stateMutability: 'view', inputs: [{ name: 'shares', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [ { name: 'assets', type: 'uint256' }, { name: 'receiver', type: 'address' } ], outputs: [{ name: 'shares', type: 'uint256' }] },
  { type: 'function', name: 'redeem', stateMutability: 'nonpayable', inputs: [ { name: 'shares', type: 'uint256' }, { name: 'receiver', type: 'address' }, { name: 'owner', type: 'address' } ], outputs: [{ name: 'assets', type: 'uint256' }] },
] as const;

interface DeployStrategyParams {
  protocol: ProtocolType;
  name: string;
  recipients: Recipient[];
  userAddress: `0x${string}`;
  // Aave-specific (optional). If omitted, defaults will be used.
  assetAddress?: `0x${string}`;
  amount?: bigint;
}

export function useDeployStrategy() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deployStrategy = async ({
    protocol,
    name,
    recipients,
    userAddress,
    assetAddress,
    amount,
  }: DeployStrategyParams) => {
    // For MVP, use the first recipient as the main donation address
    // In production, you'd deploy a splitter contract to distribute to all recipients
    const donationAddress = recipients[0]?.address as `0x${string}`;

    if (!donationAddress) {
      throw new Error('At least one recipient is required');
    }

    // Use user's address for management, keeper, and emergency admin
    const management = userAddress;
    const keeper = userAddress;
    const emergencyAdmin = userAddress;
    const enableBurning = false;

    // Zero address for tokenized strategy (can be configured later)
    const tokenizedStrategyAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;

    // Determine factory address and ABI based on protocol
    let factoryAddress: `0x${string}`;
    let abi: any;

    switch (protocol) {
      case ProtocolType.MORPHO:
        factoryAddress = MORPHO_FACTORY_ADDRESS;
        abi = MorphoFactoryABI;

        // Morpho requires a compounder vault address
        // For MVP, using zero address - should be configured in production
        const compounderVault = '0x0000000000000000000000000000000000000000' as `0x${string}`;

        writeContract({
          address: factoryAddress,
          abi: abi,
          functionName: 'createStrategy',
          args: [
            compounderVault,
            name,
            management,
            keeper,
            emergencyAdmin,
            donationAddress,
            enableBurning,
            tokenizedStrategyAddress,
          ],
        });
        break;

      case ProtocolType.SKY:
        factoryAddress = SKY_FACTORY_ADDRESS;
        abi = SkyFactoryABI;

        writeContract({
          address: factoryAddress,
          abi: abi,
          functionName: 'createStrategy',
          args: [
            name,
            management,
            keeper,
            emergencyAdmin,
            donationAddress,
            enableBurning,
            tokenizedStrategyAddress,
          ],
        });
        break;

      case ProtocolType.AAVE:
        factoryAddress = AAVE_VAULT_ADDRESS;
        abi = AaveVaultABI as any;

        writeContract({
          address: factoryAddress,
          abi: abi,
          functionName: 'deposit',
          args: [
            amount ?? 1_000_000n,
            donationAddress,
          ],
          chainId: SPLITTER_CHAIN_ID,
        });
        break;

      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  };

  return {
    deployStrategy,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
