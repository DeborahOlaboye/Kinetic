# PaymentSplitter Deployment Guide

This guide explains how to deploy the PaymentSplitter contract from Octant v2 Core using Foundry.

## Contract Overview

The PaymentSplitter is an initializable contract that splits ETH and ERC20 token payments proportionally among multiple payees based on their share allocations. It uses a pull-payment model where payees call `release()` to claim their share.

**Important Notes:**
- This contract uses the Initializable pattern (not constructor-based)
- Not compatible with rebasing or fee-on-transfer tokens
- Payee list and share allocations are immutable after initialization

## Prerequisites

1. Foundry installed (forge, cast, anvil)
2. Private key or wallet setup for deployment
3. RPC URL for your target network
4. ETH for gas fees

## Deployment Methods

### Method 1: Using forge create (Simple)

This method deploys and initializes the contract in a single command.

Since PaymentSplitter uses the Initializable pattern, you need to:
1. Deploy the contract (constructor disables initializers)
2. Call initialize() separately with your payees and shares

**Step 1: Deploy the contract**

```bash
forge create src/PaymentSplitter.sol:PaymentSplitter \
  --rpc-url <YOUR_RPC_URL> \
  --private-key <YOUR_PRIVATE_KEY>
```

Or using a keystore:
```bash
forge create src/PaymentSplitter.sol:PaymentSplitter \
  --rpc-url <YOUR_RPC_URL> \
  --keystore <PATH_TO_KEYSTORE> \
  --password <PASSWORD>
```

**Step 2: Initialize the contract**

After deployment, you'll get a contract address. Use `cast` to call initialize:

```bash
cast send <DEPLOYED_CONTRACT_ADDRESS> \
  "initialize(address[],uint256[])" \
  "[0xAddress1,0xAddress2,0xAddress3]" \
  "[50,30,20]" \
  --rpc-url <YOUR_RPC_URL> \
  --private-key <YOUR_PRIVATE_KEY>
```

Replace:
- `0xAddress1,0xAddress2,0xAddress3` with actual payee addresses
- `[50,30,20]` with the share amounts (these represent proportions, not percentages)

### Method 2: Using Forge Script (Recommended)

This method uses the provided deployment script for a more automated approach.

**Step 1: Configure the script**

Edit `script/DeployPaymentSplitter.s.sol` and update:
- The `payees` array with actual recipient addresses
- The `shares` array with corresponding share amounts

**Step 2: Simulate the deployment (dry run)**

```bash
forge script script/DeployPaymentSplitter.s.sol:DeployPaymentSplitter \
  --rpc-url <YOUR_RPC_URL>
```

**Step 3: Deploy for real**

```bash
forge script script/DeployPaymentSplitter.s.sol:DeployPaymentSplitter \
  --rpc-url <YOUR_RPC_URL> \
  --broadcast \
  --private-key <YOUR_PRIVATE_KEY>
```

Or using a keystore:
```bash
forge script script/DeployPaymentSplitter.s.sol:DeployPaymentSplitter \
  --rpc-url <YOUR_RPC_URL> \
  --broadcast \
  --keystore <PATH_TO_KEYSTORE> \
  --password <PASSWORD>
```

**Step 4: Verify on block explorer (optional)**

```bash
forge script script/DeployPaymentSplitter.s.sol:DeployPaymentSplitter \
  --rpc-url <YOUR_RPC_URL> \
  --broadcast \
  --verify \
  --etherscan-api-key <YOUR_API_KEY>
```

## Example Networks

### Ethereum Mainnet
```bash
--rpc-url https://eth.llamarpc.com
```

### Sepolia Testnet
```bash
--rpc-url https://rpc.sepolia.org
```

### Polygon
```bash
--rpc-url https://polygon-rpc.com
```

### Arbitrum
```bash
--rpc-url https://arb1.arbitrum.io/rpc
```

### Base
```bash
--rpc-url https://mainnet.base.org
```

## Environment Variables (Recommended)

Instead of passing sensitive data via CLI, use a `.env` file:

```bash
# .env
RPC_URL=https://your-rpc-url
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-api-key
```

Then load it and deploy:

```bash
source .env
forge script script/DeployPaymentSplitter.s.sol:DeployPaymentSplitter \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

## After Deployment

Once deployed and initialized, the contract will:
1. Accept ETH via the `receive()` function
2. Accept ERC20 tokens via standard transfers
3. Allow payees to claim their share using `release(payable(payeeAddress))` for ETH
4. Allow payees to claim tokens using `release(IERC20(tokenAddress), payeeAddress)`

## Verifying the Deployment

Check the contract state:

```bash
# Get total shares
cast call <CONTRACT_ADDRESS> "totalShares()" --rpc-url <YOUR_RPC_URL>

# Get a specific payee's shares
cast call <CONTRACT_ADDRESS> "shares(address)" <PAYEE_ADDRESS> --rpc-url <YOUR_RPC_URL>

# Get number of payees
cast call <CONTRACT_ADDRESS> "payee(uint256)" 0 --rpc-url <YOUR_RPC_URL>
```

## Security Considerations

1. Double-check all payee addresses before deployment
2. Verify share allocations add up correctly
3. Test on a testnet first
4. Consider using a hardware wallet for mainnet deployments
5. Never commit private keys to version control
