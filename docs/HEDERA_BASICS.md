# Hedera Blockchain Basics

A comprehensive guide to understanding Hedera blockchain concepts for beginners.

## 🌟 What is Hedera?

Hedera is a public distributed ledger technology that provides a new form of distributed consensus. Unlike traditional blockchains, Hedera uses a novel consensus algorithm called **Hashgraph** that offers:

- **High Performance**: 10,000+ transactions per second
- **Low Fees**: Predictable, low-cost transactions (typically $0.0001)
- **Energy Efficient**: Uses 0.00017 kWh per transaction
- **Fair Ordering**: Mathematically proven fair transaction ordering
- **Enterprise Grade**: Built for real-world business applications

## 🏗️ Core Concepts

### 1. Hashgraph Consensus

Unlike blockchain's linear chain of blocks, Hashgraph uses a **Directed Acyclic Graph (DAG)** structure:

```
Traditional Blockchain:
Block 1 → Block 2 → Block 3 → Block 4

Hashgraph:
    Event A ←→ Event B
      ↓         ↓
    Event C ←→ Event D
      ↓         ↓
    Event E ←→ Event F
```

**Key Benefits:**
- **Asynchronous**: No waiting for block times
- **Byzantine Fault Tolerant**: Secure against malicious actors
- **Fair**: No single node can manipulate transaction order
- **Fast**: Consensus in seconds, not minutes

### 2. Hedera Network Structure

Hedera operates on a **permissioned network** governed by the **Hedera Governing Council**:

- **39 Council Members**: Including Google, IBM, Boeing, Deutsche Telekom
- **Decentralized Governance**: No single entity controls the network
- **Rotating Leadership**: Council membership rotates over time
- **Transparent Operations**: All decisions are public

### 3. Native Services

Hedera provides built-in services beyond just cryptocurrency:

#### Cryptocurrency Service (HCS)
- **HBAR**: Native cryptocurrency for fees and staking
- **Fast Transfers**: Sub-second finality
- **Low Fees**: Predictable costs

#### Smart Contract Service (HSCS)
- **EVM Compatible**: Run Ethereum smart contracts
- **Solidity Support**: Use familiar development tools
- **Gas Efficiency**: Lower costs than Ethereum

#### Consensus Service (HCS)
- **Timestamping**: Cryptographic proof of order and time
- **Audit Trails**: Immutable logs for compliance
- **Messaging**: Decentralized communication

#### Token Service (HTS)
- **Native Tokens**: Create tokens without smart contracts
- **Compliance Features**: Built-in KYC/AML support
- **Efficient**: Lower costs than ERC-20 tokens

#### File Service (HFS)
- **Distributed Storage**: Store files across the network
- **Version Control**: Track file changes over time
- **Access Control**: Manage file permissions

## 💰 HBAR: The Native Cryptocurrency

### What is HBAR?

HBAR is Hedera's native cryptocurrency, used for:

- **Transaction Fees**: Pay for network operations
- **Smart Contract Execution**: Gas fees for contract calls
- **Network Security**: Staking for consensus participation
- **Governance**: Voting on network proposals

### HBAR Denominations

```
1 HBAR = 100,000,000 tinybars
1 tinybar = 0.00000001 HBAR

Common amounts:
- 1 HBAR = 100,000,000 tinybars
- 0.1 HBAR = 10,000,000 tinybars
- 0.01 HBAR = 1,000,000 tinybars
```

### Getting HBAR

