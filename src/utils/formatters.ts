import { formatUnits } from 'viem';

// Format wei to human-readable ETH
export function formatEthValue(value: bigint, decimals: number = 18): string {
  return Number(formatUnits(value, decimals)).toFixed(4);
}

// Format address to shortened version
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Format large numbers with commas
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
