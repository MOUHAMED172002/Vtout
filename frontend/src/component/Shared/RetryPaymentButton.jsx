import React, { useState } from "react";
import { CreditCard, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { retryOrderPayment, confirmPendingPayment } from "../../services/orderService";

// Bouton self-service pour relancer un paiement en ligne — soit une commande
// déjà créée dont la transaction FedaPay a échoué (flux legacy), soit un
// PendingCheckout encore en attente (flux différé, voir orderController.js
// materializePendingCheckout). retryOrderPayment gère les deux côté backend
// et le distingue via res.pending_checkout_id dans la réponse.
//
// Avant ce composant, la seule issue pour un paiement resté sans suite était
// un contact manuel de l'équipe ou l'auto-annulation après 30min
// (orderExpiryService.js) — le client n'avait aucun moyen de repayer
// lui-même. Aucune auth requise côté API : fonctionne aussi pour les
// commandes/paiements invités.
export default function RetryPaymentButton({ orderId, getToken = null, className = "", onSuccess = null }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const token = getToken ? await getToken() : null;
      const res = await retryOrderPayment(orderId, token);
      if (res.token && window.FedaPay) {
        setShowModal(true);
        window.FedaPay.init({
          public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_66S78_P3mXhL-N5X-J_N2xW0',
          transaction: {
            id: res.transaction_id,
            amount: Math.round(res.amount)
          },
          container: '#fedapay-embed-retry',
          // Si res.pending_checkout_id est présent, aucune commande n'existe
          // encore — il faut la matérialiser explicitement (comme au premier
          // checkout, voir CheckoutPage.jsx). Sinon (commande déjà existante,
          // flux legacy), le webhook suffit déjà à mettre à jour son statut
          // de paiement — on ferme juste la modale.
          onComplete: async ({ reason, transaction: fedaTransaction }) => {
            if (reason !== window.FedaPay.CHECKOUT_COMPLETED) {
              setShowModal(false); // DIALOG_DISMISSED — fermé sans payer
              return;
            }
            if (res.pending_checkout_id) {
              try {
                const confirmRes = await confirmPendingPayment(res.pending_checkout_id, fedaTransaction.id);
                setShowModal(false);
                toast.success("Paiement confirmé !");
                onSuccess?.(confirmRes.order);
              } catch (confirmErr) {
                // Le webhook matérialisera quand même la commande en
                // asynchrone si cet appel échoue — ne pas dire au client
                // que le paiement a échoué alors qu'il a peut-être réussi.
                console.error("[RetryPaymentButton onComplete] Confirmation error:", confirmErr);
                setShowModal(false);
                toast("Paiement reçu, finalisation en cours… Vous recevrez une confirmation sous peu.", { duration: 7000, icon: "⏳" });
              }
            } else {
              setShowModal(false);
              toast.success("Paiement confirmé !");
              onSuccess?.({ id: orderId });
            }
          }
        });
      } else if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        toast.error("Impossible de générer le lien de paiement.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de la génération du lien de paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleRetry}
        disabled={loading}
        className={className || "btn btn-primary rounded-full font-bold gap-2"}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        Réessayer le paiement
      </button>

      <input type="checkbox" className="modal-toggle" checked={showModal} readOnly />
      <div className={`modal ${showModal ? 'modal-open' : ''} bg-neutral/95 backdrop-blur-xl p-4 md:p-6`}>
        <div className="modal-box w-full max-w-2xl p-0 bg-base-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative shadow-2xl">
          <div className="p-6 md:p-8 border-b flex justify-between items-center bg-base-200">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <CreditCard size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900">Paiement sécurisé</h3>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interface de transaction FedaPay</p>
              </div>
            </div>
            <button
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-base-200 rounded-full transition-all text-base-content/40 hover:text-rose-500"
              onClick={() => setShowModal(false)}
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
          <div id="fedapay-embed-retry" className="w-full h-[450px] md:h-[550px]"></div>
        </div>
      </div>
    </>
  );
}
