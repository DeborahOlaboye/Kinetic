import { useAppStore } from '@/store';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function DebugStore() {
  const { deployedStrategies } = useAppStore();

  const checkLocalStorage = () => {
    const stored = localStorage.getItem('impactvault-storage');
    console.log('Raw localStorage:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed localStorage:', parsed);
      } catch (e) {
        console.error('Error parsing localStorage:', e);
      }
    } else {
      console.log('No data in localStorage');
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('impactvault-storage');
    window.location.reload();
  };

  return (
    <Card className="p-4 bg-gray-900 border-yellow-500">
      <h3 className="text-yellow-400 font-bold mb-2">🐛 Debug Info</h3>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Strategies in Store:</strong> {deployedStrategies.length}
        </div>

        {deployedStrategies.length > 0 && (
          <div className="mt-2 space-y-2">
            {deployedStrategies.map((strategy, idx) => (
              <div key={idx} className="bg-gray-800 p-2 rounded text-xs">
                <div><strong>Name:</strong> {strategy.name}</div>
                <div><strong>Protocol:</strong> {strategy.protocol}</div>
                <div><strong>Address:</strong> {strategy.address.slice(0, 10)}...</div>
                <div><strong>Recipients:</strong> {strategy.recipients.length}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={checkLocalStorage} variant="outline">
            Check localStorage
          </Button>
          <Button size="sm" onClick={clearStorage} variant="destructive">
            Clear & Reload
          </Button>
        </div>
      </div>
    </Card>
  );
}
