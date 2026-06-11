import React, { useState } from 'react';
import { useProfile } from '../context/useProfile';
import { Mail, ArrowRight, Loader2, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EmailVerificationBanner() {
    const { user, isAuthenticated, refreshProfile } = useProfile();
    const [isDismissed, setIsDismissed] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Ne rien afficher si non connecté, si l'email est déjà vérifié, ou si le composant est fermé
    if (!isAuthenticated || !user || user.email_verified || isDismissed) {
        return null;
    }

    const handleResend = async () => {
        setIsSending(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await api.post('/resend-verification', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSent(true);
                toast.success("Email envoyé avec succès ! Vérifiez votre boîte de réception.");
                setTimeout(() => setIsDismissed(true), 5000); // Masquer le bandeau après succès
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Une erreur est survenue lors de l'envoi.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {!isDismissed && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-indigo-600 text-white shadow-md relative z-50 overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-base-100/20 p-2 rounded-full">
                                    {sent ? <CheckCircle2 size={18} className="text-white" /> : <Mail size={18} className="text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">Sécurisez votre compte !</span>
                                    <span className="text-xs text-indigo-100">Votre adresse email ({user.email}) n'a pas encore été vérifiée.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={handleResend}
                                    disabled={isSending || sent}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-base-100 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {isSending ? (
                                        <><Loader2 size={14} className="animate-spin" /> Envoi en cours...</>
                                    ) : sent ? (
                                        <><CheckCircle2 size={14} /> Email envoyé</>
                                    ) : (
                                        <>Recevoir le lien <ArrowRight size={14} /></>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setIsDismissed(true)}
                                    className="p-1.5 hover:bg-base-200/20 rounded-full transition-colors text-indigo-200 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
