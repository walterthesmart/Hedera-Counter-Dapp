/**
 * Wallet connection button component
 */

import React from 'react';
import { Wallet, LogOut, AlertCircle, Download } from 'lucide-react';
import { WalletButtonProps } from '@/types';
import { hashPackWallet } from '@/utils/hashpack';
import { truncateAddress } from '@/utils/config';

export const WalletButton: React.FC<WalletButtonProps> = ({
  onConnect,
  onDisconnect,
  wallet,
  isConnecting = false,
}) => {
  const isHashPackAvailable = hashPackWallet.isAvailable();

  // Show HashPack installation help if needed
  const showHashPackHelp = () => {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-warning-500" />
          <h3 className="text-lg font-semibold">HashPack Wallet Required</h3>
        </div>

        <p className="text-gray-600 mb-4">
          To interact with this Hedera smart contract, you need the HashPack wallet extension.
        </p>

        <div className="space-y-3">
          <a
            href="https://www.hashpack.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Install HashPack Wallet</span>
          </a>

          <div className="text-sm text-gray-500">
            <p>After installation:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Create or import your Hedera account</li>
              <li>Make sure you're on the Hedera Testnet</li>
              <li>Refresh this page and click "Connect HashPack"</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  // If wallet is connected, show wallet info and disconnect button
  if (wallet) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Wallet Connected</p>
              <p className="text-sm text-gray-600">
                {truncateAddress(wallet.accountId)} • {wallet.network}
              </p>
            </div>
          </div>
          
          <button
            onClick={onDisconnect}
            className="btn btn-secondary"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </button>
        </div>
        
        {wallet.balance && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Balance: <span className="font-medium">{wallet.balance}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Show connect button for WalletConnect
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Your HashPack Wallet</h3>
        <p className="text-gray-600">
          Connect your HashPack wallet via WalletConnect to interact with the counter contract
        </p>
      </div>

      <div className="space-y-4">
        {!isHashPackAvailable ? (
          <div className="text-center">
            <p className="text-red-600 mb-3">HashPack wallet not detected</p>
            <a
              href="https://www.hashpack.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Install HashPack</span>
            </a>
          </div>
        ) : (
          <button
            onClick={() => onConnect()}
            disabled={isConnecting}
            className="w-full btn btn-primary flex items-center justify-center space-x-3 py-4"
          >
            {isConnecting ? (
              <>
                <div className="loading-spinner w-5 h-5" />
                <span>Connecting to HashPack...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect HashPack via WalletConnect</span>
              </>
            )}
          </button>
        )}

        {isHashPackAvailable && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Make sure HashPack is set to Hedera Testnet
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>New to Hedera?</strong> Get testnet HBAR from the{' '}
          <a
            href="https://portal.hedera.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Hedera Portal
          </a>{' '}
          to start testing.
        </p>
      </div>

      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
          Need help installing a wallet?
        </summary>
        <div className="mt-3">
          {showHashPackHelp()}
        </div>
      </details>
    </div>
  );
};
