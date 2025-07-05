# 🔍 Contract Source Code Verification Guide

## Contract Information
- **Contract ID**: `0.0.6285476`
- **Network**: Hedera Testnet
- **Contract Name**: `Counter`
- **HashScan URL**: https://hashscan.io/testnet/contract/0.0.6285476

## Verification Steps

### 1. Go to HashScan
Visit: https://hashscan.io/testnet/contract/0.0.6285476

### 2. Find Verification Section
- Look for "Code" tab or "Verify Contract" button
- Click on "Verify and Publish Source Code"

### 3. Fill in the Form

#### Basic Information
- **Contract Name**: `Counter`
- **Compiler Type**: `Solidity (Single file)`
- **Compiler Version**: `v0.8.19+commit.7dd6d404`
- **Open Source License Type**: `MIT License (MIT)`

#### Optimization Settings
- **Optimization**: `Yes`
- **Optimization Runs**: `200`

#### Constructor Arguments (ABI-encoded)
```
0000000000000000000000000000000000000000000000000000000000000000
```

#### Source Code
Copy the entire content from `verification-source.sol` file

### 4. Submit for Verification
- Click "Verify and Publish"
- Wait for the verification process to complete

## Expected Result
Once verified, you'll see:
- ✅ Source code tab with your Solidity code
- ✅ Contract ABI
- ✅ Constructor arguments
- ✅ Compiler settings
- ✅ "Verified" badge on the contract page

## Troubleshooting

### If Verification Fails:
1. **Check Compiler Version**: Ensure exact match with deployment
2. **Check Optimization Settings**: Must match deployment (enabled, 200 runs)
3. **Check Constructor Arguments**: Must be ABI-encoded correctly
4. **Check Source Code**: Must match exactly (including comments and formatting)

### Common Issues:
- **Bytecode Mismatch**: Usually due to wrong compiler version or optimization settings
- **Constructor Arguments**: Make sure they're ABI-encoded (not human-readable)
- **Import Statements**: If using imports, you may need to flatten the contract

## Alternative: Hardhat Verification

If HashScan verification doesn't work, you can try programmatic verification:

```bash
cd smart-contract
npx hardhat verify --network testnet 0.0.6285476 0
```

## Verification Benefits
- ✅ Transparency: Anyone can read your contract code
- ✅ Trust: Users can verify contract functionality
- ✅ Debugging: Easier to debug transactions
- ✅ Integration: Better tooling support
