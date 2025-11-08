import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePaymentSplitter, useReleasableToken, usePaymentSplitterPayees } from '@/hooks/usePaymentSplitter';
import { useClaimETH, useClaimToken } from '@/hooks/useClaimFunds';
import { formatEther, formatUnits } from 'viem';
import { SUPPORTED_ASSETS } from '@/utils/constants';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function PaymentSplitterDashboard() {
  const { address } = useAccount();
  const { payees } = usePaymentSplitterPayees();

  const {
    shares,
    totalShares,
    percentage,
    releasableETH,
    releasedETH,
    totalReleased,
    refetchReleasableETH,
  } = usePaymentSplitter(address);

  const {
    claimETH,
    isPending: isClaimingETH,
    isConfirming: isConfirmingETH,
    isSuccess: isSuccessETH,
    error: errorETH,
  } = useClaimETH();

  const {
    claimToken,
    isPending: isClaimingToken,
    isConfirming: isConfirmingToken,
    isSuccess: isSuccessToken,
    error: errorToken,
  } = useClaimToken();

  // Show success toast
  useEffect(() => {
    if (isSuccessETH) {
      toast.success('ETH claimed successfully!');
      refetchReleasableETH();
    }
  }, [isSuccessETH, refetchReleasableETH]);

  useEffect(() => {
    if (isSuccessToken) {
      toast.success('Tokens claimed successfully!');
    }
  }, [isSuccessToken]);

  // Show error toast
  useEffect(() => {
    if (errorETH) {
      toast.error('Failed to claim ETH: ' + errorETH.message);
    }
  }, [errorETH]);

  useEffect(() => {
    if (errorToken) {
      toast.error('Failed to claim tokens: ' + errorToken.message);
    }
  }, [errorToken]);

  if (!address) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-400">Connect your wallet to view your share</p>
      </Card>
    );
  }

  const isPayee = payees.includes(address);

  if (!isPayee) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-400">Your address is not a payee in this PaymentSplitter</p>
        <p className="text-sm text-gray-500 mt-2">
          Payees: {payees.length} configured
        </p>
      </Card>
    );
  }

  const hasClaimableETH = releasableETH && releasableETH > 0n;

  return (
    <div className="space-y-6">
      {/* Your Share Info */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Your Share in PaymentSplitter</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Your Shares</p>
            <p className="text-2xl font-bold">
              {shares?.toString() || '0'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Total Shares</p>
            <p className="text-2xl font-bold">
              {totalShares?.toString() || '0'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Your Percentage</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{percentage.toFixed(2)}%</p>
              <Badge variant="outline">{percentage.toFixed(2)}%</Badge>
            </div>
          </div>
        </div>

        {/* Visual percentage bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </Card>

      {/* ETH Claimable */}
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-4">ETH Balance</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400">Claimable ETH</p>
              <p className="text-3xl font-bold text-green-500">
                {releasableETH ? formatEther(releasableETH) : '0'} ETH
              </p>
            </div>

            <Button
              onClick={() => address && claimETH(address)}
              disabled={!hasClaimableETH || isClaimingETH || isConfirmingETH}
              className="bg-green-600 hover:bg-green-700"
            >
              {isClaimingETH || isConfirmingETH ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isClaimingETH ? 'Claiming...' : 'Confirming...'}
                </>
              ) : (
                'Claim ETH'
              )}
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Already Claimed</p>
              <p className="font-semibold">
                {releasedETH ? formatEther(releasedETH) : '0'} ETH
              </p>
            </div>

            <div>
              <p className="text-gray-400">Total Released (All)</p>
              <p className="font-semibold">
                {totalReleased ? formatEther(totalReleased) : '0'} ETH
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ERC20 Tokens */}
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-4">ERC20 Tokens</h3>

        <div className="space-y-4">
          {SUPPORTED_ASSETS.map((asset) => (
            <TokenClaimRow
              key={asset.address}
              tokenAddress={asset.address}
              tokenSymbol={asset.symbol}
              tokenDecimals={asset.decimals}
              payeeAddress={address}
              onClaim={claimToken}
              isPending={isClaimingToken || isConfirmingToken}
            />
          ))}
        </div>
      </Card>

      {/* All Payees List */}
      <Card className="p-8">
        <h3 className="text-xl font-bold mb-4">All Payees ({payees.length})</h3>

        <div className="space-y-2">
          {payees.map((payee, index) => (
            <PayeeRow key={payee} address={payee} index={index} isCurrentUser={payee === address} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// Token Claim Row Component
function TokenClaimRow({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  payeeAddress,
  onClaim,
  isPending,
}: {
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  payeeAddress: `0x${string}`;
  onClaim: (tokenAddress: `0x${string}`, payeeAddress: `0x${string}`) => void;
  isPending: boolean;
}) {
  const { releasableToken, releasedToken } = useReleasableToken(tokenAddress, payeeAddress);
  const hasClaimable = releasableToken && releasableToken > 0n;

  return (
    <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
      <div className="flex-1">
        <p className="font-semibold">{tokenSymbol}</p>
        <div className="flex gap-4 text-sm text-gray-400 mt-1">
          <span>
            Claimable: {releasableToken ? formatUnits(releasableToken, tokenDecimals) : '0'}
          </span>
          <span>
            Claimed: {releasedToken ? formatUnits(releasedToken, tokenDecimals) : '0'}
          </span>
        </div>
      </div>

      <Button
        onClick={() => onClaim(tokenAddress, payeeAddress)}
        disabled={!hasClaimable || isPending}
        variant={hasClaimable ? 'default' : 'outline'}
        size="sm"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Claiming...
          </>
        ) : (
          `Claim ${tokenSymbol}`
        )}
      </Button>
    </div>
  );
}

// Payee Row Component
function PayeeRow({
  address,
  index,
  isCurrentUser,
}: {
  address: `0x${string}`;
  index: number;
  isCurrentUser: boolean;
}) {
  const { shares } = usePaymentSplitter(address);

  return (
    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">#{index + 1}</span>
        <code className="text-sm font-mono">{address}</code>
        {isCurrentUser && (
          <Badge variant="default" className="bg-blue-600">You</Badge>
        )}
      </div>
      <div className="text-sm">
        <span className="text-gray-400">Shares:</span>{' '}
        <span className="font-semibold">{shares?.toString() || '0'}</span>
      </div>
    </div>
  );
}
