# ImpactVault 🌟

**Deploy & Track DeFi Yield for Public Goods**

ImpactVault is a decentralized application that enables users to deploy yield-generating strategies on Morpho and Sky protocols, automatically routing all generated yield to public goods projects. Built for the Octant DeFi Hackathon 2025.

## 🎯 Problem & Solution

**Problem**: DeFi yields often benefit only individual users, missing opportunities for systematic public goods funding.

**Solution**: ImpactVault creates "set it and forget it" yield donation vaults where:
- Users deploy capital to battle-tested DeFi protocols (Morpho/Sky)
- Generated yield automatically flows to selected public goods
- Users maintain full control of principal
- Zero additional effort required after setup

## ✨ Key Features

### 1. **Protocol Selection**
- Choose between Morpho and Sky protocols
- View estimated APY and protocol information
- One-click protocol switching

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

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Blockchain**: Wagmi v2+ (Ethereum interactions)
- **State Management**: Zustand
- **UI Components**: ShadCN UI
- **Routing**: React Router v7
- **Notifications**: Sonner

### Smart Contracts
ImpactVault integrates with three core Octant v2 contracts:

1. **MorphoCompounderStrategyFactory** - Deploy Morpho yield strategies
2. **SkyCompounderStrategyFactory** - Deploy Sky protocol strategies
3. **YieldDonatingTokenizedStrategy** - ERC-4626 vaults with yield donation

### Project Structure
```
src/
├── components/          # React components
│   ├── ProtocolSelector.tsx
│   ├── RecipientForm.tsx
│   ├── DeployButton.tsx
│   ├── YieldCounter.tsx
│   ├── RecipientList.tsx
│   ├── ImpactStories.tsx
│   └── ShareButton.tsx
├── pages/              # Route pages
│   ├── Home.tsx
│   ├── Deploy.tsx
│   ├── Dashboard.tsx
│   └── StrategyDetail.tsx
├── hooks/              # Custom React hooks
│   ├── useDeployStrategy.ts
│   └── useStrategyData.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   └── formatters.ts
├── abis/               # Smart contract ABIs
│   ├── MorphoCompounderStrategyFactory.json
│   ├── SkyCompounderStrategyFactory.json
│   └── YieldDonatingTokenizedStrategy.json
└── store.ts            # Zustand store
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn or npm
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/golemfoundation/octant-v2-hackathon-dapp-boilerplate.git
cd octant-v2-hackathon-dapp-boilerplate
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

4. Open http://localhost:5174 in your browser

### Environment Setup
The app is pre-configured for Ethereum Mainnet using Tenderly RPC:
- Chain ID: 1
- RPC: https://virtual.mainnet.eu.rpc.tenderly.co/82c86106-662e-4d7f-a974-c3119873873

## 📖 User Guide

### Deploying a Strategy

1. **Connect Wallet**: Click connect in the navigation bar
2. **Select Protocol**: Choose Morpho or Sky on the Deploy page
3. **Add Recipients**:
   - Enter recipient name, address, and allocation percentage
   - Add multiple recipients (must total 100%)
4. **Deploy**: Click "Deploy Strategy" and confirm transaction
5. **Track**: View your strategy on the Dashboard

### Viewing Impact

Navigate to the Dashboard to see:
- Total value locked across your strategies
- Yield generated and donated
- Impact stories showing real-world effects
- Recipient breakdown with visual allocations
- Share buttons to showcase your impact

## 🎯 Hackathon Tracks

ImpactVault targets three Octant DeFi Hackathon tracks:

### 1. Best Use of Yield Donating Strategy ($4,000)
- Full integration with YieldDonatingTokenizedStrategy contract
- Supports both Morpho and Sky protocols
- Automated yield routing to public goods

### 2. Best Public Goods Projects ($3,000)
- Focus on systematic public goods funding
- Impact storytelling and transparency
- Social sharing to inspire others

### 3. Most Creative Use of Octant v2 ($1,500)
- Novel "passive philanthropy" concept
- Gamified impact visualization
- Seamless UX for non-technical users

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

- Address validation for all recipient inputs
- Transaction simulation before execution
- User confirmation for all blockchain interactions
- Error boundaries for graceful failure handling
- Input sanitization and validation

## 📝 License

This project is built on the Octant v2 Hackathon Boilerplate.

## 🙏 Acknowledgments

- Octant team for the excellent boilerplate and protocol
- Morpho and Sky protocols for yield infrastructure
- ShadCN for beautiful UI components
- Wagmi team for blockchain integration tools

## 📞 Contact & Links

- **Demo**: [Coming Soon]
- **GitHub**: https://github.com/golemfoundation/octant-v2-hackathon-dapp-boilerplate
- **Octant Docs**: https://docs.v2.octant.build/

---

Built with ❤️ for the Octant DeFi Hackathon 2025
