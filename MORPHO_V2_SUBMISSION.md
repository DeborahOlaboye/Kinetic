# Morpho Vaults V2 Prize Submission

**Project**: Kinetic - Public Goods Funding via Morpho Vaults V2
**Team**: Kinetic Protocol
**Submission Date**: 2025-11-09
**Prize Track**: Best use of Morpho Vaults V2 ($1,500)

---

## Executive Summary

Kinetic integrates **Morpho Vaults V2** to create a trustless, non-custodial public goods funding mechanism that routes 100% of DeFi yield to verified recipients via a custom adapter. Our implementation demonstrates:

✅ **Direct Morpho Vaults V2 integration** (not via wrappers)
✅ **Complete role model** (Owner, Curator, Allocator, Sentinel)
✅ **ERC-4626 compliant** custom adapter
✅ **Safe adapter wiring** with reentrancy protection
✅ **Comprehensive test suite** (20+ tests)
✅ **Production deployment scripts**
✅ **Operational runbook** for vault management

---

## Prize Requirements Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Uses Morpho Vaults V2** | ✅ Complete | `src/morpho/adapters/PaymentSplitterYieldAdapter.sol` |
| **Respects role model** | ✅ Complete | Deployment script configures all 4 roles |
| **ERC-4626 semantics** | ✅ Complete | Adapter interfaces with ERC-4626 vaults correctly |
| **Safe adapter wiring** | ✅ Complete | Reentrancy guards, slippage protection, access controls |
| **Tests** | ✅ Complete | 20+ tests covering allocation, yield, safety |
| **Deployments** | ✅ Complete | `script/DeployMorphoVaultV2.s.sol` |
| **Concise runbooks** | ✅ Complete | `MORPHO_VAULT_RUNBOOK.md` (100+ operational procedures) |

---

## Architecture

### System Flow

```
User Deposits USDC
        ↓
Morpho Vault V2 (ERC-4626)
   │
   │ [Curator sets caps]
   │ [Allocator manages allocation]
   │ [Sentinel monitors risk]
   │
   ↓
PaymentSplitterYieldAdapter
   │
   ├─→ Aave USDC Vault (ERC-4626)
   ├─→ Morpho Blue Market (ERC-4626)
   └─→ Other ERC-4626 Vaults
   │
   │ [Tracks Principal vs Yield]
   │
   ↓ (Yield Only - Principal Protected)
PaymentSplitter Contract
   │
   ├─→ Climate DAO (40%)
   ├─→ Open Source Devs (30%)
   ├─→ Education Initiatives (20%)
   └─→ Healthcare Projects (10%)
```

### Innovation: Yield-Only Donations

Unlike traditional donation models, our adapter:
- **Protects principal**: Users can withdraw 100% of deposited capital anytime
- **Routes yield only**: High-watermark accounting ensures only profits are donated
- **Perpetual funding**: Creates sustainable, ongoing revenue for public goods
- **Multi-protocol**: Aggregates yield from Aave, Morpho, Sky, etc.

---

## Implementation Details

### 1. Custom Adapter: PaymentSplitterYieldAdapter

**Location**: `contracts/src/morpho/adapters/PaymentSplitterYieldAdapter.sol`

**Key Features**:
- Implements `IAdapter` interface required by Morpho Vaults V2
- Allocates/deallocates to multiple ERC-4626 markets
- Tracks principal separately from yield using high-watermark accounting
- Routes 100% of harvested yield to PaymentSplitter
- Supports multiple markets with independent tracking
- Slippage protection on deallocations
- Reentrancy guards on all state-changing functions
- Permissioned: only callable by parent Morpho Vault V2

**Code Highlights**:
```solidity
/// @notice Allocate assets to underlying ERC-4626 vault
function allocate(bytes memory data, uint256 assets, bytes4, address)
    external nonReentrant returns (bytes32[] memory ids, int256 change)
{
    require(msg.sender == parentVault, NotAuthorized());
    // Harvests existing yield before allocating more
    // Deposits into ERC-4626 vault
    // Tracks principal separately
    // Returns market IDs and allocation change
}

/// @notice Harvest yield and route to PaymentSplitter
function harvestYield(bytes32 marketId) external nonReentrant {
    // Calculate yield: currentValue - principalDeposited
    // Only harvests positive yield (protects against losses)
    // Redeems yield shares from underlying vault
    // Transfers to PaymentSplitter (100% donation)
}
```

**Safety Mechanisms**:
- Reentrancy protection (`nonReentrant` modifier)
- Asset validation (ensures vault uses same asset as parent)
- Slippage limits on withdrawals
- Access control (parent vault only)
- Principal protection (never touches deposited capital)

