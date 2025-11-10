# Kinetic 🌟

**Capital in Motion for Public Goods**

Kinetic is a decentralized application that enables users to deploy yield-generating strategies across multiple DeFi protocols, automatically routing all generated yield to public goods projects. Built for the Octant DeFi Hackathon 2025.

**Protocol Integration:**
- **Morpho & Sky:** Integrated via Octant V2 using KineticOctantV2Deployer
- **Aave V3:** Direct integration via custom ERC-4626 vaults with revenue splitting

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://kinetic-dapp.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Problem & Solution

**Problem**: DeFi yields often benefit only individual users, missing opportunities for systematic public goods funding.

**Solution**: Kinetic creates "set it and forget it" yield donation vaults where:
- Users deploy capital to battle-tested DeFi protocols (Morpho, Sky, Aave)
- Generated yield automatically flows to multiple public goods recipients
- Users maintain full control of principal (100% withdrawable)
- Flexible allocation: distribute yield across multiple projects with custom percentages
- Zero additional effort required after setup
- Built on Tenderly Virtual Mainnet for gas-free testing

## ✨ Key Features

### 1. **Protocol Selection**
- Choose between Morpho and Aave protocols
- View estimated APY and protocol information
- Octant V2 integration for seamless yield routing

### 2. **Flexible Recipient Allocation**
- Add multiple public goods recipients
- Allocate yield percentages to each recipient
- Visual allocation bars and validation
- Must total exactly 100%

### 3. **One-Click Deployment**
- Wagmi-powered blockchain integration
- Deploy strategies directly from the UI
- Transaction status tracking with toast notifications
- Error handling with user-friendly messages

### 4. **Real-Time Analytics Dashboard**
- Track Total Value Locked (TVL)
- Monitor yield generated
- Animated counters for engaging UX
- View all deployed strategies

### 5. **Impact Storytelling**
- Visualize real-world impact of donations
- See contribution to open source, environment, community
- Calculate carbon offset equivalent
- Track number of projects supported

### 6. **Social Sharing**
- Share impact on Twitter
- Share on Farcaster
- Copy shareable links
- Pre-formatted impact messages

## 🏗️ Technical Architecture

### Frontend Tech Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.1
- **Styling**: Tailwind CSS v4 + ShadCN UI components
- **Blockchain**: Wagmi v2.19.2 + Viem v2.38.6
- **State Management**: Zustand v5 with localStorage persistence
- **Routing**: React Router v7
- **Data Fetching**: TanStack Query v5
- **Notifications**: Sonner toast library
- **Forms**: React Hook Form + Zod validation

### Smart Contract Architecture

Kinetic uses a **dual-architecture approach** for maximum protocol coverage:

#### 1. Octant V2 Integration (Morpho & Sky)
**Contract**: `KineticOctantV2Deployer.sol`
- **Address**: `0xeD1b3CE69885027814C9046F4d9BC1C69E9Df4f3` (Chain 8)
- **Purpose**: Unified deployer for Morpho and Sky yield-donating strategies
- **Features**:
  - Deploys strategies via Octant V2 factories
  - Routes 100% of generated yield to PaymentSplitter
  - Tracks all user deployments on-chain
  - Users retain full management, keeper, and emergency admin roles

**Integrated Factories:**
- **Morpho Compounder**: `0xD09f14DD0a0ec20CAC1eD7b2Fd5A68f440C5903D`
- **Sky Compounder**: `0x925E81cA08220cc31554981E5baeE6B57270cbEb`

#### 2. Aave V3 Integration (Custom)
**Contracts**: Custom ERC-4626 vault system
- **ATokenVault.sol**: Full ERC-4626 implementation with upgradeable pattern
- **AaveVaultProxyDeployer**: `0x8901773847fF722b9AD70848B0BfF5103f97309F` (Chain 8)
- **Purpose**: Deploy lightweight vault proxies for Aave V3
- **Features**:
  - Configurable fee on yield (0-100%)
  - Revenue splitting to public goods
  - Upgradeable via OpenZeppelin proxy pattern
  - Meta-transaction support

