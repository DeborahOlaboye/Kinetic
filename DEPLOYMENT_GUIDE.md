# Kinetic Deployment Guide

## 🎯 Overview

Kinetic uses a **factory pattern** where users deploy strategies dynamically from the frontend. The factories create individual strategy instances (vaults + payment splitters) on-demand.

## 📋 Contracts Architecture

### Factory Contracts (Deploy Once)
These are the main contracts that need to be deployed:

1. **AaveVaultFactory** (`src/aave/AaveVaultFactory.sol`)
   - Creates Aave ERC-4626 vaults with revenue splitting
   - Deploys vault + revenue splitter atomically
   - Frontend calls: `createVault(asset, recipients[], shares[])`

2. **KineticOctantV2Deployer** (`src/octant/KineticOctantV2Deployer.sol`)
   - Deploys Morpho strategies via Octant V2
   - Routes 100% yield to PaymentSplitter
   - Frontend calls: `deployMorphoStrategy(name, paymentSplitter, enableBurning)`

3. **PaymentSplitterFactory** (Optional - if using factory pattern)
   - Creates PaymentSplitter instances for multi-recipient yield distribution
   - Alternative: Deploy PaymentSplitter directly via proxy

### User-Deployed Contracts (Created via Frontend)
These are created when users click "Deploy Strategy":

- **ImmutableATokenVault** - Individual Aave vault instance
- **ATokenVaultRevenueSplitterOwner** - Revenue splitter for that vault
- **PaymentSplitter** - Multi-recipient yield distributor (if using Octant V2)

## 🚧 Current Status

### ✅ Ready to Deploy
- [x] PaymentSplitter (with ERC1967Proxy)
- [x] Deployment scripts created

