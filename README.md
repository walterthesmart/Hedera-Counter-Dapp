# Hedera Counter DApp - Complete Educational Project

A comprehensive educational project demonstrating how to build a complete decentralized application (dApp) on the Hedera blockchain. This project includes a smart contract, modern web frontend, and extensive documentation for blockchain beginners.

## 🎯 Project Overview

This project demonstrates:
- **Smart Contract Development**: A feature-rich counter contract written in Solidity
- **Frontend Integration**: Modern React/Next.js application with TypeScript
- **Wallet Integration**: HashPack wallet connection and transaction signing
- **Real-time Updates**: Live contract state monitoring and transaction tracking
- **Educational Content**: Comprehensive tutorials and explanations

## 🌟 Features

### Smart Contract Features
- ✅ Increment/Decrement counter by 1 or custom amounts
- ✅ Owner-only reset functionality
- ✅ Pause/unpause contract operations
- ✅ Comprehensive error handling and validation
- ✅ Event emission for all operations
- ✅ Gas-optimized design

### Frontend Features
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Real-time counter value display with progress visualization
- ✅ Wallet connection with HashPack support
- ✅ Transaction history and status tracking
- ✅ Error handling and user feedback
- ✅ Mobile-friendly design

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Hedera Testnet Account** - [Get one here](https://portal.hedera.com/)
- **HashPack Wallet** - [Install here](https://www.hashpack.app/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hedera-counter-dapp.git
cd hedera-counter-dapp
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install smart contract dependencies
npm run setup-contract

# Install frontend dependencies
npm run setup-frontend
```

### 3. Environment Setup

Create environment files from examples:

```bash
# Copy main environment file
cp .env.example .env

# Copy frontend environment file
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env` with your Hedera credentials:
```env
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

### 4. Compile and Deploy Smart Contract

```bash
# Compile the contract
npm run compile-contract

# Deploy to Hedera testnet
npm run deploy-contract
```

The deployment script will automatically update your environment files with the contract ID.

### 5. Start the Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` to see your dApp in action!

## 📚 Understanding Hedera Blockchain

### What is Hedera?

Hedera is a public distributed ledger that offers:
- **High Performance**: 10,000+ transactions per second
- **Low Fees**: Predictable, low-cost transactions
- **Energy Efficient**: Proof-of-Stake consensus
- **Enterprise Grade**: Built for real-world applications

### Key Concepts

#### 1. **Accounts**
- Every user has a unique Account ID (format: `0.0.xxxxx`)
- Accounts hold HBAR (Hedera's native cryptocurrency)
- Required for all blockchain interactions

#### 2. **Smart Contracts**
- Self-executing contracts with terms directly written into code
- Deployed to the blockchain with a unique Contract ID
- Can hold and transfer HBAR, store data, and execute logic

#### 3. **Transactions**
- All blockchain interactions are transactions
- Require HBAR to pay for network fees
- Provide cryptographic proof of execution

#### 4. **Consensus**
- Hedera uses Hashgraph consensus algorithm
- Provides fast finality and high throughput
- More energy-efficient than traditional blockchains

## 🔧 Project Structure

```
hedera-counter-dapp/
├── smart-contract/          # Smart contract code
│   ├── contracts/          # Solidity contracts
│   ├── scripts/           # Deployment scripts
│   ├── test/              # Contract tests
│   └── config/            # Configuration files
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Next.js pages
│   │   ├── styles/        # CSS styles
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── docs/                  # Additional documentation
├── .env.example           # Environment variables template
└── README.md             # This file
```

## 💡 Smart Contract Deep Dive

### Counter.sol Explained

Our smart contract includes several key components:

#### State Variables
```solidity
uint256 private _count;        // Current counter value
address private _owner;        // Contract owner
bool private _paused;         // Pause state
```

#### Key Functions

1. **increment()** - Increases counter by 1
2. **decrement()** - Decreases counter by 1
3. **incrementBy(uint256)** - Increases by custom amount
4. **decrementBy(uint256)** - Decreases by custom amount
5. **getCount()** - Returns current value (view function)
6. **reset()** - Resets to 0 (owner only)

#### Security Features
- **Access Control**: Owner-only functions
- **Pause Mechanism**: Emergency stop functionality
- **Input Validation**: Boundary checks and error handling
- **Event Logging**: All operations emit events

### Gas Optimization

The contract is optimized for gas efficiency:
- Uses `private` variables with public getters
- Efficient storage layout
- Minimal external calls
- Batch operations support

## 🎨 Frontend Architecture

### Technology Stack

- **Next.js 14**: React framework with SSR/SSG
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Hedera SDK**: Official Hedera JavaScript SDK
- **React Hooks**: State management and side effects

### Key Components

#### 1. **WalletButton**
Handles wallet connection and displays connection status.

#### 2. **CounterDisplay**
Shows current counter value with visual progress indicators.

#### 3. **CounterControls**
Provides buttons for all contract interactions.

#### 4. **TransactionHistory**
Displays recent transactions with status tracking.

### Custom Hooks

#### useWallet
Manages wallet connection state and operations.

#### useContract
Handles all smart contract interactions.

#### useTransactions
Tracks transaction history and status.

## 🔐 Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: Functions use proper state updates
- **Access Control**: Owner-only functions properly protected
- **Input Validation**: All inputs validated before processing
- **Pause Mechanism**: Emergency stop functionality

### Frontend Security
- **Environment Variables**: Sensitive data properly managed
- **Input Sanitization**: User inputs validated and sanitized
- **Error Handling**: Graceful error handling and user feedback
- **HTTPS Only**: Production deployment uses HTTPS

## 🧪 Testing

### Smart Contract Tests

Run the comprehensive test suite:

```bash
npm run test-contract
```

Tests cover:
- Basic functionality (increment/decrement)
- Access control (owner-only functions)
- Boundary conditions (min/max values)
- Error conditions (paused state, invalid inputs)
- Event emission verification

### Testing the Deployed Contract

After deployment, verify your contract works:

```bash
cd smart-contract
npm run verify
```

## 🚀 Deployment Guide

### Smart Contract Deployment

1. **Prepare Environment**
   ```bash
   # Ensure you have testnet HBAR
   # Update .env with your credentials
   ```

2. **Compile Contract**
   ```bash
   npm run compile-contract
   ```

3. **Deploy to Testnet**
   ```bash
   npm run deploy-contract
   ```

4. **Verify Deployment**
   ```bash
   cd smart-contract
   node scripts/verify.js
   ```

### Frontend Deployment

#### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   ```
   NEXT_PUBLIC_HEDERA_NETWORK=testnet
   NEXT_PUBLIC_CONTRACT_ID=0.0.YOUR_CONTRACT_ID
   NEXT_PUBLIC_APP_NAME=Hedera Counter DApp
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

#### Manual Deployment

```bash
cd frontend
npm run build
npm run start
```

## 🔧 Configuration

### Network Configuration

The project supports multiple Hedera networks:

- **Testnet**: For development and testing
- **Mainnet**: For production deployment
- **Previewnet**: For preview features

Configure in `.env`:
```env
HEDERA_NETWORK=testnet  # or mainnet, previewnet
```

### Contract Configuration

Customize contract behavior in `smart-contract/contracts/Counter.sol`:

```solidity
uint256 public constant MAX_COUNT = 1000000;  // Maximum counter value
uint256 public constant MIN_COUNT = 0;        // Minimum counter value
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **"Insufficient Account Balance"**
- **Cause**: Not enough HBAR for transaction fees
- **Solution**: Get testnet HBAR from [Hedera Portal](https://portal.hedera.com/)

#### 2. **"Contract Not Found"**
- **Cause**: Contract not deployed or wrong Contract ID
- **Solution**: Redeploy contract and update environment variables

#### 3. **"Wallet Connection Failed"**
- **Cause**: HashPack not installed or network mismatch
- **Solution**: Install HashPack and ensure correct network

#### 4. **"Transaction Timeout"**
- **Cause**: Network congestion or insufficient gas
- **Solution**: Retry transaction or increase gas limit

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=true
```

## 📖 Learning Resources

### Hedera Documentation
- [Official Docs](https://docs.hedera.com/)
- [Developer Portal](https://hedera.com/developers)
- [SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis)

### Solidity Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)

### Web3 Development
- [Web3 University](https://www.web3.university/)
- [Ethereum Development](https://ethereum.org/en/developers/)
- [DApp Architecture](https://www.dappuniversity.com/)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hedera Team** for the excellent blockchain platform
- **HashPack Team** for the wallet integration
- **OpenZeppelin** for smart contract security patterns
- **Next.js Team** for the amazing React framework

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/hedera-counter-dapp/issues)
- **Discord**: Join the [Hedera Discord](https://discord.gg/hedera)
- **Documentation**: Check our [detailed docs](./docs/)

---

**Happy Building! 🚀**

*This project is for educational purposes and demonstrates best practices for Hedera dApp development.*
