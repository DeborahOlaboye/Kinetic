// Network configuration
export const SUPPORTED_CHAIN_ID = 1; // Mainnet (forked on Tenderly)
export const TENDERLY_RPC = import.meta.env.VITE_TENDERLY_RPC ||
  "https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff";

// Tenderly Explorer URL (Chain ID 8 - Virtual TestNet)
export const TENDERLY_EXPLORER_URL = "https://dashboard.tenderly.co/explorer/vnet/8";

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

// Deployed PaymentSplitter instance (Chain 8)
// Deploy using: forge script script/DeployPaymentSplitterWithProxy.s.sol
export const PAYMENT_SPLITTER_ADDRESS = (
  import.meta.env.VITE_PAYMENT_SPLITTER_ADDRESS ||
  "0xc4AE01295cfAE3DA96b044F1a4284A93837a644C"
) as `0x${string}`;

// Aave ERC-4626 vault address (if using a wrapper). Optional.
export const AAVE_VAULT_ADDRESS = (
  import.meta.env.VITE_AAVE_VAULT_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Aave v3 Pool proxy address (native integration)
export const AAVE_POOL_ADDRESS = (
  import.meta.env.VITE_AAVE_POOL_ADDRESS ||
  "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
) as `0x${string}`;

// Aave v3 PoolAddressesProvider (required for vault deployment)
export const AAVE_POOL_ADDRESSES_PROVIDER = (
  import.meta.env.VITE_AAVE_POOL_ADDRESSES_PROVIDER ||
  "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"
) as `0x${string}`;

// Aave Vault Proxy Deployer (lightweight - deploys proxies using existing implementations)
export const AAVE_VAULT_PROXY_DEPLOYER = (
  import.meta.env.VITE_AAVE_VAULT_PROXY_DEPLOYER ||
  "0x8901773847fF722b9AD70848B0BfF5103f97309F"
) as `0x${string}`;

// Aave Vault Factory (DEPRECATED - too large, use AAVE_VAULT_PROXY_DEPLOYER instead)
export const AAVE_VAULT_FACTORY_ADDRESS = (
  import.meta.env.VITE_AAVE_VAULT_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Revenue Splitter address for deployed vault
export const AAVE_REVENUE_SPLITTER_ADDRESS = (
  import.meta.env.VITE_AAVE_REVENUE_SPLITTER_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Recipient Splitter Factory (legacy)
export const SPLITTER_FACTORY_ADDRESS = (
  import.meta.env.VITE_SPLITTER_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Payment Splitter clone factory (deployed)
export const PAYMENT_SPLITTER_FACTORY_ADDRESS = (
  import.meta.env.VITE_PAYMENT_SPLITTER_FACTORY_ADDRESS ||
  "0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496"
) as `0x${string}`;

// Octant V2 Deployer (wrapper for deploying Morpho/Sky strategies)
export const OCTANT_V2_DEPLOYER_ADDRESS = (
  import.meta.env.VITE_OCTANT_V2_DEPLOYER ||
  "0xeD1b3CE69885027814C9046F4d9BC1C69E9Df4f3"
) as `0x${string}`;

// Octant V2 Factory Addresses
export const MORPHO_COMPOUNDER_FACTORY_ADDRESS = (
  import.meta.env.VITE_MORPHO_FACTORY ||
  "0xD09f14DD0a0ec20CAC1eD7b2Fd5A68f440C5903D"
) as `0x${string}`;

export const SKY_COMPOUNDER_FACTORY_ADDRESS = (
  import.meta.env.VITE_SKY_FACTORY ||
  "0x925E81cA08220cc31554981E5baeE6B57270cbEb"
) as `0x${string}`;

export const YIELD_DONATING_TOKENIZED_STRATEGY_ADDRESS = (
  import.meta.env.VITE_YIELD_DONATING_TOKENIZED_STRATEGY ||
  "0x7De92dC71F857fd9AB2Abf76F7AfC71394FD8B22"
) as `0x${string}`;

// Morpho Vaults V2 Integration
// PaymentSplitterYieldAdapter - Custom adapter routing 100% yield to public goods
export const MORPHO_ADAPTER_ADDRESS = (
  import.meta.env.VITE_MORPHO_ADAPTER_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Morpho VaultV2 instance that uses the PaymentSplitterYieldAdapter
export const MORPHO_VAULT_ADDRESS = (
  import.meta.env.VITE_MORPHO_VAULT_ADDRESS ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Chain ID where PaymentSplitter is deployed (default mainnet fork=1 unless overridden)
export const SPLITTER_CHAIN_ID = Number(import.meta.env.VITE_SPLITTER_CHAIN_ID || 1);

// Protocol types
export enum ProtocolType {
  MORPHO = "Morpho",
  SKY = "Sky",
  AAVE = "Aave" // ← ADD THIS LINE
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

// Aave v3 aTokens (mainnet)
export const AAVE_AUSDC_ADDRESS = "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c" as `0x${string}`;

// Default tokens to show on the Payment Splitter dashboard (includes aUSDC for Aave flow)
export const SPLITTER_DEFAULT_TOKENS = [
  { symbol: "USDC", address: USDC_ADDRESS, decimals: 6 },
  { symbol: "DAI", address: DAI_ADDRESS, decimals: 18 },
  { symbol: "USDT", address: USDT_ADDRESS, decimals: 6 },
  { symbol: "aUSDC", address: AAVE_AUSDC_ADDRESS, decimals: 6 },
];
