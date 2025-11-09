// src/pages/Deploy.tsx
import { useState } from 'react';
import { ProtocolSelector } from '@/components/ProtocolSelector';
import { RecipientForm, Recipient } from '@/components/RecipientForm';
import { DeployButton } from '@/components/DeployButton';
import { ProtocolType } from '@/utils/constants';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { KineticParticles } from '@/components/KineticParticles';
import { ShootingStars } from '@/components/ShootingStars';

export function Deploy() {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />
      {/* Shooting Stars */}
      <ShootingStars />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Deploy Strategy</h1>
            <Badge variant="outline" className="border-[#78B288] text-[#78B288]">
              Octant V2
            </Badge>
          </div>
          <p className="text-muted-foreground">Select protocol, add recipients, deploy. Fund public goods perpetually in 3 steps.</p>
        </div>

        <Card className="p-6 glass-effect border-[#78B288]/30">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🌊</div>
            <div>
              <h3 className="font-semibold mb-1">Octant V2 Integration</h3>
              <p className="text-sm text-muted-foreground">
                Kinetic uses Octant V2 for seamless yield routing. Morpho strategies are deployed via the Octant V2 protocol,
                while Aave vaults use custom ERC-4626 contracts. All yield flows to your selected public goods recipients through
                a transparent PaymentSplitter contract.
              </p>
            </div>
          </div>
        </Card>

        <ProtocolSelector
          selected={selectedProtocol}
          onSelect={setSelectedProtocol}
        />

        {selectedProtocol && (
          <>
            <Separator />
            <RecipientForm
              recipients={recipients}
              onChange={setRecipients}
            />
            <Separator />
            <DeployButton
              protocol={selectedProtocol}
              recipients={recipients}
            />
          </>
        )}
        </div>
      </div>
    </div>
  );
}
