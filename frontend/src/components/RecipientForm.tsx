import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface Recipient {
  address: string;
  name: string;
  percentage: number;
}

interface RecipientFormProps {
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
}

export function RecipientForm({ recipients, onChange }: RecipientFormProps) {
  const [newRecipient, setNewRecipient] = useState<Recipient>({
    address: '',
    name: '',
    percentage: 0
  });

  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0);
  const isValid = totalPercentage === 100;

  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const addRecipient = () => {
    if (!newRecipient.address || !newRecipient.name || newRecipient.percentage <= 0) {
      return;
    }

    if (!isValidAddress(newRecipient.address)) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
    }

    if (totalPercentage + newRecipient.percentage > 100) {
      alert(`Cannot exceed 100% allocation. Currently at ${totalPercentage}%`);
      return;
    }

    onChange([...recipients, newRecipient]);
    setNewRecipient({ address: '', name: '', percentage: 0 });
  };

  const removeRecipient = (index: number) => {
    onChange(recipients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Add Recipients</h2>
          <p className="text-muted-foreground">Specify public goods projects to receive perpetual funding</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total Allocation</div>
          <div className={`text-2xl font-bold ${isValid ? 'text-[#78B288]' : 'text-[#ff9800]'}`}>
            {totalPercentage}%
          </div>
        </div>
      </div>

      {/* Existing Recipients */}
      {recipients.length > 0 && (
        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{recipient.name}</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg border-[#78B288] text-[#78B288]">
                    {recipient.percentage}%
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRecipient(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Recipient Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., GitcoinGrants"
                value={newRecipient.name}
                onChange={(e) =>
                  setNewRecipient({ ...newRecipient, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Allocation %</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={newRecipient.percentage || ''}
                onChange={(e) =>
                  setNewRecipient({
                    ...newRecipient,
                    percentage: Number(e.target.value)
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Wallet Address</Label>
            <Input
              id="address"
              placeholder="0x..."
              value={newRecipient.address}
              onChange={(e) =>
                setNewRecipient({ ...newRecipient, address: e.target.value })
              }
            />
          </div>
          <Button
            onClick={addRecipient}
            className="w-full"
            disabled={!newRecipient.address || !newRecipient.name || newRecipient.percentage <= 0}
          >
            Add Recipient
          </Button>
        </div>
      </Card>

      {!isValid && recipients.length > 0 && (
        <div className="text-[#ff9800] text-sm text-center">
          Total allocation must equal 100%
        </div>
      )}
    </div>
  );
}
