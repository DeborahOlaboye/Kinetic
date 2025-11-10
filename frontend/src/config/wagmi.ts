import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, base, baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Tenderly virtual mainnet RPC (fork of mainnet for testing without gas costs)
const TENDERLY_RPC = import.meta.env.VITE_TENDERLY_RPC ||
  "https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff"

// Chain 8 - Tenderly Virtual Mainnet (where PaymentSplitter is deployed)
const chain8 = defineChain({
  id: 8,
  name: 'Tenderly Virtual Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_CHAIN_8_RPC || TENDERLY_RPC] },
  },
})

export const config = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia, chain8],
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
    [chain8.id]: http(import.meta.env.VITE_CHAIN_8_RPC || TENDERLY_RPC),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
