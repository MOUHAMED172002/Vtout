import { useEffect } from 'react';
import { useAuth } from '../../lib/AuthHooks';
import { applyReferralCode } from '../../services/referralService';

const STORAGE_KEY = 'vtout_referral_code';

// Composant invisible monté globalement (voir App.jsx, à côté de <ProfileSync />).
// 1) Capture le paramètre ?ref=CODE dès qu'il apparaît dans l'URL (page d'accueil,
//    page produit, etc.) et le garde en localStorage — le visiteur peut naviguer
//    plusieurs pages avant de s'inscrire.
// 2) Dès que l'utilisateur est authentifié (inscription email, WhatsApp ou social),
//    consomme le code une seule fois via /referrals/apply, puis l'efface.
export default function ReferralCapture() {
    const { isSignedIn, userId, getToken } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref && ref.trim()) {
            localStorage.setItem(STORAGE_KEY, ref.trim().toUpperCase());
        }
    }, []);

    useEffect(() => {
        const consume = async () => {
            const code = localStorage.getItem(STORAGE_KEY);
            if (!isSignedIn || !userId || !code) return;
            try {
                const token = await getToken();
                await applyReferralCode(code, token);
            } catch (err) {
                // Non-bloquant : code invalide, déjà appliqué, ou propre code — ignoré silencieusement.
            } finally {
                localStorage.removeItem(STORAGE_KEY);
            }
        };
        consume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, userId]);

    return null;
}
