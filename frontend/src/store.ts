// src/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProtocolType } from "@/utils/constants";

export interface Strategy {
  address: string;
  protocol: ProtocolType;
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
  removeStrategy: (address: string) => void;
  clearInvalidStrategies: () => void;
  syncStrategies: (strategies: Strategy[]) => void; // NEW: Sync blockchain data to cache
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
        set({ selectedStrategy: strategy }),
      removeStrategy: (address) =>
        set((state) => ({
          deployedStrategies: state.deployedStrategies.filter(s => s.address !== address)
        })),
      clearInvalidStrategies: () =>
        set((state) => ({
          deployedStrategies: state.deployedStrategies.filter(s => s.address && s.address.length === 42)
        })),
      syncStrategies: (strategies) => {
        console.log('Syncing blockchain strategies to cache:', strategies.length);
        set({ deployedStrategies: strategies });
      }
    }),
    {
      name: 'kinetic-storage', // localStorage key
      partialize: (state) => ({
        deployedStrategies: state.deployedStrategies,
      }),
    }
  )
);
