import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

/**
 * Component to manually recover strategies with correct addresses
 * Use this if you know the correct contract addresses for your deployed strategies
 */
export function RecoverStrategies() {
  const { deployedStrategies, addStrategy } = useAppStore();
  const [txHash, setTxHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  const invalidStrategies = deployedStrategies.filter(s => s.address.length !== 42);

  const handleRecover = () => {
    if (!contractAddress || contractAddress.length !== 42) {
      toast.error('Invalid contract address (must be 42 characters including 0x)');
      return;
    }

    // Find the invalid strategy that might match this tx hash
    const matchingStrategy = invalidStrategies.find(s =>
      txHash && s.address.toLowerCase() === txHash.toLowerCase()
    );

    if (matchingStrategy) {
      // Update by removing old and adding new
      addStrategy({
        ...matchingStrategy,
        address: contractAddress,
        totalDeposited: BigInt(matchingStrategy.totalDeposited || '0'),
        yieldGenerated: BigInt(matchingStrategy.yieldGenerated || '0'),
      });
      toast.success('Strategy recovered! Please refresh the page.');
    } else {
      toast.error('No matching strategy found with that transaction hash');
    }
  };

  if (invalidStrategies.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 glass-card border-blue-500/50 bg-blue-500/10">
      <h3 className="font-semibold text-blue-400 mb-3">Recover Strategy Addresses</h3>
      <p className="text-sm text-muted-foreground mb-4">
        If you know the correct contract addresses for your deployed strategies, you can manually recover them here.
        Check Tenderly Explorer for the transaction hash to find the deployed contract address.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Transaction Hash (66 chars)</label>
          <Input
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Contract Address (42 chars)</label>
          <Input
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        <Button
          onClick={handleRecover}
          size="sm"
          variant="outline"
          className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
          disabled={!txHash || !contractAddress || contractAddress.length !== 42}
        >
          Recover Strategy
        </Button>
      </div>

      <div className="mt-4 p-3 bg-secondary/50 rounded text-xs text-muted-foreground">
        <strong>How to find contract address:</strong>
        <ol className="list-decimal ml-4 mt-1 space-y-1">
          <li>Copy the transaction hash from your invalid strategy</li>
          <li>Open Tenderly Explorer and search for the transaction</li>
          <li>Look for the "Contract Creation" or deployed strategy address</li>
          <li>Paste both values above and click Recover</li>
        </ol>
      </div>
    </Card>
  );
}
