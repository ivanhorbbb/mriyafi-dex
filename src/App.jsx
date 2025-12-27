import React, { useState } from 'react'
import Header from './components/Header';
import SwapCard from './components/SwapCard';
import PoolsCard from './components/PoolsCard';
import { translations } from './translations';

const Earn = ({ t }) => (
    <div className="glass-panel p-10 rounded-3xl max-w-3xl w-full text-center animate-fade-in border border-white/10 bg-[#131823]/60 backdrop-blur-xl">
        <h2 className="text-4xl font-bold text-white mb-4">{t.nav.earn}</h2>
        <p className="text-xl text-gray-400">Staking is coming soon...</p>
    </div>
);

function App() {
  
  const [activeTab, setActiveTab] = useState('swap');
  const [lang, setLang] = useState('en');

  const t = translations[lang];

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ua' : 'en');
  };

  
  const renderContent = () => {
    switch(activeTab) {
      case 'swap': return <SwapCard t={t.swap} />;
      case 'pools': return <PoolsCard t={t.pools} />;
      case 'earn': return <Earn t={t} />;
      default: return <SwapCard t={t.swap} />;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#050b14] text-white font-sans selection:bg-[#00d4ff]/30 selection:text-white">
      
      {/* EFFECTS */}
      <div className="fixed top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-[#0066ff]/20 rounded-full blur-[160px] pointer-events-none mix-blend-screen animate-pulse-slow" />
      <div className="fixed top-[20%] -left-[10%] w-[800px] h-[800px] bg-[#ffaa00]/10 rounded-full blur-[180px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] left-[20%] w-[1200px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            lang={lang}
            toggleLang={toggleLang}
            t={t.nav}
        />
        
        <main className="flex-grow flex flex-col items-center justify-center p-6 mt-16 md:scale-110 transition-transform duration-500 origin-center">
           {renderContent()}
        </main>

        <footer className="w-full text-center py-6 text-sm text-gray-600 font-mono">
            MriyaFi DEX &copy; 2025
        </footer>
      </div>
    </div>
  );
}

export default App;