import { PaymentSplitterDashboard } from '@/components/PaymentSplitterDashboard';
import { PAYMENT_SPLITTER_ADDRESS } from '@/utils/constants';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PaymentSplitterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Payment Splitter Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            View and claim your share of funds
          </p>

          <Card className="p-4 bg-gray-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Contract Address</p>
                <code className="text-sm font-mono text-blue-400">
                  {PAYMENT_SPLITTER_ADDRESS}
                </code>
              </div>
              <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-600">
                Live on Chain 8
              </Badge>
            </div>
          </Card>
        </div>

        {/* Dashboard */}
        <PaymentSplitterDashboard />

        {/* Info Section */}
        <Card className="p-8 bg-gray-800/30">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">1. Funds Distribution:</strong> When ETH or ERC20 tokens are sent to the PaymentSplitter contract,
              they are automatically allocated to payees based on their share percentages.
            </p>
            <p>
              <strong className="text-white">2. Pull Payment Model:</strong> Funds are not automatically sent to payees.
              Each payee must claim their share by clicking the "Claim" button.
            </p>
            <p>
              <strong className="text-white">3. Gas Costs:</strong> When claiming funds, you (the payee) pay the gas fee for the transaction.
            </p>
            <p>
              <strong className="text-white">4. Multiple Claims:</strong> You can claim ETH and each token type separately.
              There's no need to claim everything at once.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
