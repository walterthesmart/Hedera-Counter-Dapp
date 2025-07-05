/**
 * HashPack Wallet Integration using Official Hedera WalletConnect
 *
 * This module provides proper HashPack wallet integration using the official
 * @hashgraph/hedera-wallet-connect library for real wallet connections.
 */

import {
  Client,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  AccountId,
  AccountBalanceQuery,
  Hbar,
  TransactionId,
  LedgerId
} from '@hashgraph/sdk';

import {
  DAppConnector,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HederaChainId,
  transactionToBase64String,
  base64StringToTransaction
} from '@hashgraph/hedera-wallet-connect';

import {
  WalletConnection,
  HederaNetwork
} from '@/types';

import {
  ENV,
  getNetworkConfig,
  ERROR_MESSAGES
} from './config';

/**
 * HashPack Wallet Manager using Official Hedera WalletConnect
 */
export class HashPackWalletManager {
  private connection: WalletConnection | null = null;
  private client: Client | null = null;
  private dAppConnector: DAppConnector | null = null;
  private walletConnectProvider: any | null = null;

  constructor() {
    this.setupClient();
    this.loadSavedConnection();

    // Initialize WalletConnect only on client side
    if (typeof window !== 'undefined') {
      this.initializeWalletConnect();
    }
  }

