/**
 * Type definitions for the Hedera Counter DApp
 */

// Hedera Network Types
export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet';

// Wallet Connection Types
export interface WalletConnection {
  accountId: string;
  isConnected: boolean;
  network: HederaNetwork;
  balance?: string;
}

// Contract Types
export interface ContractInfo {
  contractId: string;
  count: number;
  owner: string;
  isPaused: boolean;
  maxCount: number;
  minCount: number;
}

// Transaction Types
export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface Transaction {
  id: string;
  type: 'increment' | 'decrement' | 'incrementBy' | 'decrementBy' | 'reset';
  status: TransactionStatus;
  hash?: string;
  timestamp: number;
  amount?: number;
  error?: string;
}

// UI State Types
export interface AppState {
  wallet: WalletConnection | null;
  contract: ContractInfo | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// Component Props Types
export interface CounterDisplayProps {
  count: number;
  isLoading?: boolean;
  maxCount?: number;
  minCount?: number;
}

export interface WalletButtonProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  wallet: WalletConnection | null;
  isConnecting?: boolean;
}

export interface TransactionButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export interface TransactionHistoryProps {
  transactions: Transaction[];
  network: HederaNetwork;
}

// API Response Types
export interface ContractCallResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Configuration Types
export interface AppConfig {
  contractId: string;
  network: HederaNetwork;
  mirrorNodeUrl?: string;
  appName: string;
}

// Wallet Provider Types (for WalletConnect and other wallets)
export interface WalletProvider {
  name: string;
  icon: string;
  isAvailable: boolean;
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
}

// WalletConnect specific types
export interface WalletConnectSession {
  topic: string;
  peer: {
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  namespaces: Record<string, any>;
}

export interface WalletConnectProvider {
  connect: () => Promise<WalletConnectSession>;
  disconnect: () => Promise<void>;
  request: (params: any) => Promise<any>;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

// Mirror Node API Types
export interface MirrorNodeTransaction {
  transaction_id: string;
  consensus_timestamp: string;
  result: string;
  transaction_hash: string;
  transfers: Array<{
    account: string;
    amount: number;
  }>;
}

export interface MirrorNodeResponse<T> {
  transactions?: T[];
  links?: {
    next: string | null;
  };
}

// Form Types
export interface IncrementByFormData {
  amount: number;
}

export interface DecrementByFormData {
  amount: number;
}

// Hook Return Types
export interface UseWalletReturn {
  wallet: WalletConnection | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
  isConnected: boolean;
  isHashPackAvailable: boolean;
}

export interface UseContractReturn {
  contract: ContractInfo | null;
  increment: () => Promise<void>;
  decrement: () => Promise<void>;
  incrementBy: (amount: number) => Promise<void>;
  decrementBy: (amount: number) => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event Types
export interface ContractEvent {
  name: string;
  args: any[];
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}
