// src/pages/Deploy.tsx
import { useState } from 'react';
import { ProtocolSelector } from '@/components/ProtocolSelector';
import { RecipientForm, Recipient } from '@/components/RecipientForm';
import { DeployButton } from '@/components/DeployButton';
import { ProtocolType } from '@/utils/constants';
import { Separator } from '@/components/ui/separator';
import { KineticParticles } from '@/components/KineticParticles';

export function Deploy() {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  return (
    <div className="relative">
      {/* Kinetic Energy Particles Background */}
      <KineticParticles />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Deploy Strategy</h1>
          <p className="text-muted-foreground">Select protocol, add recipients, deploy. Fund public goods perpetually in 3 steps.</p>
        </div>


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
