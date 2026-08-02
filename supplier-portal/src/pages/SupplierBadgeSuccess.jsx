import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../components/clerk-shim';
import { getMyBadgeStatus } from '../services/badgeService';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

export default function SupplierBadgeSuccess() {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [confirmed, setConfirmed] = useState(false);
    const attemptsRef = useRef(0);

    useEffect(() => {
        let timer;

        const poll = async () => {
            attemptsRef.current += 1;
            try {
                const token = await getToken();
                const data = await getMyBadgeStatus(token);
                if (data.is_certified) {
                    setConfirmed(true);
                    return;
                }
            } catch (err) {
                // ignore, retry
            }
            if (attemptsRef.current < MAX_ATTEMPTS) {
                timer = setTimeout(poll, POLL_INTERVAL_MS);
            }
        };

        poll();
        return () => clearTimeout(timer);
    }, [getToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl text-center space-y-6">
                {confirmed ? (
                    <>
                        <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <BadgeCheck size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Badge activé !</h1>
                        <p className="text-sm font-bold text-slate-400">
                            Votre paiement a été confirmé. Le badge "Vendeur Certifié" est maintenant visible sur tous vos produits.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center">
                            <Loader2 size={28} className="animate-spin" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Paiement en cours de traitement</h1>
                        <p className="text-sm font-bold text-slate-400">
                            Nous confirmons votre paiement. Cela peut prendre quelques instants — vous pouvez revenir plus tard, votre badge sera activé automatiquement dès confirmation.
                        </p>
                    </>
                )}
                <button
                    onClick={() => navigate('/badge-certifie')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
                >
                    Retour au badge certifié
                </button>
            </div>
        </div>
    );
}
