# Hedera WalletConnect Integration Guide

This guide explains how the Hedera Counter DApp has been updated to use the official Hedera WalletConnect implementation instead of HashPack-specific integration.

## 🔄 Migration Overview

The application has been migrated from:
- **Before**: Direct HashPack wallet integration
- **After**: Official Hedera WalletConnect implementation

This change provides:
- ✅ **Multi-wallet support**: Works with HashPack, Blade, Kabila, and other Hedera wallets
- ✅ **Standardized protocol**: Uses WalletConnect v2 standard
- ✅ **Better UX**: Unified connection flow across all wallets
- ✅ **Future-proof**: Official Hedera implementation with ongoing support

## 📦 Dependencies

The following packages have been added:

```json
{
  "@hashgraph/hedera-wallet-connect": "2.0.0-canary.811af2f.0",
  "@walletconnect/modal": "^2.6.2"
}
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local` file:

```env
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

**Getting a WalletConnect Project ID:**
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add it to your environment variables

### Network Configuration

The WalletConnect integration automatically detects the network from your app configuration:

```typescript
// In frontend/src/utils/config.ts
export const ENV = {
  HEDERA_NETWORK: 'testnet', // or 'mainnet'
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  // ... other config
};
```

## 🏗️ Architecture Changes

### 1. Wallet Manager (`frontend/src/utils/wallet.ts`)

**Before (HashPack-specific):**
```typescript
export class HashPackWallet {
  private provider: HashPackProvider | null = null;
  
  async connect(): Promise<WalletConnection> {
    const result = await this.provider!.connectToLocalWallet();
    // HashPack-specific logic
  }
}
```

**After (WalletConnect):**
```typescript
export class HederaWalletConnectManager {
  private walletConnect: HederaWalletConnect | null = null;
  
  async connect(): Promise<WalletConnection> {
    const session = await this.walletConnect!.openModal();
    // Standard WalletConnect flow
  }
}
```

### 2. Wallet Button Component

**Before:**
- Listed specific wallets with installation checks
- Required wallet-specific connection logic

**After:**
- Single "Connect via WalletConnect" button
- Shows supported wallets as informational display
- Unified connection flow for all wallets

### 3. Transaction Execution

**Before (HashPack):**
```typescript
const transactionBytes = transaction.toBytes();
const result = await this.provider!.sendTransaction({
  transactionBytes: Array.from(transactionBytes),
});
```

**After (WalletConnect):**
```typescript
const result = await this.walletConnect!.executeTransaction(
  transaction,
  accountId
);
```

## 🔌 Supported Wallets

The WalletConnect integration supports all Hedera-compatible wallets:

| Wallet | Status | Download |
|--------|--------|----------|
| **HashPack** | ✅ Supported | [hashpack.app](https://www.hashpack.app/) |
| **Blade Wallet** | ✅ Supported | [bladewallet.io](https://bladewallet.io/) |
| **Kabila Wallet** | ✅ Supported | [kabila.app](https://kabila.app/) |
| **Other Hedera Wallets** | ✅ Supported | Via WalletConnect protocol |

## 🚀 Usage Examples

### Basic Connection

```typescript
import { useWallet } from '@/hooks/useWallet';

function MyComponent() {
  const { wallet, connect, disconnect, isConnecting } = useWallet();

  return (
    <div>
      {wallet ? (
        <div>
          <p>Connected: {wallet.accountId}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect()} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
```

### Contract Interaction

```typescript
import { useContract } from '@/hooks/useContract';

function CounterControls() {
  const { contract, increment, isLoading } = useContract(wallet);

  return (
    <button 
      onClick={increment} 
      disabled={isLoading || !contract}
    >
      Increment Counter
    </button>
  );
}
```

## 🔍 Testing the Integration

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test Wallet Connection

1. Open `http://localhost:3000`
2. Click "Connect via WalletConnect"
3. Choose your preferred Hedera wallet
4. Complete the connection flow
5. Test contract interactions

## 🐛 Troubleshooting

### Common Issues

#### 1. "WalletConnect Project ID not found"

**Problem**: Missing or invalid WalletConnect Project ID.

**Solution**:
```bash
# Check your .env.local file
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id
```

#### 2. "No wallets found"

**Problem**: No compatible wallets installed.

**Solution**:
- Install HashPack, Blade, or another Hedera wallet
- Ensure the wallet supports WalletConnect v2

#### 3. "Connection timeout"

**Problem**: Wallet connection times out.

**Solution**:
- Check network connectivity
- Ensure wallet is unlocked
- Try refreshing the page

#### 4. "Transaction failed"

**Problem**: Contract transactions fail after connection.

**Solution**:
- Verify contract is deployed
- Check account has sufficient HBAR
- Ensure wallet is on correct network (testnet/mainnet)

### Debug Mode

Enable debug logging:

```typescript
// In your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('WalletConnect Debug Mode Enabled');
  }
}, []);
```

## 📚 API Reference

### HederaWalletConnectManager

```typescript
class HederaWalletConnectManager {
  // Initialize WalletConnect
  constructor()
  
  // Check if WalletConnect is available
  isAvailable(): boolean
  
  // Connect to wallet
  connect(): Promise<WalletConnection>
  
  // Disconnect from wallet
  disconnect(): Promise<void>
  
  // Execute contract transaction
  executeTransaction(
    accountId: string,
    contractId: string,
    functionName: string,
    parameters?: ContractFunctionParameters,
    gasLimit?: number,
    maxTransactionFee?: number
  ): Promise<ContractCallResult>
}
```

### WalletConnection Interface

```typescript
interface WalletConnection {
  accountId: string;      // Hedera account ID (0.0.xxxxx)
  isConnected: boolean;   // Connection status
  network: HederaNetwork; // testnet | mainnet | previewnet
  balance?: string;       // Optional account balance
}
```

## 🔄 Migration Checklist

If migrating from HashPack-specific integration:

- [ ] Install WalletConnect dependencies
- [ ] Get WalletConnect Project ID
- [ ] Update environment variables
- [ ] Replace HashPack-specific code
- [ ] Update wallet button component
- [ ] Test with multiple wallets
- [ ] Update documentation
- [ ] Deploy and verify

## 🌟 Benefits of WalletConnect Integration

### For Users
- **Choice**: Use any Hedera-compatible wallet
- **Consistency**: Same connection flow across all wallets
- **Security**: Industry-standard WalletConnect protocol

### For Developers
- **Simplicity**: Single integration for all wallets
- **Maintenance**: Official Hedera support and updates
- **Future-proof**: Automatic support for new wallets

### For the Ecosystem
- **Standardization**: Promotes WalletConnect adoption
- **Interoperability**: Better wallet ecosystem integration
- **Innovation**: Enables new wallet features and capabilities

## 📞 Support

### Resources
- [Hedera WalletConnect Documentation](https://docs.hedera.com/hedera/tutorials/more-tutorials/walletconnect)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Hedera Discord](https://discord.gg/hedera)

### Getting Help
1. Check this troubleshooting guide
2. Review Hedera WalletConnect docs
3. Ask in Hedera Discord #developers channel
4. Create GitHub issue with detailed error information

---

**The WalletConnect integration provides a robust, standardized way to connect with Hedera wallets while maintaining all existing functionality. Happy building! 🚀**