**Aave V3 Protocol Addresses:**
- **Pool**: `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`
- **PoolAddressesProvider**: `0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e`

#### 3. Payment Distribution System
**PaymentSplitter.sol** (Based on OpenZeppelin, adapted by Golem Foundation)
- **Address**: `0xc4AE01295cfAE3DA96b044F1a4284A93837a644C` (Chain 8)
- **Factory**: `0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496` (Chain 8)
- **Features**:
  - Multi-recipient yield distribution
  - Support for ETH and all ERC20 tokens
  - Pull payment model (recipients claim their share)
  - Proportional share allocation
  - Immutable recipient configuration per splitter
  - Automatic share calculation

**PaymentSplitterFactory.sol**
- Deploys minimal clones for gas efficiency
- Validates 100% allocation requirement
- Tracks all user-deployed splitters

### Project Structure
```
Kinetic/
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ProtocolSelector.tsx # Protocol selection UI
│   │   │   ├── RecipientForm.tsx    # Multi-recipient form
│   │   │   ├── DeployButton.tsx     # Strategy deployment (18K lines)
│   │   │   ├── YieldCounter.tsx     # Animated yield display
│   │   │   ├── ImpactStories.tsx    # Impact visualization
│   │   │   ├── ShareButton.tsx      # Social sharing
│   │   │   ├── AaveVaultDashboard.tsx    # Aave vault management
│   │   │   ├── MorphoDashboard.tsx       # Morpho strategy management
│   │   │   ├── PaymentSplitterDashboard.tsx # Splitter UI
│   │   │   └── ui/                  # ShadCN UI components
│   │   ├── pages/                   # Route pages
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Deploy.tsx           # Strategy deployment
│   │   │   ├── Dashboard.tsx        # User dashboard
│   │   │   ├── StrategyDetail.tsx   # Strategy details
│   │   │   └── About.tsx            # About page
│   │   ├── hooks/                   # Custom React hooks (20 hooks)
│   │   │   ├── useDeployOctantV2Strategy.ts  # Morpho/Sky deployment
│   │   │   ├── useDeployAaveVault.ts         # Aave vault deployment
│   │   │   ├── useUserStrategies.ts          # Fetch Morpho strategies
│   │   │   ├── useUserAaveVaults.ts          # Fetch Aave vaults
│   │   │   ├── usePaymentSplitter.ts         # Payment splitter ops
│   │   │   └── useAggregatedStrategyData.ts  # Aggregate all data
│   │   ├── config/                  # Configuration
│   │   │   └── wagmi.ts             # Wagmi blockchain config
│   │   ├── utils/                   # Utilities
│   │   │   ├── constants.ts         # Contract addresses & config
│   │   │   └── formatters.ts        # Number/date formatting
│   │   ├── abis/                    # Smart contract ABIs (15 files)
│   │   │   ├── KineticOctantV2Deployer.json
│   │   │   ├── AaveVaultProxyDeployer.json
│   │   │   ├── PaymentSplitter.json
│   │   │   └── ...
│   │   ├── store.ts                 # Zustand global state
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── contracts/                       # Foundry smart contracts
│   ├── src/
│   │   ├── KineticOctantV2Deployer.sol      # Octant V2 deployer
│   │   ├── PaymentSplitter.sol              # Yield distribution
│   │   ├── PaymentSplitterFactory.sol       # Splitter factory
│   │   ├── aave/                            # Aave integration
│   │   │   ├── ATokenVault.sol              # ERC-4626 vault
│   │   │   ├── AaveVaultProxyDeployer.sol   # Proxy deployer
│   │   │   └── ...
│   │   └── morpho/adapters/
│   │       └── PaymentSplitterYieldAdapter.sol # Morpho V2 adapter
│   ├── scripts/                     # Deployment scripts (8 scripts)
│   ├── test/                        # Contract tests (3 test files)
│   └── foundry.toml                 # Foundry configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **Package Manager**: Yarn v1.22+ (recommended) or npm
- **Web3 Wallet**: MetaMask, Rainbow, or any injected wallet
- **Foundry**: (Optional) For smart contract development

### Frontend Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/Kinetic.git
cd Kinetic/frontend
```

