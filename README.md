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
Pre-configured ABIs for Octant v2 integration:
- **MorphoCompounderStrategyFactory** - Factory for Morpho yield strategies
- **SkyCompounderStrategyFactory** - Factory for Sky protocol strategies
- **AaveATokenVault** - Aave v3 ERC-4626 vault for lending yields
- **YieldDonatingTokenizedStrategy** - Automated yield donation contract

All ABIs are located in `src/abis/` and ready to import:
```typescript
import MorphoABI from '@/abis/MorphoCompounderStrategyFactory.json';
import SkyABI from '@/abis/SkyCompounderStrategyFactory.json';
import AaveABI from '@/abis/AaveATokenVault.json';
import YieldABI from '@/abis/YieldDonatingTokenizedStrategy.json';
```

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
