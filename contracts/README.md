# ImpactVault Smart Contracts

This directory contains the smart contracts for ImpactVault's multi-recipient yield distribution system.

## Contracts

### RecipientSplitter.sol
Extends OpenZeppelin's PaymentSplitter to automatically distribute received funds (ETH and ERC20 tokens) to multiple recipients based on their allocation percentages.

**Key Features:**
- Accepts ETH and ERC20 tokens
- Automatically splits funds based on predefined percentages
- Recipients can withdraw their share at any time
- Immutable after deployment (recipients and shares cannot be changed)

### RecipientSplitterFactory.sol
Factory contract for deploying RecipientSplitter instances.

**Key Features:**
- Creates new splitter contracts with custom recipients
- Validates that allocations total 100%
- Tracks all splitters created by each user
- Emits events for indexing and tracking

## Deployment Instructions

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

### 1. Create Hardhat Config
Create `hardhat.config.js` in the project root:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

### 2. Create Deployment Script
Create `scripts/deploy-splitter-factory.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying RecipientSplitterFactory...");

  const RecipientSplitterFactory = await hre.ethers.getContractFactory("RecipientSplitterFactory");
  const factory = await RecipientSplitterFactory.deploy();

  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("RecipientSplitterFactory deployed to:", address);

  // Wait for block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await factory.deploymentTransaction().wait(6);

  // Verify on Etherscan
  console.log("Verifying contract on Etherscan...");
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [],
  });

  console.log("Deployment complete!");
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_SPLITTER_FACTORY_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 3. Deploy to Testnet (Sepolia)
```bash
npx hardhat run scripts/deploy-splitter-factory.js --network sepolia
```

### 4. Deploy to Mainnet
```bash
npx hardhat run scripts/deploy-splitter-factory.js --network mainnet
```

### 5. Update Environment Variables
After deployment, update your `.env` file with the deployed factory address:
```
VITE_SPLITTER_FACTORY_ADDRESS=0x...
```

## Testing

Create `test/RecipientSplitter.test.js`:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipientSplitterFactory", function () {
  let factory;
  let owner, recipient1, recipient2, recipient3;

  beforeEach(async function () {
    [owner, recipient1, recipient2, recipient3] = await ethers.getSigners();

    const RecipientSplitterFactory = await ethers.getContractFactory("RecipientSplitterFactory");
    factory = await RecipientSplitterFactory.deploy();
    await factory.waitForDeployment();
  });

  it("Should create a splitter with correct recipients", async function () {
    const recipients = [
      { account: recipient1.address, shares: 50 },
      { account: recipient2.address, shares: 30 },
      { account: recipient3.address, shares: 20 },
    ];

    const tx = await factory.createSplitter(recipients, "Test Splitter");
    const receipt = await tx.wait();

    const event = receipt.logs.find(log => log.eventName === "SplitterCreated");
    expect(event).to.not.be.undefined;

    const splitterAddress = event.args.splitter;
    expect(splitterAddress).to.be.properAddress;
  });

  it("Should reject invalid total shares", async function () {
    const recipients = [
      { account: recipient1.address, shares: 50 },
      { account: recipient2.address, shares: 30 },
    ];

    await expect(
      factory.createSplitter(recipients, "Invalid Splitter")
    ).to.be.revertedWith("Total shares must equal 100");
  });
});
```

Run tests:
```bash
npx hardhat test
```

## Usage Example

### JavaScript/TypeScript
```javascript
import { ethers } from 'ethers';
import RecipientSplitterFactoryABI from './abis/RecipientSplitterFactory.json';

const factory = new ethers.Contract(
  FACTORY_ADDRESS,
  RecipientSplitterFactoryABI,
  signer
);

// Create a splitter
const recipients = [
  { account: '0x123...', shares: 50 },  // 50%
  { account: '0x456...', shares: 30 },  // 30%
  { account: '0x789...', shares: 20 },  // 20%
];

const tx = await factory.createSplitter(
  recipients,
  'My Impact Strategy'
);

const receipt = await tx.wait();
const splitterAddress = receipt.logs[0].args.splitter;
console.log('Splitter deployed at:', splitterAddress);
```

## Gas Estimates

- Deploying Factory: ~1.5M gas
- Creating Splitter (3 recipients): ~500k gas
- Creating Splitter (5 recipients): ~700k gas

## Security Considerations

1. **Immutability**: Once deployed, splitter recipients and shares cannot be changed
2. **Validation**: Factory validates that shares total exactly 100%
3. **Zero Address**: Factory prevents zero addresses as recipients
4. **OpenZeppelin**: Uses battle-tested PaymentSplitter implementation

## License

MIT
