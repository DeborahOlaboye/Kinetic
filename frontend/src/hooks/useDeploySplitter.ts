/**
 * @deprecated This hook is no longer used.
 *
 * PaymentSplitter deployment should be done via Forge scripts instead:
 *
 * 1. Edit script/DeployPaymentSplitterWithProxy.s.sol with your payees and shares
 * 2. Run: forge script script/DeployPaymentSplitterWithProxy.s.sol:DeployPaymentSplitterWithProxy \
 *         --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY
 * 3. Update VITE_PAYMENT_SPLITTER_ADDRESS in .env with the deployed proxy address
 * 4. Use the PaymentSplitter dashboard at /splitter to interact with it
 *
 * Deploying contracts from the frontend requires complex setup with bytecode
 * and is better suited for backend/script deployment.
 */

import { Recipient } from '@/components/RecipientForm';

interface DeploySplitterParams {
  recipients: Recipient[];
}

export function useDeploySplitter() {
  const deploySplitter = async (_params: DeploySplitterParams) => {
    throw new Error(
      'PaymentSplitter deployment from frontend is not supported. ' +
      'Please use Forge scripts: forge script script/DeployPaymentSplitterWithProxy.s.sol'
    );
  };

  return {
    deploySplitter,
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    error: null,
    hash: undefined,
    deployedAddress: null,
  };
}
