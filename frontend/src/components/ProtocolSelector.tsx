import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtocolType } from '@/utils/constants';

interface ProtocolSelectorProps {
  selected: ProtocolType | null;
  onSelect: (protocol: ProtocolType) => void;
}

export function ProtocolSelector({ selected, onSelect }: ProtocolSelectorProps) {
  const protocols = [
    {
      type: ProtocolType.MORPHO,
      name: 'Morpho',
      description: 'Optimized lending markets via Octant V2 - route 100% yield to public goods',
      apy: '~5-8%',
      icon: '🔷'
    },
    {
      type: ProtocolType.AAVE,
      name: 'Aave V3',
      description: 'Battle-tested lending with deep liquidity - perpetual public goods funding',
      apy: '~4-6%',
      icon: '🏦'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Protocol</h2>
        <p className="text-muted-foreground">Choose your yield strategy to fund public goods perpetually</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {protocols.map((protocol) => {
          const isSelected = selected === protocol.type;
          return (
          <div
            key={protocol.type}
            className={isSelected ? 'gradient-border' : ''}
          >
            <Card
              className={`p-6 cursor-pointer transition-all duration-300 glass-card card-elevated ${
                isSelected
                  ? 'gradient-border-content bg-[#78B288]/10'
                  : 'glow-on-hover'
              }`}
              onClick={() => onSelect(protocol.type)}
            >
              <div className="text-4xl mb-4">{protocol.icon}</div>
              <h3 className="text-xl font-bold mb-2">{protocol.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{protocol.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Est. APY</span>
                <span className="text-[#78B288] font-semibold">{protocol.apy}</span>
              </div>
              {isSelected && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white hover:scale-105 transition-all duration-300" size="sm">
                    Selected ✓
                  </Button>
                </div>
              )}
            </Card>
          </div>
          );
        })}
      </div>
    </div>
  );
}
