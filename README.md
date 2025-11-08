# ⚡ Kinetic

**Capital in motion for public goods**

Deploy yield-generating DeFi strategies that fund Ethereum's most impactful projects perpetually. Set it once, impact forever.

Built for **Octant DeFi Hackathon 2025** | Powered by **Morpho • Sky • Aave v3**

---

## What is Kinetic?

Kinetic transforms idle treasury assets into perpetual funding engines for public goods. Deploy yield strategies in 3 clicks, never touch them again, and fund Ethereum builders forever.

**Key Features:**
- 🎯 **3-Click Deployment** - Select protocol → Add recipients → Deploy
- 💰 **Multi-Protocol Support** - Choose from Morpho (~5-8% APY), Sky (~4-6% APY), or Aave v3 (~4-6% APY)
- 📊 **Real-Time Tracking** - Watch yield accumulate and see exactly how much you're funding
- 🔒 **Zero Principal Loss** - Only yields are donated, your capital stays safe
- ⚡ **Perpetual Impact** - Set once, fund public goods forever

## Quick Start

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

```
src/
├── abis/                # Smart contract ABIs
│   ├── MorphoCompounderStrategyFactory.json
│   ├── SkyCompounderStrategyFactory.json
│   └── YieldDonatingTokenizedStrategy.json
├── components/
│   └── ui/              # ShadCN UI components
├── pages/               # Your app pages/routes
│   ├── About.tsx
│   └── [add more here]
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
├── store.ts             # Zustand global state
├── App.tsx              # Routes and app shell
└── main.tsx             # App entry point
```

## Development Guide

### Exploring Components
The homepage displays all 17 pre-built components:
- Interactive demos you can test immediately
- See how each component looks and behaves
- All components are styled for the dark theme

### Adding New Pages
1. Create a new file in `src/pages/` (e.g., `Dashboard.tsx`)
2. Add route in `src/App.tsx`:
```tsx
<Route path="dashboard" element={<Dashboard />} />
```

### Using Zustand State
```tsx
import { useCounterStore } from '@/store';

function MyComponent() {
  const { count, increment } = useCounterStore();
  return <button onClick={increment}>{count}</button>;
}
```

### Using ShadCN Components
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Card>
  <Button>Click me</Button>
</Card>
```

### Using Smart Contract ABIs
```tsx
import MorphoABI from '@/abis/MorphoCompounderStrategyFactory.json';
import { useReadContract } from 'wagmi';

function MyComponent() {
  const { data } = useReadContract({
    address: '0x...', // Contract address
    abi: MorphoABI,
    functionName: 'createStrategy',
    args: [/* your args */]
  });

  return <div>{/* Your component */}</div>;
}
```

### Styling with Tailwind
Use utility classes directly in JSX:
```tsx
<div className="flex items-center gap-4 rounded-lg border p-6">
  <h1 className="text-2xl font-bold">Hello</h1>
</div>
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready to deploy to any static hosting service.

## Customization

### Add More ShadCN Components
Visit [ui.shadcn.com](https://ui.shadcn.com) and use their CLI:
```bash
npx shadcn@latest add [component-name]
```

### Modify Tailwind Config
Edit `tailwind.config.js` for custom colors, fonts, etc.

### Configure Build
Edit `vite.config.ts` for build optimizations.

## Tips for Hackathons

1. **Focus on features** - UI components are ready, just build your logic
2. **Use Zustand** for simple global state - no Redux boilerplate
3. **Leverage Tailwind** for rapid styling - no CSS files needed
4. **ShadCN components** are accessible and mobile-responsive out of the box
5. **TypeScript** helps catch bugs early - use it!
