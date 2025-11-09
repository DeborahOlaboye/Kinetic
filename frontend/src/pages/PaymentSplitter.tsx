import { PaymentSplitterDashboard } from '@/components/PaymentSplitterDashboard';
import { PAYMENT_SPLITTER_ADDRESS } from '@/utils/constants';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KineticParticles } from '@/components/KineticParticles';

export function PaymentSplitterPage() {
  return (
    <div className="relative min-h-screen bg-background py-12 px-4">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Payment Splitter Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Claim your share of perpetual funding
          </p>

          <Card className="p-4 bg-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
                <code className="text-sm font-mono text-[#78B288]">
                  {PAYMENT_SPLITTER_ADDRESS}
                </code>
              </div>
              <Badge variant="outline" className="bg-[#78B288]/20 text-[#78B288] border-[#78B288]">
                Live on Chain 8
              </Badge>
            </div>
          </Card>
        </div>

        {/* Dashboard */}
        <PaymentSplitterDashboard />

        {/* Info Section */}
        <Card className="p-8 bg-card">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">1. Funds Distribution:</strong> When ETH or ERC20 tokens are sent to the PaymentSplitter contract,
              they are automatically allocated to payees based on their share percentages.
            </p>
            <p>
              <strong className="text-foreground">2. Pull Payment Model:</strong> Funds are not automatically sent to payees.
              Each payee must claim their share by clicking the "Claim" button.
            </p>
            <p>
              <strong className="text-foreground">3. Gas Costs:</strong> When claiming funds, you (the payee) pay the gas fee for the transaction.
            </p>
            <p>
              <strong className="text-foreground">4. Multiple Claims:</strong> You can claim ETH and each token type separately.
              There's no need to claim everything at once.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
