# Troubleshooting Guide

This guide helps you resolve common issues when building and running the Hedera Counter DApp.

## 🔧 Setup Issues

### Node.js and npm Problems

#### "node is not recognized as an internal or external command"

**Problem**: Node.js is not installed or not in PATH.

**Solution**:
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install the LTS version (16 or higher)
3. Restart your terminal/command prompt
4. Verify installation: `node --version`

#### "npm install" fails with permission errors

**Problem**: Permission issues with npm global packages.

**Solution**:
```bash
# On Windows (run as Administrator)
npm install -g npm

# On macOS/Linux
sudo npm install -g npm
# Or configure npm to use a different directory
```

#### "npm install" takes too long or hangs

**Problem**: Network issues or npm cache problems.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Use different registry
npm install --registry https://registry.npmjs.org/

# Try yarn instead
npm install -g yarn
yarn install
```

### Environment Configuration

#### "Missing required environment variables"

**Problem**: Environment files not configured properly.

**Solution**:
1. Copy `.env.example` to `.env`
2. Copy `frontend/.env.local.example` to `frontend/.env.local`
3. Fill in your Hedera credentials:
   ```env
   HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   ```

#### "Invalid account ID format"

**Problem**: Incorrect Hedera account ID format.

**Solution**:
- Use format: `0.0.123456` (not `0x...` format)
- Get valid account ID from [Hedera Portal](https://portal.hedera.com/)

#### "Invalid private key format"

**Problem**: Wrong private key format or encoding.

**Solution**:
- Use DER-encoded private key from Hedera Portal
- Format should be: `302e020100300506032b657004220420...`
- Don't use Ethereum-style private keys (`0x...`)

## 🔗 Smart Contract Issues

### Compilation Problems

#### "Solidity compiler not found"

**Problem**: Hardhat can't find Solidity compiler.

**Solution**:
```bash
cd smart-contract
npm install @nomicfoundation/hardhat-toolbox
npx hardhat compile
```

#### "Contract size exceeds limit"

**Problem**: Contract bytecode too large.

**Solution**:
1. Enable optimizer in `hardhat.config.js`:
   ```javascript
   solidity: {
     version: "0.8.19",
     settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
     }
   }
   ```

#### "Import resolution failed"

**Problem**: Can't find imported contracts.

**Solution**:
```bash
# Install OpenZeppelin contracts
cd smart-contract
npm install @openzeppelin/contracts
```

### Deployment Issues

#### "INSUFFICIENT_ACCOUNT_BALANCE"

**Problem**: Not enough HBAR for deployment.

**Solution**:
1. Get testnet HBAR from [Hedera Portal](https://portal.hedera.com/)
2. Check account balance on [HashScan](https://hashscan.io/testnet)
3. Deployment typically costs ~2 HBAR

#### "INVALID_ACCOUNT_ID"

**Problem**: Account ID format is incorrect.

**Solution**:
- Verify account ID format: `0.0.123456`
- Check account exists on HashScan
- Ensure using correct network (testnet/mainnet)

#### "Transaction timeout"

**Problem**: Network congestion or connectivity issues.

**Solution**:
```bash
# Increase timeout in deployment script
const contractCreateSubmit = await contractCreateTx
  .setMaxTransactionFee(new Hbar(5))  // Increase fee
  .execute(client);
```

#### "Contract deployment failed"

**Problem**: Various deployment issues.

**Solution**:
1. Check network connectivity
2. Verify account has sufficient HBAR
3. Try deploying to testnet first
4. Check Hedera network status

### Contract Interaction

#### "Contract not found"

**Problem**: Contract ID doesn't exist or is incorrect.

**Solution**:
1. Verify contract ID in `.env` file
2. Check contract exists on HashScan
3. Redeploy if necessary: `npm run deploy-contract`

#### "Function call reverted"

**Problem**: Contract function execution failed.

**Solution**:
1. Check function parameters
2. Verify account permissions (for owner-only functions)
3. Ensure contract is not paused
4. Check gas limits

## 🌐 Frontend Issues

### Build Problems

#### "Module not found" errors

**Problem**: Missing dependencies or incorrect imports.

**Solution**:
```bash
cd frontend
npm install
# Or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "TypeScript compilation errors"

