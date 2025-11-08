import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAddress } from '@/utils/formatters';

interface Recipient {
  address: string;
  name: string;
  percentage: number;
}

interface RecipientListProps {
  recipients: Recipient[];
  totalYield?: bigint;
}

export function RecipientList({ recipients, totalYield }: RecipientListProps) {
  if (recipients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-400">No recipients configured</p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Yield Distribution</h2>
      <div className="space-y-4">
        {recipients.map((recipient, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{recipient.name}</h3>
                  <Badge variant="outline">{recipient.percentage}%</Badge>
                </div>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {formatAddress(recipient.address)}
                </p>
              </div>
            </div>

            {/* Visual percentage bar */}
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${recipient.percentage}%` }}
              />
            </div>

            {totalYield && (
              <div className="text-right text-sm text-gray-400">
                Est. received: $
                {((Number(totalYield) / 1e18) * (recipient.percentage / 100)).toFixed(4)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Recipients</span>
          <span className="font-semibold">{recipients.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-400">Total Allocation</span>
          <span className="font-semibold text-green-400">
            {recipients.reduce((sum, r) => sum + r.percentage, 0)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
