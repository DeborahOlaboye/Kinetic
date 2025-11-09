# Kinetic Octant V2 Integration Policy

## Executive Summary

Kinetic integrates **Octant V2** to enable programmatic yield allocation toward public goods funding. Users can deploy yield-generating strategies using **MorphoCompounderStrategyFactory** and **SkyCompounderStrategyFactory**, with 100% of realized yield automatically routed to a configurable **PaymentSplitter** contract that distributes funds proportionally to verified public goods recipients.

This integration satisfies all Octant V2 Hackathon prize requirements:
- ✅ Uses Octant V2 to programmatically allocate yield
- ✅ Directs yield toward on-chain objectives (public goods funding)
- ✅ Includes smart contracts for yield routing
- ✅ Provides comprehensive policy documentation

---

## Yield Routing Architecture

### Flow Diagram

```
User deposits USDC/DAI/USDT
        ↓
Octant V2 Strategy (ERC-4626 Vault)
  - MorphoCompounderStrategy OR
  - SkyCompounderStrategy
        ↓
Strategy compounds yield via:
  - Morpho lending markets OR
  - Sky (MakerDAO) savings protocol
        ↓
100% Yield Donation (dragonRouter)
        ↓
PaymentSplitter Contract
        ↓
Public Goods Recipients
  (proportional distribution based on shares)
```

### Key Components

1. **KineticOctantV2Deployer** (`contracts/src/octant/KineticOctantV2Deployer.sol`)
   - Wrapper contract for deploying Morpho and Sky strategies
   - Automatically configures PaymentSplitter as `donationAddress`
   - Tracks all deployed strategies per user

2. **PaymentSplitter** (OpenZeppelin)
   - Receives 100% of yield from Octant V2 strategies
   - Splits funds among verified public goods recipients
   - Trustless, immutable allocation percentages

3. **Octant V2 Factories**
   - `MorphoCompounderStrategyFactory`: Deploys Morpho lending strategies
   - `SkyCompounderStrategyFactory`: Deploys Sky (MakerDAO) strategies
   - Both implement `YieldDonatingTokenizedStrategy` pattern

---

## Smart Contracts

### 1. KineticOctantV2Deployer

**Location**: `contracts/src/octant/KineticOctantV2Deployer.sol`

**Purpose**: Simplifies deployment of Octant V2 yield strategies with PaymentSplitter integration.

**Key Functions**:

```solidity
function deployMorphoStrategy(
    address _morphoVault,
    string memory _strategyName,
    address _paymentSplitter,
    bool _enableBurning
) external returns (address strategyAddress)
```

```solidity
function deploySkyStrategy(
    string memory _strategyName,
    address _paymentSplitter,
    bool _enableBurning
) external returns (address strategyAddress)
```

**State Variables**:
- `morphoFactory`: Address of MorphoCompounderStrategyFactory
- `skyFactory`: Address of SkyCompounderStrategyFactory
- `tokenizedStrategyImplementation`: Address of YieldDonatingTokenizedStrategy
- `userStrategies`: Mapping of user address to their deployed strategies
- `allStrategies`: Array of all deployed strategies

**Events**:
```solidity
event StrategyDeployed(
    address indexed deployer,
    address indexed strategyAddress,
    address indexed donationRecipient,
    ProtocolType protocol,
    string name
);
```

### 2. PaymentSplitter

**Source**: OpenZeppelin Contracts v5.0.2

**Location**: Used via import in deployment scripts

**Purpose**: Receives 100% of yield from Octant V2 strategies and distributes to public goods recipients.

**Key Features**:
- Immutable allocation percentages (set at deployment)
- Pull-based withdrawals for each recipient
- Supports ERC20 tokens and native ETH
- Gas-efficient proportional distribution

