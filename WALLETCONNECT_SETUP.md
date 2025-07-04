# HashPack WalletConnect Integration Setup

This guide explains how to set up the HashPack wallet integration using the official Hedera WalletConnect library.

## 🔧 **Current Implementation**

The application now uses the **official Hedera WalletConnect library** (`@hashgraph/hedera-wallet-connect`) instead of a custom mock implementation. This provides:

- ✅ **Real HashPack wallet connection** via WalletConnect protocol
- ✅ **Official Hedera integration** following best practices
- ✅ **Proper transaction signing** through HashPack
- ✅ **Standardized wallet interface** compatible with other Hedera wallets

## 🚀 **Getting Started**

### 1. Get a WalletConnect Project ID

To use WalletConnect, you need a project ID from WalletConnect Cloud:

1. **Visit WalletConnect Cloud**: https://cloud.walletconnect.com/
2. **Sign up/Login** with your account
3. **Create a new project**:
   - Project Name: "Simple Counter DApp" (or your preferred name)
   - Project Description: "A Hedera smart contract counter application"
   - Project URL: Your domain (or `http://localhost:3000` for development)
4. **Copy your Project ID** from the dashboard

### 2. Update Environment Variables

Update your `frontend/.env.local` file:

```bash
# Replace 'your-project-id-here' with your actual WalletConnect project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

### 3. Install HashPack Wallet

Make sure you have HashPack wallet installed:

1. **Download HashPack**: https://www.hashpack.app/
2. **Install the browser extension**
3. **Create or import your Hedera account**
4. **Make sure you're on Hedera Testnet**
5. **Fund your account** with testnet HBAR from the faucet

## 🔗 **How the Integration Works**

### Connection Flow

1. **User clicks "Connect HashPack via WalletConnect"**
2. **WalletConnect modal opens** with QR code or connection options
3. **User connects via HashPack** (either by scanning QR or direct connection)
4. **HashPack prompts for permission** to connect to the dApp
5. **Connection established** and user account info is displayed

### Transaction Flow

1. **User clicks increment/decrement** on the counter
2. **Transaction is created** using Hedera SDK
3. **Transaction is sent to HashPack** via WalletConnect
4. **HashPack shows transaction details** for user approval
5. **User signs transaction** in HashPack
6. **Transaction is executed** on Hedera network
7. **Result is displayed** in the dApp

## 🛠 **Technical Details**

### Key Components

- **`HashPackWalletManager`**: Main class handling wallet operations
- **`DAppConnector`**: WalletConnect integration for dApp side
- **`HederaWalletConnectProvider`**: Provider for Hedera-specific operations
- **Contract Integration**: Direct smart contract interaction via signed transactions

### Supported Operations

- ✅ **Connect/Disconnect** HashPack wallet
- ✅ **Get account balance** and information
- ✅ **Execute contract functions** (increment, decrement, reset)
- ✅ **Query contract state** (get current count)
- ✅ **Transaction signing** and submission

## 🔍 **Testing the Integration**

### Prerequisites

1. **HashPack wallet installed** and set up
2. **Testnet HBAR** in your account
3. **WalletConnect Project ID** configured
4. **Development server running** (`npm run dev`)

### Test Steps

1. **Open the application**: http://localhost:3000
2. **Click "Connect HashPack via WalletConnect"**
3. **Follow the WalletConnect flow** to connect HashPack
4. **Verify connection**: Your account ID and balance should display
5. **Test contract interactions**: Try increment/decrement buttons
6. **Check HashPack**: Confirm transactions appear for signing

## 🚨 **Troubleshooting**

### Common Issues

**"WalletConnect is not initialized"**
- Check that your project ID is valid
- Ensure environment variables are loaded correctly
- Restart the development server

**"No accounts found after WalletConnect connection"**
- Make sure HashPack is unlocked
- Verify you're on the correct network (testnet)
- Try disconnecting and reconnecting

**"Transaction failed"**
- Ensure you have sufficient HBAR for gas fees
- Check that the contract ID is correct
- Verify network connectivity

### Debug Mode

Enable debug logging by checking the browser console for:
- `🔗 Connecting to HashPack wallet via WalletConnect...`
- `✅ HashPack wallet connected successfully`
- `🔄 Executing contract function: increment`
- `✅ Contract transaction successful`

## 📚 **Additional Resources**

- **HashPack Documentation**: https://docs.hashpack.app/
- **Hedera WalletConnect Docs**: https://github.com/hashgraph/hedera-wallet-connect
- **WalletConnect Cloud**: https://cloud.walletconnect.com/
- **Hedera Developer Portal**: https://docs.hedera.com/

## 🎯 **Next Steps**

1. **Get your WalletConnect Project ID** from the cloud dashboard
2. **Update the environment variable** with your real project ID
3. **Test the connection** with your HashPack wallet
4. **Deploy to production** with proper project configuration

The integration is now ready for real HashPack wallet connections! 🎉
