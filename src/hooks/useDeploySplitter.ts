import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SPLITTER_FACTORY_ADDRESS } from '@/utils/constants';
import PaymentSplitterFactoryABI from '@/abis/PaymentSplitterFactory.json';
import { Recipient } from '@/components/RecipientForm';

interface DeploySplitterParams {
  recipients: Recipient[];
  name: string;
}

export function useDeploySplitter() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deploySplitter = async ({
    recipients,
    name,
  }: DeploySplitterParams) => {
    // Convert recipients to Octant's PaymentSplitterFactory format
    // Octant accepts: address[] payees, string[] payeeNames, uint256[] shares
    const payees = recipients.map(r => r.address as `0x${string}`);
    const payeeNames = recipients.map(r => r.name);
    const shares = recipients.map(r => BigInt(r.percentage)); // e.g., 50% = 50 shares

    console.log('Deploying PaymentSplitter:', { payees, payeeNames, shares });

    writeContract({
      address: SPLITTER_FACTORY_ADDRESS,
      abi: PaymentSplitterFactoryABI,
      functionName: 'createPaymentSplitter',
      args: [payees, payeeNames, shares],
    });
  };

  return {
    deploySplitter,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
