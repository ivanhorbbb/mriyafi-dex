import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers';
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import PoolsCard from './components/PoolsCard';
import { translations } from './translations';

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
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('swap');
  const [lang, setLang] = useState('en');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { balances } = useTokenBalances(provider, account, refreshTrigger);

  const updateBalances = useCallback(() => {
      setRefreshTrigger(prev => prev + 1);
  }, []);

  const connectWallet = useCallback(async () => {
    if (window.ethereum) { 
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await newProvider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(newProvider);
      } catch (error) {
        console.error("User rejected request:", error);
      }
    } else {
      alert("Please install MetaMask to use this app!");
    }
  }, []);

  const disconnectWallet = async () => {
    setAccount(null);
    
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }]
      });
    } catch (error) {
      console.error("Failed to revoke permissions (user rejected or not supported)", error);
    }
  };

  
  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ua' : 'en');
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const init = async () => {
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                setProvider(new ethers.BrowserProvider(window.ethereum));
            }
        } catch (e) {
            console.error(e);
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
  ), [activeTab, lang, t.nav, account, connectWallet, toggleLang]);

  const memoizedFooter = useMemo(() => (
      <footer className="w-full text-center py-6 text-sm text-gray-600 font-mono mt-6">
        MriyaFi DEX &copy; 2025
      </footer>
  ), [])

  
  const content = useMemo(() => {
    switch(activeTab) {
      case 'swap': return <SwapCard t={t.swap} account={account} balances={balances} provider={provider} connectWallet={connectWallet} updateBalances={updateBalances} />;
      case 'pools': return <PoolsCard t={t.pools} />;
      case 'earn': return <Earn t={t} />;
      default: return <SwapCard t={t.swap} account={account} balances={balances}/>;
    }
  }, [activeTab, t, account, balances, provider, connectWallet, updateBalances]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#050b14] text-white font-sans selection:bg-[#00d4ff]/30 selection:text-white">
      
      {/* EFFECTS */}
      <BackgroundEffects />

      <div className="relative z-10 flex flex-col min-h-screen">
        {memoizedHeader}
        
        <main className="flex-grow flex flex-col items-center justify-center p-6 mt-16 md:scale-110 transition-transform duration-500 origin-center will-change-transform">
           {content}
        </main>

        {memoizedFooter}
      </div>
    </div>
  );
}

export default App;