#### Testnet HBAR (Free for Development)
1. Visit [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Receive free testnet HBAR for development

#### Mainnet HBAR (Real Value)
- Purchase from exchanges (Binance, Coinbase, etc.)
- Receive from other users
- Earn through staking rewards

## 🔐 Accounts and Keys

### Account Structure

Every Hedera account has:

```
Account ID: 0.0.123456
├── Public Key: 302a300506032b6570032100...
├── Private Key: 302e020100300506032b657004220420...
├── Balance: 100.50000000 ℏ
└── Auto-Renew Period: 7776000 seconds (90 days)
```

### Account ID Format

Hedera uses a unique three-part identifier:
```
0.0.123456
│ │ └─ Account Number
│ └─ Realm (always 0 currently)
└─ Shard (always 0 currently)
```

### Key Types

#### ED25519 Keys (Recommended)
- **Fast**: Optimized for performance
- **Secure**: Cryptographically strong
- **Small**: Compact key size

#### ECDSA Keys (Ethereum Compatible)
- **Compatible**: Works with Ethereum tools
- **Familiar**: Standard in blockchain development
- **Interoperable**: Easy migration from Ethereum

### Account Creation

```javascript
// Using Hedera SDK
const { Client, AccountCreateTransaction, PrivateKey, Hbar } = require("@hashgraph/sdk");

const client = Client.forTestnet();
const privateKey = PrivateKey.generateED25519();
const publicKey = privateKey.publicKey;

const transaction = new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(new Hbar(10));

const response = await transaction.execute(client);
const receipt = await response.getReceipt(client);
const accountId = receipt.accountId;
```

## 📝 Transactions

### Transaction Lifecycle

1. **Creation**: Build transaction with parameters
2. **Signing**: Sign with private key(s)
3. **Submission**: Send to Hedera network
4. **Consensus**: Network reaches agreement
5. **Finality**: Transaction is final and immutable

### Transaction Types

#### Cryptocurrency Transfers
```javascript
const transferTx = new TransferTransaction()
    .addHbarTransfer(senderId, new Hbar(-10))
    .addHbarTransfer(receiverId, new Hbar(10));
```

#### Smart Contract Calls
```javascript
const contractTx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(100000)
    .setFunction("increment");
```

#### Account Updates
```javascript
const updateTx = new AccountUpdateTransaction()
    .setAccountId(accountId)
    .setKey(newPublicKey);
```

### Transaction Fees

Hedera uses a predictable fee structure:

```
Base Fee + Network Fee + Node Fee + Service Fee
```

**Typical Costs:**
- Simple transfer: ~$0.0001
- Smart contract call: ~$0.001-0.01
- Account creation: ~$0.05
- File storage: ~$0.05 per KB

## 🔧 Smart Contracts on Hedera

### EVM Compatibility

Hedera Smart Contract Service is fully compatible with Ethereum:

- **Solidity**: Write contracts in Solidity
- **Web3 Tools**: Use familiar development tools
- **Libraries**: Import OpenZeppelin and other libraries
- **Migration**: Easy to port from Ethereum

### Key Differences from Ethereum

#### Gas Model
```solidity
// Ethereum: Variable gas prices
// Hedera: Fixed, predictable fees

// Gas limit still applies
function expensiveOperation() external {
    // This might cost 100,000 gas units
    // On Ethereum: 100,000 * gasPrice (variable)
    // On Hedera: Fixed USD equivalent
}
```

#### Account Model
```solidity
// Hedera accounts have both:
// - EVM address (0x...)
// - Hedera ID (0.0.123456)

// Both refer to the same account
address evmAddress = 0x1234567890123456789012345678901234567890;
// Corresponds to Hedera ID like 0.0.123456
```

### Deployment Process

1. **Compile**: Use Hardhat, Truffle, or Remix
2. **Deploy**: Use Hedera SDK or Web3 tools
3. **Verify**: Confirm deployment on HashScan
4. **Interact**: Call functions through SDK or Web3

## 🌐 Network Environments

### Testnet
- **Purpose**: Development and testing
- **HBAR**: Free testnet tokens
- **Reset**: Periodic resets (data may be lost)
- **Explorer**: https://hashscan.io/testnet

### Previewnet
- **Purpose**: Preview upcoming features
- **HBAR**: Free preview tokens
- **Stability**: Less stable than testnet
- **Explorer**: https://hashscan.io/previewnet

### Mainnet
- **Purpose**: Production applications
- **HBAR**: Real value cryptocurrency
- **Stability**: Production-ready
- **Explorer**: https://hashscan.io/mainnet

## 🔍 Exploring the Network

### HashScan Explorer

HashScan is the official Hedera network explorer:

**Account Information:**
```
https://hashscan.io/testnet/account/0.0.123456
```

**Transaction Details:**
```
https://hashscan.io/testnet/transaction/0.0.123456-1234567890-123456789
```

**Smart Contract:**
```
https://hashscan.io/testnet/contract/0.0.789012
```

### Mirror Node API

Access network data programmatically:

```javascript
// Get account information
const response = await fetch(
    'https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.123456'
);
const accountData = await response.json();

// Get transaction history
const txResponse = await fetch(
    'https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=0.0.123456'
);
const transactions = await txResponse.json();
```

## 🛡️ Security Best Practices

### Private Key Management

```javascript
// ❌ DON'T: Store private keys in code
const privateKey = "302e020100300506032b657004220420...";

// ✅ DO: Use environment variables
const privateKey = PrivateKey.fromString(process.env.PRIVATE_KEY);

// ✅ DO: Use hardware wallets for production
// ✅ DO: Use key derivation for multiple accounts
```

### Transaction Security

```javascript
// Always verify transaction receipts
const response = await transaction.execute(client);
const receipt = await response.getReceipt(client);

if (receipt.status !== Status.Success) {
    throw new Error(`Transaction failed: ${receipt.status}`);
}
```

### Smart Contract Security

```solidity
// Use OpenZeppelin for security patterns
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SecureCounter is Ownable, ReentrancyGuard {
    // Implement security best practices
}
```

## 📚 Learning Resources

### Official Documentation
- [Hedera Documentation](https://docs.hedera.com/)
- [SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis)
- [Smart Contract Guide](https://docs.hedera.com/hedera/smart-contracts)

### Development Tools
- [Hedera SDK](https://github.com/hashgraph/hedera-sdk-js)
- [HashScan Explorer](https://hashscan.io/)
- [Hedera Portal](https://portal.hedera.com/)

### Community Resources
- [Hedera Discord](https://discord.gg/hedera)
- [Developer Forum](https://hedera.com/discord)
- [GitHub Repositories](https://github.com/hashgraph)

## 🎯 Next Steps

Now that you understand Hedera basics:

1. **Set up a testnet account** at [portal.hedera.com](https://portal.hedera.com/)
2. **Install HashPack wallet** for easy account management
3. **Try the Counter DApp** to see Hedera in action
4. **Explore the SDK** to build your own applications
5. **Join the community** to connect with other developers

---

**Ready to build on Hedera? Let's go! 🚀**