2. **Install dependencies**:
```bash
yarn install
# or
npm install
```

3. **Configure environment variables** (Optional):

Create a `.env` file in the `frontend/` directory:

```env
# Tenderly RPC (default is already configured)
VITE_TENDERLY_RPC=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_TENDERLY_ID

# Chain 8 RPC (Tenderly Virtual Mainnet)
VITE_CHAIN_8_RPC=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_TENDERLY_ID

# Contract Addresses (pre-configured, override if needed)
VITE_PAYMENT_SPLITTER_ADDRESS=0xc4AE01295cfAE3DA96b044F1a4284A93837a644C
VITE_PAYMENT_SPLITTER_FACTORY_ADDRESS=0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496
VITE_OCTANT_V2_DEPLOYER=0xeD1b3CE69885027814C9046F4d9BC1C69E9Df4f3
VITE_AAVE_VAULT_PROXY_DEPLOYER=0x8901773847fF722b9AD70848B0BfF5103f97309F
VITE_MORPHO_FACTORY=0xD09f14DD0a0ec20CAC1eD7b2Fd5A68f440C5903D
VITE_SKY_FACTORY=0x925E81cA08220cc31554981E5baeE6B57270cbEb

# Optional: Override token addresses
# VITE_AAVE_POOL_ADDRESS=0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
```

> **Note**: The app works out-of-the-box without a `.env` file. All critical addresses are pre-configured in `src/utils/constants.ts`.

4. **Start the development server**:
```bash
yarn dev
# or
npm run dev
```

5. **Open the app**:
Navigate to http://localhost:5173 (or the port shown in your terminal)

### Network Configuration

**Supported Networks:**
- **Chain 8** (Tenderly Virtual Mainnet) - **Primary deployment** 🎯
  - All contracts deployed here
  - Gas-free testing environment
  - Mainnet fork with full state
- **Mainnet** (via Tenderly RPC)
- **Sepolia** (testnet)
- **Base** & **Base Sepolia**

**Default Configuration:**
- **Primary Chain**: Tenderly Virtual Mainnet (Chain 8)
- **RPC**: `https://virtual.mainnet.eu.rpc.tenderly.co/...` (Tenderly fork)
- **Explorer**: Tenderly Dashboard
- **Gas**: Free (virtual testnet)

### Smart Contract Development (Optional)

If you want to deploy or modify contracts:

1. **Navigate to contracts directory**:
```bash
cd ../contracts
```

2. **Install Foundry dependencies**:
```bash
forge install
```

3. **Compile contracts**:
```bash
forge build
```

4. **Run tests**:
```bash
forge test
```

5. **Deploy contracts** (see deployment scripts in `scripts/`):
```bash
forge script script/DeployPaymentSplitterFactory.s.sol --rpc-url YOUR_RPC_URL --broadcast
```

## 📖 User Guide

### Deploying a Strategy

1. **Connect Wallet**: Click connect in the navigation bar
2. **Select Protocol**: Choose Morpho or Aave on the Deploy page
3. **Add Recipients**:
   - Enter recipient name, address, and allocation percentage
   - Add multiple recipients (must total 100%)
4. **Deploy**: Click "Deploy Strategy" and confirm transaction via Octant V2
5. **Track**: View your strategy on the Dashboard

### Viewing Impact

Navigate to the Dashboard to see:
- Total value locked across your strategies
- Yield generated and donated
- Impact stories showing real-world effects
- Recipient breakdown with visual allocations
- Share buttons to showcase your impact

