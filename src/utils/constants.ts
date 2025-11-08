// Network configuration
export const SUPPORTED_CHAIN_ID = 1; // Mainnet (forked on Tenderly)
export const TENDERLY_RPC = import.meta.env.VITE_TENDERLY_RPC ||
  "https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff";

// Contract addresses (Octant v2 on Mainnet)
// Get addresses from environment variables or use placeholders
// For production, set VITE_MORPHO_FACTORY_ADDRESS and VITE_SKY_FACTORY_ADDRESS in .env
export const MORPHO_FACTORY_ADDRESS = (
  import.meta.env.VITE_MORPHO_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const SKY_FACTORY_ADDRESS = (
  import.meta.env.VITE_SKY_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Recipient Splitter Factory (for multi-recipient distribution)
export const SPLITTER_FACTORY_ADDRESS = (
  import.meta.env.VITE_SPLITTER_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Protocol types
export enum ProtocolType {
  MORPHO = "Morpho",
  SKY = "Sky"
}

// Asset addresses (Common tokens)
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`;
export const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F" as `0x${string}`;
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`;

export const SUPPORTED_ASSETS = [
  { symbol: "USDC", address: USDC_ADDRESS, decimals: 6 },
  { symbol: "DAI", address: DAI_ADDRESS, decimals: 18 },
  { symbol: "USDT", address: USDT_ADDRESS, decimals: 6 }
];