**Example Configuration**:
```solidity
address[] memory payees = [
    0x1234...ClimateFund,
    0x5678...OpenSourceDev,
    0xABCD...EducationDAO
];

uint256[] memory shares = [
    5000,  // 50% to Climate Fund
    3000,  // 30% to Open Source Dev
    2000   // 20% to Education DAO
];
```

### 3. Octant V2 Factory Contracts

**MorphoCompounderStrategyFactory**:
- Deploys ERC-4626 vaults that lend assets on Morpho
- Automatically compounds yield
- Configurable `donationAddress` parameter routes 100% yield

**SkyCompounderStrategyFactory**:
- Deploys ERC-4626 vaults for Sky (MakerDAO) savings
- Similar auto-compounding behavior
- Also supports `donationAddress` for yield routing

**YieldDonatingTokenizedStrategy** (ERC-4626):
- Standard vault interface: `deposit()`, `withdraw()`, `redeem()`
- Internal `dragonRouter` sends 100% yield to donation address
- Depositors maintain principal, receive no yield (all donated)

---

## Yield Routing Policy

### Allocation Mechanism

1. **User Deposits**: Users deposit supported assets (USDC, DAI, USDT) into Octant V2 strategy vaults
2. **Yield Generation**: Strategies automatically lend assets on Morpho or Sky protocols
3. **Yield Harvesting**: Compounding occurs automatically via keeper bots
4. **Donation Routing**: 100% of realized yield is sent to `dragonRouter` (PaymentSplitter address)
5. **Distribution**: PaymentSplitter splits funds among recipients based on immutable share allocations

### Percentage Distribution

**Total Yield**: 100% to PaymentSplitter (0% retained by protocol or users)

**PaymentSplitter Allocation** (configurable at deployment):
```
Example Configuration:
- 50% → Climate change mitigation projects
- 30% → Open source software development
- 20% → Education and research initiatives

Total: 100% (10,000 basis points)
```

### Immutability Guarantees

- **PaymentSplitter recipients**: Set at deployment, cannot be changed
- **Share allocations**: Fixed percentages, immutable after deployment
- **Donation address in strategies**: Configured at strategy deployment via KineticOctantV2Deployer
- **Strategy management**: Users retain management rights (deposit/withdraw), but yield routing is locked

### Transparency

All allocations are verifiable on-chain:
- `PaymentSplitter.totalShares()`: Total shares issued
- `PaymentSplitter.shares(address)`: Shares for each recipient
- Events: `PaymentReceived`, `PaymentReleased` track all inflows/outflows
- `KineticOctantV2Deployer.getUserStrategies(address)`: View user's deployed strategies

---

## On-Chain Objectives

### Primary Objective: Perpetual Public Goods Funding

Kinetic creates a **sustainable, perpetual funding mechanism** for verified public goods by:

1. **Leveraging Composability**: Users earn 0% yield but contribute 100% to public goods
2. **No Token Overhead**: Uses existing stablecoins (USDC/DAI/USDT)
3. **Trustless Execution**: Smart contracts enforce allocation, no governance required
4. **Multiple Yield Sources**: Supports Morpho, Sky, and Aave protocols

### Secondary Objectives

- **Incentivizing Public Goods Participation**: Users can deploy strategies supporting causes they care about
- **Rebates for Recipients**: Public goods projects receive ongoing, predictable funding
- **Allocation Transparency**: All yield routing is visible on-chain

---

## Technical Implementation

### Deployment Steps

1. **Deploy PaymentSplitter**:
```bash
forge script script/DeployPaymentSplitterWithProxy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

2. **Deploy KineticOctantV2Deployer**:
```bash
# Set environment variables
export MORPHO_FACTORY_ADDRESS=0x...
export SKY_FACTORY_ADDRESS=0x...
export TOKENIZED_STRATEGY_ADDRESS=0x...

forge script script/DeployOctantV2Deployer.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

