import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, Plus, Banknote, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../components/clerk-shim';
import api from '../services/api';

export default function SupplierWallet() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState({ balance: 0, transactions: [], payoutRequests: [] });
    const [loading, setLoading] = useState(true);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('momo');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [saveDetails, setSaveDetails] = useState(false);

    const fetchFinancials = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/financials/my-status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
        } catch (err) {
            toast.error("Erreur de chargement des données financières");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, []);

    useEffect(() => {
        if (stats.savedPayoutInfo && stats.savedPayoutInfo.method === payoutMethod) {
            setPaymentDetails(stats.savedPayoutInfo.details);
            setSaveDetails(true);
        } else {
            setPaymentDetails('');
            setSaveDetails(false);
        }
    }, [payoutMethod, stats.savedPayoutInfo]);

    const handlePayoutRequest = async (e) => {
        e.preventDefault();
        if (!payoutAmount || payoutAmount < 1000) return toast.error("Montant minimum : 1000 F");
        if (payoutAmount > stats.balance) return toast.error("Solde insuffisant");

        try {
            const token = await getToken();
            await api.post('/financials/request-payout', {
                amount: payoutAmount,
                payment_method: payoutMethod,
                payment_details: paymentDetails,
                save_details: saveDetails
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Demande de retrait envoyée !");
            setShowPayoutModal(false);
            fetchFinancials();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de la demande");
        }
    };

    if (loading) return <div className="p-20 text-center"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
            {/* Header / Summary Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Wallet size={24} className="text-primary" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Solde Disponible</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
                            {Number(stats.balance).toLocaleString()} <span className="text-primary text-3xl">FCFA</span>
                        </h1>
                    </div>
                    
                    <button 
                        onClick={() => setShowPayoutModal(true)}
                        className="bg-primary text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/40 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        Retirer l'argent <ArrowUpRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Recent Transactions */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Transactions récentes</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dernières 20</span>
                    </div>
                    
                    <div className="space-y-4">
                        {stats.transactions.length > 0 ? stats.transactions.map(t => (
                            <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-50 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'earning' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                    {t.type === 'earning' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-slate-900 text-sm">{t.description}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.createdAt || t.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                                </div>
                                <div className={`text-lg font-black ${t.type === 'earning' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                    {t.type === 'earning' ? '+' : '-'} {Number(t.amount).toLocaleString()} F
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-slate-50 rounded-3xl text-slate-400 font-bold text-sm">
                                Aucune transaction pour le moment.
                            </div>
                        )}
                    </div>
                </div>

                {/* Payout Requests */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Demandes de retrait</h3>
                        <Clock size={20} className="text-slate-400" />
                    </div>

                    <div className="space-y-4">
                        {stats.payoutRequests.length > 0 ? stats.payoutRequests.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-50 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(p.createdAt || p.created_at).toLocaleString()}</span>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        p.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                                        p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                                        'bg-rose-50 text-rose-600'
                                    }`}>
                                        {p.status === 'pending' ? 'En attente' : p.status === 'paid' ? 'Payé' : 'Rejeté'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{Number(p.amount).toLocaleString()} F</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Via {p.payment_method.toUpperCase()}</p>
                                    </div>
                                    {p.admin_notes && <p className="text-[9px] font-bold text-slate-400 max-w-[150px] italic">Note: {p.admin_notes}</p>}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-slate-50 rounded-3xl text-slate-400 font-bold text-sm">
                                Aucune demande de retrait effectuée.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)} />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative z-10 space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Retrait d'argent</h3>
                            <p className="text-sm font-bold text-slate-400">Choisissez le montant et le mode de retrait.</p>
                        </div>

                        <form onSubmit={handlePayoutRequest} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Montant à retirer (FCFA)</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={payoutAmount} 
                                    onChange={e => setPayoutAmount(e.target.value)} 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-2xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 transition-all" 
                                    placeholder="Ex: 5000" 
                                />
                                <p className="text-[10px] text-right font-bold text-slate-400">Solde max: {stats.balance.toLocaleString()} F</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setPayoutMethod('momo')} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${payoutMethod === 'momo' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                    <ShieldCheck size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Mobile Money</span>
                                </button>
                                <button type="button" onClick={() => setPayoutMethod('bank')} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${payoutMethod === 'bank' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                    <Banknote size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Banque</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                    {payoutMethod === 'momo' ? 'Numéro de téléphone MoMo & Nom' : 'Informations Bancaires (RIB, Nom de la banque)'}
                                </label>
                                <textarea 
                                    required 
                                    value={paymentDetails} 
                                    onChange={e => setPaymentDetails(e.target.value)} 
                                    rows="2"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-8 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none" 
                                    placeholder={payoutMethod === 'momo' ? "Ex: 67000000 - Jean Dupont" : "Ex: Société Générale, RIB: 00001..."}
                                />
                                <div className="flex items-center gap-2 ml-4 mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="save_details" 
                                        checked={saveDetails} 
                                        onChange={e => setSaveDetails(e.target.checked)}
                                        className="checkbox checkbox-xs checkbox-primary"
                                    />
                                    <label htmlFor="save_details" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none">Enregistrer ces informations</label>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                                Confirmer la demande <ChevronRight size={18} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
