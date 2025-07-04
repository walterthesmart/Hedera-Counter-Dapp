/**
 * Wallet connection button component
 */

import React from 'react';
import { Wallet, LogOut, AlertCircle, Download } from 'lucide-react';
import { WalletButtonProps } from '@/types';
import { getWalletManager, isWalletAvailable, getWalletInstallInstructions } from '@/utils/wallet';
import { truncateAddress } from '@/utils/config';

export const WalletButton: React.FC<WalletButtonProps> = ({
  onConnect,
  onDisconnect,
  wallet,
  isConnecting = false,
}) => {
  const walletManager = getWalletManager();
  const availableWallets = walletManager.getAvailableWallets();
  const hasWalletConnect = true; // WalletConnect is always available

  // Show wallet installation help if needed
  const showWalletHelp = () => {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-warning-500" />
          <h3 className="text-lg font-semibold">Need a Hedera Wallet?</h3>
        </div>

        <p className="text-gray-600 mb-4">
          You need a Hedera-compatible wallet to interact with this dApp. WalletConnect supports multiple wallets.
        </p>

        <div className="space-y-3">
          {Object.entries(getWalletInstallInstructions()).map(([key, walletInfo]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{walletInfo.name}</h4>
                <a
                  href={walletInfo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Get Wallet
                </a>
              </div>
              <p className="text-sm text-gray-600 mb-3">{walletInfo.description}</p>
              <ol className="text-sm text-gray-600 space-y-1">
                {walletInfo.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs font-medium flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          ))}
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
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">
          Connect your Hedera wallet via WalletConnect to interact with the counter contract
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onConnect()}
          disabled={isConnecting}
          className="w-full btn btn-primary flex items-center justify-center space-x-3 py-4"
        >
          {isConnecting ? (
            <>
              <div className="loading-spinner w-5 h-5" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect via WalletConnect</span>
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Supports multiple Hedera wallets:
          </p>
          <div className="flex justify-center space-x-4">
            {availableWallets.map((walletOption) => (
              <div key={walletOption.id} className="text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                  <Wallet className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600">{walletOption.name}</span>
              </div>
            ))}
          </div>
        </div>
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
          {showWalletHelp()}
        </div>
      </details>
    </div>
  );
};