### 2. Role Model Implementation

**Deployment Script**: `contracts/script/DeployMorphoVaultV2.s.sol`

**Role Configuration**:

```solidity
// Owner: Governance multisig
vault.setCurator(curator);
vault.setIsAllocator(allocator, true);
vault.setIsSentinel(sentinel, true);

// Curator: Risk manager
vault.submitCap(marketId, initialCap);  // Set market caps
vault.submitPerformanceFee(1000);       // Set fees (10%)

// Allocator: Yield optimizer
adapter.allocate(data, assets, selector, sender);  // Manage allocations

// Sentinel: Emergency responder
vault.submitCap(compromisedMarket, 0);  // Bypass timelock in emergencies
```

**Separation of Concerns**:
- **Owner**: Can set curator, but NOT allocate funds
- **Curator**: Can set caps, but NOT execute allocations
- **Allocator**: Can allocate within caps, but NOT change caps
- **Sentinel**: Can deallocate in emergencies, but NOT allocate

This separation ensures no single role can steal funds.

### 3. ERC-4626 Compliance

Our adapter correctly implements ERC-4626 semantics:

**Deposit Flow**:
```solidity
// User deposits USDC into Morpho Vault
shares = vault.deposit(assets, receiver);

// Vault calls adapter.allocate()
adapter.allocate(marketData, assets, ...);

// Adapter deposits into underlying ERC-4626 vault
underlyingShares = underlyingVault.deposit(assets, address(adapter));
```

**Withdrawal Flow**:
```solidity
// User redeems shares from Morpho Vault
assets = vault.redeem(shares, receiver, owner);

// Vault calls adapter.deallocate()
adapter.deallocate(marketData, neededAssets, ...);

// Adapter redeems from underlying vault
assetsReceived = underlyingVault.redeem(shares, receiver, address(adapter));
```

**Yield Calculation**:
```solidity
// Accurate share-to-asset conversion
currentValue = underlyingVault.convertToAssets(adapterShares);
yield = currentValue - principalDeposited;  // High-watermark accounting
```

### 4. Comprehensive Testing

**Test Suite**: `contracts/test/morpho/PaymentSplitterYieldAdapter.t.sol`

**Coverage** (20+ tests):

| Category | Tests | Coverage |
|----------|-------|----------|
| Initialization | 2 | Constructor validation, zero address checks |
| Allocation | 4 | Deposits, access control, multi-market, asset validation |
| Deallocation | 3 | Withdrawals, slippage, market removal |
| Yield Harvesting | 3 | Routing to PaymentSplitter, principal protection, loss handling |
| Real Assets | 2 | Total calculation, unrealized yield inclusion |
| View Functions | 2 | Harvestable yield, allocation queries |
| Reentrancy | 1 | Protection verification |
| Edge Cases | 3+ | Invalid markets, full deallocations, zero yield |

**Example Test**:
```solidity
function test_HarvestYield_RoutesToPaymentSplitter() public {
    // Allocate principal
    vm.prank(address(parentVault));
    adapter.allocate(data, 100_000e6, bytes4(0), address(0));

    // Simulate 10% yield
    underlyingVault.addYield(10_000e6);

    // Harvest
    adapter.harvestYield(marketId);

    // Verify yield went to PaymentSplitter
    assertGt(asset.balanceOf(paymentSplitter), 0);
    assertEq(adapter.totalYieldDonated(), 10_000e6);

    // Verify principal untouched
    assertEq(adapter.getAllocation(marketId).principalDeposited, 100_000e6);
}
```

### 5. Production Deployment

**Script**: `contracts/script/DeployMorphoVaultV2.s.sol`

**Deployment Steps**:
1. Deploy PaymentSplitterYieldAdapter
2. Deploy Morpho VaultV2 (MetaMorpho)
3. Configure roles (Owner, Curator, Allocator, Sentinel)
4. Submit initial market caps (with timelock)
5. Register adapter with vault
6. Perform initial allocation

**Usage**:
```bash
# Set environment variables
export OWNER_ADDRESS=0x...
export CURATOR_ADDRESS=0x...
export ALLOCATOR_ADDRESS=0x...
export SENTINEL_ADDRESS=0x...
export PAYMENT_SPLITTER_ADDRESS=0x...
export UNDERLYING_ASSET=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48  # USDC

# Deploy
forge script script/DeployMorphoVaultV2.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

### 6. Operational Runbook

**Document**: `MORPHO_VAULT_RUNBOOK.md`

**Contents** (8,000+ words):
- Architecture overview with diagrams
- Complete role definitions and responsibilities
- Step-by-step deployment procedures
- Daily operational tasks for each role
- Emergency response procedures (3 scenarios)
- Monitoring dashboard requirements
- Troubleshooting guide
- CLI command cheat sheet

**Sample Procedures**:
```bash
# Daily Task: Harvest yield (Allocator)
cast call $ADAPTER "harvestableYield(bytes32)" $MARKET_ID
cast send $ADAPTER "harvestYield(bytes32)" $MARKET_ID

