## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation
```bash
git clone https://github.com/golemfoundation/octant-v2-hackathon-dapp-boilerplate.git
cd octant-v2-hackathon-dapp-boilerplate
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see your app.


# Kinetic - Multi-Protocol Yield Routing for Public Goods

Kinetic is a DeFi platform that routes 100% of yield from multiple protocols (Morpho, Sky, Aave) to verified public goods recipients via trustless smart contracts.

**Hackathon Tracks:**
- ✅ **Morpho Vaults V2 Prize ($1,500)** - Custom adapter with role model, ERC-4626 compliance, tests, deployments, and runbook
- ✅ **Octant V2 Public Goods Innovation ($1,500)** - Programmatic yield allocation using MorphoCompounderStrategyFactory and SkyCompounderStrategyFactory
- ✅ **Best Use of Aave v3 ($2,500)** - ERC-4626 vaults for reliable stablecoin yields

**Prize Documentation:**
- Morpho Vaults V2: [MORPHO_V2_SUBMISSION.md](./MORPHO_V2_SUBMISSION.md) | [MORPHO_VAULT_RUNBOOK.md](./MORPHO_VAULT_RUNBOOK.md)
- Octant V2: [OCTANT_V2_POLICY.md](./OCTANT_V2_POLICY.md)
- Aave v3: See Aave Integration section below

---

## What's Included

### Core Stack
- **React 19** - Latest React with improved performance
- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Type safety for better DX
- **Tailwind CSS v4** - Utility-first styling
- **React Router v7** - Modern client-side routing

### State & Forms
- **Zustand** - Lightweight state management (see `src/store.js`)
- **React Hook Form** - Performant form validation
- **Zod** - Schema validation

### UI Components
- **ShadCN UI** - High-quality, accessible components (17 ready-to-use components)
  - Pre-configured in `src/components/ui/`
  - Avatar, Badge, Button, Card, Checkbox, Dialog, Dropdown Menu, Form, Input, Label, Select, Separator, Skeleton, Switch, Tabs, Tooltip, Toaster
  - **All components visible on homepage** with interactive demos!
- **Lucide React** - Beautiful icon library (1000+ icons)
- **Sonner** - Toast notifications

### Design System
- **Dark Theme** - Custom Octant dark theme with `#0d0d0d` background
- **Arcane Fable Font** - Beautiful custom font for headings
- **Optimized Colors** - Carefully selected palette for accessibility and readability

### Smart Contract ABIs
Pre-configured ABIs for Octant v2 and multi-protocol integration:
- **KineticOctantV2Deployer** - Wrapper for deploying Morpho/Sky strategies
- **MorphoCompounderStrategyFactory** - Factory for Morpho yield strategies
- **SkyCompounderStrategyFactory** - Factory for Sky protocol strategies
- **AaveATokenVault** - Aave v3 ERC-4626 vault for lending yields
- **YieldDonatingTokenizedStrategy** - Automated yield donation contract
- **PaymentSplitter** - OpenZeppelin contract for recipient distribution

All ABIs are located in `src/abis/` and ready to import:
```typescript
import KineticOctantV2DeployerABI from '@/abis/KineticOctantV2Deployer.json';
import MorphoABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyABI from '@/abis/SkyCompounderStrategyFactory.json';
import AaveABI from '@/abis/AaveATokenVault.json';
import YieldABI from '@/abis/YieldDonatingTokenizedStrategy.json';
```

---

## Octant V2 Integration

Kinetic integrates **Octant V2** to enable programmatic yield allocation toward public goods funding. This integration targets the **"Octant V2 Hackathon"** prize track ($2,000).

### Features
- **Multi-Protocol Support**: Deploy yield strategies on Morpho or Sky protocols
- **100% Yield Donation**: All realized yield routes to PaymentSplitter contract
- **Trustless Execution**: Smart contracts enforce allocation, no governance required
- **Transparent Allocations**: All yield routing is verifiable on-chain
- **Perpetual Funding**: Creates sustainable, ongoing revenue for public goods

### How It Works
1. User deploys a strategy via `KineticOctantV2Deployer` contract
2. Chooses Morpho (lending markets) or Sky (MakerDAO savings)
3. Strategy auto-compounds yield while routing 100% to donation address
4. PaymentSplitter receives yield and distributes to verified recipients
5. Recipients can claim their proportional share anytime

### Technical Architecture

#### System Overview
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Kinetic Platform                                  │
│                   Perpetual Public Goods Funding Engine                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐                                    ┌──────────────────────┐
│   User/DAO   │◄───────── Dashboard ──────────────►│   Frontend (React)   │
│              │        Real-time Metrics            │   - Deploy UI        │
│  (Depositor) │        Yield Tracking               │   - Strategy Monitor │
└──────┬───────┘        Impact Stories               └──────────┬───────────┘
       │                                                         │
       │ 1. Choose Protocol                                     │
       │ 2. Set Recipients                          ┌───────────▼────────────┐
       │ 3. Deploy Strategy                         │  Web3 Hooks (wagmi)    │
       │                                            │  - useDeployStrategy   │
       └────────────────────────────────────────────┤  - useStrategyData     │
                                                    │  - usePaymentSplitter  │
                                                    └───────────┬────────────┘
                                                                │
                      ┌─────────────────────────────────────────▼──────────────┐
                      │         Smart Contract Layer (Ethereum/Base)           │
                      └─────────────────────────────────────────┬──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Multi-Protocol Architecture                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │           KineticOctantV2Deployer (Entry Point)                      │  │
