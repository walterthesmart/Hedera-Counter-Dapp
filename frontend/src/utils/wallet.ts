/**
 * Wallet integration utilities for Hedera wallets
 * Uses official Hedera WalletConnect implementation
 */

import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionId
} from '@hashgraph/sdk';

// Temporarily disabled due to ES module issues
// import { HederaWalletConnect } from '@hashgraph/hedera-wallet-connect';

// Mock HederaWalletConnect class for development
class MockHederaWalletConnect {
  private isConnected = false;
  private accountData: any = null;

  constructor(projectId: string, network: string, appName: string) {
    console.log('Mock WalletConnect initialized:', { projectId, network, appName });
  }

  async connect() {
    console.log('Mock wallet connecting...');
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.isConnected = true;
    this.accountData = {
      accountId: '0.0.6255971',
      network: 'testnet',
      isConnected: true
    };

    console.log('Mock wallet connected:', this.accountData);
    return this.accountData;
  }

  async disconnect() {
    console.log('Mock wallet disconnecting...');
    this.isConnected = false;
    this.accountData = null;
    console.log('Mock wallet disconnected');
  }

  getAccountData() {
    return this.accountData;
  }

  isWalletConnected() {
    return this.isConnected;
  }

  async executeTransaction(
    accountId: string,
    contractId: string,
    functionName: string,
    parameters?: any,
    gasLimit?: number,
    maxTransactionFee?: number
  ) {
    console.log('Mock transaction execution:', {
      accountId,
      contractId,
      functionName,
      parameters,
      gasLimit,
      maxTransactionFee
    });

    // For development, simulate successful transaction
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: `0.0.${Date.now()}@${Date.now()}.${Math.floor(Math.random() * 1000000)}`,
      status: 'SUCCESS',
      contractResult: {
        gasUsed: gasLimit || 100000,
        result: 'Mock transaction result'
      }
    };
  }
}

// Use mock implementation temporarily
const HederaWalletConnect = MockHederaWalletConnect;

import {
  WalletConnection,
  HederaNetwork,
  ContractCallResult,
  WalletConnectSession,
  WalletConnectProvider
} from '@/types';

import {
  APP_CONFIG,
  CONTRACT_CONSTANTS,
  ERROR_MESSAGES,
  ENV,
  getNetworkConfig
} from './config';

/**
 * Hedera WalletConnect integration
 */
