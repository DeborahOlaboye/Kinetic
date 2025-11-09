# Morpho Vault V2 Operations Runbook

**Project**: Kinetic Public Goods Funding Platform
**Integration**: Morpho Vaults V2 with PaymentSplitter yield routing
**Purpose**: Operational guide for managing Morpho vaults and adapters

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Role Definitions](#role-definitions)
3. [Initial Deployment](#initial-deployment)
4. [Daily Operations](#daily-operations)
5. [Emergency Procedures](#emergency-procedures)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Components

```
┌──────────────────────────────────────────────────────────┐
│                    Morpho Vault V2                        │
│  (ERC-4626 compliant, role-based governance)             │
│                                                           │
│  Roles:                                                   │
│  ├─ Owner: Sets curator, manages governance              │
│  ├─ Curator: Configures caps, fees, allocators          │
│  ├─ Allocator: Manages fund allocation                  │
│  └─ Sentinel: Emergency response                        │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│          PaymentSplitterYieldAdapter                     │
│  (Custom adapter routing 100% yield to public goods)    │
│                                                           │
│  - Tracks principal vs. yield                           │
│  - Routes yield → PaymentSplitter                       │
│  - Supports multiple ERC-4626 markets                   │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│                   Underlying Markets                      │
│  (ERC-4626 vaults: Aave, Morpho Blue, etc.)             │
│                                                           │
│  - Generate yield on deposited assets                    │
│  - Adapter withdraws yield periodically                  │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼ (Yield Only)
┌──────────────────────────────────────────────────────────┐
│                  PaymentSplitter                          │
│  (Public goods recipients)                               │
│                                                           │
│  - Climate DAOs: 40%                                     │
│  - Open Source: 30%                                      │
│  - Education: 20%                                        │
│  - Healthcare: 10%                                       │
└──────────────────────────────────────────────────────────┘
```

### Key Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| Morpho VaultV2 | `$VAULT_ADDRESS` | Main vault (set after deployment) |
| PaymentSplitterYieldAdapter | `$ADAPTER_ADDRESS` | Custom yield adapter |
| PaymentSplitter | `$SPLITTER_ADDRESS` | Public goods distributor |
| Underlying Asset | `$ASSET_ADDRESS` | USDC/DAI/etc. |

---

## Role Definitions

### Owner
**Permissions:**
- Set/update curator address
- Set/update guardian/sentinel addresses
- Update vault name/symbol
- Transfer ownership

**Responsibilities:**
- Appoint trusted curator (multisig recommended)
- Monitor curator performance
- Handle governance upgrades

**Security:**
- **MUST** be a multisig (3/5 recommended)
- Use hardware wallets for signers
- Timelock all governance actions

### Curator
**Permissions:**
- Submit/accept market caps
- Set allocator permissions
- Configure fees (performance + management)
- Set timelocks
- Configure adapter registry

**Responsibilities:**
- Risk assessment for new markets
- Cap management based on market conditions
- Fee optimization
- Allocator oversight

**Security:**
- **MUST** be a multisig (2/3 minimum)
- All cap increases require timelock
- Document all configuration changes

### Allocator
**Permissions:**
- Reallocate funds between curator-approved markets
- Set liquidity adapter
- Set max rate (share price appreciation limit)

**Responsibilities:**
- Optimize yield across markets
- Maintain liquidity for withdrawals
- Harvest yield to PaymentSplitter
- Monitor market health

**Security:**
- Can be a bot/EOA (lower privilege)
- Actions constrained by curator caps
- No ability to steal funds

### Sentinel
**Permissions:**
- Revoke pending cap increases
- Force deallocate from markets
- Decrease caps immediately (no timelock)

**Responsibilities:**
- Monitor for exploits/hacks
- Emergency response coordination
- Market de-risking during crises

**Security:**
- **SHOULD** be a multisig (2/3 recommended)
- 24/7 monitoring capability
- Clear escalation procedures

---

## Initial Deployment

### Prerequisites
```bash
# Install dependencies
cd contracts
forge install

# Set environment variables
cp .env.example .env
# Edit .env with your values
```

### Required Environment Variables
```bash
# Role addresses
OWNER_ADDRESS=0x...           # Governance multisig
CURATOR_ADDRESS=0x...         # Curator multisig
ALLOCATOR_ADDRESS=0x...       # Allocator bot/EOA
SENTINEL_ADDRESS=0x...        # Emergency responder

# Contract addresses
PAYMENT_SPLITTER_ADDRESS=0x... # PaymentSplitter for yield
UNDERLYING_ASSET=0x...         # USDC/DAI address
AAVE_VAULT=0x...              # Initial market (optional)

# Network config
RPC_URL=https://...
ETHERSCAN_API_KEY=...
PRIVATE_KEY=...               # Deployer key
```

### Step 1: Deploy Contracts
```bash
# Deploy PaymentSplitter adapter and Morpho vault
forge script script/DeployMorphoVaultV2.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  --slow

# Save deployed addresses
export VAULT_ADDRESS=<from_deployment_output>
export ADAPTER_ADDRESS=<from_deployment_output>
```

### Step 2: Configure Roles (Owner Actions)
```bash
# Set curator
cast send $VAULT_ADDRESS \
  "setCurator(address)" $CURATOR_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $OWNER_KEY

# Set allocator permission
cast send $VAULT_ADDRESS \
  "setIsAllocator(address,bool)" $ALLOCATOR_ADDRESS true \
  --rpc-url $RPC_URL \
  --private-key $OWNER_KEY

# Set sentinel permission
cast send $VAULT_ADDRESS \
  "setIsSentinel(address,bool)" $SENTINEL_ADDRESS true \
  --rpc-url $RPC_URL \
  --private-key $OWNER_KEY
```

### Step 3: Submit Initial Market Caps (Curator Actions)
```bash
# Generate market ID
MARKET_ID=$(cast keccak "$(cast abi-encode "f(string,address)" "market/aave" $AAVE_VAULT)")

# Submit cap (1M USDC initial cap)
INITIAL_CAP=1000000000000  # 1M USDC (6 decimals)

cast send $VAULT_ADDRESS \
  "submitCap(bytes32,uint256)" $MARKET_ID $INITIAL_CAP \
  --rpc-url $RPC_URL \
  --private-key $CURATOR_KEY

# Wait for timelock to expire (typically 1 day)
sleep 86400

# Accept cap
cast send $VAULT_ADDRESS \
  "acceptCap(bytes32)" $MARKET_ID \
  --rpc-url $RPC_URL \
  --private-key $CURATOR_KEY
```

### Step 4: Perform Initial Allocation (Allocator Actions)
```bash
# Prepare allocation data
ALLOCATE_AMOUNT=500000000000  # 500K USDC
ALLOCATION_DATA=$(cast abi-encode "f(address,bytes32)" $AAVE_VAULT $MARKET_ID)

# Execute allocation via adapter
cast send $ADAPTER_ADDRESS \
  "allocate(bytes,uint256,bytes4,address)" \
  $ALLOCATION_DATA $ALLOCATE_AMOUNT 0x00000000 $ALLOCATOR_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $ALLOCATOR_KEY
```

### Step 5: Verify Deployment
```bash
# Check vault configuration
cast call $VAULT_ADDRESS "owner()" --rpc-url $RPC_URL
cast call $VAULT_ADDRESS "curator()" --rpc-url $RPC_URL
cast call $VAULT_ADDRESS "totalAssets()" --rpc-url $RPC_URL

# Check adapter state
cast call $ADAPTER_ADDRESS "marketCount()" --rpc-url $RPC_URL
cast call $ADAPTER_ADDRESS "totalPrincipal()" --rpc-url $RPC_URL
```

---

## Daily Operations

### Allocator Tasks

#### 1. Monitor Market Conditions
```bash
# Check total assets in vault
cast call $VAULT_ADDRESS "totalAssets()" --rpc-url $RPC_URL

# Check adapter real assets
cast call $ADAPTER_ADDRESS "realAssets()" --rpc-url $RPC_URL

# Check specific market allocation
cast call $ADAPTER_ADDRESS \
  "getAllocation(bytes32)" $MARKET_ID \
  --rpc-url $RPC_URL
```

#### 2. Reallocate Funds
```bash
# Scenario: Move 100K from Market 1 to Market 2

# Deallocate from Market 1
DEALLOCATE_AMOUNT=100000000000
DEALLOCATE_DATA=$(cast abi-encode "f(address,bytes32,uint256)" \
  $MARKET1_VAULT $MARKET1_ID 100)  # 1% slippage

cast send $ADAPTER_ADDRESS \
  "deallocate(bytes,uint256,bytes4,address)" \
  $DEALLOCATE_DATA $DEALLOCATE_AMOUNT 0x00000000 $ALLOCATOR_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $ALLOCATOR_KEY

# Allocate to Market 2
ALLOCATE_DATA=$(cast abi-encode "f(address,bytes32)" $MARKET2_VAULT $MARKET2_ID)

cast send $ADAPTER_ADDRESS \
  "allocate(bytes,uint256,bytes4,address)" \
  $ALLOCATE_DATA $DEALLOCATE_AMOUNT 0x00000000 $ALLOCATOR_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $ALLOCATOR_KEY
```

#### 3. Harvest Yield
```bash
# Check harvestable yield
cast call $ADAPTER_ADDRESS \
  "harvestableYield(bytes32)" $MARKET_ID \
  --rpc-url $RPC_URL

# Harvest if yield > threshold (e.g., 1000 USDC)
cast send $ADAPTER_ADDRESS \
  "harvestYield(bytes32)" $MARKET_ID \
  --rpc-url $RPC_URL \
  --private-key $ALLOCATOR_KEY

# Verify yield sent to PaymentSplitter
cast call $ADAPTER_ADDRESS "totalYieldDonated()" --rpc-url $RPC_URL
```

#### 4. Automated Allocation Bot (Example)
```python
#!/usr/bin/env python3
# allocator_bot.py - Example automation script

import time
from web3 import Web3

# Setup
w3 = Web3(Web3.HTTPProvider(RPC_URL))
adapter = w3.eth.contract(address=ADAPTER_ADDRESS, abi=ADAPTER_ABI)

def optimize_allocation():
    """
    Optimization logic:
    1. Harvest yield from all markets
    2. Check APYs across markets
    3. Reallocate to maximize yield
    """
    markets = get_active_markets()

    for market_id in markets:
        # Harvest yield
        harvestable = adapter.functions.harvestableYield(market_id).call()
        if harvestable > HARVEST_THRESHOLD:
            harvest_tx = adapter.functions.harvestYield(market_id).transact()
            print(f"Harvested {harvestable} from {market_id}")

    # Reallocate based on APY (simplified)
    best_market = find_highest_apy_market()
    reallocate_to_market(best_market)

# Run every 4 hours
while True:
    optimize_allocation()
    time.sleep(14400)
```

### Curator Tasks

#### 1. Add New Market
```bash
# Research new market (manual due diligence)
# - Audit status
# - TVL & track record
# - Smart contract risks

# Generate market ID
NEW_MARKET_ID=$(cast keccak "$(cast abi-encode "f(string,address)" "market/new" $NEW_VAULT)")

# Submit conservative initial cap
NEW_CAP=100000000000  # 100K USDC

cast send $VAULT_ADDRESS \
  "submitCap(bytes32,uint256)" $NEW_MARKET_ID $NEW_CAP \
  --rpc-url $RPC_URL \
  --private-key $CURATOR_KEY

# Document rationale in governance forum
```

#### 2. Adjust Market Caps
```bash
# Increase cap for well-performing market
INCREASED_CAP=2000000000000  # 2M USDC

cast send $VAULT_ADDRESS \
  "submitCap(bytes32,uint256)" $MARKET_ID $INCREASED_CAP \
  --rpc-url $RPC_URL \
  --private-key $CURATOR_KEY

# Note: Increases require timelock wait period
```

#### 3. Configure Fees
```bash
# Set performance fee (e.g., 10% = 1000 basis points)
PERFORMANCE_FEE=1000  # 10%

cast send $VAULT_ADDRESS \
  "submitPerformanceFee(uint96)" $PERFORMANCE_FEE \
  --rpc-url $RPC_URL \
  --private-key $CURATOR_KEY
```

---

## Emergency Procedures

### Scenario 1: Market Exploit Detected

**Symptoms:**
- Sudden drop in market asset value
- Exploit announcement on social media
- Unusual on-chain activity

**Response (Sentinel):**
```bash
# 1. IMMEDIATELY decrease cap to zero (bypasses timelock)
cast send $VAULT_ADDRESS \
  "submitCap(bytes32,uint256)" $COMPROMISED_MARKET_ID 0 \
  --rpc-url $RPC_URL \
  --private-key $SENTINEL_KEY

# 2. Force deallocate all funds from compromised market
cast send $ADAPTER_ADDRESS \
  "deallocate(bytes,uint256,bytes4,address)" \
  $DEALLOCATE_DATA $MAX_AMOUNT 0x00000000 $SENTINEL_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $SENTINEL_KEY

# 3. Notify Owner and Curator
# 4. Publish incident report
```

### Scenario 2: Smart Contract Bug in Adapter

**Symptoms:**
- Yield calculations incorrect
- Failed transactions
- Unexpected reverts

**Response (Owner):**
```bash
# 1. Pause new allocations (via Curator)
# Contact Curator to set all caps to current levels

# 2. Deploy fixed adapter version
forge script script/DeployFixedAdapter.s.sol --broadcast

# 3. Migrate funds to new adapter (Allocator)
# Deallocate from old adapter, allocate to new

# 4. Update vault adapter registry (Owner)
cast send $VAULT_ADDRESS \
  "setAdapter(address,bool)" $NEW_ADAPTER true \
  --rpc-url $RPC_URL \
  --private-key $OWNER_KEY
```

### Scenario 3: Liquidity Crisis

**Symptoms:**
- Large withdrawal request pending
- Insufficient idle reserves
- Cannot fulfill redemptions

**Response (Allocator):**
```bash
# 1. Identify most liquid markets
cast call $ADAPTER_ADDRESS "realAssets()" --rpc-url $RPC_URL

# 2. Deallocate from liquid markets
# Prioritize markets with:
# - Low withdrawal penalties
# - High liquidity depth
# - Instant withdrawals

# 3. Increase idle reserve percentage (Curator)
cast send $VAULT_ADDRESS \
  "setIdleReservePercentage(uint256)" 2000 \  # 20%
  --rpc-url $RPC_URL \
  --private-key $CURATOR_KEY
```

---

## Monitoring & Maintenance

### Key Metrics Dashboard

Monitor these metrics continuously:

| Metric | Query | Alert Threshold |
|--------|-------|-----------------|
| Total Assets | `vault.totalAssets()` | -10% in 1 hour |
| Adapter Principal | `adapter.totalPrincipal()` | Mismatch with allocations |
| Yield Donated | `adapter.totalYieldDonated()` | Stagnant for 7 days |
| Market Count | `adapter.marketCount()` | >10 markets (gas risk) |
| Idle Reserve | `vault.idleAssets()` | <5% of total |

### Weekly Tasks
- [ ] Review allocator performance
- [ ] Analyze yield generation trends
- [ ] Check for smart contract upgrades in underlying markets
- [ ] Verify PaymentSplitter distributions
- [ ] Review gas costs for operations

### Monthly Tasks
- [ ] Comprehensive security audit of all markets
- [ ] Allocator strategy review
- [ ] Fee optimization analysis
- [ ] Governance participation review
- [ ] Documentation updates

---

## Troubleshooting

### Issue: Allocation Fails with "NotAuthorized"
**Cause:** Caller is not the parent vault
**Solution:** Ensure allocate/deallocate is called via Morpho Vault V2, not directly

### Issue: "SlippageTooHigh" Error
**Cause:** Market price moved unfavorably during deallocation
**Solution:** Increase maxSlippage parameter or retry after market stabilizes

### Issue: Yield Not Routing to PaymentSplitter
**Cause:** Harvest threshold not met or no positive yield
**Solution:**
```bash
# Check harvestable yield
cast call $ADAPTER_ADDRESS "harvestableYield(bytes32)" $MARKET_ID

# Manual harvest
cast send $ADAPTER_ADDRESS "harvestYield(bytes32)" $MARKET_ID
```

### Issue: realAssets() Reverts
**Cause:** One of the underlying vaults is reverting (DoS vector)
**Solution:** Sentinel force-deallocates from problematic market

---

## Appendix

### Contract ABIs
- Morpho VaultV2: `artifacts/VaultV2.sol/VaultV2.json`
- PaymentSplitterYieldAdapter: `artifacts/PaymentSplitterYieldAdapter.sol/PaymentSplitterYieldAdapter.json`

### Useful Commands Cheat Sheet
```bash
# View functions
cast call $VAULT "totalAssets()"
cast call $VAULT "curator()"
cast call $ADAPTER "marketCount()"
cast call $ADAPTER "realAssets()"
cast call $ADAPTER "getAllocation(bytes32)" $MARKET_ID

# State changes
cast send $VAULT "submitCap(bytes32,uint256)" $ID $CAP
cast send $ADAPTER "allocate(...)"
cast send $ADAPTER "deallocate(...)"
cast send $ADAPTER "harvestYield(bytes32)" $ID
```

### Emergency Contacts
- **Owner Multisig**: [governance@kinetic.xyz](mailto:governance@kinetic.xyz)
- **Curator Multisig**: [curator@kinetic.xyz](mailto:curator@kinetic.xyz)
- **On-Call Sentinel**: [emergency@kinetic.xyz](mailto:emergency@kinetic.xyz)
- **Discord**: #morpho-vault-ops

---

**Document Version**: 1.0
**Last Updated**: 2025-11-09
**Maintained By**: Kinetic Protocol Team