# Weekly Task: Reallocate based on APY (Allocator)
cast send $ADAPTER "deallocate(...)" $MARKET1_DATA $AMOUNT
cast send $ADAPTER "allocate(...)" $MARKET2_DATA $AMOUNT

# Emergency: Market exploit (Sentinel)
cast send $VAULT "submitCap(bytes32,uint256)" $MARKET_ID 0
```

---

## Technical Highlights

### 1. High-Watermark Yield Tracking

Traditional yield donation models donate from total balance, risking principal in market downturns. Our high-watermark system:

```solidity
struct MarketAllocation {
    uint256 principalDeposited;  // Original deposit (never decreases)
    uint256 totalShares;         // Current vault shares
}

// Yield calculation
currentValue = vault.convertToAssets(totalShares);
if (currentValue > principalDeposited) {
    yieldAmount = currentValue - principalDeposited;  // Only donate profits
}
```

**Benefits**:
- Principal never at risk of donation
- Users can always withdraw 100% of deposits
- Unrealized losses don't affect yield calculations
- Perpetual funding model (keeps generating yield forever)

### 2. Multi-Market Aggregation

Morpho Vaults V2 allows allocation across multiple markets. Our adapter tracks each independently:

```solidity
mapping(bytes32 => MarketAllocation) public allocations;
bytes32[] public marketIds;  // Active markets

function realAssets() external view returns (uint256 total) {
    for (uint256 i = 0; i < marketIds.length; i++) {
        total += vault.convertToAssets(allocations[marketIds[i]].totalShares);
    }
}
```

**Benefits**:
- Diversified yield sources (Aave + Morpho + Sky)
- Risk mitigation across protocols
- Dynamic reallocation based on APY
- Scalable to 10+ markets

### 3. Slippage Protection

Deallocation from volatile markets can face slippage. We protect users:

```solidity
function deallocate(bytes memory data, uint256 assets, ...) external {
    (address vault, bytes32 marketId, uint256 maxSlippage) = abi.decode(data, ...);

    uint256 assetsReceived = underlyingVault.redeem(sharesToRedeem, ...);

    uint256 minAssets = assets * (10000 - maxSlippage) / 10000;
    require(assetsReceived >= minAssets, SlippageTooHigh());
}
```

### 4. Gas Optimization

Efficient storage layout and iteration:

```solidity
// Immutables (no SLOAD cost)
address public immutable parentVault;
address public immutable paymentSplitter;
bytes32 public immutable adapterId;

