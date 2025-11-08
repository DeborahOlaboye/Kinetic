import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtocolType } from '@/utils/constants';
import { useAppStore } from '@/store';

interface ProtocolSelectorProps {
  selected: ProtocolType | null;
  onSelect: (protocol: ProtocolType) => void;
}

export function ProtocolSelector({ selected, onSelect }: ProtocolSelectorProps) {
  const { theme } = useAppStore();
  const protocols = [
    {
      type: ProtocolType.MORPHO,
      name: 'Morpho',
      description: 'Optimized lending protocol with efficient capital allocation',
      apy: '~5-8%',
      icon: '🔷',
      color: 'blue'
    },
    {
      type: ProtocolType.SKY,
      name: 'Sky',
      description: 'Decentralized savings protocol powered by MakerDAO',
      apy: '~4-6%',
      icon: '☁️',
      color: 'purple'
    },
    {
      type: ProtocolType.AAVE,
      name: 'Aave v3',
      description: 'Battle-tested lending protocol with deep liquidity',
      apy: '~4-6%',
      icon: '🏦',
      color: 'pink'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Protocol</h2>
        <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
          Choose where to generate yield for public goods
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {protocols.map((protocol) => {
          // Using exact Kinetic brand colors
          const getBorderColor = () => {
            if (protocol.color === 'blue') return 'border-[#0066FF] bg-[#0066FF]/10';
            if (protocol.color === 'purple') return 'border-[#8B5CF6] bg-[#8B5CF6]/10';
            if (protocol.color === 'pink') return 'border-[#EC4899] bg-[#EC4899]/10';
            return 'border-[#0066FF] bg-[#0066FF]/10';
          };

          const getHoverColor = () => {
            if (protocol.color === 'blue') return 'hover:border-[#0066FF]';
            if (protocol.color === 'purple') return 'hover:border-[#8B5CF6]';
            if (protocol.color === 'pink') return 'hover:border-[#EC4899]';
            return 'hover:border-[#0066FF]';
          };

          return (
          <Card
            key={protocol.type}
            className={`p-6 cursor-pointer transition-all ${getHoverColor()} ${
              selected === protocol.type
                ? getBorderColor()
                : theme === 'light' ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900/50'
            }`}
            onClick={() => onSelect(protocol.type)}
          >
            <div className="text-4xl mb-4">{protocol.icon}</div>
            <h3 className="text-xl font-bold mb-2">{protocol.name}</h3>
            <p className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              {protocol.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Est. APY</span>
              <span className="text-green-400 font-semibold">{protocol.apy}</span>
            </div>
            {selected === protocol.type && (
              <div className="mt-4">
                <Button variant="outline" className="w-full" size="sm">
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