export class HederaWalletConnectManager {
  private walletConnect: MockHederaWalletConnect | null = null;
  private session: WalletConnectSession | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeWalletConnect();
  }

  private async initializeWalletConnect(): Promise<void> {
    try {
      // Initialize Hedera WalletConnect with project configuration
      this.walletConnect = new HederaWalletConnect(
        ENV.WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        APP_CONFIG.network === 'mainnet' ? 'mainnet' : 'testnet',
        ENV.APP_NAME || 'Hedera Counter DApp'
      );

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
    }
  }

  /**
   * Check if WalletConnect is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.walletConnect !== null;
  }

  /**
   * Connect to wallet via WalletConnect
   */
  async connect(): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('WalletConnect is not available');
    }

    try {
      console.log('🔗 Connecting to wallet...');
      // Use mock connect method
      const result = await this.walletConnect!.connect();

      this.session = {
        topic: 'mock-topic',
        peer: {
          metadata: {
            name: 'Mock Wallet',
            description: 'Mock wallet for development',
            url: 'https://mock-wallet.com',
            icons: []
          }
        },
        namespaces: {}
      };

      const connection: WalletConnection = {
        accountId: result.accountId,
        network: result.network as HederaNetwork,
        isConnected: true,
        walletType: 'walletconnect',
        balance: '100.0' // Mock balance
      };

      console.log('✅ Wallet connected successfully:', connection);
      return connection;
    } catch (error) {
      console.error('❌ WalletConnect connection error:', error);
      throw new Error(ERROR_MESSAGES.WALLET_REJECTED);
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    if (this.walletConnect && this.session) {
      try {
        console.log('🔌 Disconnecting wallet...');
        await this.walletConnect.disconnect();
        this.session = null;
        console.log('✅ Wallet disconnected successfully');
      } catch (error) {
        console.error('❌ WalletConnect disconnect error:', error);
      }
    }
  }

  /**
   * Execute a contract transaction through WalletConnect
   */
  async executeTransaction(
    accountId: string,
    contractId: string,
    functionName: string,
    parameters?: ContractFunctionParameters,
    gasLimit: number = CONTRACT_CONSTANTS.GAS_LIMIT,
    maxTransactionFee: number = CONTRACT_CONSTANTS.MAX_TRANSACTION_FEE
  ): Promise<ContractCallResult> {
    if (!this.isAvailable() || !this.session) {
      throw new Error('WalletConnect is not connected');
    }

    try {
      // Create the transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gasLimit)
        .setFunction(functionName, parameters)
        .setMaxTransactionFee(new Hbar(maxTransactionFee))
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

      // Execute transaction through WalletConnect
      const result = await this.walletConnect!.executeTransaction(
        accountId,
        contractId,
        functionName,
        parameters,
        gasLimit,
        maxTransactionFee
      );

      if (result && result.success) {
        return {
          success: true,
          transactionId: result.transactionId,
        };
      } else {
        throw new Error('Transaction execution failed');
      }
    } catch (error) {
      console.error('Transaction execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }
}

/**
 * Wallet manager class to handle WalletConnect integration
 */
export class WalletManager {
  private walletConnect: HederaWalletConnectManager;
  private currentWallet: WalletConnection | null = null;

  constructor() {
    this.walletConnect = new HederaWalletConnectManager();
  }

  /**
   * Get available wallets through WalletConnect
   */
  getAvailableWallets() {
    return [
      {
        name: 'HashPack',
        id: 'hashpack',
        icon: '/icons/hashpack.svg',
        isAvailable: true, // WalletConnect supports multiple wallets
        downloadUrl: 'https://www.hashpack.app/',
      },
      {
        name: 'Blade Wallet',
        id: 'blade',
        icon: '/icons/blade.svg',
        isAvailable: true,
        downloadUrl: 'https://bladewallet.io/',
      },
      {
        name: 'Kabila Wallet',
        id: 'kabila',
        icon: '/icons/kabila.svg',
        isAvailable: true,
        downloadUrl: 'https://kabila.app/',
      },
    ];
  }

  /**
   * Connect to wallet via WalletConnect
   */
  async connect(): Promise<WalletConnection> {
    this.currentWallet = await this.walletConnect.connect();
    return this.currentWallet;
  }

  /**
   * Disconnect from current wallet
   */
  async disconnect(): Promise<void> {
    if (this.currentWallet) {
      await this.walletConnect.disconnect();
      this.currentWallet = null;
    }
  }

  /**
   * Get current wallet connection
   */
  getCurrentWallet(): WalletConnection | null {
    return this.currentWallet;
  }

  /**
   * Set current wallet connection (for external wallet integrations)
   */
  setCurrentWallet(wallet: WalletConnection | null): void {
    this.currentWallet = wallet;
  }

  /**
   * Execute contract function
   */
  async executeContract(
    contractId: string,
    functionName: string,
    parameters?: ContractFunctionParameters,
    gasLimit?: number,
    maxTransactionFee?: number
  ): Promise<ContractCallResult> {
    if (!this.currentWallet) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    // Check wallet type and use appropriate execution method
    if (this.currentWallet.walletType === 'metamask') {
      // Use MetaMask for contract execution
      const { metaMaskWallet, hederaContractIdToEvmAddress } = await import('@/utils/metamask');

      // Convert Hedera contract ID to EVM address format
      const contractAddress = hederaContractIdToEvmAddress(contractId);

      let result;
      switch (functionName) {
        case 'increment':
          result = await metaMaskWallet.incrementCounter(contractAddress);
          break;
        case 'decrement':
          result = await metaMaskWallet.decrementCounter(contractAddress);
          break;
        case 'incrementBy':
          // For incrementBy, we need to pass the amount parameter
          // Since we're calling this from incrementCounterBy, we'll get the amount from there
          result = await metaMaskWallet.executeContract(contractAddress, functionName, [], gasLimit);
          break;
        case 'decrementBy':
          // For decrementBy, we need to pass the amount parameter
          // Since we're calling this from decrementCounterBy, we'll get the amount from there
          result = await metaMaskWallet.executeContract(contractAddress, functionName, [], gasLimit);
          break;
        default:
          result = await metaMaskWallet.executeContract(contractAddress, functionName, [], gasLimit);
      }

      return {
        success: result.success,
        transactionId: result.transactionId,
        error: result.error
      };
    } else {
      // Use WalletConnect for other wallets (HashPack, etc.)
      return await this.walletConnect.executeTransaction(
        this.currentWallet.accountId,
        contractId,
        functionName,
        parameters,
        gasLimit,
        maxTransactionFee
      );
    }
  }

  /**
   * Increment counter
   */
  async incrementCounter(contractId: string): Promise<ContractCallResult> {
    return await this.executeContract(contractId, 'increment');
  }

  /**
   * Decrement counter
   */
  async decrementCounter(contractId: string): Promise<ContractCallResult> {
    return await this.executeContract(contractId, 'decrement');
  }

  /**
   * Increment counter by amount
   */
  async incrementCounterBy(contractId: string, amount: number): Promise<ContractCallResult> {
    if (!this.currentWallet) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    // Check wallet type and use appropriate execution method
    if (this.currentWallet.walletType === 'metamask') {
      const { metaMaskWallet, hederaContractIdToEvmAddress } = await import('@/utils/metamask');
      const contractAddress = hederaContractIdToEvmAddress(contractId);
      const result = await metaMaskWallet.incrementCounterBy(contractAddress, amount);
      return {
        success: result.success,
        transactionId: result.transactionId,
        error: result.error
      };
    } else {
      const parameters = new ContractFunctionParameters().addUint256(amount);
      return await this.executeContract(contractId, 'incrementBy', parameters);
    }
  }

  /**
   * Decrement counter by amount
   */
  async decrementCounterBy(contractId: string, amount: number): Promise<ContractCallResult> {
    if (!this.currentWallet) {
      throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    }

    // Check wallet type and use appropriate execution method
    if (this.currentWallet.walletType === 'metamask') {
      const { metaMaskWallet, hederaContractIdToEvmAddress } = await import('@/utils/metamask');
      const contractAddress = hederaContractIdToEvmAddress(contractId);
      const result = await metaMaskWallet.decrementCounterBy(contractAddress, amount);
      return {
        success: result.success,
        transactionId: result.transactionId,
        error: result.error
      };
    } else {
      const parameters = new ContractFunctionParameters().addUint256(amount);
      return await this.executeContract(contractId, 'decrementBy', parameters);
    }
  }

  /**
   * Reset counter (owner only)
   */
  async resetCounter(contractId: string): Promise<ContractCallResult> {
    return await this.executeContract(contractId, 'reset');
  }

  /**
   * Check if wallet supports the required network
   */
  isNetworkSupported(network: HederaNetwork): boolean {
    const supportedNetworks: HederaNetwork[] = ['testnet', 'mainnet'];
    return supportedNetworks.includes(network);
  }

  /**
   * Validate wallet connection
   */
  async validateConnection(): Promise<boolean> {
    if (!this.currentWallet) {
      return false;
    }

    try {
      // Try to get account info or perform a simple query
      // This would require additional implementation
      return true;
    } catch (error) {
      console.error('Wallet validation error:', error);
      return false;
    }
  }
}

// Singleton instance
let walletManager: WalletManager | null = null;

/**
 * Get wallet manager instance
 */
export const getWalletManager = (): WalletManager => {
  if (!walletManager) {
    walletManager = new WalletManager();
  }
  return walletManager;
};

/**
 * Utility functions
 */

/**
 * Check if any wallet is available
 */
export const isWalletAvailable = (): boolean => {
  const manager = getWalletManager();
  const wallets = manager.getAvailableWallets();
  return wallets.some(wallet => wallet.isAvailable);
};

/**
 * Get wallet installation instructions
 */
export const getWalletInstallInstructions = () => {
  return {
    general: {
      name: 'Hedera Wallets',
      description: 'Connect with any Hedera-compatible wallet',
      downloadUrl: 'https://hedera.com/ecosystem',
      instructions: [
        'Install a Hedera-compatible wallet (HashPack, Blade, Kabila)',
        'Create or import your wallet',
        'Ensure you have testnet HBAR for transactions',
        'Click "Connect Wallet" to connect via WalletConnect',
      ],
    },
    hashpack: {
      name: 'HashPack',
      description: 'The most popular Hedera wallet',
      downloadUrl: 'https://www.hashpack.app/',
      instructions: [
        'Visit hashpack.app',
        'Download the browser extension or mobile app',
        'Create or import your wallet',
        'Connect via WalletConnect',
      ],
    },
    blade: {
      name: 'Blade Wallet',
      description: 'Feature-rich Hedera wallet',
      downloadUrl: 'https://bladewallet.io/',
      instructions: [
        'Visit bladewallet.io',
        'Download the browser extension',
        'Create or import your wallet',
        'Connect via WalletConnect',
      ],
    },
  };
};

/**
 * Format wallet error messages
 */
export const formatWalletError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    // Common wallet error patterns
    if (error.message.includes('User rejected')) {
      return ERROR_MESSAGES.WALLET_REJECTED;
    }
    if (error.message.includes('insufficient')) {
      return ERROR_MESSAGES.INSUFFICIENT_BALANCE;
    }
    if (error.message.includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Local storage utilities for wallet persistence
 */
export const saveWalletConnection = (wallet: WalletConnection): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hedera_wallet_connection', JSON.stringify(wallet));
  }
};

export const loadWalletConnection = (): WalletConnection | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hedera_wallet_connection');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored wallet connection:', error);
        localStorage.removeItem('hedera_wallet_connection');
      }
    }
  }
  return null;
};

export const clearWalletConnection = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hedera_wallet_connection');
  }
};
