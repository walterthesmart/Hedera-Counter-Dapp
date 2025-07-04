/**
 * React hook for wallet management
 */

import { useState, useEffect, useCallback } from 'react';
import { WalletConnection, UseWalletReturn } from '@/types';
import { 
  getWalletManager, 
  saveWalletConnection, 
  loadWalletConnection, 
  clearWalletConnection,
  formatWalletError 
} from '@/utils/wallet';
import { SUCCESS_MESSAGES } from '@/utils/config';

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletManager = getWalletManager();

  // Load saved wallet connection on mount
  useEffect(() => {
    const savedWallet = loadWalletConnection();
    if (savedWallet) {
      setWallet(savedWallet);
      // Optionally validate the connection
      validateConnection(savedWallet);
    }
  }, []);

  // Validate wallet connection
  const validateConnection = async (walletConnection: WalletConnection) => {
    try {
      const isValid = await walletManager.validateConnection();
      if (!isValid) {
        // Connection is no longer valid, clear it
        disconnect();
      }
    } catch (error) {
      console.error('Wallet validation failed:', error);
      disconnect();
    }
  };

  // Connect to wallet via WalletConnect
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const connection = await walletManager.connect();
      setWallet(connection);
      saveWalletConnection(connection);

      // Show success message (you might want to use a toast library)
      console.log(SUCCESS_MESSAGES.WALLET_CONNECTED);
    } catch (error) {
      const errorMessage = formatWalletError(error);
      setError(errorMessage);
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [walletManager]);

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    try {
      await walletManager.disconnect();
      setWallet(null);
      clearWalletConnection();
      setError(null);
      
      // Show success message
      console.log(SUCCESS_MESSAGES.WALLET_DISCONNECTED);
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
    }
  }, [walletManager]);

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const savedWallet = loadWalletConnection();
      if (savedWallet && !wallet && !isConnecting) {
        try {
          await connect();
        } catch (error) {
          // Auto-connect failed, user will need to manually connect
          console.log('Auto-connect failed, manual connection required');
        }
      }
    };

    autoConnect();
  }, [connect, wallet, isConnecting]);

  return {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
  };
};
