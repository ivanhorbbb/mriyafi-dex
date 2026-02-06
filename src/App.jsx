import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import PoolsCard from './components/PoolsCard';
import { translations } from './translations';
import { Toaster } from 'react-hot-toast';

import { useTokenBalances } from './hooks/useTokenBalances';

const BackgroundEffects = React.memo(() => {
  return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#050b14]">
            <div 
                className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] opacity-30 animate-pulse-slow"
                style={{
                    background: 'radial-gradient(circle, rgba(0,102,255,0.4) 0%, rgba(0,102,255,0) 70%)',
                    transform: 'translateZ(0)',
                }} 
            />
            <div 
                className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 170, 0, 0.4) 0%, rgba(255,170,0,0) 90%)',
                    transform: 'translateZ(0)',
                }} 
            />
            <div 
                className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[50vw] opacity-10"
                style={{
                    background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, rgba(0,212,255,0) 70%)',
                    transform: 'translateZ(0)',
                }} 
            />
        </div>
    );
});

const Earn = React.memo(({ t }) => (
    <div className="glass-panel p-10 rounded-3xl max-w-3xl w-full text-center animate-fade-in border border-white/10 bg-[#131823]/60 backdrop-blur-xl">
        <h2 className="text-4xl font-bold text-white mb-4">{t.nav.earn}</h2>
        <p className="text-xl text-gray-400">Staking is coming soon...</p>
    </div>
));

function App() {
  const SEPOLIA_CHAIN_ID = '0xaa36a7';
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('swap');
  const [lang, setLang] = useState('en');

  const { balances, refetch } = useTokenBalances(provider, account);

  const connectWallet = useCallback(async () => {

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && !window.ethereum) {
        const currentUrl = window.location.host + window.location.pathname;
        window.location.href = `https://metamask.app.link/dapp/${currentUrl}?connect=true`;
        return;
    }

    if (window.ethereum) { 
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await newProvider.send("eth_requestAccounts", []);

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (chainId !== SEPOLIA_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: SEPOLIA_CHAIN_ID }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: 'Sepolia Test Network',
                                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                                rpcUrls: ['https://sepolia.drpc.org'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                            },
                        ],
                    });
                } else {
                    throw switchError;
                }
            }
        }

        setAccount(accounts[0]);
        setProvider(newProvider);
        localStorage.setItem('isWalletConnected', 'true');

        const url = new URL(window.location.href);
        if (url.searchParams.get('connect')) {
             url.searchParams.delete('connect');
             window.history.replaceState({}, document.title, url.pathname);
        }

      } catch (error) {
        console.error("User rejected request:", error);
      }
    } else {
      alert("Please install MetaMask to use this app!");
      window.open("https://metamask.io/download/", "_blank");
    }
  }, []);
  
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    localStorage.removeItem('isWalletConnected');
  }, []);

  
  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ua' : 'en');
  }, []);

  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldAutoConnect = urlParams.get('connect') === 'true';
      const storedConnection = localStorage.getItem('isWalletConnected') === 'true';

      if (!window.ethereum) return;

      if (shouldAutoConnect || storedConnection) {
          try {
              if (shouldAutoConnect) {
                  setTimeout(async () => {
                      await connectWallet();
                  }, 1000)
              } else {
                  const accounts = await window.ethereum.request({ method: "eth_accounts" });
                  if (accounts.length > 0) {
                      setAccount(accounts[0]);
                      setProvider(new ethers.BrowserProvider(window.ethereum));
                  }
              }
          } catch (e) {
              console.error(e);
          }
      }
    };

    init();

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setProvider(new ethers.BrowserProvider(window.ethereum));
        } else {
            setAccount(null);
            setProvider(null);
        }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', () => window.location.reload());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = translations[lang];


  const memoizedHeader = useMemo(() => (
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        toggleLang={toggleLang}
        t={t.nav}
        account={account}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />
        // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [activeTab, lang, t.nav, account, connectWallet, toggleLang]);

  const memoizedFooter = useMemo(() => (
      <footer className="w-full text-center py-6 text-sm text-gray-600 font-mono mt-6">
        MriyaFi DEX &copy; 2025
      </footer>
  ), [])

  
  const content = useMemo(() => {
    switch(activeTab) {
      case 'swap': return <SwapCard t={t.swap} account={account} balances={balances} provider={provider} connectWallet={connectWallet} refetchBalances={refetch} />;
      case 'pools': return <PoolsCard t={t.pools} />;
      case 'earn': return <Earn t={t} />;
      default: return <SwapCard t={t.swap} account={account} balances={balances} provider={provider} connectWallet={connectWallet} refetchBalances={refetch} />;
    }
  }, [activeTab, t, account, balances, provider, connectWallet, refetch]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#050b14] text-white font-sans selection:bg-[#00d4ff]/30 selection:text-white">
      
      {/* TOASTER */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#131823',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#00d4ff',
              secondary: '#131823',
            },
          },
        }}
      />
      
      {/* EFFECTS */}
      <BackgroundEffects />

      <div className="relative z-20 flex flex-col min-h-screen">
        {memoizedHeader}
        
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 mt-16 md:p-6 md:scale-110 transition-transform duration-500 origin-center will-change-transform">
           {content}
        </main>

        {memoizedFooter}
      </div>
    </div>
  );
}

export default App;