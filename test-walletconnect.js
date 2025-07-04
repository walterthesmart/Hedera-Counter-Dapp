#!/usr/bin/env node

/**
 * WalletConnect Integration Test Script
 * This script verifies that the WalletConnect integration is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Hedera WalletConnect Integration...\n');

// Test 1: Check if WalletConnect dependencies are installed
console.log('1. Checking WalletConnect dependencies...');
try {
  const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    '@hashgraph/hedera-wallet-connect',
    '@walletconnect/modal'
  ];
  
  let allDepsFound = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: NOT FOUND`);
      allDepsFound = false;
    }
  });
  
  if (allDepsFound) {
    console.log('   ✅ All WalletConnect dependencies found\n');
  } else {
    console.log('   ❌ Missing WalletConnect dependencies\n');
  }
} catch (error) {
  console.log(`   ❌ Error checking dependencies: ${error.message}\n`);
}

// Test 2: Check environment configuration
console.log('2. Checking environment configuration...');
try {
  const envExamplePath = path.join(__dirname, 'frontend', '.env.local.example');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  
  if (envExample.includes('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')) {
    console.log('   ✅ WalletConnect Project ID configured in .env.local.example');
  } else {
    console.log('   ❌ WalletConnect Project ID not found in .env.local.example');
  }
  
  const envLocalPath = path.join(__dirname, 'frontend', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf8');
    if (envLocal.includes('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')) {
      console.log('   ✅ WalletConnect Project ID found in .env.local');
    } else {
      console.log('   ⚠️  WalletConnect Project ID not configured in .env.local');
    }
  } else {
    console.log('   ⚠️  .env.local file not found (copy from .env.local.example)');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Error checking environment: ${error.message}\n`);
}

// Test 3: Check wallet utility implementation
console.log('3. Checking wallet utility implementation...');
try {
  const walletUtilPath = path.join(__dirname, 'frontend', 'src', 'utils', 'wallet.ts');
  const walletUtil = fs.readFileSync(walletUtilPath, 'utf8');
  
  const checks = [
    { name: 'HederaWalletConnect import', pattern: '@hashgraph/hedera-wallet-connect' },
    { name: 'HederaWalletConnectManager class', pattern: 'class HederaWalletConnectManager' },
    { name: 'WalletConnect initialization', pattern: 'new HederaWalletConnect' },
    { name: 'Multi-wallet support', pattern: 'Blade Wallet' },
  ];
  
  checks.forEach(check => {
    if (walletUtil.includes(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
  console.log('');
} catch (error) {
  console.log(`   ❌ Error checking wallet utility: ${error.message}\n`);
}

// Test 4: Check component updates
console.log('4. Checking component updates...');
try {
  const walletButtonPath = path.join(__dirname, 'frontend', 'src', 'components', 'WalletButton.tsx');
  const walletButton = fs.readFileSync(walletButtonPath, 'utf8');
  
  if (walletButton.includes('Connect via WalletConnect')) {
    console.log('   ✅ WalletButton updated for WalletConnect');
  } else {
    console.log('   ❌ WalletButton not updated for WalletConnect');
  }
  
  if (walletButton.includes('HashPack') && walletButton.includes('Blade') && walletButton.includes('Kabila')) {
    console.log('   ✅ Multi-wallet support in UI');
  } else {
    console.log('   ❌ Multi-wallet support not implemented in UI');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Error checking components: ${error.message}\n`);
}

// Test 5: Check documentation
console.log('5. Checking documentation...');
try {
  const walletConnectDocPath = path.join(__dirname, 'docs', 'WALLETCONNECT_INTEGRATION.md');
  if (fs.existsSync(walletConnectDocPath)) {
    console.log('   ✅ WalletConnect integration documentation exists');
    
    const doc = fs.readFileSync(walletConnectDocPath, 'utf8');
    if (doc.includes('Migration Overview') && doc.includes('Troubleshooting')) {
      console.log('   ✅ Documentation is comprehensive');
    } else {
      console.log('   ⚠️  Documentation may be incomplete');
    }
  } else {
    console.log('   ❌ WalletConnect integration documentation missing');
  }
  
  const readmePath = path.join(__dirname, 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf8');
  if (readme.includes('WalletConnect')) {
    console.log('   ✅ README updated with WalletConnect information');
  } else {
    console.log('   ❌ README not updated with WalletConnect information');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Error checking documentation: ${error.message}\n`);
}

// Summary
console.log('📋 Integration Test Summary');
console.log('==========================');
console.log('✅ = Passed');
console.log('⚠️  = Warning (manual action needed)');
console.log('❌ = Failed (requires fixing)');
console.log('');
console.log('Next Steps:');
console.log('1. Install dependencies: cd frontend && npm install');
console.log('2. Get WalletConnect Project ID from https://cloud.walletconnect.com/');
console.log('3. Configure .env.local with your Project ID');
console.log('4. Test wallet connection: npm run dev');
console.log('5. Verify multi-wallet support with different Hedera wallets');
console.log('');
console.log('🚀 WalletConnect integration test completed!');
