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
      description: 'Optimized lending protocol with efficient capital allocation',
      apy: '~5-8%',
      icon: '🔷'
    },
    {
      type: ProtocolType.SKY,
      name: 'Sky',
      description: 'Decentralized savings protocol powered by MakerDAO',
      apy: '~4-6%',
      icon: '☁️'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Protocol</h2>
        <p className="text-gray-400">Choose where to generate yield for public goods</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {protocols.map((protocol) => (
          <Card
            key={protocol.type}
            className={`p-6 cursor-pointer transition-all hover:border-blue-500 ${
              selected === protocol.type
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700'
            }`}
            onClick={() => onSelect(protocol.type)}
          >
            <div className="text-4xl mb-4">{protocol.icon}</div>
            <h3 className="text-xl font-bold mb-2">{protocol.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{protocol.description}</p>
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
        ))}
      </div>
    </div>
  );
}
