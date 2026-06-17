import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { getOrderById } from '../../services/orderService';

export default function CheckoutSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const orderId = params.get('order_id');
    const [fired, setFired] = useState(false);

    useEffect(() => {
        if (fired) return;
        setFired(true);

        const fireAndRedirect = async () => {
            let value = 0;
            try {
                if (orderId) {
                    const order = await getOrderById(orderId, null);
                    value = parseFloat(order?.total_amount || 0);
                }
            } catch (_) {}

            window.gtag?.('event', 'purchase', {
                transaction_id: orderId || 'unknown',
                currency: 'XOF',
                value
            });

            setTimeout(() => {
                navigate(orderId ? `/user/dashboard/orders/${orderId}` : '/', { replace: true });
            }, 3000);
        };

        fireAndRedirect();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-black text-base-content tracking-tighter">Paiement confirmé !</h1>
            <p className="text-base-content/60 font-bold max-w-sm">
                Votre commande {orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : ''} a été validée avec succès.
            </p>
            <p className="text-sm text-base-content/40 animate-pulse">Redirection vers votre commande...</p>
        </div>
    );
}
