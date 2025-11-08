import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Get WalletConnect project ID from environment or use a placeholder
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// Tenderly virtual mainnet RPC (fork of mainnet for testing without gas costs)
const TENDERLY_RPC = import.meta.env.VITE_TENDERLY_RPC ||
  "https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff"

export const config = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia],
  connectors: [
    injected(),
    // Commented out WalletConnect - uncomment when you have a real Project ID
    // walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(TENDERLY_RPC), // Use Tenderly fork for mainnet
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