│  │  - deployMorphoStrategy(name, paymentSplitter, enableBurning)        │  │
│  │  - deploySkyStrategy(name, paymentSplitter, enableBurning)           │  │
│  │  - Tracks all user strategies on-chain                               │  │
│  └───┬────────────────────────────────┬────────────────────────────┬────┘  │
│      │                                │                            │        │
│      │ Protocol 1                     │ Protocol 2                 │ Aave   │
│      ▼                                ▼                            ▼        │
│  ┌────────────────────┐      ┌────────────────────┐      ┌──────────────┐  │
│  │  Morpho Factory    │      │   Sky Factory      │      │ Aave Factory │  │
│  │  (Octant V2)       │      │   (Octant V2)      │      │  (Kinetic)   │  │
│  │                    │      │                    │      │              │  │
│  │  Creates:          │      │  Creates:          │      │  Creates:    │  │
│  │  Morpho Vault      │      │  Sky Vault         │      │  Aave Vault  │  │
│  │  (ERC-4626)        │      │  (ERC-4626)        │      │  (ERC-4626)  │  │
│  └────────┬───────────┘      └────────┬───────────┘      └──────┬───────┘  │
│           │                           │                         │           │
│           │                           │                         │           │
│           └───────────────┬───────────┴─────────────────────────┘           │
│                           │                                                 │
│                           ▼                                                 │
│              ┌─────────────────────────────┐                               │
│              │  Yield Strategies (ERC-4626)│                               │
│              │  - deposit(assets)          │                               │
│              │  - withdraw(assets)         │                               │
│              │  - totalAssets()            │                               │
│              │  - Auto-compound yields     │                               │
│              │  - 100% yield → Donation    │                               │
│              └──────────┬──────────────────┘                               │
│                         │                                                   │
│                         │ Automated Yield Transfer                          │
│                         ▼                                                   │
│              ┌─────────────────────────────┐                               │
│              │    PaymentSplitter          │                               │
│              │    (Public Goods Fund)      │                               │
│              │                             │                               │
│              │  - Receives 100% yield      │                               │
│              │  - Proportional distribution│                               │
│              │  - release(recipient)       │                               │
│              │  - Gas-efficient claims     │                               │
│              └──────────┬──────────────────┘                               │
│                         │                                                   │
│                         │ Claimable Funds                                   │
│                         ▼                                                   │
│              ┌─────────────────────────────┐                               │
│              │  Public Goods Recipients    │                               │
│              │                             │                               │
│              │  • Climate DAOs (40%)       │                               │
│              │  • Open Source Devs (30%)   │                               │
│              │  • Education (20%)          │                               │
│              │  • Healthcare (10%)         │                               │
│              │                             │                               │
│              │  Each claims their share    │                               │
│              └─────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          Yield Flow (Example)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Day 0:  User deposits 10,000 USDC                                          │
│          → Strategy holds 10,000 USDC                                       │
│          → Principal stays in vault                                         │
│                                                                             │
│  Day 30: Strategy generates 50 USDC yield (5% APY)                          │
│          → 50 USDC automatically sent to PaymentSplitter                    │
│          → Principal still 10,000 USDC (withdrawable anytime)               │
│                                                                             │
│  Recipients can claim their portions:                                       │
│          → Climate DAO claims: 20 USDC (40%)                                │
│          → Open Source claims: 15 USDC (30%)                                │
│          → Education claims: 10 USDC (20%)                                  │
│          → Healthcare claims: 5 USDC (10%)                                  │
│                                                                             │
│  Day 60: 50 USDC more yield → Repeat                                        │
│          Principal always withdrawable, yield perpetually donated           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

#### Key Security Features
- ✅ **Non-Custodial**: Users retain full control of principal
- ✅ **Transparent**: All yield routing is on-chain and verifiable
- ✅ **Trustless**: Smart contracts enforce allocations automatically
- ✅ **Upgradeable**: PaymentSplitter uses proxy pattern for improvements
- ✅ **Battle-Tested**: Built on Aave, Morpho, and OpenZeppelin contracts
- ✅ **Audited Protocols**: Leverages Octant V2's audited factory pattern

### Smart Contracts
- **KineticOctantV2Deployer**: `contracts/src/octant/KineticOctantV2Deployer.sol`
- **Deployment Script**: `contracts/script/DeployOctantV2Deployer.s.sol`
- **Policy Documentation**: [OCTANT_V2_POLICY.md](./OCTANT_V2_POLICY.md)