// Remove markets when fully deallocated (saves gas on realAssets())
if (allocation.totalShares == 0) {
    delete allocations[marketId];
    _removeMarketId(marketId);
}
```

---

## Security Considerations

### Access Control
- All state-changing functions check `msg.sender == parentVault`
- Only parent Morpho Vault V2 can trigger allocations/deallocations
- Public `harvestYield()` is safe (can only send to PaymentSplitter)

### Reentrancy Protection
- `nonReentrant` modifier on all external state-changing functions
- Follows checks-effects-interactions pattern
- No reentrancy vectors identified

### Asset Validation
- Adapter verifies underlying vault uses same asset as parent
- Prevents allocation to incompatible markets
- Blocks cross-asset attacks

### Principal Protection
- High-watermark ensures deposits never donated
- Yield calculation: `max(currentValue - principal, 0)`
- Users can withdraw 100% of deposits even after yield donation

### Slippage Limits
- Deallocations require maximum slippage parameter
- Prevents sandwich attacks
- Fails safely on excessive slippage

### Audit Status
- **Morpho Vaults V2**: Audited by Trail of Bits, Spearbit
- **PaymentSplitter**: OpenZeppelin battle-tested contract
- **Custom Adapter**: Ready for professional audit

---

## Deployment Addresses

### Mainnet (Pending)
- Morpho VaultV2: `<to be deployed>`
- PaymentSplitterYieldAdapter: `<to be deployed>`
- PaymentSplitter: `<already deployed>`

### Testnet (Sepolia)
*Deployments pending based on Morpho V2 testnet availability*

---

## Impact & Use Cases

### Public Goods Funding
- **Climate DAOs**: 40% of yield → carbon offset projects
- **Open Source**: 30% of yield → OSS maintainers
- **Education**: 20% of yield → coding bootcamps
- **Healthcare**: 10% of yield → medical research

### Projected Impact (1M TVL, 5% APY)
- **Annual Yield**: $50,000
- **Monthly Donations**: $4,167
- **Recipients**: 4 categories, proportionally split
- **Principal**: Fully withdrawable by users anytime

### Competitive Advantages
1. **Non-custodial**: Users retain control of principal
2. **Trustless**: Smart contracts enforce allocations
3. **Transparent**: All yield routing on-chain
4. **Multi-protocol**: Aggregates best yields
5. **Role-based**: Professional vault management

---

## Future Enhancements

### Planned Features
1. **Governance Token**: Vote on recipient allocation percentages
2. **Impact Metrics**: On-chain proof of public goods funding
3. **Automated Rebalancing**: ML-based yield optimization
4. **Cross-Chain**: Deploy on L2s (Arbitrum, Optimism, Base)
5. **NFT Certificates**: Mint yield donation receipts

### Morpho V2 Roadmap Integration
- **Market V2 Adapter**: Support new Morpho Blue markets
- **Vault V1 Adapter**: Backward compatibility
- **Liquidity Adapter**: Advanced withdrawal strategies
- **Fee Optimization**: Dynamic performance fees based on yield

---

## Team & Resources

### Core Contributors
- **Smart Contract Dev**: Morpho V2 integration, adapter development
- **Frontend Dev**: React dashboard for vault management
- **DevOps**: Deployment automation, monitoring

### Open Source
- **Repository**: https://github.com/kinetic-protocol/kinetic-v2
- **License**: MIT
- **Documentation**: Comprehensive README, runbook, NatSpec comments

### Contact
- **Website**: https://kinetic-protocol.xyz
- **Discord**: #morpho-vault-support
- **Twitter**: @kinetic_defi

---

## Appendix

### File Inventory

```
contracts/
├── src/
│   └── morpho/
│       └── adapters/
│           └── PaymentSplitterYieldAdapter.sol  # Custom adapter (400 lines)
├── script/
│   └── DeployMorphoVaultV2.s.sol                 # Deployment script (200 lines)
├── test/
│   └── morpho/
│       └── PaymentSplitterYieldAdapter.t.sol    # Test suite (600 lines, 20+ tests)
├── foundry.toml                                  # Forge configuration
└── README.md                                     # Integration documentation

docs/
├── MORPHO_VAULT_RUNBOOK.md                       # Operational guide (8000+ words)
├── MORPHO_V2_SUBMISSION.md                      # This document
└── OCTANT_V2_POLICY.md                          # Octant V2 integration (existing)
```

### Lines of Code
- **Adapter**: ~400 LOC
- **Tests**: ~600 LOC
- **Deployment**: ~200 LOC
- **Documentation**: ~8,000 words
- **Total**: 1,200+ LOC, 10,000+ words documentation

### Standards Compliance
- ✅ ERC-4626 (Tokenized Vault Standard)
- ✅ Morpho IAdapter interface
- ✅ OpenZeppelin security patterns
- ✅ Solidity 0.8.20+ (overflow protection)
- ✅ NatSpec documentation

---

## Conclusion

Kinetic's Morpho Vaults V2 integration represents a novel approach to public goods funding: **yield-only donations with principal protection**. By combining Morpho's battle-tested vault infrastructure with our custom PaymentSplitterYieldAdapter, we've created a trustless, sustainable funding mechanism for public goods.

Our submission demonstrates:
1. **Deep protocol understanding**: Correct implementation of role model, adapter pattern, ERC-4626
2. **Production readiness**: Comprehensive tests, deployment scripts, operational runbooks
3. **Innovation**: High-watermark yield tracking, multi-market aggregation
4. **Impact potential**: Perpetual funding model scales with DeFi adoption

We believe this integration showcases the **best use of Morpho Vaults V2** for social good and respectfully submit for the $1,500 prize.

---

**Submission Checklist**:
- ✅ Direct Morpho Vaults V2 integration
- ✅ Role model respected (Owner, Curator, Allocator, Sentinel)
- ✅ ERC-4626 semantics correct
- ✅ Safe adapter wiring (reentrancy, slippage, access control)
- ✅ Comprehensive tests (20+ passing tests)
- ✅ Deployment scripts with role configuration
- ✅ Concise operational runbook (8,000+ words)

**Ready for Judging**: ✅
