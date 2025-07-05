/**
 * MetaMask wallet integration for Hedera
 */

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { WalletConnection, HederaNetwork } from '@/types';
import { ERROR_MESSAGES } from './config';

/**
 * Convert Hedera contract ID to EVM address
 * Hedera contract IDs (0.0.xxxxx) map to EVM addresses
 */
export const hederaContractIdToEvmAddress = (contractId: string): string => {
  // Extract the contract number from the Hedera ID (0.0.xxxxx)
  const parts = contractId.split('.');
  if (parts.length !== 3 || parts[0] !== '0' || parts[1] !== '0') {
    throw new Error(`Invalid Hedera contract ID format: ${contractId}`);
  }

  const contractNum = parseInt(parts[2]);
  if (isNaN(contractNum)) {
    throw new Error(`Invalid contract number in ID: ${contractId}`);
  }

  // Convert to EVM address format (20 bytes, padded with zeros)
  // The contract number is stored in the last 8 bytes of the address
  const hexNum = contractNum.toString(16).padStart(16, '0');
  return `0x${'0'.repeat(24)}${hexNum}`;
};

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
   * Get current chain ID
   */
  async getChainId(): Promise<string | null> {
    try {
      return await this.provider.request({ method: 'eth_chainId' });
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return null;
    }
  }

  /**
   * Ensure MetaMask is connected to the correct Hedera network
   */
  async ensureCorrectNetwork(network: Exclude<HederaNetwork, 'previewnet'> = 'testnet'): Promise<void> {
    try {
      const currentChainId = await this.provider.request({ method: 'eth_chainId' });
      const targetNetwork = HEDERA_NETWORKS[network];

      if (currentChainId !== targetNetwork.chainId) {
        console.log(`Switching to Hedera ${network} (Chain ID: ${targetNetwork.chainId})`);

        try {
          // Try to switch to the network
          await this.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetNetwork.chainId }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            console.log(`Adding Hedera ${network} network to MetaMask`);
            await this.provider.request({
              method: 'wallet_addEthereumChain',
              params: [targetNetwork],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Failed to ensure correct network:', error);
      throw new Error(`Failed to connect to Hedera ${network}. Please manually add the network to MetaMask.`);
    }
  }

  /**
   * Connect to MetaMask
   */
  async connect(network: Exclude<HederaNetwork, 'previewnet'> = 'testnet'): Promise<WalletConnection> {
    if (!this.isAvailable()) {
      throw new Error('MetaMask is not installed. Please install MetaMask browser extension.');
    }

    try {
      // First ensure we're on the correct network
      await this.ensureCorrectNetwork(network);

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

  /**
   * Get the complete contract ABI for the Counter contract
   */
  private getCounterContractABI(): string[] {
    return [
      // Constructor
      "constructor(uint256 initialCount)",

      // Main functions
      "function increment() external",
      "function decrement() external",
      "function incrementBy(uint256 amount) external",
      "function decrementBy(uint256 amount) external",
      "function reset() external",

      // View functions
      "function getCount() external view returns (uint256)",
      "function getOwner() external view returns (address)",
      "function isPaused() external view returns (bool)",
      "function getContractInfo() external view returns (uint256 count, address owner, bool paused, uint256 maxCount, uint256 minCount)",

      // Owner functions
      "function pause() external",
      "function unpause() external",
      "function transferOwnership(address newOwner) external",

      // Constants
      "function MAX_COUNT() external view returns (uint256)",
      "function MIN_COUNT() external view returns (uint256)",

      // Events
      "event CountIncremented(uint256 newCount, address indexed caller)",
      "event CountDecremented(uint256 newCount, address indexed caller)",
      "event CountReset(address indexed caller)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
      "event ContractPaused(address indexed caller)",
      "event ContractUnpaused(address indexed caller)",

      // Custom Errors
      "error CounterPaused()",
      "error MaxCountExceeded()",
      "error MinCountExceeded()",
      "error OnlyOwner()",
      "error InvalidAddress()"
    ];
  }

  /**
   * Check if the contract is paused before executing transactions
   */
  async isContractPaused(contractAddress: string): Promise<boolean> {
    try {
      const contractABI = this.getCounterContractABI();
      const contract = new ethers.Contract(contractAddress, contractABI, this.provider);
      return await contract.isPaused();
    } catch (error) {
      console.error('Failed to check contract pause status:', error);
      return false; // Assume not paused if we can't check
    }
  }

  /**
   * Get current contract count
   */
  async getContractCount(contractAddress: string): Promise<number | null> {
    try {
      console.log('🔍 getContractCount called for:', contractAddress);
      const contractABI = this.getCounterContractABI();
      console.log('🔍 Contract ABI loaded, creating contract instance...');
      const contract = new ethers.Contract(contractAddress, contractABI, this.provider);
      console.log('🔍 Contract instance created, calling getCount()...');
      const count = await contract.getCount();
      const countNumber = count.toNumber();
      console.log('✅ Contract count retrieved successfully:', countNumber);
      return countNumber;
    } catch (error) {
      console.error('❌ Failed to get contract count:', error);
      return null;
    }
  }

  /**
   * Execute a smart contract function
   */
  async executeContract(
    contractAddress: string,
    functionName: string,
    parameters: any[] = [],
    gasLimit: number = 300000
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    if (!this.signer || !this.connection?.isConnected) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect MetaMask first.'
      };
    }

    try {
      console.log(`Executing contract function: ${functionName} on ${contractAddress}`);

      // Check if contract is paused before executing state-changing functions
      const stateMutatingFunctions = ['increment', 'decrement', 'incrementBy', 'decrementBy'];
      if (stateMutatingFunctions.includes(functionName)) {
        const isPaused = await this.isContractPaused(contractAddress);
        if (isPaused) {
          return {
            success: false,
            error: 'Contract is currently paused. Please contact the contract owner.'
          };
        }
      }

      // Get the complete contract ABI
      const contractABI = this.getCounterContractABI();

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, this.signer);

      // Execute the function with increased gas limit and proper error handling
      let tx;
      const txOptions = {
        gasLimit: gasLimit,
        // Add some buffer for gas estimation
        gasPrice: undefined // Let MetaMask estimate
      };

      if (parameters.length > 0) {
        tx = await contract[functionName](...parameters, txOptions);
      } else {
        tx = await contract[functionName](txOptions);
      }

      console.log('Transaction sent:', tx.hash);
      console.log('Transaction details:', {
        to: tx.to,
        from: tx.from,
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice?.toString()
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);
      console.log('Gas used:', receipt.gasUsed?.toString());

      return {
        success: true,
        transactionId: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('Contract execution failed:', error);

      // Parse specific error messages
      let errorMessage = 'Contract execution failed';

      if (error.code === 'CALL_EXCEPTION') {
        if (error.reason) {
          errorMessage = `Contract call failed: ${error.reason}`;
        } else if (error.data) {
          errorMessage = 'Contract call reverted. This might be due to contract constraints (max/min count limits, paused state, or insufficient permissions).';
        }
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction would fail. Please check contract state and your permissions.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Increment counter
   */
  async incrementCounter(contractAddress: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Pre-check: Get current count to validate increment is possible
    try {
      const currentCount = await this.getContractCount(contractAddress);
      if (currentCount !== null && currentCount >= 1000000) { // MAX_COUNT
        return {
          success: false,
          error: 'Cannot increment: Maximum count limit (1,000,000) would be exceeded.'
        };
      }
    } catch (error) {
      console.warn('Could not pre-validate increment operation:', error);
    }

    return await this.executeContract(contractAddress, 'increment', [], 350000);
  }

  /**
   * Decrement counter
   */
  async decrementCounter(contractAddress: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Pre-check: Get current count to validate decrement is possible
    try {
      const currentCount = await this.getContractCount(contractAddress);
      if (currentCount !== null && currentCount <= 0) { // MIN_COUNT
        return {
          success: false,
          error: 'Cannot decrement: Minimum count limit (0) would be exceeded.'
        };
      }
    } catch (error) {
      console.warn('Could not pre-validate decrement operation:', error);
    }

    return await this.executeContract(contractAddress, 'decrement', [], 350000);
  }

  /**
   * Increment counter by amount
   */
  async incrementCounterBy(contractAddress: string, amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0.'
      };
    }

    // Pre-check: Get current count to validate increment is possible
    try {
      const currentCount = await this.getContractCount(contractAddress);
      if (currentCount !== null && currentCount + amount > 1000000) { // MAX_COUNT
        return {
          success: false,
          error: `Cannot increment by ${amount}: Maximum count limit (1,000,000) would be exceeded.`
        };
      }
    } catch (error) {
      console.warn('Could not pre-validate incrementBy operation:', error);
    }

    return await this.executeContract(contractAddress, 'incrementBy', [amount], 350000);
  }

  /**
   * Decrement counter by amount
   */
  async decrementCounterBy(contractAddress: string, amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0.'
      };
    }

    // Pre-check: Get current count to validate decrement is possible
    try {
      const currentCount = await this.getContractCount(contractAddress);
      if (currentCount !== null && (currentCount < amount || currentCount - amount < 0)) { // MIN_COUNT
        return {
          success: false,
          error: `Cannot decrement by ${amount}: Minimum count limit (0) would be exceeded.`
        };
      }
    } catch (error) {
      console.warn('Could not pre-validate decrementBy operation:', error);
    }

    return await this.executeContract(contractAddress, 'decrementBy', [amount], 350000);
  }

  /**
   * Debug function to get comprehensive contract information
   */
  async debugContractState(contractAddress: string): Promise<any> {
    try {
      console.log('🔍 Starting debugContractState for:', contractAddress);
      const contractABI = this.getCounterContractABI();
      const contract = new ethers.Contract(contractAddress, contractABI, this.provider);

      console.log('🔍 Contract instance created, calling getContractInfo...');

      // Try to call getContractInfo
      let debugInfo;
      try {
        const [count, owner, paused, maxCount, minCount] = await contract.getContractInfo();

        debugInfo = {
          contractAddress,
          currentCount: count.toNumber(),
          owner: owner,
          isPaused: paused,
          maxCount: maxCount.toNumber(),
          minCount: minCount.toNumber(),
          connectedAccount: this.connection?.accountId,
          network: this.connection?.network,
          chainId: await this.provider.request({ method: 'eth_chainId' })
        };
        console.log('✅ getContractInfo succeeded:', debugInfo);
      } catch (contractInfoError) {
        console.warn('❌ getContractInfo failed, trying individual calls:', contractInfoError);

        // Fallback: try individual function calls
        try {
          const count = await contract.getCount();
          const owner = await contract.getOwner();
          const isPaused = await contract.isPaused();

          debugInfo = {
            contractAddress,
            currentCount: count.toNumber(),
            owner: owner,
            isPaused: isPaused,
            maxCount: 1000000, // Default values
            minCount: 0,
            connectedAccount: this.connection?.accountId,
            network: this.connection?.network,
            chainId: await this.provider.request({ method: 'eth_chainId' })
          };
          console.log('✅ Individual calls succeeded:', debugInfo);
        } catch (individualError) {
          console.error('❌ Individual calls also failed:', individualError);
          throw individualError;
        }
      }

      console.log('🔍 Final Contract Debug Info:', debugInfo);
      return debugInfo;
    } catch (error) {
      console.error('❌ Failed to get contract debug info:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
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
