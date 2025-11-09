import { Card } from '@/components/ui/card';
import { formatEthValue, formatNumber } from '@/utils/formatters';
import { useEffect, useState } from 'react';

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
          <div className="h-32 animate-pulse bg-muted rounded" />
        </Card>
        <Card className="p-8">
          <div className="h-32 animate-pulse bg-muted rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-8 border-[#B9AEA5]/50">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            Capital Deployed
          </div>
          <div className="text-4xl font-bold text-foreground">
            ${formatNumber(animatedTotal)}
          </div>
          <div className="text-xs text-muted-foreground">
            Generating perpetual funding
          </div>
        </div>
      </Card>

      <Card className="p-8 border-[#78B288]/50">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            Public Goods Funded
          </div>
          <div className="text-4xl font-bold text-[#78B288]">
            ${formatNumber(animatedYield)}
          </div>
          <div className="text-xs text-muted-foreground">
            Funding active, impact perpetual
          </div>
        </div>
      </Card>
    </div>
  );
}
