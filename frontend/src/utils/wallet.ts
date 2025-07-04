/**
 * Wallet integration utilities for Hedera wallets
 * Supports HashPack and other Hedera-compatible wallets
 */

import { 
  AccountId, 
  ContractExecuteTransaction, 
  ContractFunctionParameters,
  Hbar,
  TransactionId
} from '@hashgraph/sdk';

import { 
  WalletConnection, 
  HederaNetwork, 
  ContractCallResult,
  HashPackProvider 
} from '@/types';

import { 
  APP_CONFIG, 
  CONTRACT_CONSTANTS, 
  ERROR_MESSAGES,
  getNetworkConfig 
} from './config';

// HashPack wallet interface
declare global {
  interface Window {
    hashpack?: HashPackProvider;
  }
}

/**
 * HashPack wallet integration
 */
export class HashPackWallet {
  private provider: HashPackProvider | null = null;
  private isInitialized = false;

  constructor() {
    this.checkProvider();
  }

  private checkProvider(): void {
    if (typeof window !== 'undefined' && window.hashpack) {
      this.provider = window.hashpack;
      this.isInitialized = true;
    }
  }

  /**
   * Check if HashPack is installed
   */
  isInstalled(): boolean {
    return this.isInitialized && this.provider !== null;
  }

  /**
   * Connect to HashPack wallet
   */
  async connect(): Promise<WalletConnection> {
    if (!this.isInstalled()) {
      throw new Error('HashPack wallet is not installed');
    }

    try {
      const result = await this.provider!.connectToLocalWallet();
      
      if (result.success && result.data) {
        const accountId = result.data.accountIds[0];
        const network = result.data.network as HederaNetwork;
        
        return {
          accountId,
          isConnected: true,
          network,
        };
      } else {
        throw new Error(result.error || 'Failed to connect to HashPack');
      }
    } catch (error) {
      console.error('HashPack connection error:', error);
      throw new Error(ERROR_MESSAGES.WALLET_REJECTED);
    }
  }

  /**
   * Disconnect from HashPack wallet
   */
  async disconnect(): Promise<void> {
    if (this.provider) {
      try {
        await this.provider.disconnect();
      } catch (error) {
        console.error('HashPack disconnect error:', error);
      }
    }
  }

  /**
   * Execute a contract transaction through HashPack
   */
  async executeTransaction(
    accountId: string,
    contractId: string,
    functionName: string,
    parameters?: ContractFunctionParameters,
    gasLimit: number = CONTRACT_CONSTANTS.GAS_LIMIT,
    maxTransactionFee: number = CONTRACT_CONSTANTS.MAX_TRANSACTION_FEE
  ): Promise<ContractCallResult> {
    if (!this.isInstalled()) {
      throw new Error('HashPack wallet is not installed');
    }

    try {
      // Create the transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gasLimit)
        .setFunction(functionName, parameters)
        .setMaxTransactionFee(new Hbar(maxTransactionFee))
        .setTransactionId(TransactionId.generate(AccountId.fromString(accountId)));

      // Convert transaction to bytes for HashPack
      const transactionBytes = transaction.toBytes();

      // Send transaction through HashPack
      const result = await this.provider!.sendTransaction({
        transactionBytes: Array.from(transactionBytes),
      });

      if (result.success) {
        return {
          success: true,
          transactionId: result.response?.transactionId,
        };
      } else {
        throw new Error(result.error || 'Transaction failed');
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
 * Wallet manager class to handle multiple wallet types
 */
export class WalletManager {
  private hashPack: HashPackWallet;
  private currentWallet: WalletConnection | null = null;

  constructor() {
    this.hashPack = new HashPackWallet();
  }

  /**
   * Get available wallets
   */
  getAvailableWallets() {
    return [
      {
        name: 'HashPack',
        id: 'hashpack',
        icon: '/icons/hashpack.svg',
        isInstalled: this.hashPack.isInstalled(),
        downloadUrl: 'https://www.hashpack.app/',
      },
    ];
  }

  /**
   * Connect to a specific wallet
   */
  async connect(walletId: string = 'hashpack'): Promise<WalletConnection> {
    switch (walletId) {
      case 'hashpack':
        this.currentWallet = await this.hashPack.connect();
        break;
      default:
        throw new Error(`Unsupported wallet: ${walletId}`);
    }

    return this.currentWallet;
  }

  /**
   * Disconnect from current wallet
   */
  async disconnect(): Promise<void> {
    if (this.currentWallet) {
      await this.hashPack.disconnect();
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

    return await this.hashPack.executeTransaction(
      this.currentWallet.accountId,
      contractId,
      functionName,
      parameters,
      gasLimit,
      maxTransactionFee
    );
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
    const parameters = new ContractFunctionParameters().addUint256(amount);
    return await this.executeContract(contractId, 'incrementBy', parameters);
  }

  /**
   * Decrement counter by amount
   */
  async decrementCounterBy(contractId: string, amount: number): Promise<ContractCallResult> {
    const parameters = new ContractFunctionParameters().addUint256(amount);
    return await this.executeContract(contractId, 'decrementBy', parameters);
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
  return wallets.some(wallet => wallet.isInstalled);
};

/**
 * Get wallet installation instructions
 */
export const getWalletInstallInstructions = () => {
  return {
    hashpack: {
      name: 'HashPack',
      description: 'The most popular Hedera wallet',
      downloadUrl: 'https://www.hashpack.app/',
      instructions: [
        'Visit hashpack.app',
        'Download the browser extension',
        'Create or import your wallet',
        'Connect to this dApp',
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
