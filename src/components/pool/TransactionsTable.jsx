import { memo } from 'react';
import { ArrowRightLeft, Loader2, ExternalLink } from 'lucide-react';

const TransactionsTable = ({ transactions, loading, symbols, t, formatTokenAmount, formatTime }) => {
    const { symbolA, symbolB } = symbols;

    return (
        <div className="rounded-[3rem] p-8 border border-white/10 bg-[#131823]/60 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
                <ArrowRightLeft className="text-gray-400" size={24}/>
                <h3 className="text-2xl font-bold text-white">{t.transactions}</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-white/5">
                            <th className="pb-4 pl-2 font-medium">{t.colDate || 'Action'}</th>
                            <th className="pb-4 font-medium">{t.colLiq || 'Token Amount'}</th>
                            <th className="pb-4 font-medium">{t.colPrice || 'Token Amount'}</th>
                            <th className="pb-4 font-medium text-right">{t.colDate || 'Time'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500">
                                    <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin h-4 w-4"/> Loading transactions...</div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500">No transactions found recently</td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.hash} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-2">
                                        <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#00d4ff] hover:text-white font-medium">
                                            {tx.type} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </td>
                                    <td className="py-4 text-white font-mono">
                                        {formatTokenAmount(tx.amount0)} {symbolA}
                                    </td>
                                    <td className="py-4 text-white font-mono">
                                        {formatTokenAmount(tx.amount1)} {symbolB}
                                    </td>
                                    <td className="py-4 text-right text-gray-400">
                                        {formatTime(tx.timestamp)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default memo(TransactionsTable);