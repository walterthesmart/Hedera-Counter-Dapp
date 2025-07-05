/**
 * MetaMask wallet integration for Hedera
 */

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { WalletConnection, HederaNetwork } from '@/types';
import { ERROR_MESSAGES } from './config';

// Hedera network configurations for MetaMask
export const HEDERA_NETWORKS: Record<Exclude<HederaNetwork, 'previewnet'>, any> = {
  testnet: {
    chainId: '0x128', // 296 in hex
    chainName: 'Hedera Testnet',
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18,
    },
    rpcUrls: ['https://testnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/testnet'],
  },
  mainnet: {
    chainId: '0x127', // 295 in hex
    chainName: 'Hedera Mainnet',
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/mainnet'],
  },
};

export class MetaMaskWallet {
  private provider: any = null;
  private signer: ethers.Signer | null = null;
  private connection: WalletConnection | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeProvider();
    }
  }

  /**
   * Initialize MetaMask provider (client-side only)
   */
  private async initializeProvider(): Promise<void> {
    try {
      this.provider = await detectEthereumProvider();
      if (this.provider && this.provider.isMetaMask) {
        // Set up event listeners
        this.setupEventListeners();
      }
    } catch (error) {
      console.error('Failed to initialize MetaMask provider:', error);
    }
  }

  /**
   * Set up MetaMask event listeners
   */
  private setupEventListeners(): void {
    if (!this.provider) return;

    // Account changed
    this.provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.updateConnection(accounts[0]);
      }
    });

    // Chain changed
    this.provider.on('chainChanged', (chainId: string) => {
      console.log('Chain changed to:', chainId);
      // Reload the page to reset the dapp state
      window.location.reload();
    });

    // Disconnect
    this.provider.on('disconnect', () => {
      this.disconnect();
    });
  }

  /**
   * Check if MetaMask is available
   */
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(this.provider && this.provider.isMetaMask);
  }

  /**
   * Check if MetaMask is connected
   */
  isConnected(): boolean {
    return !!this.connection?.isConnected;
  }

  /**
   * Get current connection
   */
  getConnection(): WalletConnection | null {
    return this.connection;
  }

  /**
   * Connect to MetaMask
   */
  async connect(network: Exclude<HederaNetwork, 'previewnet'> = 'testnet'): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not installed. Please install MetaMask browser extension.');
    }

    try {
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Switch to Hedera network
      await this.switchToHederaNetwork(network);

      // Create ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      this.signer = await ethersProvider.getSigner();

      // Get account balance
      const balance = await ethersProvider.getBalance(accounts[0]);
      const balanceInHbar = ethers.formatEther(balance);

      // Convert Ethereum address to Hedera account ID format
      const accountId = this.addressToAccountId(accounts[0]);

      this.connection = {
        accountId,
        isConnected: true,
        network,
        balance: `${parseFloat(balanceInHbar).toFixed(4)} HBAR`,
        walletType: 'metamask',
        address: accounts[0],
      };

      // Save connection to localStorage
      this.saveConnection();

      return this.connection;
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to connect to MetaMask');
    }
  }

  /**
   * Switch to Hedera network in MetaMask
   */
  async switchToHederaNetwork(network: Exclude<HederaNetwork, 'previewnet'>): Promise<void> {
    const networkConfig = HEDERA_NETWORKS[network];

    try {
      // Try to switch to the network
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        } catch (addError) {
          throw new Error(`Failed to add Hedera ${network} to MetaMask`);
        }
      } else {
        throw new Error(`Failed to switch to Hedera ${network}`);
      }
    }
  }

  /**
   * Convert Ethereum address to Hedera account ID format
   * This is a simplified conversion - in practice, you might need a more sophisticated mapping
   */
  private addressToAccountId(address: string): string {
    // For demo purposes, we'll create a mock account ID
    // In a real implementation, you'd need to map Ethereum addresses to Hedera account IDs
    const addressNum = parseInt(address.slice(-8), 16);
    return `0.0.${addressNum % 10000000}`;
  }

  /**
   * Update connection with new account
   */
  private async updateConnection(newAccount: string): Promise<void> {
    if (!this.connection) return;

    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const balance = await ethersProvider.getBalance(newAccount);
      const balanceInHbar = ethers.formatEther(balance);

      this.connection = {
        ...this.connection,
        accountId: this.addressToAccountId(newAccount),
        address: newAccount,
        balance: `${parseFloat(balanceInHbar).toFixed(4)} HBAR`,
      };

      this.saveConnection();
    } catch (error) {
      console.error('Failed to update connection:', error);
    }
  }

  /**
   * Disconnect from MetaMask
   */
  async disconnect(): Promise<void> {
    this.connection = null;
    this.signer = null;
    this.clearSavedConnection();
  }

  /**
   * Get current signer for transactions
   */
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  /**
   * Save connection to localStorage
   */
  private saveConnection(): void {
    if (this.connection) {
      localStorage.setItem('metamask_connection', JSON.stringify(this.connection));
    }
  }

  /**
   * Load saved connection from localStorage
   */
  loadSavedConnection(): WalletConnection | null {
    try {
      const saved = localStorage.getItem('metamask_connection');
      if (saved) {
        const connection = JSON.parse(saved);
        // Verify the connection is still valid
        if (this.isAvailable() && connection.isConnected) {
          this.connection = connection;
          return connection;
        }
      }
    } catch (error) {
      console.error('Failed to load saved connection:', error);
    }
    return null;
  }

  /**
   * Clear saved connection
   */
  private clearSavedConnection(): void {
    localStorage.removeItem('metamask_connection');
  }

  /**
   * Sign a transaction
   */
  async signTransaction(transaction: any): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available. Please connect MetaMask first.');
    }

    try {
      const signedTx = await this.signer.sendTransaction(transaction);
      return signedTx.hash;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Transaction signing failed');
    }
  }
}

// Export singleton instance
export const metaMaskWallet = new MetaMaskWallet();

// Utility functions
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return metaMaskWallet.isAvailable();
};

export const connectMetaMask = async (network: Exclude<HederaNetwork, 'previewnet'> = 'testnet'): Promise<WalletConnection> => {
  return await metaMaskWallet.connect(network);
};

export const disconnectMetaMask = async (): Promise<void> => {
  return await metaMaskWallet.disconnect();
};

export const getMetaMaskConnection = (): WalletConnection | null => {
  return metaMaskWallet.getConnection() || metaMaskWallet.loadSavedConnection();
};

export const isMetaMaskConnected = (): boolean => {
  return metaMaskWallet.isConnected();
};
