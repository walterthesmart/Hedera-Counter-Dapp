/**
 * Application configuration and constants
 */

import { HederaNetwork, AppConfig } from '@/types';

// Environment variables with fallbacks
export const ENV = {
  HEDERA_NETWORK: (process.env.NEXT_PUBLIC_HEDERA_NETWORK as HederaNetwork) || 'testnet',
  CONTRACT_ID: process.env.NEXT_PUBLIC_CONTRACT_ID || '0.0.6285476',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Hedera Counter DApp',
  MIRROR_NODE_URL: process.env.NEXT_PUBLIC_MIRROR_NODE_URL || '',
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
} as const;

// Network configurations
export const NETWORK_CONFIG = {
  testnet: {
    name: 'Hedera Testnet',
    chainId: 296,
    rpcUrl: 'https://testnet.hashio.io/api',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    explorerUrl: 'https://hashscan.io/testnet',
    faucetUrl: 'https://portal.hedera.com/',
  },
  mainnet: {
    name: 'Hedera Mainnet',
    chainId: 295,
    rpcUrl: 'https://mainnet.hashio.io/api',
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
    explorerUrl: 'https://hashscan.io/mainnet',
    faucetUrl: null,
  },
  previewnet: {
    name: 'Hedera Previewnet',
    chainId: 297,
    rpcUrl: 'https://previewnet.hashio.io/api',
    mirrorNodeUrl: 'https://previewnet.mirrornode.hedera.com',
    explorerUrl: 'https://hashscan.io/previewnet',
    faucetUrl: null,
  },
} as const;

// Application configuration
export const APP_CONFIG: AppConfig = {
  contractId: ENV.CONTRACT_ID,
  network: ENV.HEDERA_NETWORK,
  mirrorNodeUrl: ENV.MIRROR_NODE_URL || NETWORK_CONFIG[ENV.HEDERA_NETWORK].mirrorNodeUrl,
  appName: ENV.APP_NAME,
};

// Contract constants (should match the smart contract)
export const CONTRACT_CONSTANTS = {
  MAX_COUNT: 1000000,
  MIN_COUNT: 0,
  GAS_LIMIT: 300000,
  MAX_TRANSACTION_FEE: 2, // HBAR
} as const;

// UI constants
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  REFRESH_INTERVAL: 10000, // 10 seconds
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
  MAX_TRANSACTIONS_HISTORY: 50,
} as const;

// Wallet configuration
export const WALLET_CONFIG = {
  HASHPACK: {
    name: 'HashPack',
    icon: '/icons/hashpack.svg',
    downloadUrl: 'https://www.hashpack.app/',
  },
  // Add more wallets as needed
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  CONTRACT_NOT_DEPLOYED: 'Contract not deployed or invalid contract ID',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INSUFFICIENT_BALANCE: 'Insufficient HBAR balance for transaction',
  CONTRACT_PAUSED: 'Contract is currently paused',
  MAX_COUNT_EXCEEDED: 'Cannot increment beyond maximum count',
  MIN_COUNT_EXCEEDED: 'Cannot decrement below minimum count',
  INVALID_AMOUNT: 'Please enter a valid amount',
  WALLET_REJECTED: 'Transaction was rejected by wallet',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  WALLET_DISCONNECTED: 'Wallet disconnected',
  TRANSACTION_SUBMITTED: 'Transaction submitted successfully',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
  CONTRACT_UPDATED: 'Contract state updated',
} as const;

// Validation rules
export const VALIDATION = {
  MIN_INCREMENT_AMOUNT: 1,
  MAX_INCREMENT_AMOUNT: 1000,
  MIN_DECREMENT_AMOUNT: 1,
  MAX_DECREMENT_AMOUNT: 1000,
} as const;

// Helper functions
export const getNetworkConfig = (network: HederaNetwork = ENV.HEDERA_NETWORK) => {
  return NETWORK_CONFIG[network];
};

export const getExplorerUrl = (network: HederaNetwork, type: 'transaction' | 'contract' | 'account', id: string) => {
  const baseUrl = getNetworkConfig(network).explorerUrl;
  return `${baseUrl}/${type}/${id}`;
};

export const getContractExplorerUrl = (contractId: string, network: HederaNetwork = ENV.HEDERA_NETWORK) => {
  return getExplorerUrl(network, 'contract', contractId);
};

export const getTransactionExplorerUrl = (transactionId: string, network: HederaNetwork = ENV.HEDERA_NETWORK) => {
  return getExplorerUrl(network, 'transaction', transactionId);
};

export const getMirrorNodeUrl = (network: HederaNetwork = ENV.HEDERA_NETWORK) => {
  return ENV.MIRROR_NODE_URL || getNetworkConfig(network).mirrorNodeUrl;
};

export const isValidContractId = (contractId: string): boolean => {
  // Hedera contract ID format: 0.0.xxxxx
  const contractIdRegex = /^0\.0\.\d+$/;
  return contractIdRegex.test(contractId);
};

export const isValidAccountId = (accountId: string): boolean => {
  // Hedera account ID format: 0.0.xxxxx
  const accountIdRegex = /^0\.0\.\d+$/;
  return accountIdRegex.test(accountId);
};

export const formatHbar = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toFixed(8)} ℏ`;
};

export const formatContractId = (contractId: string): string => {
  if (!contractId) return 'Not deployed';
  return contractId;
};

export const formatAccountId = (accountId: string): string => {
  if (!accountId) return 'Not connected';
  return accountId;
};

export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address || address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Development helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Feature flags
export const FEATURES = {
  ENABLE_TRANSACTION_HISTORY: true,
  ENABLE_CONTRACT_EVENTS: true,
  ENABLE_ADVANCED_CONTROLS: true,
  ENABLE_ANALYTICS: isProduction,
} as const;
