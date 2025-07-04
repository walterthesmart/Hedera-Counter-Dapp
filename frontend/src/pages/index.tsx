/**
 * Main page component for the Hedera Counter DApp
 */

import React, { useEffect } from 'react';
import Head from 'next/head';
import { Github, ExternalLink, BookOpen } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';
import { useTransactions } from '@/hooks/useTransactions';
import { WalletButton } from '@/components/WalletButton';
import { CounterDisplay } from '@/components/CounterDisplay';
import { CounterControls } from '@/components/CounterControls';
import { TransactionHistory } from '@/components/TransactionHistory';
import { APP_CONFIG, getContractExplorerUrl } from '@/utils/config';

export default function Home() {
  const { wallet, connect, disconnect, isConnecting, error: walletError } = useWallet();
  const { 
    contract, 
    increment, 
    decrement, 
    incrementBy, 
    decrementBy, 
    reset, 
    refresh,
    isLoading: contractLoading, 
    error: contractError 
  } = useContract(wallet);
  const { 
    transactions, 
    addTransaction, 
    updateTransaction 
  } = useTransactions();

  // Add transaction tracking to contract operations
  const handleIncrement = async () => {
    const txId = `tx_${Date.now()}`;
    addTransaction({
      type: 'increment',
      status: 'pending',
    });
    
    try {
      await increment();
      updateTransaction(txId, { status: 'success' });
    } catch (error) {
      updateTransaction(txId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      });
    }
  };

  const handleDecrement = async () => {
    const txId = `tx_${Date.now()}`;
    addTransaction({
      type: 'decrement',
      status: 'pending',
    });
    
    try {
      await decrement();
      updateTransaction(txId, { status: 'success' });
    } catch (error) {
      updateTransaction(txId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      });
    }
  };

  const handleIncrementBy = async (amount: number) => {
    const txId = `tx_${Date.now()}`;
    addTransaction({
      type: 'incrementBy',
      status: 'pending',
      amount,
    });
    
    try {
      await incrementBy(amount);
      updateTransaction(txId, { status: 'success' });
    } catch (error) {
      updateTransaction(txId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      });
    }
  };

  const handleDecrementBy = async (amount: number) => {
    const txId = `tx_${Date.now()}`;
    addTransaction({
      type: 'decrementBy',
      status: 'pending',
      amount,
    });
    
    try {
      await decrementBy(amount);
      updateTransaction(txId, { status: 'success' });
    } catch (error) {
      updateTransaction(txId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      });
    }
  };

  const handleReset = async () => {
    const txId = `tx_${Date.now()}`;
    addTransaction({
      type: 'reset',
      status: 'pending',
    });
    
    try {
      await reset();
      updateTransaction(txId, { status: 'success' });
    } catch (error) {
      updateTransaction(txId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Transaction failed' 
      });
    }
  };

  return (
    <>
      <Head>
        <title>{APP_CONFIG.appName} - Hedera Blockchain Counter</title>
        <meta name="description" content="A complete educational Hedera blockchain project demonstrating smart contract interaction with a simple counter dApp." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-hedera-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">
                    {APP_CONFIG.appName}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Hedera Blockchain Counter
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/your-username/hedera-counter-dapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="View on GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                
                <a
                  href="/docs"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Documentation"
                >
                  <BookOpen className="w-5 h-5" />
                </a>

                {APP_CONFIG.contractId && (
                  <a
                    href={getContractExplorerUrl(APP_CONFIG.contractId, APP_CONFIG.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title="View Contract on HashScan"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Wallet & Counter */}
            <div className="lg:col-span-2 space-y-8">
              {/* Wallet Connection */}
              <WalletButton
                onConnect={connect}
                onDisconnect={disconnect}
                wallet={wallet}
                isConnecting={isConnecting}
              />

              {/* Counter Display */}
              {contract && (
                <CounterDisplay
                  count={contract.count}
                  isLoading={contractLoading}
                  maxCount={contract.maxCount}
                  minCount={contract.minCount}
                />
              )}

              {/* Counter Controls */}
              <CounterControls
                contract={contract}
                wallet={wallet}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onIncrementBy={handleIncrementBy}
                onDecrementBy={handleDecrementBy}
                onReset={handleReset}
                isLoading={contractLoading}
                error={contractError || walletError}
              />
            </div>

            {/* Right Column - Transaction History & Info */}
            <div className="space-y-8">
              {/* Transaction History */}
              <TransactionHistory
                transactions={transactions}
                network={APP_CONFIG.network}
              />

              {/* Contract Information */}
              {contract && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Contract Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract ID:</span>
                      <span className="font-mono">{APP_CONFIG.contractId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network:</span>
                      <span className="capitalize">{APP_CONFIG.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={contract.isPaused ? 'text-warning-600' : 'text-success-600'}>
                        {contract.isPaused ? 'Paused' : 'Active'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-mono text-xs">
                        {contract.owner.slice(0, 6)}...{contract.owner.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Help & Resources */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <div className="space-y-3">
                  <a
                    href="https://docs.hedera.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700"
                  >
                    <span>Hedera Documentation</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://portal.hedera.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700"
                  >
                    <span>Get Testnet HBAR</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.hashpack.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700"
                  >
                    <span>HashPack Wallet</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                Built with ❤️ for the Hedera community
              </p>
              <p className="text-sm">
                This is an educational project demonstrating Hedera smart contract development
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