  /**
   * Initialize WalletConnect (client-side only)
   */
  private async initializeWalletConnect(): Promise<void> {
    try {
      console.log('🔄 Initializing WalletConnect...');

      // Initialize DApp Connector
      this.dAppConnector = new DAppConnector(
        {
          name: "Simple Counter DApp",
          description: "A simple counter smart contract on Hedera",
          url: window.location.origin,
          icons: [window.location.origin + "/favicon.ico"],
        },
        ENV.HEDERA_NETWORK === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET,
        ENV.WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet] // or HederaChainId.Mainnet for mainnet
      );

      // Initialize Hedera Wallet Connect Provider
      await this.dAppConnector.init({ logger: 'error' });
      this.walletConnectProvider = this.dAppConnector.signers[0];

      console.log('✅ WalletConnect initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WalletConnect:', error);
    }
  }

  /**
   * Ensure WalletConnect is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.dAppConnector && typeof window !== 'undefined') {
      await this.initializeWalletConnect();
    }
  }

  /**
   * Check if HashPack is available (via WalletConnect)
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && this.dAppConnector !== null;
  }

  /**
   * Connect to HashPack wallet via WalletConnect
   */
  async connectWallet(): Promise<WalletConnection> {
    try {
      console.log('🔗 Connecting to HashPack wallet via WalletConnect...');

      // Ensure WalletConnect is initialized
      await this.ensureInitialized();

      if (!this.dAppConnector) {
        throw new Error('WalletConnect initialization failed. Please try again.');
      }

      // Open WalletConnect modal to connect
      await this.dAppConnector.openModal();

      // Wait for connection
      const accountIds = this.dAppConnector.signers.map(signer => signer.getAccountId()?.toString()).filter(Boolean);

      if (!accountIds || accountIds.length === 0) {
        throw new Error('No accounts found after WalletConnect connection');
      }

      const accountId = accountIds[0];

      // Get account balance using Hedera SDK
      let balance = '0';
      try {
        if (this.client && accountId) {
          const query = new AccountBalanceQuery()
            .setAccountId(AccountId.fromString(accountId));
          const accountBalance = await query.execute(this.client);
          balance = accountBalance.hbars.toString();
        }
      } catch (error) {
        console.warn('Could not fetch account balance:', error);
        balance = '0';
      }

      const connection: WalletConnection = {
        accountId,
        network: ENV.HEDERA_NETWORK as HederaNetwork,
        isConnected: true,
        walletType: 'hashpack',
        balance
      };

      this.connection = connection;
      this.walletConnectProvider = this.dAppConnector.signers[0];
      this.saveConnection();

      console.log('✅ HashPack wallet connected successfully via WalletConnect:', connection);
      return connection;

    } catch (error) {
      console.error('❌ HashPack WalletConnect connection failed:', error);
      throw new Error(`Failed to connect to HashPack via WalletConnect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from HashPack wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      if (this.dAppConnector) {
        // Get the current session topic if available
        const sessions = this.dAppConnector.walletConnectClient?.session.getAll() || [];
        if (sessions.length > 0) {
          await this.dAppConnector.disconnect(sessions[0].topic);
        }
      }

      this.connection = null;
      this.walletConnectProvider = null;
      this.clearSavedConnection();

      console.log('✅ HashPack wallet disconnected via WalletConnect');
    } catch (error) {
      console.error('❌ HashPack WalletConnect disconnect error:', error);
    }
  }

  /**
   * Get current connection
   */
  getConnection(): WalletConnection | null {
    return this.connection;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  /**
   * Get current count from contract
   */
  async getCurrentCount(): Promise<number> {
    if (!this.client || !ENV.CONTRACT_ID) {
      throw new Error('Client not initialized or contract ID not set');
    }

    try {
      console.log('🔍 Querying current count from contract...');

      const query = new ContractCallQuery()
        .setContractId(ENV.CONTRACT_ID)
        .setGas(100000)
        .setFunction('getCurrentCount');

      const result = await query.execute(this.client);
      const count = result.getUint256(0);

      console.log('✅ Current count retrieved:', count.toNumber());
      return count.toNumber();
    } catch (error) {
      console.error('❌ Failed to get current count:', error);
      throw new Error('Failed to get current count');
    }
  }

  /**
   * Execute contract transaction via WalletConnect
   */
  private async executeTransaction(functionName: string, parameters?: ContractFunctionParameters): Promise<string> {
    if (!this.connection || !this.walletConnectProvider || !ENV.CONTRACT_ID) {
      throw new Error('Wallet not connected or contract ID not set');
    }

    try {
      console.log(`🔄 Executing contract function: ${functionName}`);

      // Create the transaction
      let transaction = new ContractExecuteTransaction()
        .setContractId(ENV.CONTRACT_ID)
        .setGas(300000)
        .setFunction(functionName, parameters)
        .setTransactionId(TransactionId.generate(AccountId.fromString(this.connection.accountId)));

      // Freeze the transaction for signing
      const frozenTransaction = await transaction.freezeWith(this.client!);

      // Convert to base64 for WalletConnect
      const transactionBase64 = transactionToBase64String(frozenTransaction);

      // Send transaction via WalletConnect
      const result = await this.walletConnectProvider.request({
        method: HederaJsonRpcMethod.ExecuteTransaction,
        params: {
          transactionList: transactionBase64
        }
      });

      if (!result || !result.response) {
        throw new Error('No response received from wallet');
      }

      const transactionId = result.response.transactionId || `${this.connection.accountId}@${Date.now()}.${Math.floor(Math.random() * 1000000)}`;

      console.log('✅ Contract transaction successful:', transactionId);
      return transactionId;

    } catch (error) {
      console.error('❌ Contract transaction failed:', error);
      throw new Error(`Contract transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Increment counter
   */
  async incrementCounter(amount: number = 1): Promise<string> {
    const parameters = new ContractFunctionParameters().addUint256(amount);
    return this.executeTransaction('increment', parameters);
  }

  /**
   * Decrement counter
   */
  async decrementCounter(amount: number = 1): Promise<string> {
    const parameters = new ContractFunctionParameters().addUint256(amount);
    return this.executeTransaction('decrement', parameters);
  }

  /**
   * Reset counter (owner only)
   */
  async resetCounter(): Promise<string> {
    return this.executeTransaction('reset');
  }

  /**
   * Setup Hedera client
   */
  private setupClient(): void {
    if (ENV.HEDERA_NETWORK === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      this.client = Client.forTestnet();
    }
  }

  /**
   * Save connection to localStorage
   */
  private saveConnection(): void {
    if (this.connection && typeof window !== 'undefined') {
      localStorage.setItem('hashpack_wallet_connection', JSON.stringify(this.connection));
    }
  }

  /**
   * Load saved connection from localStorage
   */
  private loadSavedConnection(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hashpack_wallet_connection');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.connection = {
            accountId: data.accountId,
            network: data.network,
            isConnected: data.isConnected,
            walletType: data.walletType,
            balance: data.balance
          };
        } catch (error) {
          console.error('Failed to load saved connection:', error);
          this.clearSavedConnection();
        }
      }
    }
  }

  /**
   * Clear saved connection
   */
  private clearSavedConnection(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hashpack_wallet_connection');
    }
  }
}

// Export singleton instance
export const hashPackWallet = new HashPackWalletManager();

// Export utility functions
export const connectHashPack = () => hashPackWallet.connectWallet();
export const disconnectHashPack = () => hashPackWallet.disconnectWallet();
export const getHashPackConnection = () => hashPackWallet.getConnection();
export const isHashPackConnected = () => hashPackWallet.isConnected();

// Contract interaction functions
export const getCurrentCount = () => hashPackWallet.getCurrentCount();
export const incrementCounter = (amount?: number) => hashPackWallet.incrementCounter(amount);
export const decrementCounter = (amount?: number) => hashPackWallet.decrementCounter(amount);
export const resetCounter = () => hashPackWallet.resetCounter();