3. **Deploy Strategy via KineticOctantV2Deployer**:
```typescript
// Frontend usage
const { deploy } = useDeployOctantV2Strategy();

await deploy({
  protocol: ProtocolType.MORPHO,
  name: 'Kinetic-Morpho-USDC-PublicGoods',
  paymentSplitterAddress: '0x...PaymentSplitter',
  morphoVault: '0x...MorphoVault', // Optional
  enableBurning: false
});
```

### Contract Addresses

**Mainnet (Tenderly Fork)**:
- MorphoCompounderStrategyFactory: `TBD` (set via `VITE_MORPHO_FACTORY_ADDRESS`)
- SkyCompounderStrategyFactory: `TBD` (set via `VITE_SKY_FACTORY_ADDRESS`)
- KineticOctantV2Deployer: `TBD` (set via `VITE_OCTANT_V2_DEPLOYER_ADDRESS`)
- PaymentSplitter: `0xc4AE01295cfAE3DA96b044F1a4284A93837a644C` (example)

---

## Frontend Integration

### Hook: useDeployOctantV2Strategy

**Location**: `frontend/src/hooks/useDeployOctantV2Strategy.ts`

**Usage Example**:
```typescript
import { useDeployOctantV2Strategy } from '@/hooks/useDeployOctantV2Strategy';
import { ProtocolType } from '@/utils/constants';

function DeployStrategyButton() {
  const { deploy, isPending, isSuccess } = useDeployOctantV2Strategy();

  const handleDeploy = async () => {
    await deploy({
      protocol: ProtocolType.MORPHO, // or ProtocolType.SKY
      name: 'My-Public-Goods-Strategy',
      paymentSplitterAddress: '0x...', // Your PaymentSplitter address
      morphoVault: '0x...', // Only for Morpho
      enableBurning: false
    });
  };

  return (
    <button onClick={handleDeploy} disabled={isPending}>
      {isPending ? 'Deploying...' : 'Deploy Strategy'}
    </button>
  );
}
```

---

## Compliance with Octant V2 Prize Requirements

| Requirement | Status | Evidence |
|------------|--------|----------|
| ✅ Use Octant V2 to programmatically allocate yield | **YES** | Uses `MorphoCompounderStrategyFactory` and `SkyCompounderStrategyFactory` with `donationAddress` parameter |
| ✅ Allocate toward on-chain objective | **YES** | Public goods funding via PaymentSplitter contract |
| ✅ Include contracts for yield routing | **YES** | `KineticOctantV2Deployer.sol` + `PaymentSplitter.sol` + Octant V2 factory ABIs |
| ✅ Brief policy description | **YES** | This document (`OCTANT_V2_POLICY.md`) |
| ✅ On-chain mechanisms | **YES** | Allocations (PaymentSplitter shares), Incentives (perpetual funding), Rebates (recipient withdrawals) |

---

## Verification

### Smart Contract Verification

All contracts are verifiable on Etherscan/Tenderly:
```bash
forge verify-contract \
  --chain-id 1 \
  --compiler-version v0.8.28 \
  $CONTRACT_ADDRESS \
  src/octant/KineticOctantV2Deployer.sol:KineticOctantV2Deployer \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Testing Yield Routing

1. Deploy PaymentSplitter with test recipients
2. Deploy Morpho or Sky strategy via KineticOctantV2Deployer
3. Deposit USDC/DAI into strategy vault
4. Wait for yield to accrue
5. Call `release(token, recipient)` on PaymentSplitter
6. Verify recipients receive proportional amounts

---

## References

- **Octant V2 Documentation**: https://docs.v2.octant.build
- **Morpho Protocol**: https://morpho.org
- **Sky (MakerDAO)**: https://sky.money
- **OpenZeppelin PaymentSplitter**: https://docs.openzeppelin.com/contracts/5.x/api/finance#PaymentSplitter

---

## License

MIT License - See project LICENSE file for details

---

**Last Updated**: 2025-01-09
**Author**: Kinetic Team
**Hackathon**: Octant V2 Hackathon 2025
