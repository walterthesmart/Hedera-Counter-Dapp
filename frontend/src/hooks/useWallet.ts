/**
 * React hook for wallet management
 */

import { useState, useEffect, useCallback } from 'react';
import { WalletConnection, UseWalletReturn } from '@/types';
import {
  hashPackWallet,
  connectHashPack,
  disconnectHashPack,
  getHashPackConnection,
  isHashPackConnected
} from '@/utils/hashpack';
import { SUCCESS_MESSAGES } from '@/utils/config';

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved wallet connection on mount
  useEffect(() => {
    const savedWallet = getHashPackConnection();
    if (savedWallet && savedWallet.isConnected) {
      setWallet(savedWallet);
    }
  }, []);

  // Check if HashPack is available
  const isHashPackAvailable = useCallback(() => {
    return hashPackWallet.isAvailable();
  }, []);

  // Connect to HashPack wallet
  const connect = useCallback(async () => {
    if (!isHashPackAvailable()) {
      setError('HashPack wallet is not installed. Please install the HashPack browser extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const connection = await connectHashPack();
      setWallet(connection);

      // Show success message
      console.log(SUCCESS_MESSAGES.WALLET_CONNECTED);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to HashPack wallet';
      setError(errorMessage);
      console.error('HashPack connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [isHashPackAvailable]);

  // Disconnect from HashPack wallet
  const disconnect = useCallback(async () => {
    try {
      await disconnectHashPack();
      setWallet(null);
      setError(null);

      // Show success message
      console.log('HashPack wallet disconnected successfully');
    } catch (error) {
      console.error('HashPack disconnect failed:', error);
      // Even if disconnect fails, clear the local state
      setWallet(null);
    }
  }, []);

  return {
    wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!wallet?.isConnected,
    isHashPackAvailable: isHashPackAvailable(),
  };
};
