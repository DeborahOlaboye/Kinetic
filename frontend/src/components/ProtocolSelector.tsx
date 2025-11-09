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
      name: 'Morpho Blue',
      description: 'Optimized lending markets generating sustainable yield for public goods',
      apy: '~5-8%',
      icon: '🔷'
    },
    {
      type: ProtocolType.SKY,
      name: 'Sky Protocol',
      description: 'Decentralized savings protocol funding Ethereum builders perpetually',
      apy: '~4-6%',
      icon: '☁️'
    },
    {
      type: ProtocolType.AAVE,
      name: 'Aave V3',
      description: 'Battle-tested lending protocol with deep liquidity for maximum impact',
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

      <div className="grid md:grid-cols-3 gap-4">
        {protocols.map((protocol) => {
          return (
          <Card
            key={protocol.type}
            className={`p-6 cursor-pointer transition-all duration-300 hover:border-[#78B288] ${
              selected === protocol.type
                ? 'border-[#78B288] bg-[#78B288]/10'
                : 'border-border'
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
            {selected === protocol.type && (
              <div className="mt-4">
                <Button variant="outline" className="w-full border-[#78B288] text-[#78B288] hover:bg-[#78B288] hover:text-white" size="sm">
                  Selected ✓
                </Button>
              </div>
            )}
          </Card>
          );
        })}
      </div>
    </div>
  );
}