### Frontend Hooks
- **useDeployOctantV2Strategy**: Deploy Morpho or Sky strategies
- **usePaymentSplitter**: Interact with PaymentSplitter contract

### Deployment Instructions

1. **Deploy PaymentSplitter** (if not already deployed):
```bash
cd contracts
forge script script/DeployPaymentSplitterWithProxy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

2. **Set environment variables**:
```bash
# Add to contracts/.env
MORPHO_FACTORY_ADDRESS=0x...  # Octant V2 Morpho factory
SKY_FACTORY_ADDRESS=0x...     # Octant V2 Sky factory
TOKENIZED_STRATEGY_ADDRESS=0x...  # YieldDonatingTokenizedStrategy implementation
```

3. **Deploy KineticOctantV2Deployer**:
```bash
forge script script/DeployOctantV2Deployer.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

4. **Update frontend .env**:
```bash
# Add to frontend/.env
VITE_OCTANT_V2_DEPLOYER_ADDRESS=<deployed_address>
VITE_MORPHO_FACTORY_ADDRESS=<morpho_factory>
VITE_SKY_FACTORY_ADDRESS=<sky_factory>
```

5. **Deploy a strategy from the frontend**:
```typescript
import { useDeployOctantV2Strategy } from '@/hooks/useDeployOctantV2Strategy';
import { ProtocolType } from '@/utils/constants';

const { deploy } = useDeployOctantV2Strategy();

await deploy({
  protocol: ProtocolType.MORPHO,  // or ProtocolType.SKY
  name: 'Kinetic-Morpho-USDC-PublicGoods',
  paymentSplitterAddress: '0x...',
  morphoVault: '0x...',  // Only for Morpho
  enableBurning: false
});
```

---

## Aave v3 Integration

Kinetic now supports **Aave v3** as a third protocol option for generating yield to fund public goods. This integration targets the **"Best Use of Aave v3"** hackathon track ($2,500 prize).

### Features
- **ERC-4626 Compliant**: Uses Aave's standardized ATokenVault interface
- **Multi-Protocol Support**: Deploy strategies across Morpho, Sky, and Aave v3
- **Battle-Tested Security**: Leverages Aave's $8B+ TVL and audited contracts
- **Reliable Yields**: 4-6% APY on stablecoins (USDC, DAI, USDT)

### How It Works
1. Users select Aave as their yield source
2. Vault deposits assets into Aave v3 lending pools
3. Earns lending APY (4-6% on stablecoins)
4. 100% of yield automatically routes to public goods recipients
5. Principal remains in Aave, can be withdrawn anytime

### Technical Details
- **Aave v3 Pool Address**: `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` (Mainnet)
- **Supported Assets**: USDC, DAI, USDT
- **Interface**: ERC-4626 compliant for composability
- **Gas Optimized**: Efficient recipient distribution

---

## Morpho Vaults V2 Frontend Integration

The frontend includes a complete dashboard for interacting with the Morpho Vaults V2 adapter.

### Features
- **Real-time Metrics**: View total assets, principal, and yield donated
- **Market Monitoring**: Track all active ERC-4626 vault allocations
- **Yield Harvesting**: One-click harvest of available yield from any market
- **High-Watermark Display**: See principal protection in action
- **Transparent Tracking**: All data fetched directly from on-chain contracts

### Frontend Components

#### MorphoDashboard Component
Location: `frontend/src/components/MorphoDashboard.tsx`

Displays:
- Total assets across all markets
- Total principal deposited (protected amount)
- Total yield donated to public goods
- Yield vs principal ratio
- Active market cards with harvest buttons
- Contract addresses for verification

#### useMorphoAdapter Hook
Location: `frontend/src/hooks/useMorphoAdapter.ts`

Provides:
- **Read Functions**:
  - `marketCount` - Number of active markets
  - `totalPrincipal` - Total protected deposits
  - `totalYieldDonated` - Cumulative yield sent to public goods
  - `realAssets` - Current total value including unrealized yield
  - `getAllocation(marketId)` - Details for specific market
  - `getHarvestableYield(marketId)` - Claimable yield amount

- **Write Functions**:
  - `allocate({ vault, marketId, assets })` - Deposit to market
  - `deallocate({ vault, marketId, assets, maxSlippage })` - Withdraw from market
  - `harvestYield(marketId)` - Claim yield and send to PaymentSplitter

### Accessing the Dashboard

1. Navigate to `/morpho-vault` in the app or click "Morpho Vault" in the navigation
2. Connect your wallet
3. View adapter metrics and active markets
4. Harvest yield with one click when available

### Configuration

Add to `frontend/.env`:
```bash
# Deployed PaymentSplitterYieldAdapter address
VITE_MORPHO_ADAPTER_ADDRESS=0x...

# Deployed Morpho VaultV2 address
VITE_MORPHO_VAULT_ADDRESS=0x...
```

Deploy contracts using:
```bash
cd contracts
forge script script/DeployMorphoVaultV2.s.sol --rpc-url $RPC_URL --broadcast --verify
```

---

## Project Structure

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
