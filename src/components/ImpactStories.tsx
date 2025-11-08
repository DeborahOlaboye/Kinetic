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
      title: 'Funding Open Source Development',
      description: 'Your yield is supporting critical infrastructure projects that power the decentralized web.',
      impact: `$${(yieldValue * 0.4).toFixed(2)} contributed`,
      icon: '💻',
      color: 'blue',
    },
    {
      title: 'Environmental Impact',
      description: 'Supporting carbon-negative blockchain initiatives and green public goods.',
      impact: `${((yieldValue * 0.3) / 50).toFixed(1)} tons CO₂ offset`,
      icon: '🌱',
      color: 'green',
    },
    {
      title: 'Community Building',
      description: 'Empowering community-led projects and local public goods initiatives.',
      impact: `${recipientCount} projects supported`,
      icon: '🤝',
      color: 'purple',
    },
  ];

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Impact Story</h2>
        <p className="text-gray-400">See the real-world impact of your yield donations</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((story, index) => (
          <Card
            key={index}
            className={`p-6 border-${story.color}-500/30 hover:border-${story.color}-500/50 transition-colors`}
          >
            <div className="text-4xl mb-4">{story.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{story.description}</p>
            <Badge variant="outline" className={`text-${story.color}-400`}>
              {story.impact}
            </Badge>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-lg border border-blue-500/20">
        <h3 className="text-lg font-semibold mb-2">Passive Impact Making</h3>
        <p className="text-gray-400">
          Your funds continue generating returns while automatically funding public goods.
          No additional effort required - your capital works for the greater good 24/7.
        </p>
      </div>
    </Card>
  );
}
