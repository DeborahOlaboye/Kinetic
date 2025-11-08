import { Card } from '@/components/ui/card';
import { formatEthValue, formatNumber } from '@/utils/formatters';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';

interface YieldCounterProps {
  totalAssets?: bigint;
  yieldGenerated?: bigint;
  isLoading?: boolean;
  decimals?: number;
}

export function YieldCounter({
  totalAssets,
  yieldGenerated,
  isLoading,
  decimals = 18,
}: YieldCounterProps) {
  const { theme } = useAppStore();
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedYield, setAnimatedYield] = useState(0);

  const totalValue = totalAssets ? Number(formatEthValue(totalAssets, decimals)) : 0;
  const yieldValue = yieldGenerated ? Number(formatEthValue(yieldGenerated, decimals)) : 0;

  // Animate counter on value change
  useEffect(() => {
    if (totalValue === 0) return;

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = totalValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalValue) {
        setAnimatedTotal(totalValue);
        clearInterval(timer);
      } else {
        setAnimatedTotal(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalValue]);

  useEffect(() => {
    if (yieldValue === 0) return;

    const duration = 1500;
    const steps = 60;
    const increment = yieldValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= yieldValue) {
        setAnimatedYield(yieldValue);
        clearInterval(timer);
      } else {
        setAnimatedYield(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [yieldValue]);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-8">
          <div className={`h-32 animate-pulse rounded ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
        </Card>
        <Card className="p-8">
          <div className={`h-32 animate-pulse rounded ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className={`p-8 border-blue-500/50 ${theme === 'light' ? 'bg-white' : 'bg-gray-900/50'}`}>
        <div className="space-y-2">
          <div className={`text-sm uppercase tracking-wide ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Total Value Locked
          </div>
          <div className="text-4xl font-bold text-blue-400">
            ${formatNumber(animatedTotal)}
          </div>
          <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
            Generating yield for public goods
          </div>
        </div>
      </Card>

      <Card className={`p-8 border-green-500/50 ${theme === 'light' ? 'bg-white' : 'bg-gray-900/50'}`}>
        <div className="space-y-2">
          <div className={`text-sm uppercase tracking-wide ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Yield Generated
          </div>
          <div className="text-4xl font-bold text-green-400">
            ${formatNumber(animatedYield)}
          </div>
          <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
            Donated to selected projects
          </div>
        </div>
      </Card>
    </div>
  );
}
