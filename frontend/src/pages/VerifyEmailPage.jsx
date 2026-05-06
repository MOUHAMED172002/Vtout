import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../component/context/useProfile';

const statuses = {
    success: {
        icon: <CheckCircle2 className="w-16 h-16 text-emerald-500" />,
        title: 'Email vérifié !',
        subtitle: 'Votre adresse email a été confirmée avec succès.',
        detail: 'Votre compte est maintenant sécurisé. Vous pouvez continuer à utiliser Vtout en toute confiance.',
        color: 'from-emerald-50 to-white',
        border: 'border-emerald-100',
        cta: { label: 'Accéder à mon compte', to: '/user/dashboard', style: 'bg-emerald-600 hover:bg-emerald-700' }
    },
    expired: {
        icon: <Clock className="w-16 h-16 text-amber-500" />,
        title: 'Lien expiré',
        subtitle: 'Ce lien de vérification a expiré (validité 24h).',
        detail: 'Reconnectez-vous à votre compte pour recevoir un nouveau lien automatiquement.',
        color: 'from-amber-50 to-white',
        border: 'border-amber-100',
        cta: { label: 'Se reconnecter', to: '/auth/connexion', style: 'bg-amber-500 hover:bg-amber-600' }
    },
    invalid: {
        icon: <XCircle className="w-16 h-16 text-rose-500" />,
        title: 'Lien invalide',
        subtitle: 'Ce lien de vérification est invalide ou déjà utilisé.',
        detail: 'Si vous rencontrez un problème, contactez notre support.',
        color: 'from-rose-50 to-white',
        border: 'border-rose-100',
        cta: { label: 'Retour à l\'accueil', to: '/', style: 'bg-rose-500 hover:bg-rose-600' }
    },
    error: {
        icon: <XCircle className="w-16 h-16 text-slate-400" />,
        title: 'Erreur serveur',
        subtitle: 'Une erreur est survenue lors de la vérification.',
        detail: 'Veuillez réessayer plus tard ou contacter notre support.',
        color: 'from-slate-50 to-white',
        border: 'border-slate-100',
        cta: { label: 'Retour à l\'accueil', to: '/', style: 'bg-slate-700 hover:bg-slate-800' }
    }
};

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const { refreshProfile, isAuthenticated } = useProfile();
    const status = searchParams.get('status');
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [isLoading, setIsLoading] = useState(!status); // Loading only if no status yet

    useEffect(() => {
        if (status === 'success' && isAuthenticated) {
            refreshProfile();
        }
    }, [status, isAuthenticated, refreshProfile]);

    useEffect(() => {
        // If an old link was clicked (points to frontend instead of backend)
        // Redirect it to the backend endpoint so it can be verified.
        if (token && email && !status) {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            window.location.href = `${backendUrl}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
        }
    }, [token, email, status]);

    // If user landed here without a status (direct navigation) and no token
    if (!status && !token && !isLoading) {
        return <PendingState />;
    }

    if (!status) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const config = statuses[status] || statuses.error;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20 }}
                className={`w-full max-w-md bg-gradient-to-b ${config.color} rounded-3xl border ${config.border} shadow-xl overflow-hidden`}
            >
                {/* Top bar */}
                <div className="bg-slate-900 px-8 py-5 text-center">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Vtout · Sécurité</span>
                </div>

                {/* Content */}
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    >
                        {config.icon}
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{config.title}</h1>
                        <p className="text-slate-500 font-semibold text-sm">{config.subtitle}</p>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed">{config.detail}</p>

                    <Link
                        to={config.cta.to}
                        className={`w-full py-3.5 rounded-2xl text-white font-black text-sm transition-all active:scale-95 flex items-center justify-center ${config.cta.style}`}
                    >
                        {config.cta.label}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

// State shown when user navigates to /auth/verify-email directly (no status param)
function PendingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white p-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
            >
                <div className="bg-slate-900 px-8 py-5 text-center">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Vtout · Sécurité</span>
                </div>
                <div className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Mail className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vérifiez votre email</h1>
                        <p className="text-slate-500 font-semibold text-sm">Un lien de confirmation vous a été envoyé</p>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Consultez votre boîte mail et cliquez sur le lien de vérification pour sécuriser votre compte.
                        Le lien expire dans <strong>24 heures</strong>.
                    </p>
                    <p className="text-xs text-slate-300">Pensez à vérifier vos spams si vous ne le trouvez pas.</p>
                    <Link
                        to="/"
                        className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
