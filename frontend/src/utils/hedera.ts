/**
 * Hedera SDK utilities and helper functions
 */

import {
  Client,
  AccountId,
  ContractId,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionId,
  TransactionReceipt,
  Status,
} from '@hashgraph/sdk';

import { HederaNetwork, ContractInfo, ContractCallResult } from '@/types';
import { APP_CONFIG, CONTRACT_CONSTANTS, getNetworkConfig } from './config';

/**
 * Create a Hedera client for the specified network
 */
export const createHederaClient = (network: HederaNetwork = APP_CONFIG.network): Client => {
  switch (network) {
    case 'mainnet':
      return Client.forMainnet();
    case 'previewnet':
      return Client.forPreviewnet();
    case 'testnet':
    default:
      return Client.forTestnet();
  }
};

/**
 * Query contract function (read-only)
 */
export const queryContract = async (
  contractId: string,
  functionName: string,
  parameters?: ContractFunctionParameters,
  network: HederaNetwork = APP_CONFIG.network
): Promise<ContractCallResult> => {
  const client = createHederaClient(network);
  
  try {
    const query = new ContractCallQuery()
      .setContractId(ContractId.fromString(contractId))
      .setGas(100000)
      .setFunction(functionName, parameters);

    const result = await query.execute(client);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(`Contract query failed for ${functionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    client.close();
  }
};

/**
 * Execute contract function (write operation)
 * Note: This requires wallet integration for signing
 */
export const executeContract = async (
  contractId: string,
  functionName: string,
  parameters?: ContractFunctionParameters,
  gasLimit: number = CONTRACT_CONSTANTS.GAS_LIMIT,
  maxTransactionFee: number = CONTRACT_CONSTANTS.MAX_TRANSACTION_FEE
): Promise<ContractCallResult> => {
  try {
    // This will be implemented with wallet integration
    // For now, return a placeholder
    return {
      success: false,
      error: 'Wallet integration required for contract execution',
    };
  } catch (error) {
    console.error(`Contract execution failed for ${functionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get current counter value from contract
 */
export const getCounterValue = async (
  contractId: string,
  network: HederaNetwork = APP_CONFIG.network
): Promise<number | null> => {
  const result = await queryContract(contractId, 'getCount', undefined, network);
  
  if (result.success && result.data) {
    try {
      return result.data.getUint256(0).toNumber();
    } catch (error) {
      console.error('Failed to parse counter value:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Get complete contract information
 */
export const getContractInfo = async (
  contractId: string,
  network: HederaNetwork = APP_CONFIG.network
): Promise<ContractInfo | null> => {
  const result = await queryContract(contractId, 'getContractInfo', undefined, network);
  
  if (result.success && result.data) {
    try {
      const count = result.data.getUint256(0).toNumber();
      const owner = result.data.getAddress(1);
      const isPaused = result.data.getBool(2);
      const maxCount = result.data.getUint256(3).toNumber();
      const minCount = result.data.getUint256(4).toNumber();
      
      return {
        contractId,
        count,
        owner: `0x${owner}`,
        isPaused,
        maxCount,
        minCount,
      };
    } catch (error) {
      console.error('Failed to parse contract info:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Check if contract is paused
 */
export const isContractPaused = async (
  contractId: string,
  network: HederaNetwork = APP_CONFIG.network
): Promise<boolean> => {
  const result = await queryContract(contractId, 'isPaused', undefined, network);
  
  if (result.success && result.data) {
    try {
      return result.data.getBool(0);
    } catch (error) {
      console.error('Failed to parse pause status:', error);
      return false;
    }
  }
  
  return false;
};

/**
 * Get contract owner address
 */
export const getContractOwner = async (
  contractId: string,
  network: HederaNetwork = APP_CONFIG.network
): Promise<string | null> => {
  const result = await queryContract(contractId, 'getOwner', undefined, network);
  
  if (result.success && result.data) {
    try {
      const owner = result.data.getAddress(0);
      return `0x${owner}`;
    } catch (error) {
      console.error('Failed to parse owner address:', error);
      return null;
    }
  }
  
  return null;
};

/**
 * Validate contract ID format
 */
export const validateContractId = (contractId: string): boolean => {
  try {
    ContractId.fromString(contractId);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate account ID format
 */
export const validateAccountId = (accountId: string): boolean => {
  try {
    AccountId.fromString(accountId);
    return true;
  } catch {
    return false;
  }
};

/**
 * Convert transaction ID to string
 */
export const formatTransactionId = (transactionId: TransactionId): string => {
  return transactionId.toString();
};

/**
 * Convert HBAR amount to tinybars
 */
export const hbarToTinybars = (hbar: number): number => {
  return Math.floor(hbar * 100_000_000);
};

/**
 * Convert tinybars to HBAR
 */
export const tinybarsToHbar = (tinybars: number): number => {
  return tinybars / 100_000_000;
};

/**
 * Format HBAR amount for display
 */
export const formatHbarAmount = (amount: number, decimals: number = 8): string => {
  return `${amount.toFixed(decimals)} ℏ`;
};

/**
 * Get transaction status from receipt
 */
export const getTransactionStatus = (receipt: TransactionReceipt): 'success' | 'error' => {
  return receipt.status === Status.Success ? 'success' : 'error';
};

/**
 * Create contract function parameters for increment by amount
 */
export const createIncrementByParams = (amount: number): ContractFunctionParameters => {
  return new ContractFunctionParameters().addUint256(amount);
};

/**
 * Create contract function parameters for decrement by amount
 */
export const createDecrementByParams = (amount: number): ContractFunctionParameters => {
  return new ContractFunctionParameters().addUint256(amount);
};

/**
 * Get network explorer URL for transaction
 */
export const getTransactionExplorerUrl = (
  transactionId: string,
  network: HederaNetwork = APP_CONFIG.network
): string => {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/transaction/${transactionId}`;
};

/**
 * Get network explorer URL for contract
 */
export const getContractExplorerUrl = (
  contractId: string,
  network: HederaNetwork = APP_CONFIG.network
): string => {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/contract/${contractId}`;
};

/**
 * Get network explorer URL for account
 */
export const getAccountExplorerUrl = (
  accountId: string,
  network: HederaNetwork = APP_CONFIG.network
): string => {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/account/${accountId}`;
};

/**
 * Error handling utilities
 */
export const parseHederaError = (error: any): string => {
  if (error?.message) {
    // Common Hedera error patterns
    if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      return 'Insufficient HBAR balance for transaction';
    }
    if (error.message.includes('CONTRACT_REVERT_EXECUTED')) {
      return 'Contract execution reverted';
    }
    if (error.message.includes('INVALID_CONTRACT_ID')) {
      return 'Invalid contract ID';
    }
    if (error.message.includes('TIMEOUT')) {
      return 'Transaction timeout';
    }
    
    return error.message;
  }
  
  return 'Unknown Hedera error';
};

/**
 * Retry mechanism for network calls
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};
