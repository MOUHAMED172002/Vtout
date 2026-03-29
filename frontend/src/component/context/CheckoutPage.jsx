import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import AddressSelector from "./AddressSelector";
import { useCart } from "./CartContext";
import { createOrder, updateOrderStatus } from "../../services/orderService";
import { createAddress } from "../../services/addressService";
import toast from "react-hot-toast";
import { Check, CreditCard, Truck, MapPin, ReceiptText, ShieldCheck, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export default function CheckoutPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const isGuest = !user;
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("delivery");
  const [loading, setLoading] = useState(false);
  const [fedapayReady, setFedapayReady] = useState(false);
  const [showFedaPayModal, setShowFedaPayModal] = useState(false);
  // Steps: 1 (Contact), 2 (Address), 3 (Payment), 4 (Done)
  const [step, setStep] = useState(isGuest ? 1 : 2);
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const incoming = location?.state || {};
  const itemsFromCart = incoming.items || [];
  const totalFromCart = incoming.total || 0;

  useEffect(() => {
    if (itemsFromCart.length === 0) {
      toast.error("Votre panier est vide.");
      navigate("/cartpage");
    }
  }, [itemsFromCart, navigate]);

  useEffect(() => {
    if (!document.getElementById("fedapay-checkout-script")) {
      const script = document.createElement("script");
      script.id = "fedapay-checkout-script";
      script.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
      script.async = true;
      script.onload = () => setFedapayReady(true);
      document.body.appendChild(script);
    } else {
      setFedapayReady(true);
    }
  }, []);

  async function createOrderFlow({ addressObj, items, total, paymentMethod = "delivery" }) {
    const token = isGuest ? null : await getToken();
    const addrRow = await createAddress({
      label: addressObj.label || "Adresse de livraison",
      departement_id: addressObj.departement_id,
      departement_label: addressObj.departement_label,
      commune_id: addressObj.commune_id,
      commune_label: addressObj.commune_label,
      quartier_id: addressObj.quartier_id,
      quartier_label: addressObj.quartier_label,
      address_line: addressObj.address_line || "",
      phone: addressObj.phone || guestInfo.phone || "",
      is_default: !isGuest,
    }, token);

    const orderRow = await createOrder({
      total_amount: total,
      status: paymentMethod === "fedapay" ? "pending_payment" : "en_attente",
      payment_method: paymentMethod,
      address_id: addrRow.id,
      guest_name: isGuest ? guestInfo.name : undefined,
      guest_email: isGuest ? guestInfo.email : undefined,
      guest_phone: isGuest ? guestInfo.phone : undefined,
      items: items.map(it => ({
        product_id: it.product_id || it.id,
        variant_id: it.variant_id || null, // Important: pass variant_id if it exists
        quantity: Number(it.quantity) || 1,
        price: Number(it.price_snapshot || it.price) || 0,
      }))
    }, token);

    return orderRow;
  }

  const handleConfirmOrder = async () => {
    try {
      if (!address) return toast.error("Veuillez renseigner votre adresse !");
      setLoading(true);

      if (paymentMethod === "fedapay") {
        if (!fedapayReady) return toast.error("FedaPay n’est pas encore chargé !");

        const order = await createOrderFlow({
          addressObj: address,
          items: itemsFromCart,
          total: totalFromCart,
          paymentMethod: "fedapay",
        });

        setShowFedaPayModal(true);
        window.FedaPay.init({
          public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY,
          transaction: { amount: totalFromCart, description: `Paiement commande #${order.id.slice(0, 8)}` },
          customer: {
            email: isGuest ? guestInfo.email : (user?.primaryEmailAddress?.emailAddress || ""),
            lastname: isGuest ? guestInfo.name : (user?.lastName || "Client")
          },
          currency: { iso: "XOF" },
          container: "#fedapay-embed",
          onComplete: async (resp) => {
            setShowFedaPayModal(false);
            const freshToken = isGuest ? null : await getToken();
            if (resp.status === "approved") {
              await updateOrderStatus(order.id, {
                status: "confirmee",
                payment_id: resp.transaction.id,
                payment_status: "payé"
              }, freshToken);

              toast.success("✅ Paiement réussi !");
              await refreshCart();
              setStep(4);
              setTimeout(() => {
                navigate(isGuest ? `/order-confirmation/${order.id}` : `/user/dashboard/orders/${order.id}`);
              }, 2000);
            } else {
              try {
                await updateOrderStatus(order.id, {
                  status: "en_attente",
                  payment_status: "non_payé"
                }, freshToken);
              } catch (e) { console.error(e); }
              toast.error("❌ Échec du paiement");
            }
          },
        });
      } else {
        const order = await createOrderFlow({
          addressObj: address,
          items: itemsFromCart,
          total: totalFromCart,
          paymentMethod: "delivery",
        });
        await refreshCart();
        setStep(4);
        toast.success("Commande enregistrée !");
        const nextPath = isGuest ? `/order-confirmation/${order.id}` : `/user/dashboard/orders/${order.id}`;
        setTimeout(() => navigate(nextPath), 2500);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Header Area */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Finalisation</h1>
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s || (s === 1 && !isGuest) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-400'
                  }`}>
                  {(step > s || (s === 1 && !isGuest)) ? <Check size={20} /> : s}
                </div>
                {s < 4 && <div className={`h-1 w-12 rounded-full ${(step > s || (s === 1 && !isGuest)) ? 'bg-primary' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {/* STEP 1 — Guest Info (only for unauthenticated users) */}
              {step === 1 && isGuest && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Vos coordonnées</h2>
                      <p className="text-sm text-gray-400 font-medium">Achat en tant qu'invité · aucun compte requis</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom complet *</label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={guestInfo.name}
                        onChange={e => setGuestInfo(p => ({ ...p, name: e.target.value }))}
                        className="input input-bordered w-full h-14 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email *</label>
                      <input
                        type="email"
                        placeholder="jean@email.com"
                        value={guestInfo.email}
                        onChange={e => setGuestInfo(p => ({ ...p, email: e.target.value }))}
                        className="input input-bordered w-full h-14 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button
                      disabled={!guestInfo.name.trim() || !guestInfo.email.trim()}
                      onClick={() => setStep(2)}
                      className="btn btn-primary rounded-2xl px-12 h-14 font-black shadow-lg shadow-primary/20 gap-2 group"
                    >
                      Continuer <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><MapPin size={24} /></div>
                    <h2 className="text-2xl font-black text-gray-900">Où devons-nous livrer ?</h2>
                  </div>
                  <AddressSelector onChange={setAddress} requirePhone={true} requireQuartier={true} />
                  <div className="pt-4 flex justify-between">
                    {isGuest && <button onClick={() => setStep(1)} className="font-black text-gray-400 hover:text-gray-900">Retour</button>}
                    <button
                      disabled={!address || !address.is_valid}
                      onClick={() => setStep(3)}
                      className="btn btn-primary rounded-2xl px-12 h-14 font-black shadow-lg shadow-primary/20 gap-2 group ml-auto"
                    >
                      Continuer <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CreditCard size={24} /></div>
                    <h2 className="text-2xl font-black text-gray-900">Mode de paiement</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setPaymentMethod('delivery')}
                      className={`p-8 rounded-3xl border-2 transition-all text-left space-y-4 ${paymentMethod === 'delivery' ? 'border-primary bg-orange-50/50 ring-4 ring-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'delivery' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-gray-900">À la livraison</p>
                        <p className="text-sm text-gray-500 font-medium">Payez en espèces à réception</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('fedapay')}
                      className={`p-8 rounded-3xl border-2 transition-all text-left space-y-4 ${paymentMethod === 'fedapay' ? 'border-primary bg-orange-50/50 ring-4 ring-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'fedapay' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-gray-900">En ligne</p>
                        <p className="text-sm text-gray-500 font-medium">MTN, Moov, Carte bancaire</p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-10 flex justify-between gap-4 border-t border-gray-50">
                    <button onClick={() => setStep(2)} className="font-black text-gray-400 hover:text-gray-900">Retour</button>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={loading}
                      className="btn btn-primary rounded-2xl px-12 h-14 font-black shadow-lg shadow-primary/20 gap-2"
                    >
                      {loading ? <span className="loading loading-spinner"></span> : "Confirmer la commande"}
                    </button>
                  </div>
                </motion.div>
              )}

              {((step === 3 && !isGuest) || step === 4) ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 md:p-20 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-6 md:space-y-8"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto md:scale-125 mb-2 md:mb-4">
                    <Check size={32} className="md:w-12 md:h-12" />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">Félicitations !</h2>
                    <p className="text-sm md:text-gray-500 font-medium max-w-[250px] md:max-w-sm mx-auto leading-relaxed">Votre commande a été enregistrée avec succès. Redirection en cours…</p>
                  </div>
                  <div className="pt-6 md:pt-8 loading loading-dots loading-md md:loading-lg text-primary"></div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>

              <h3 className="text-2xl font-black flex items-center gap-3 relative z-10">
                Votre Commande <ReceiptText size={20} className="text-primary" />
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {itemsFromCart.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight text-slate-900 mb-1 line-clamp-1">{it.name || "Produit"}</p>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">{it.quantity} Unité{it.quantity > 1 ? 's' : ''}</p>
                    </div>
                    <span className="font-black text-slate-300 text-sm">{(it.price_snapshot || it.price).toLocaleString()} F</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-800 relative z-10">
                <div className="flex justify-between text-slate-400 font-bold">
                  <span>Livraison</span>
                  <span className="text-emerald-400">Gratuit</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Total Final</span>
                  <span className="text-4xl font-black text-primary">{totalFromCart.toLocaleString()} F</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 relative z-10">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <ShieldCheck size={20} className="text-primary" />
                  Paiement 100% sécurisé via serveurs cryptés.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FedaPay Embed Modal */}
      <input type="checkbox" className="modal-toggle" checked={showFedaPayModal} readOnly />
      <div className={`modal ${showFedaPayModal ? 'modal-open' : ''} bg-slate-900/95 backdrop-blur-xl p-4 md:p-6`}>
        <div className="modal-box w-full max-w-2xl p-0 bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative shadow-2xl">
          <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50">
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
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white rounded-full transition-all text-slate-400 hover:text-rose-500"
              onClick={() => setShowFedaPayModal(false)}
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
          <div id="fedapay-embed" className="w-full h-[450px] md:h-[550px]"></div>
        </div>
      </div>
    </div>
  );
}