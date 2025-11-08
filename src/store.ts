// src/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Strategy {
  address: string;
  protocol: "Morpho" | "Sky";
  name: string;
  totalDeposited: string; // Changed to string for localStorage compatibility
  yieldGenerated: string; // Changed to string for localStorage compatibility
  recipients: Array<{
    address: string;
    name: string;
    percentage: number;
  }>;
}

interface AppState {
  // Existing counter state
  count: number;
  increment: () => void;

  // New strategy state
  deployedStrategies: Strategy[];
  selectedStrategy: Strategy | null;
  addStrategy: (strategy: Omit<Strategy, 'totalDeposited' | 'yieldGenerated'> & { totalDeposited: bigint; yieldGenerated: bigint }) => void;
  setSelectedStrategy: (strategy: Strategy | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Existing...
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),

      // New...
      deployedStrategies: [],
      selectedStrategy: null,
      addStrategy: (strategy) => {
        console.log('Adding strategy to store:', strategy);
        set((state) => {
          const newStrategy = {
            ...strategy,
            totalDeposited: strategy.totalDeposited.toString(),
            yieldGenerated: strategy.yieldGenerated.toString(),
          };
          const updated = [...state.deployedStrategies, newStrategy];
          console.log('Updated strategies:', updated);
          return { deployedStrategies: updated };
        });
      },
      setSelectedStrategy: (strategy) =>
        set({ selectedStrategy: strategy })
    }),
    {
      name: 'impactvault-storage', // localStorage key
      partialize: (state) => ({
        deployedStrategies: state.deployedStrategies,
      }),
    }
  )
);
