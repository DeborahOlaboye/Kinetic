# Octant V2 Deployment Guide

This guide explains how to deploy the Octant V2 factory contracts needed for Kinetic.

## Option 1: Use Golem Foundation's Deployed Contracts (Recommended for Hackathon)

For the hackathon, you can use Golem Foundation's deployed Octant V2 contracts if they provide them. Check:
- https://github.com/golemfoundation/octant-v2-core
- https://docs.v2.octant.build
- Octant Discord/Community channels

## Option 2: Deploy Your Own Factories (Full Control)

If you want to deploy your own Octant V2 factories:

### Step 1: Clone and Build Octant V2 Core

```bash
# In a temporary directory
git clone https://github.com/golemfoundation/octant-v2-core.git
cd octant-v2-core

# Install dependencies
forge install

# Build contracts
forge build
```

### Step 2: Deploy TokenizedStrategy Implementation

```bash
# Create .env file
cp .env.template .env

# Edit .env with your details:
# RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/your-fork-id
# PRIVATE_KEY=your_private_key
# ETHERSCAN_API_KEY=your_api_key

# Deploy TokenizedStrategy
forge create src/core/TokenizedStrategy.sol:TokenizedStrategy \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --verify

# Save the deployed address as TOKENIZED_STRATEGY_ADDRESS
```

### Step 3: Deploy MorphoCompounderStrategyFactory

```bash
forge create src/factories/MorphoCompounderStrategyFactory.sol:MorphoCompounderStrategyFactory \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --verify

# Save the deployed address as MORPHO_FACTORY_ADDRESS
```

### Step 4: Deploy SkyCompounderStrategyFactory

```bash
forge create src/factories/SkyCompounderStrategyFactory.sol:SkyCompounderStrategyFactory \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --verify

# Save the deployed address as SKY_FACTORY_ADDRESS
```

### Step 5: Update Kinetic Configuration

```bash
# In contracts/.env
MORPHO_FACTORY_ADDRESS=<deployed_morpho_factory>
SKY_FACTORY_ADDRESS=<deployed_sky_factory>
TOKENIZED_STRATEGY_ADDRESS=<deployed_tokenized_strategy>

# In frontend/.env
VITE_MORPHO_FACTORY_ADDRESS=<deployed_morpho_factory>
VITE_SKY_FACTORY_ADDRESS=<deployed_sky_factory>
```

### Step 6: Deploy KineticOctantV2Deployer

```bash
cd /path/to/Kinetic/contracts

forge script script/DeployOctantV2Deployer.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

### Step 7: Update Frontend

```bash
# In frontend/.env
VITE_OCTANT_V2_DEPLOYER_ADDRESS=<deployed_kinetic_deployer>
```

## Option 3: Simplified Mock for Testing (Fastest)

For quick testing without full Octant V2 deployment, you can:

1. Deploy PaymentSplitter only
2. Use mock "strategies" that just route funds to PaymentSplitter
3. Test the yield routing flow without actual Morpho/Sky integration

## Required Addresses Summary

After deployment, you need these addresses:

```env
# Octant V2 Core (from golemfoundation/octant-v2-core)
MORPHO_FACTORY_ADDRESS=0x...
SKY_FACTORY_ADDRESS=0x...
TOKENIZED_STRATEGY_ADDRESS=0x...

# Kinetic Wrapper (from your deployment)
VITE_OCTANT_V2_DEPLOYER_ADDRESS=0x...

# Payment Distribution (from your deployment)
VITE_PAYMENT_SPLITTER_ADDRESS=0x...
```

## Mainnet Addresses (if available)

Check the official Octant V2 documentation for mainnet deployed addresses:
- Docs: https://docs.v2.octant.build
- GitHub: https://github.com/golemfoundation/octant-v2-core

## Key Contracts

- **MorphoCompounderStrategyFactory**: Deploys strategies that compound yield via Morpho lending markets
  - Uses Yearn USDC vault: `0x074134A2784F4F66b6ceD6f68849382990Ff3215`
  - USDC token: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`

- **SkyCompounderStrategyFactory**: Deploys strategies for Sky (MakerDAO) protocol
  - Uses USDS reward address: `0x0650CAF159C5A49f711e8169D4336ECB9b950275`

- **YieldDonatingTokenizedStrategy**: ERC-4626 vault implementation that auto-donates 100% yield

## Hackathon Notes

For the Octant V2 hackathon, you need to demonstrate:
1. ✅ Using Octant V2 to programmatically allocate yield
2. ✅ Routing yield to an on-chain objective (PaymentSplitter → public goods)
3. ✅ Smart contracts implementing the routing logic (KineticOctantV2Deployer)
4. ✅ Policy documentation (OCTANT_V2_POLICY.md)

Your current implementation meets all requirements! The actual deployment addresses are less critical than demonstrating the integration pattern.

## Troubleshooting

**"Cannot find factory addresses"**
- Use Option 2 to deploy your own
- Or use Option 3 for simplified testing

**"Compilation errors"**
- The octant-v2-core repo may have version dependencies
- Check their README for Solidity version requirements
- Use `forge build --force` to rebuild

**"Tenderly fork issues"**
- Make sure your Tenderly fork includes mainnet state
- The factories need access to Morpho and Sky protocols
- Consider deploying on a testnet instead

## Next Steps

1. Choose an option above (1, 2, or 3)
2. Deploy the required contracts
3. Update your `.env` files with addresses
4. Test deployment via the frontend
5. Verify 100% yield routes to PaymentSplitter