**Problem**: Type errors in TypeScript code.

**Solution**:
1. Check TypeScript configuration in `tsconfig.json`
2. Install missing type definitions:
   ```bash
   npm install @types/node @types/react @types/react-dom
   ```
3. Fix type errors in code

#### "Tailwind CSS not working"

**Problem**: Styles not applying correctly.

**Solution**:
1. Check `tailwind.config.js` configuration
2. Verify CSS imports in `globals.css`
3. Restart development server

### Runtime Issues

#### "Wallet connection failed"

**Problem**: Can't connect to HashPack or other wallets.

**Solution**:
1. Install HashPack browser extension
2. Create/import wallet in HashPack
3. Ensure wallet is unlocked
4. Check browser console for errors

#### "Network mismatch"

**Problem**: Wallet connected to different network.

**Solution**:
1. Switch wallet to testnet/mainnet as needed
2. Update environment variables to match
3. Restart application

#### "Transaction rejected"

**Problem**: User rejected transaction in wallet.

**Solution**:
- This is normal user behavior
- Implement proper error handling
- Show user-friendly error messages

#### "Page not loading"

**Problem**: Frontend application won't start.

**Solution**:
```bash
# Check if port 3000 is available
netstat -an | grep 3000

# Try different port
PORT=3001 npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🔍 Debugging Tips

### Enable Debug Logging

Add to your `.env` file:
```env
DEBUG=true
NODE_ENV=development
```

### Check Browser Console

1. Open browser developer tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests

### Verify Network Connectivity

```bash
# Test Hedera testnet connectivity
curl https://testnet.mirrornode.hedera.com/api/v1/network/nodes

# Test HashIO RPC
curl https://testnet.hashio.io/api
```

### Check Contract State

```bash
# Run contract verification script
cd smart-contract
node scripts/verify.js
```

### Monitor Transactions

1. Use [HashScan](https://hashscan.io/testnet) to monitor transactions
2. Check transaction status and error messages
3. Verify account balances and contract state

## 📊 Performance Issues

### Slow Contract Calls

**Problem**: Contract interactions are slow.

**Solution**:
1. Use appropriate gas limits
2. Optimize contract functions
3. Consider batching operations

### Large Bundle Size

**Problem**: Frontend bundle is too large.

**Solution**:
1. Enable code splitting in Next.js
2. Use dynamic imports for large components
3. Optimize images and assets

### Memory Issues

**Problem**: Application uses too much memory.

**Solution**:
1. Check for memory leaks in React components
2. Properly cleanup event listeners
3. Use React.memo for expensive components

## 🆘 Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Check Hedera documentation
4. Verify your environment setup

### Where to Get Help

1. **GitHub Issues**: [Project Issues](https://github.com/your-repo/issues)
2. **Hedera Discord**: [discord.gg/hedera](https://discord.gg/hedera)
3. **Stack Overflow**: Tag with `hedera` and `dapp`
4. **Hedera Documentation**: [docs.hedera.com](https://docs.hedera.com/)

### When Reporting Issues

Include:
1. **Environment**: OS, Node.js version, npm version
2. **Steps to reproduce**: Exact commands and actions
3. **Error messages**: Full error text and stack traces
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Screenshots**: If applicable

### Sample Issue Template

```markdown
## Environment
- OS: Windows 10 / macOS 12 / Ubuntu 20.04
- Node.js: v18.17.0
- npm: 9.6.7
- Browser: Chrome 115

## Steps to Reproduce
1. Run `npm run deploy-contract`
2. See error message

## Error Message
```
Error: INSUFFICIENT_ACCOUNT_BALANCE
```

## Expected Behavior
Contract should deploy successfully

## Additional Context
Account has 5 HBAR balance on testnet
```

---

**Still having issues? Don't hesitate to ask for help! The Hedera community is friendly and supportive. 🤝**