## 🎯 Hackathon Tracks

Kinetic targets three Octant DeFi Hackathon tracks:

### 1. Best Use of Yield Donating Strategy ($4,000) ✅
**Implementation:**
- **Full Octant V2 Integration**: `KineticOctantV2Deployer` contract (`0xeD1b3C...`) deployed
- **Morpho & Sky Support**: Integrated via Octant V2 Compounder Factories
- **Aave V3 Integration**: Custom ERC-4626 vaults with revenue splitting
- **100% Yield Routing**: All generated yield flows to `PaymentSplitter` smart contract
- **Multi-Protocol Coverage**: Supports 3 major DeFi protocols (Morpho, Sky, Aave)

**Technical Highlights:**
- On-chain strategy tracking with `getUserStrategies()` and `getTotalStrategies()`
- Users maintain full control: management, keeper, and emergency admin roles
- ERC-4626 standard compliance for maximum composability
- Upgradeable vault pattern with OpenZeppelin proxies

### 2. Best Public Goods Projects ($3,000) ✅
**Implementation:**
- **Perpetual Funding Model**: "Capital in motion" - principal stays, yield flows forever
- **Multi-Recipient Support**: Distribute yield across multiple projects (custom %)
- **Impact Visualization**: Real-time impact stories with carbon offset calculations
- **Transparency**: All transactions on-chain, fully auditable
- **Social Amplification**: Twitter & Farcaster sharing to inspire others

**User Experience:**
- Animated yield counters showing real-time impact
- Impact storytelling: "Your yield funded X projects, offset Y tons of CO2"
- One-click social sharing of impact achievements
- Public dashboard to showcase contributions

### 3. Most Creative Use of Octant v2 ($1,500) ✅
**Novel Innovations:**
- **Unified Deployer Pattern**: Single contract abstracts complexity of multiple protocols
- **Dual Architecture**: Octant V2 for Morpho/Sky, custom contracts for Aave
- **Set-and-Forget UX**: Deploy once, yield flows automatically forever
- **Flexible Allocation**: Custom yield distribution across multiple recipients
- **Gas-Free Testing**: Built on Tenderly Virtual Mainnet for barrier-free onboarding
- **20+ Custom Hooks**: Comprehensive blockchain integration with Wagmi/Viem

**User-Centric Design:**
- Non-technical users can deploy strategies in 3 clicks
- No ongoing management required
- Automatic yield harvesting and distribution
- Visual allocation bars with real-time validation

## 🔮 Future Enhancements

### Phase 2: Advanced Features
- [ ] Multi-recipient smart contract splitter
- [ ] Automatic rebalancing across protocols
- [ ] Historical yield tracking
- [ ] Recipient verification system
- [ ] DAO governance for recipient selection

### Phase 3: Ecosystem Integration
- [ ] Integration with Gitcoin Grants
- [ ] ENS resolution for recipient addresses
- [ ] NFT certificates for milestone achievements
- [ ] Cross-chain support

## 🛡️ Security Considerations

**Smart Contract Security:**
- ✅ Based on audited OpenZeppelin contracts (PaymentSplitter, ERC-4626, Upgradeable)
- ✅ Minimal clone pattern for gas-efficient deployment (ERC-1167)
- ✅ No admin backdoors - users maintain full control of strategies
- ✅ Non-custodial design - Kinetic never holds user funds
- ✅ Immutable recipient configuration per PaymentSplitter (no rug-pull risk)
- ✅ Pull payment model - recipients claim their share (no push risk)
- ✅ Comprehensive unit tests with Foundry
- ⚠️ **Not production-audited** - use at your own risk on testnet only

**Frontend Security:**
- ✅ Address validation for all recipient inputs
- ✅ Percentage allocation validation (must total 100%)
- ✅ Transaction simulation before execution (via Tenderly)
- ✅ User confirmation required for all blockchain interactions
- ✅ Input sanitization with Zod validation
- ✅ Error boundaries for graceful failure handling
- ✅ No private key handling - uses injected wallet connectors

