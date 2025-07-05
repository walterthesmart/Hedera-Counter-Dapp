/**
 * Main page component for the Hedera Counter DApp
 */

import React, { useEffect } from 'react';
import Head from 'next/head';
import { Github, ExternalLink, BookOpen } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';
import { useTransactions } from '@/hooks/useTransactions';
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
    const txId = addTransaction({
      type: 'increment',
      status: 'pending',
    });

    try {
      const result = await increment();
      updateTransaction(txId, {
        status: 'success',
        hash: result?.transactionId || undefined
      });
    } catch (error) {
      updateTransaction(txId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    }
  };

  const handleDecrement = async () => {
    const txId = addTransaction({
      type: 'decrement',
      status: 'pending',
    });

    try {
      const result = await decrement();
      updateTransaction(txId, {
        status: 'success',
        hash: result?.transactionId || undefined
      });
    } catch (error) {
      updateTransaction(txId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    }
  };

  const handleIncrementBy = async (amount: number) => {
    const txId = addTransaction({
      type: 'incrementBy',
      status: 'pending',
      amount,
    });

    try {
      const result = await incrementBy(amount);
      updateTransaction(txId, {
        status: 'success',
        hash: result?.transactionId || undefined
      });
    } catch (error) {
      updateTransaction(txId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    }
  };

  const handleDecrementBy = async (amount: number) => {
    const txId = addTransaction({
      type: 'decrementBy',
      status: 'pending',
      amount,
    });

    try {
      const result = await decrementBy(amount);
      updateTransaction(txId, {
        status: 'success',
        hash: result?.transactionId || undefined
      });
    } catch (error) {
      updateTransaction(txId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Transaction failed'
      });
    }
  };

  const handleReset = async () => {
    const txId = addTransaction({
      type: 'reset',
      status: 'pending',
    });

    try {
      const result = await reset();
      updateTransaction(txId, {
        status: 'success',
        hash: result?.transactionId || undefined
      });
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
        <title>{`${APP_CONFIG.appName} - Hedera Blockchain Counter`}</title>
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

                {/* MetaMask Connect Button */}
                {wallet?.isConnected ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">
                        {wallet.accountId.slice(0, 8)}...
                      </span>
                    </div>
                    <button
                      onClick={disconnect}
                      className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Disconnect Wallet"
                    >
                      <span className="text-sm">⏻</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => connect('metamask')}
                    disabled={isConnecting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span>🦊</span>
                        <span>Connect MetaMask</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Counter */}
            <div className="lg:col-span-2 space-y-8">
              {/* Counter Display */}
              {contract && (
                <CounterDisplay
                  count={contract.count}
                  isLoading={contractLoading}
                  maxCount={contract.maxCount}
                  minCount={contract.minCount}
                  onRefresh={refresh}
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

              {/* Debug Section */}
              {wallet?.walletType === 'metamask' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold">Debug Information</h3>
                  </div>
                  <div className="card-content space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Contract ID:</strong> {APP_CONFIG.contractId}
                      </div>
                      <div>
                        <strong>Network:</strong> {APP_CONFIG.network}
                      </div>
                      <div>
                        <strong>Wallet:</strong> {wallet?.accountId}
                      </div>
                      <div>
                        <strong>Contract State:</strong> {contract ? 'Loaded' : 'Not loaded'}
                      </div>
                      <div>
                        <strong>Loading:</strong> {contractLoading ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <strong>Error:</strong> {contractError || 'None'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔍 Manual refresh triggered');
                          refresh();
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Debug Refresh
                      </button>
                      <button
                        onClick={async () => {
                          console.log('🔍 Manual contract test triggered');
                          try {
                            const { metaMaskWallet, hederaContractIdToEvmAddress } = await import('@/utils/metamask');
                            const contractAddress = hederaContractIdToEvmAddress(APP_CONFIG.contractId);
                            console.log('🔍 Testing contract at:', contractAddress);
                            const count = await metaMaskWallet.getContractCount(contractAddress);
                            console.log('🔍 Contract count result:', count);
                            alert(`Contract count: ${count}`);
                          } catch (error) {
                            console.error('🔍 Manual test failed:', error);
                            alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Test Contract
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
