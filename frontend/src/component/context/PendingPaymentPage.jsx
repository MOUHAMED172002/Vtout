import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, Package, ArrowRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { getPendingCheckout } from "../../services/orderService";
import { useAuth } from "../../lib/AuthHooks";
import RetryPaymentButton from "../Shared/RetryPaymentButton";
import toast from "react-hot-toast";

// Page atteinte via le lien envoyé dans la relance WhatsApp/email d'un
// paiement en ligne encore en attente (voir orderExpiryService.js
// remindPendingCheckouts) — permet de reprendre le paiement directement
// sans repasser par tout le tunnel de checkout, la réservation de stock
// et le panier calculé étant déjà conservés côté serveur (PendingCheckout).
export default function PendingPaymentPage() {
    const { pendingCheckoutId } = useParams();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [pending, setPending] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const data = await getPendingCheckout(pendingCheckoutId);
                setPending(data);
                if (data.status === 'confirmed' && data.order_id) {
                    navigate(`/order-confirmation/${data.order_id}`, { replace: true });
                }
            } catch (err) {
                console.error("Erreur chargement paiement en attente:", err);
                toast.error("Impossible de charger ce paiement.");
            } finally {
                setLoading(false);
            }
        };
        if (pendingCheckoutId) fetchPending();
    }, [pendingCheckoutId, navigate]);

    const handlePaymentSuccess = (order) => {
        if (order?.id) {
            setTimeout(() => navigate(`/order-confirmation/${order.id}`), 1500);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
    );

    const isExpiredOrFailed = pending && ['expired', 'failed'].includes(pending.status);

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12 md:py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-base-100 p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-8 max-w-xl w-full relative overflow-hidden"
            >
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-50 rounded-full blur-3xl pointer-events-none" />

                {!pending ? (
                    <>
                        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={36} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">Paiement introuvable</h1>
                        <p className="text-sm text-gray-400 font-medium">Ce lien de paiement n'est plus valide.</p>
                        <Link to="/products-liste" className="btn btn-primary rounded-2xl px-8 h-14 font-black gap-2 text-sm">
                            Retour à la boutique <ArrowRight size={18} />
                        </Link>
                    </>
                ) : isExpiredOrFailed ? (
                    <>
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <Clock size={36} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">Ce paiement a expiré</h1>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            La fenêtre de paiement est passée, mais pas d'inquiétude — recommencez simplement votre commande, ça ne prend qu'un instant.
                        </p>
                        <Link to="/cart" className="btn btn-primary rounded-2xl px-8 h-14 font-black gap-2 text-sm">
                            Retour au panier <ArrowRight size={18} />
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <Clock size={36} />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">Paiement en attente</h1>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed px-2">
                                Votre commande est prête, il ne reste plus qu'à finaliser le paiement.
                            </p>
                        </div>

                        <div className="bg-neutral text-white rounded-2xl p-6 space-y-2 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Package size={50} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/50">Montant à payer</p>
                            <p className="font-black text-2xl text-primary">{Number(pending.amount || 0).toLocaleString()} FCFA</p>
                            {pending.items_count > 0 && (
                                <p className="text-xs text-base-content/50 font-bold">{pending.items_count} article{pending.items_count > 1 ? 's' : ''}</p>
                            )}
                        </div>

                        <RetryPaymentButton
                            orderId={pendingCheckoutId}
                            getToken={getToken}
                            onSuccess={handlePaymentSuccess}
                            className="btn btn-primary rounded-2xl h-14 font-black shadow-lg shadow-primary/20 gap-2 text-sm w-full"
                        />
                    </>
                )}
            </motion.div>
        </div>
    );
}