**Deployment Considerations:**
- Currently deployed on **Tenderly Virtual Mainnet** (Chain 8)
- Mainnet fork with full state - **not** real mainnet
- For testnet/hackathon purposes only
- Before mainnet deployment: professional audit required

## 📝 License

This project is licensed under the MIT License. Built on the Octant v2 protocol and inspired by the Golem Foundation's vision for decentralized public goods funding.

**Key Components & Licenses:**
- **Frontend**: MIT License
- **Smart Contracts**: MIT License (PaymentSplitter based on OpenZeppelin)
- **Octant V2 Protocol**: Golem Foundation
- **Dependencies**: See individual package licenses

## 🙏 Acknowledgments

**Protocols & Infrastructure:**
- **Octant Team** - For the groundbreaking V2 protocol and comprehensive developer resources
- **Morpho Labs** - For innovative yield optimization infrastructure
- **Aave** - For the battle-tested lending protocol
- **Tenderly** - For the powerful virtual testnet infrastructure
- **Golem Foundation** - For the PaymentSplitter contract and public goods vision

**Developer Tools:**
- **Wagmi & Viem** - For best-in-class Web3 React hooks
- **ShadCN UI** - For beautiful, accessible UI components
- **Foundry** - For fast and reliable smart contract development
- **Vercel** - For seamless frontend deployment

**Open Source:**
- **OpenZeppelin** - For audited contract libraries
- **TanStack Query** - For powerful data synchronization
- **Zustand** - For elegant state management

## 📊 Technical Specifications

### Performance Metrics
- **Bundle Size**: Optimized with Vite 6 and tree-shaking
- **Build Time**: ~30 seconds (frontend)
- **Contract Deployment Gas**: ~2-5M gas per strategy deployment
- **Supported Tokens**: USDC, DAI, USDT, aUSDC (extensible)

### Testing Coverage
- **Smart Contracts**: Foundry unit tests (3 test files)
- **Frontend**: React components with TypeScript strict mode
- **Integration**: Manual testing on Tenderly Virtual Mainnet

### Browser Support
- Chrome/Brave (recommended)
- Firefox
- Safari (partial)
- Edge

### Wallet Support
- MetaMask ✅
- Rainbow Wallet ✅
- Coinbase Wallet ✅
- WalletConnect ⚠️ (requires project ID configuration)
- Any injected Web3 wallet ✅

## 📞 Contact & Links

- **Live Demo**: https://kinetic-dapp.vercel.app *(or update with your actual URL)*
- **GitHub Repository**: https://github.com/yourusername/Kinetic *(update with actual repo)*
- **Documentation**: See this README
- **Octant V2 Docs**: https://docs.v2.octant.build/
- **Octant V2 SDK**: https://github.com/golemfoundation/octant-v2-sdk
- **Hackathon Details**: https://octant.devfolio.co/

### Deployed Contracts (Chain 8 - Tenderly Virtual Mainnet)
- **KineticOctantV2Deployer**: [`0xeD1b3CE69885027814C9046F4d9BC1C69E9Df4f3`](https://dashboard.tenderly.co/explorer/vnet/8)
- **PaymentSplitterFactory**: [`0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496`](https://dashboard.tenderly.co/explorer/vnet/8)
- **AaveVaultProxyDeployer**: [`0x8901773847fF722b9AD70848B0BfF5103f97309F`](https://dashboard.tenderly.co/explorer/vnet/8)

### Support & Community
For questions, issues, or contributions:
- Open an issue on GitHub
- Join the Octant Discord
- Tag us on Twitter/X

---

**Built with ❤️ for the Octant DeFi Hackathon 2025**

*Kinetic - Putting capital in motion for public goods* 🌟
