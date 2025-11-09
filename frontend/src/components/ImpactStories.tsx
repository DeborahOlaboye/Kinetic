import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ImpactStoriesProps {
  totalYield?: bigint;
  recipientCount?: number;
}

export function ImpactStories({ totalYield, recipientCount = 0 }: ImpactStoriesProps) {
  const yieldValue = totalYield ? Number(totalYield) / 1e18 : 0;

  const stories = [
    {
      title: 'Ethereum Infrastructure',
      description: 'Perpetual funding for critical infrastructure that powers the Ethereum ecosystem.',
      impact: `$${(yieldValue * 0.4).toFixed(2)} perpetual funding`,
      icon: '💻',
    },
    {
      title: 'Public Goods Builders',
      description: 'Supporting developers building essential tools and protocols for the community.',
      impact: `${recipientCount} projects funded`,
      icon: '🌱',
    },
    {
      title: 'Sustainable Impact',
      description: 'Capital in motion generating lasting value for Ethereum public goods.',
      impact: `${((yieldValue * 0.3) / 50).toFixed(1)}x multiplier effect`,
      icon: '🤝',
    },
  ];

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Perpetual Impact</h2>
        <p className="text-muted-foreground">Capital in motion funding public goods, forever</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((story, index) => (
          <Card
            key={index}
            className="p-6 border-[#78B288]/30 hover:border-[#78B288]/50 transition-all duration-300"
          >
            <div className="text-4xl mb-4">{story.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{story.description}</p>
            <Badge variant="outline" className="text-[#78B288] border-[#78B288]">
              {story.impact}
            </Badge>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-[#78B288]/10 rounded-lg border border-[#78B288]/20">
        <h3 className="text-lg font-semibold mb-2">Set and Forget. Fund Forever.</h3>
        <p className="text-muted-foreground">
          Deploy once, impact perpetually. Your capital generates sustainable yield while your principal stays safe and withdrawable. No grants cycles. No renewals. Just perpetual funding for Ethereum's builders.
        </p>
      </div>
    </Card>
  );
}
