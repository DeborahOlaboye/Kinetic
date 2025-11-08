import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MORPHO_FACTORY_ADDRESS, SKY_FACTORY_ADDRESS, SPLITTER_FACTORY_ADDRESS } from '@/utils/constants';

export function CheckContracts() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const publicClient = usePublicClient();

  const checkContracts = async () => {
    setChecking(true);
    const newResults: Record<string, string> = {};

    try {
      // Check Morpho Factory
      const morphoCode = await publicClient?.getBytecode({ address: MORPHO_FACTORY_ADDRESS });
      newResults['Morpho Factory'] = morphoCode && morphoCode !== '0x'
        ? `✅ EXISTS (${morphoCode.length} bytes)`
        : '❌ NOT DEPLOYED';

      // Check Sky Factory
      const skyCode = await publicClient?.getBytecode({ address: SKY_FACTORY_ADDRESS });
      newResults['Sky Factory'] = skyCode && skyCode !== '0x'
        ? `✅ EXISTS (${skyCode.length} bytes)`
        : '❌ NOT DEPLOYED';

      // Check Splitter Factory
      const splitterCode = await publicClient?.getBytecode({ address: SPLITTER_FACTORY_ADDRESS });
      newResults['Splitter Factory'] = splitterCode && splitterCode !== '0x'
        ? `✅ EXISTS (${splitterCode.length} bytes)`
        : '❌ NOT DEPLOYED';

    } catch (error) {
      console.error('Error checking contracts:', error);
      newResults['Error'] = String(error);
    }

    setResults(newResults);
    setChecking(false);
  };

  return (
    <Card className="p-4 bg-red-900/20 border-red-600">
      <h3 className="text-red-400 font-bold mb-2">🔍 Contract Checker</h3>

      <div className="space-y-2 mb-4">
        <div className="text-xs">
          <div className="font-bold">Morpho Factory:</div>
          <div className="font-mono text-gray-400">{MORPHO_FACTORY_ADDRESS}</div>
        </div>
        <div className="text-xs">
          <div className="font-bold">Sky Factory:</div>
          <div className="font-mono text-gray-400">{SKY_FACTORY_ADDRESS}</div>
        </div>
        <div className="text-xs">
          <div className="font-bold">Splitter Factory:</div>
          <div className="font-mono text-gray-400">{SPLITTER_FACTORY_ADDRESS}</div>
        </div>
      </div>

      <Button
        onClick={checkContracts}
        disabled={checking}
        size="sm"
        className="w-full mb-3"
      >
        {checking ? 'Checking...' : 'Check if Contracts Exist'}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2 text-sm">
          {Object.entries(results).map(([name, status]) => (
            <div key={name} className="flex justify-between items-center">
              <span className="font-medium">{name}:</span>
              <span className={status.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                {status}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