### ⚠️ Requires Configuration
- [ ] **AaveVaultFactory** - Contract too large (42KB > 24KB limit)
  - **Solution**: Optimize contract or split into multiple contracts
  - See: [Ethereum Contract Size Limit](https://ethereum.org/en/developers/tutorials/downsizing-contracts-to-fight-the-contract-size-limit/)

- [ ] **KineticOctantV2Deployer** - Requires Octant V2 factory addresses
  - **Required addresses** (set in `contracts/.env`):
    ```bash
    MORPHO_FACTORY_ADDRESS=0x... # MorphoCompounderStrategyFactory
    TOKENIZED_STRATEGY_ADDRESS=0x... # YieldDonatingTokenizedStrategy
    ```
  - **Where to get these**:
    - Check [Octant V2 docs](https://docs.v2.octant.build/)
    - Or deploy Octant V2 contracts yourself
    - Or use mainnet addresses if on Tenderly fork

## 📝 Deployment Steps

### 1. Set Environment Variables

**contracts/.env:**
```bash
# Network
PRIVATE_KEY=0x...
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c311987358ff

# Octant V2 Factories (REQUIRED for Morpho deployment)
MORPHO_FACTORY_ADDRESS=0x... # Get from Octant V2 docs
TOKENIZED_STRATEGY_ADDRESS=0x... # Get from Octant V2 docs

# Deployed Factories (will be filled after deployment)
AAVE_VAULT_FACTORY_ADDRESS=0x...
OCTANT_V2_DEPLOYER_ADDRESS=0x...
PAYMENT_SPLITTER_ADDRESS=0x... # If using standalone splitter
```

### 2. Deploy AaveVaultFactory

**Option A: Optimize contract size**
```bash
# Modify AaveVaultFactory.sol to reduce size:
# - Remove unnecessary functions
# - Extract complex logic to libraries
# - Use external contracts for validation
forge build --sizes
```

**Option B: Deploy with size check disabled (local testing only)**
```bash
forge script scripts/DeployAaveVaultFactory.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --skip-simulation \
  --unlocked
```

### 3. Deploy KineticOctantV2Deployer

**After obtaining Octant V2 addresses:**
```bash
forge script scripts/DeployOctantV2Deployer.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### 4. (Optional) Deploy PaymentSplitter with Proxy

If you want a standalone payment splitter:
```bash
forge script scripts/DeployPaymentSplitterWithProxy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

### 5. Update Frontend Environment

**frontend/.env:**
```bash
# Factory Addresses (users interact with these)
VITE_AAVE_VAULT_FACTORY_ADDRESS=0x662bA2710C9c5da92d27bC558D8fB7f2cc40d373
VITE_OCTANT_V2_DEPLOYER_ADDRESS=0x...
VITE_PAYMENT_SPLITTER_ADDRESS=0x...

# Asset Addresses (already in constants.ts)
VITE_USDC_ADDRESS=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
VITE_DAI_ADDRESS=0x6B175474E89094C44Da98b954EedeAC495271d0F
VITE_USDT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
```

## 🧪 Testing Deployment Flow

### Test Aave Vault Deployment

```javascript
// From frontend (useDeployAaveVault hook)
const recipients = [
  { address: '0x1111...', shareInBps: 5000 }, // 50%
  { address: '0x2222...', shareInBps: 5000 }  // 50%
];

// Frontend calls factory
const tx = await aaveVaultFactory.createVault(
  USDC_ADDRESS,
  recipients.map(r => r.address),
  recipients.map(r => r.shareInBps)
);

await tx.wait();

// Get deployed vault address
const userVaults = await aaveVaultFactory.getUserVaults(userAddress);
const newVault = userVaults[userVaults.length - 1];

console.log("Vault deployed at:", newVault);
```

### Test Octant V2 Strategy Deployment

```javascript
// From frontend (useDeployOctantV2Strategy hook)
const paymentSplitterAddress = '0x...'; // From previous deployment

const tx = await octantV2Deployer.deployMorphoStrategy(
  "Kinetic-Morpho-USDC-PublicGoods", // name
  paymentSplitterAddress,             // donation recipient
  false                                // enableBurning
);

await tx.wait();

// Get deployed strategy
const strategies = await octantV2Deployer.getUserStrategies(userAddress);
const newStrategy = strategies[strategies.length - 1];

console.log("Strategy deployed at:", newStrategy.strategyAddress);
```

## 🔧 Troubleshooting

### Contract Size Too Large
```bash
# Check contract sizes
forge build --sizes

# Options:
# 1. Use libraries for complex logic
# 2. Remove unnecessary view functions
# 3. Split into multiple contracts
# 4. Use external contracts for validation
```

### Missing Octant V2 Addresses
```bash
# Check Octant V2 documentation
# https://docs.v2.octant.build/

# Or deploy Octant V2 contracts yourself
# (requires Morpho Blue and other dependencies)
```

### Transaction Fails on Tenderly
```bash
# Ensure RPC URL is correct
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_FORK_ID

# Not the dashboard URL!
# ❌ https://dashboard.tenderly.co/explorer/vnet/...
# ✅ https://virtual.mainnet.eu.rpc.tenderly.co/...
```

## 📚 Next Steps

1. **Optimize AaveVaultFactory** - Reduce contract size below 24KB
2. **Obtain Octant V2 Addresses** - Get from docs or deploy yourself
3. **Deploy All Factories** - AaveVaultFactory + KineticOctantV2Deployer
4. **Update Frontend** - Add factory addresses to constants.ts
5. **Test E2E Flow** - Deploy strategy from frontend → verify on-chain

## 🎯 Success Criteria

- [ ] AaveVaultFactory deployed and verified
- [ ] KineticOctantV2Deployer deployed and verified
- [ ] Frontend can deploy Aave vaults successfully
- [ ] Frontend can deploy Morpho strategies successfully
- [ ] Yield flows to PaymentSplitter correctly
- [ ] Recipients can claim their yield shares

---

**Need Help?**
- [Foundry Docs](https://book.getfoundry.sh/)
- [Octant V2 Docs](https://docs.v2.octant.build/)
- [Contract Size Optimization](https://ethereum.org/en/developers/tutorials/downsizing-contracts-to-fight-the-contract-size-limit/)
