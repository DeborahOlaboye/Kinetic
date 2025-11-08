// src/pages/Deploy.tsx
import { useState } from 'react';
import { ProtocolSelector } from '@/components/ProtocolSelector';
import { RecipientForm, Recipient } from '@/components/RecipientForm';
import { DeployButton } from '@/components/DeployButton';
import { CheckContracts } from '@/components/CheckContracts';
import { ProtocolType } from '@/utils/constants';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store';

export function Deploy() {
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const { theme } = useAppStore();

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Deploy Your Vault</h1>
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Three steps to perpetual public goods funding. Deploy once, impact forever.
          </p>
        </div>

        {/* Contract Checker */}
        <CheckContracts />

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
  );
}
