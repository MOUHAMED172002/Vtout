import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Package, ArrowRight, CreditCard, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { getOrderById } from "../../services/orderService";
import toast from "react-hot-toast";

export default function GuestOrderConfirmationPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Pas de token nécessaire pour la confirmation invité si la route est ouverte
                const data = await getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                console.error("Erreur chargement commande:", err);
                toast.error("Impossible de charger les détails de la commande");
            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 md:py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-8 md:space-y-10 max-w-xl w-full relative overflow-hidden"
            >
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner"
                >
                    <Check size={40} className="md:w-12 md:h-12" strokeWidth={3} />
                </motion.div>

                <div className="space-y-3 md:space-y-4 relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">Commande confirmée&nbsp;!</h1>
                    <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed px-2">
                        Merci pour votre achat. Votre commande a été enregistrée avec succès.<br className="hidden md:block" />
                        Un email récapitulatif a été envoyé à votre adresse.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 relative z-10">
                    {/* Order IDs List */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3 text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Package size={60} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Références Commandes</p>
                        <div className="space-y-2">
                            <p className="font-black text-lg text-primary font-mono">#{orderId?.slice(0, 12).toUpperCase()}</p>
                            {order?.siblings?.map(sibling => (
                                <p key={sibling.id} className="font-black text-lg text-slate-400 font-mono">#{sibling.id?.slice(0, 12).toUpperCase()}</p>
                            ))}
                        </div>
                    </div>
 
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Paiement</p>
                            <div className="flex items-center gap-2 overflow-hidden">
                                {order?.payment_status === 'payé' ? (
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase">Payé</span>
                                ) : (
                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 uppercase">En attente</span>
                                )}
                                <span className="text-xs font-bold text-slate-700 truncate">{order?.payment_method === 'fedapay' ? 'FedaPay' : 'CASH'}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Panier</p>
                            <p className="text-sm font-black text-slate-900">
                                {(Number(order?.total_amount) + (order?.siblings?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0)).toLocaleString()} FCFA
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center relative z-10">
                    <Link
                        to="/"
                        className="btn btn-primary rounded-2xl px-8 md:px-10 h-14 font-black shadow-lg shadow-primary/20 gap-2 text-sm"
                    >
                        <Package size={18} />
                        Accueil
                    </Link>
                    <Link
                        to="/products-liste"
                        className="btn btn-ghost rounded-2xl px-8 md:px-10 h-14 font-black border border-gray-100 gap-2 text-sm hover:bg-slate-50"
                    >
                        Boutique
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
