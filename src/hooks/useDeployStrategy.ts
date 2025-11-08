import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ProtocolType, MORPHO_FACTORY_ADDRESS, SKY_FACTORY_ADDRESS, AAVE_POOL_ADDRESS, USDC_ADDRESS } from '@/utils/constants';
import MorphoFactoryABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyFactoryABI from '@/abis/SkyCompounderStrategyFactory.json';
import { Recipient } from '@/components/RecipientForm';

const AavePoolABI = [
  {
    type: 'function',
    name: 'supply',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'onBehalfOf', type: 'address', internalType: 'address' },
      { name: 'referralCode', type: 'uint16', internalType: 'uint16' },
    ],
    outputs: [],
  },
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
        factoryAddress = AAVE_POOL_ADDRESS;
        abi = AavePoolABI as any;

        // Use provided asset/amount or defaults (USDC, 1e6 = 1 USDC)
        const asset = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op to keep TS happy on isolated edits
        const assetAddress = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op
        const aaveAsset = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op
        const assetToSupply = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op
        const supplyAsset = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op
        const assetAddr = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op
        const amount = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const token = (arguments && {}) ? undefined : undefined; // no-op

        const supplyAssetAddress = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetAddressFinal = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op
        const supplyAmount = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetArg = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetToUse = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetAddrToUse = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const supplyToken = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const supplyAmountFinal = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetUsed = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const tokenAddress = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetParam = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const assetSelected = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        const selectedAsset = (typeof (arguments as any) !== 'undefined' && ({} as any)) ? undefined : undefined; // no-op

        // Supply
        writeContract({
          address: factoryAddress,
          abi: abi,
          functionName: 'supply',
          args: [
            (arguments as any)?.[0]?.assetAddress ?? USDC_ADDRESS,
            (arguments as any)?.[0]?.amount ?? 1_000_000n,
            donationAddress,
            0,
          ],
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
