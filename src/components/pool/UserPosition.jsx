import { memo } from 'react';
import { Wallet } from 'lucide-react';

const UserPosition = ({ 
    lpBalance, 
    poolShare, 
    isOwnerOfPool, 
    reserves, 
    symbols, 
    t, 
    onOpenModal, 
    formatTokenAmount 
}) => {
    const { symbolA, symbolB } = symbols;

    return (
        <div className="lg:col-span-1 p-8 flex flex-col h-full bg-[#0a0e17]/30 relative">
            <div className="flex items-center gap-3 mb-8">
                <Wallet className="text-gray-400" size={24}/>
                <h3 className="text-2xl font-bold text-white">{t.position}</h3>
            </div>
            <div className="space-y-6 mb-8 flex-grow">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-base">{t.modal.yourLiquidity}</span>
                    <span className={`font-mono text-xl font-bold ${lpBalance > 0 ? 'text-white' : 'text-gray-500'}`}>
                        {lpBalance > 0 ? lpBalance.toFixed(6) : '0.00'} LP
                    </span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-base">{t.modal.shareOfPool}</span>
                    <span className={`font-mono text-xl font-bold ${isOwnerOfPool ? 'text-yellow-400' : 'text-white'}`}>
                        {poolShare.toFixed(2)}%
                    </span>
                </div>

                <div className="w-full h-px bg-white/5"></div>
                
                {lpBalance > 0 && (
                    <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex justify-between">
                            <span>{t.pooled} {symbolA}:</span>
                            <span className="text-white font-mono">{formatTokenAmount(parseFloat(reserves.reserveA) * (poolShare / 100))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t.pooled} {symbolB}:</span>
                            <span className="text-white font-mono">{formatTokenAmount(parseFloat(reserves.reserveB) * (poolShare / 100))}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid gap-4 mt-auto relative z-10">
                <button onClick={() => onOpenModal('add')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ffeebb] via-[#f0dfae] to-[#d4c085] text-[#0a0e17] font-bold text-lg shadow-[0_0_20px_rgba(240,223,174,0.2)] hover:scale-[1.02] transition-all">{t.add}</button>
                <button onClick={() => onOpenModal('remove')} className="w-full py-4 rounded-2xl bg-[#1a2c38]/40 border border-[#00d4ff]/30 text-white font-bold text-lg hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">{t.remove}</button>
            </div>
        </div>
    );
};

export default memo(UserPosition);