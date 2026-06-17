import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "../../lib/AuthHooks";
import AddressSelector from "./AddressSelector";
import { useCart } from "./CartContext";
import { createOrder, updateOrderStatus } from "../../services/orderService";
import { createAddress } from "../../services/addressService";
import { validateCoupon } from "../../services/couponService";
import toast from "react-hot-toast";
import { Check, CreditCard, Truck, MapPin, ReceiptText, ShieldCheck, ChevronRight, X, Zap, Wallet } from "lucide-react";

import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
export default function CheckoutPage() {
  const { getToken } = useAuth();
  const { user, isSignedIn, isLoaded } = useUser();
  const isGuest = isLoaded ? !isSignedIn : false;

  const isWhatsAppUser = (user?.email || user?.primaryEmailAddress?.emailAddress)?.endsWith("@whatsapp.vtout.com");
  const [whatsappNotifPhone, setWhatsappNotifPhone] = useState("");

  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("delivery");
  const [loading, setLoading] = useState(false);
  const [showFedaPayModal, setShowFedaPayModal] = useState(false);
  const [fedapayReady, setFedapayReady] = useState(false);

  // Steps: 1 (Contact), 2 (Address), 3 (Verification), 4 (Payment), 5 (WhatsApp Prompt if needed)
  const [step, setStep] = useState(2);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAdjustedStep, setHasAdjustedStep] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasAdjustedStep) {
      setStep(isSignedIn ? 2 : 1);
      setHasAdjustedStep(true);
    }
  }, [isLoaded, isSignedIn, hasAdjustedStep]);

  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [feesConfig, setFeesConfig] = useState({ intra: 500, inter: 1000, crossing: {} });
  const [isDynamicFeeLoading, setIsDynamicFeeLoading] = useState(false);

  useEffect(() => {
    // Fetch delivery fee configs from public API
    fetch(`${import.meta.env.VITE_API_URL}/configs/public`)
      .then(res => res.json())
      .then(data => {
        const configMap = (data || []).reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {});
        
        let crossing = {};
        try {
            crossing = configMap['crossing_fees'] ? JSON.parse(configMap['crossing_fees']) : {};
        } catch (e) { console.error("Crossing fees parse error", e); }

        setFeesConfig({
          intra: parseFloat(configMap['intra_department_fee'] ?? 500),
          inter: parseFloat(configMap['inter_department_fee'] ?? 1000),
          crossing
        });
      })
      .catch(err => console.error("[Checkout] Error fetching configs:", err));
  }, []);

  useEffect(() => {
    if (user) {
        getToken().then(token => {
            api.get('/financials/my-status', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => setWalletBalance(res.data?.balance || 0))
            .catch(err => console.error("Balance fetch error:", err));
        });
    }
  }, [user]);


  const incoming = location?.state || {};
  const itemsFromCart = incoming.items || [];
  const totalFromCart = incoming.total || 0;

  // Update delivery fee when address changes
  useEffect(() => {
    if (!address || !address.is_valid || itemsFromCart.length === 0) {
      setDeliveryFee(0);
      return;
    }

    setIsDynamicFeeLoading(true);
    
    // Group items by boutique to calculate one supplement per boutique pickup point
    const boutiques = {};
    itemsFromCart.forEach(it => {
        const product = it.product || it;
        const bId = product.boutique_id || product.boutique?.id || 'default';
        if (!boutiques[bId] && (product.boutique || it.boutique)) {
            boutiques[bId] = product.boutique || it.boutique;
        }
    });

    let totalSupplement = 0;
    Object.entries(boutiques).forEach(([bId, boutique]) => {
        if (!boutique) return;
        
        // Find items for this specific boutique
        const boutiqueItems = itemsFromCart.filter(it => {
            const p = it.product || it;
            const id = p.boutique_id || p.boutique?.id || 'default';
            return String(id) === String(bId);
        });

        // Aggregating and normalizing free delivery zones
        const normalize = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
        
        const allFreeCommunesNormalized = new Set();
        boutiqueItems.forEach(it => {
            const p = it.product || it;
            if (p.free_delivery_communes) {
                p.free_delivery_communes.forEach(c => allFreeCommunesNormalized.add(normalize(c)));
            }
        });
        
        const targetCommuneNormalized = normalize(address.commune_label);
        const isFreeZone = allFreeCommunesNormalized.has(targetCommuneNormalized) || 
                          String(boutique.commune_id) === String(address.commune_id);

        if (isFreeZone) {
            // Livraison incluse
        } else if (String(boutique.departement_id) === String(address.departement_id)) {
            totalSupplement += feesConfig.intra;
        } else {
            const key = `${boutique.departement_id}-${address.departement_id}`;
            const reverseKey = `${address.departement_id}-${boutique.departement_id}`;
            
            if (feesConfig.crossing[key] !== undefined) {
                totalSupplement += parseFloat(feesConfig.crossing[key]);
            } else if (feesConfig.crossing[reverseKey] !== undefined) {
                totalSupplement += parseFloat(feesConfig.crossing[reverseKey]);
            } else {
                totalSupplement += feesConfig.inter;
            }
        }
    });

    setDeliveryFee(totalSupplement);
    setIsDynamicFeeLoading(false);
  }, [address, itemsFromCart, feesConfig]);

  useEffect(() => {
    if (itemsFromCart.length === 0) {
      toast.error("Votre panier est vide.");
      navigate("/cartpage");
    }
  }, [itemsFromCart, navigate]);

  useEffect(() => {
    if (itemsFromCart.length > 0 && totalFromCart > 0) {
      window.gtag?.('event', 'begin_checkout', { currency: 'XOF', value: totalFromCart });
      window.fbq?.('track', 'InitiateCheckout', { currency: 'XOF', value: totalFromCart });
    }
  }, []);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setIsValidating(true);
      const res = await validateCoupon(couponCode, totalFromCart);
      setAppliedCoupon(res);
      setDiscount(res.discount);
      toast.success("Code promo appliqué !");
    } catch (err) {
      toast.error(err.response?.data?.error || "Code promo invalide");
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setIsValidating(false);
    }
  };

  const finalTotal = Math.max(0, totalFromCart - discount + deliveryFee);

  async function createOrderFlow({ addressObj, items, total, paymentMethod = "delivery", coupon }) {
    console.log("[CheckoutPage] Starting createOrderFlow...", { paymentMethod, itemsCount: items.length });
    const token = isGuest ? null : await getToken();
    
    console.log("[CheckoutPage] Creating address...");
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
    console.log("[CheckoutPage] Address created with ID:", addrRow?.id);

    console.log("[CheckoutPage] Creating order...");
    const response = await createOrder({
      total_amount: total,
      status: paymentMethod === "fedapay" ? "pending_payment" : "en_attente",
      payment_method: paymentMethod,
      address_id: addrRow.id,
      guest_name: isGuest ? guestInfo.name : undefined,
      guest_email: isGuest ? guestInfo.email : undefined,
      guest_phone: whatsappNotifPhone || (isGuest ? guestInfo.phone : undefined),
      items: items.map(it => ({
        product_id: it.product_id || it.id,
        variant_id: it.variant_id || null,
        quantity: Number(it.quantity) || 1,
        price: Number(it.price_snapshot || it.price) || 0,
      })),
      coupon_code: coupon || undefined
    }, token);

    console.log("[CheckoutPage] Order response received:", response);
    // Return the FULL response to capture payment_url, not just order.
    return response;
  }

  const handleConfirmOrder = async () => {
    try {
      if (!address) return toast.error("Veuillez renseigner votre adresse !");
      setLoading(true);

      if (paymentMethod === "fedapay") {
        const createResponse = await createOrderFlow({
          addressObj: address,
          items: itemsFromCart,
          total: finalTotal,
          paymentMethod: "fedapay",
          coupon: appliedCoupon?.code
        });

        if (createResponse.token && window.FedaPay) {
            const backendTotal = createResponse.orders ? createResponse.orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) : finalTotal;
            setShowFedaPayModal(true);
            window.FedaPay.init({
                public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_66S78_P3mXhL-N5X-J_N2xW0',
                transaction: {
                    id: createResponse.transaction_id,
                    amount: Math.round(backendTotal)
                },
                container: '#fedapay-embed'
            });
            return;
        } else if (createResponse.payment_url) {
            window.location.href = createResponse.payment_url;
            return;
        } else {
            toast.error("Erreur de génération du lien de paiement");
        }
      } else {
        const createResponse = await createOrderFlow({
          addressObj: address,
          items: itemsFromCart,
          total: finalTotal,
          paymentMethod: paymentMethod,
          coupon: appliedCoupon?.code

        });
        await refreshCart();
        setIsSuccess(true);
        window.gtag?.('event', 'purchase', { transaction_id: createResponse.order?.id, currency: 'XOF', value: finalTotal });
        window.fbq?.('track', 'Purchase', { currency: 'XOF', value: finalTotal });
        toast.success("Commande enregistrée !");
        const nextPath = isGuest ? `/order-confirmation/${createResponse.order.id}` : `/user/dashboard/orders/${createResponse.order.id}`;
        setTimeout(() => navigate(nextPath), 2500);
      }
    } catch (err) {
      console.error("[Checkout Error]", err?.response?.data || err?.message || err);
      const errorMsg = err.response?.data?.error || "Erreur lors de la validation";
      const details = err.response?.data?.details;
      toast.error(details ? `${errorMsg}: ${details}` : errorMsg, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-200/50 min-h-screen pt-12 pb-24 font-sans selection:bg-primary/10 selection:text-primary transition-colors duration-500">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Header Area — hidden on success */}
        {!isSuccess && (
          <div className="text-center mb-8 md:mb-20 space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-6xl font-black text-base-content tracking-tightest">
              Ma <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Commande.</span>
            </h1>
            <div className="flex items-center justify-center gap-2 md:gap-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-base transition-all duration-500 ${
                        step >= s || (s === 1 && !isGuest)
                        ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110'
                        : 'bg-base-100 border-2 border-base-200 text-base-content/30'
                    }`}>
                      {(step > s || (s === 1 && !isGuest)) ? <Check size={16} strokeWidth={3} /> : s}
                    </div>
                  </div>
                  {s < 5 && <div className={`h-1 w-4 md:w-12 rounded-full transition-all duration-700 ${
                      (step > s || (s === 1 && !isGuest)) ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-base-200'
                  }`}></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content */}
          <div className={`${isSuccess ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-8`}>
            <div className={`${isSuccess ? 'lg:col-span-12 max-w-2xl mx-auto w-full' : 'lg:col-span-8'} space-y-8`}>
              {/* STEP 1 — Guest Info (only for unauthenticated users) */}
              {step === 1 && isGuest && (
                <div
                  key="step1"
                  className="bg-base-100 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-base-content/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8 md:space-y-10"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-violet-50 text-violet-600 rounded-3xl shadow-sm">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-base-content tracking-tight">Vos coordonnées</h2>
                      <p className="text-sm text-base-content/40 font-bold uppercase tracking-widest mt-1">Achat rapide · Invité</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-2">Nom complet *</label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={guestInfo.name}
                        onChange={e => setGuestInfo(p => ({ ...p, name: e.target.value }))}
                        className="input input-bordered w-full h-14 rounded-2xl bg-base-200 border-base-200 focus:border-primary font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-2">Email *</label>
                      <input
                        type="email"
                        placeholder="jean@email.com"
                        value={guestInfo.email}
                        onChange={e => setGuestInfo(p => ({ ...p, email: e.target.value }))}
                        className="input input-bordered w-full h-14 rounded-2xl bg-base-200 border-base-200 focus:border-primary font-bold text-sm"
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
                </div>
              )}

              {step === 2 && (
                <div
                  key="step2"
                  className="bg-base-100 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-base-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl shadow-sm"><MapPin size={28} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-base-content tracking-tight">Où livrer ?</h2>
                        <p className="text-sm text-base-content/40 font-bold uppercase tracking-widest mt-1">Sélectionnez votre quartier</p>
                    </div>
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
                </div>
              )}

              {step === 3 && (
                <div
                  key="step3"
                  className="bg-base-100 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-base-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-orange-50 text-orange-600 rounded-3xl shadow-sm"><ReceiptText size={28} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-base-content tracking-tight">Vérification</h2>
                        <p className="text-sm text-base-content/40 font-bold uppercase tracking-widest mt-1">Résumé de votre panier</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {itemsFromCart.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-base-200 rounded-3xl border border-base-200">
                        <div className="w-16 h-16 bg-base-100 rounded-2xl p-2 border border-base-200 flex-shrink-0">
                          <img src={it.image_url || it.product?.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-base-content truncate">{it.name}</p>
                          <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{it.quantity} x {Number(it.price_snapshot || it.price).toLocaleString()} F</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-base-content">{((it.price_snapshot || it.price) * it.quantity).toLocaleString()} F</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals for Mobile Step */}
                  <div className="p-6 bg-base-100 border border-base-200 rounded-[2rem] space-y-4 shadow-sm">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-base-content/50">Sous-total</span>
                      <span className="text-base-content font-black">{totalFromCart.toLocaleString()} F</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 text-sm font-black uppercase">
                        <span>Réduction</span>
                        <span>-{discount.toLocaleString()} F</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-base-content/50">Livraison</span>
                      <span className="text-base-content font-black">{deliveryFee === 0 ? "Gratuite" : `${deliveryFee.toLocaleString()} F`}</span>
                    </div>
                    <div className="h-px bg-base-200 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-xs uppercase tracking-widest text-primary">Total à payer</span>
                      <span className="text-3xl font-black text-base-content">{finalTotal.toLocaleString()} F</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button onClick={() => setStep(2)} className="font-black text-gray-400 hover:text-gray-900">Retour</button>
                    <button
                      onClick={() => setStep(4)}
                      className="btn btn-primary rounded-2xl px-12 h-14 font-black shadow-lg shadow-primary/20 gap-2 group ml-auto"
                    >
                      Paiement <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div
                  key="step4"
                  className="bg-base-100 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-base-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl shadow-sm"><CreditCard size={28} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-base-content tracking-tight">Paiement</h2>
                        <p className="text-sm text-base-content/40 font-bold uppercase tracking-widest mt-1">Choisissez votre méthode</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ... (Payment methods content) ... */}
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
                      className={`p-10 rounded-[2.5rem] border-2 transition-all text-left space-y-6 group overflow-hidden relative ${paymentMethod === 'fedapay' ? 'border-primary bg-primary/5 ring-8 ring-primary/5' : 'border-base-content/5 hover:border-primary/30 hover:bg-base-200/50'}`}
                    >
                      {paymentMethod === 'fedapay' && <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'fedapay' ? 'bg-primary text-primary-content rotate-6' : 'bg-base-200 text-base-content/40'}`}>
                        <CreditCard size={28} />
                      </div>
                      <div>
                        <p className="font-black text-xl text-base-content">Paiement en ligne</p>
                        <p className="text-sm text-base-content/60 font-bold mt-1">MTN, Moov, Carte bancaire</p>
                      </div>
                    </button>

                    {!isGuest && walletBalance > 0 && (
                      <button
                        onClick={() => setPaymentMethod('wallet')}
                        disabled={walletBalance < finalTotal}
                        className={`p-10 rounded-[2.5rem] border-2 transition-all text-left space-y-6 group overflow-hidden relative ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5 ring-8 ring-primary/5' : 'border-base-content/5 hover:border-emerald-500/30 hover:bg-emerald-50/10'} ${walletBalance < finalTotal ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'wallet' ? 'bg-emerald-500 text-white rotate-3' : 'bg-emerald-50 text-emerald-400'}`}>
                          <Wallet size={28} />
                        </div>
                        <div>
                          <div className="flex justify-between items-center">
                            <p className="font-black text-xl text-base-content">Portefeuille Vtout</p>
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">Solde: {walletBalance.toLocaleString()} F</span>
                          </div>
                          <p className="text-sm text-base-content/60 font-bold mt-1">
                            {walletBalance < finalTotal ? "Solde insuffisant" : "Paiement instantané avec vos gains"}
                          </p>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="pt-10 flex justify-between gap-4 border-t border-gray-50">
                    <button onClick={() => setStep(3)} className="font-black text-gray-400 hover:text-gray-900">Retour</button>
                    <button
                      onClick={() => {
                        if (isWhatsAppUser) {
                          handleConfirmOrder();
                        } else {
                          // Pre-fill with address phone if available
                          if (address?.phone && !whatsappNotifPhone) setWhatsappNotifPhone(address.phone);
                          setStep(5);
                        }
                      }}
                      disabled={loading}
                      className="btn btn-primary rounded-2xl px-12 h-14 font-black shadow-lg shadow-primary/20 gap-2"
                    >
                      {loading ? <span className="loading loading-spinner"></span> : "Confirmer la commande"}
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && !isWhatsAppUser && (
                <div
                  key="step5"
                  className="bg-base-100 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-base-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl shadow-sm">
                      <Zap size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-base-content tracking-tight">Suivi WhatsApp</h2>
                      <p className="text-sm text-base-content/40 font-bold uppercase tracking-widest mt-1">Recevez vos notifications en temps réel</p>
                    </div>
                  </div>

                  <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100/50 space-y-6">
                    <p className="text-sm font-bold text-base-content/70 leading-relaxed">
                      Pour vous tenir informé de l'avancée de votre livraison (Confirmation, Expédition, Arrivée), veuillez confirmer votre numéro WhatsApp ci-dessous.
                    </p>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-2">Numéro WhatsApp *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <span className="text-emerald-600 font-bold">+229</span>
                        </div>
                        <input
                          type="tel"
                          placeholder="61000000"
                          value={whatsappNotifPhone.replace('+229', '').trim()}
                          onChange={e => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            setWhatsappNotifPhone(val.startsWith('229') ? `+${val}` : `+229${val}`);
                          }}
                          className="input input-bordered w-full h-16 pl-16 rounded-2xl bg-base-100 border-emerald-100 focus:border-emerald-500 font-black text-lg text-emerald-900"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-500/60 ml-2 italic">📦 Un message de confirmation vous sera envoyé.</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-4">
                    <button onClick={() => setStep(4)} className="font-black text-gray-400 hover:text-gray-900">Retour</button>
                    <button
                      disabled={whatsappNotifPhone.replace(/[^\d]/g, '').length < 8 || loading}
                      onClick={handleConfirmOrder}
                      className="btn btn-primary rounded-2xl px-12 h-16 font-black shadow-lg shadow-primary/20 gap-2 flex-1 md:flex-none"
                    >
                      {loading ? <span className="loading loading-spinner"></span> : "Finaliser ma commande"}
                    </button>
                  </div>
                </div>
              )}

              {isSuccess ? (
                <div
                  key="success"
                  className="bg-base-100 p-8 md:p-20 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-6 md:space-y-8"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto md:scale-125 mb-2 md:mb-4">
                    <Check size={32} className="md:w-12 md:h-12" />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">Félicitations !</h2>
                    <p className="text-sm md:text-gray-500 font-medium max-w-[250px] md:max-w-sm mx-auto leading-relaxed">Votre commande a été enregistrée avec succès. Redirection en cours…</p>
                  </div>
                  <div className="pt-6 md:pt-8 loading loading-dots loading-md md:loading-lg text-primary"></div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Sidebar Summary — Desktop Only, hidden on success */}
          <div className={`lg:col-span-4 ${isSuccess ? 'hidden' : 'hidden lg:block'}`}>
            <div className="sticky top-24 bg-base-100 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-base-content/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-8 md:space-y-10 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"></div>

              <h3 className="text-3xl font-black flex items-center gap-4 relative z-10 text-base-content tracking-tight">
                Résumé <span className="p-2 bg-base-200 border border-base-content/5 rounded-xl"><ReceiptText size={22} className="text-primary" /></span>
              </h3>

              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {itemsFromCart.map((it, idx) => (
                  <div key={idx} className="flex flex-col gap-1 py-2 border-b border-base-200 last:border-0 group/item">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-sm leading-tight text-base-content mb-1 truncate group-hover/item:text-primary transition-colors">{it.name || "Produit"}</p>
                            <p className="text-[10px] font-black uppercase text-base-content/40 tracking-[0.2em]">{it.quantity} x {Number(it.price_snapshot || it.price).toLocaleString()} F</p>
                        </div>
                        <span className="font-black text-base-content text-sm bg-base-200 px-3 py-1.5 rounded-xl border border-base-200 italic transition-transform group-hover/item:-translate-x-1">
                            {((it.price_snapshot || it.price) * it.quantity).toLocaleString()} F
                        </span>
                    </div>
                    {/* Shipping Origins & Free Zones */}
                    <div className="space-y-1 mt-2">
                        {(it.product?.boutique || it.boutique) && (
                            <div className="flex items-center gap-2">
                                <MapPin size={10} className="text-primary" />
                                <p className="text-[9px] font-bold text-base-content/40 italic">
                                    Expédié depuis : <span className="text-base-content/70">
                                        {[
                                            (it.product?.boutique?.commune_label || it.boutique?.commune_label),
                                            ...(it.product?.free_delivery_communes || it.free_delivery_communes || [])
                                        ].filter((v, i, a) => v && a.indexOf(v) === i).join(', ')}
                                    </span>
                                </p>
                            </div>
                        )}
                        {(it.product?.free_delivery_communes?.length > 0 || it.free_delivery_communes?.length > 0) && (
                            <div className="flex items-center gap-2">
                                <Truck size={10} className="text-emerald-500" />
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                    Livraison offerte dans : {(it.product?.free_delivery_communes || it.free_delivery_communes).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-800 relative z-10">
                {/* Coupon Input */}
                <div className="space-y-3 p-6 bg-base-200 border border-base-200 rounded-3xl relative">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Coupon de réduction</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTRER LE CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-base-100 border-2 border-base-200 rounded-2xl h-12 px-4 text-xs font-black tracking-widest focus:border-primary outline-none transition-all placeholder:text-base-content/30"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isValidating || !couponCode}
                      className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {isValidating ? <span className="loading loading-spinner loading-xs"></span> : <Check size={18} strokeWidth={3} />}
                    </button>
                  </div>
                  {discount > 0 && <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20 animate-bounce">ACTIF</span>}
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-base-content/40 font-bold text-sm">
                        <span>Sous-total</span>
                        <span>{totalFromCart.toLocaleString()} F</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-emerald-500 font-bold text-sm bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <span className="flex items-center gap-2"><Zap size={14} /> Réduction</span>
                            <span>-{discount.toLocaleString()} F</span>
                        </div>
                    )}
                    <div className="flex justify-between text-base-content/40 font-bold text-sm">
                        <div className="flex flex-col">
                            <span>Livraison</span>
                            {address?.is_valid && deliveryFee === 0 && (
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">
                                    Offerte
                                </span>
                            )}
                        </div>
                        {address?.is_valid ? (
                            <div className="text-right">
                                <span className="text-primary font-black">{deliveryFee === 0 ? "Gratuite" : `${deliveryFee.toLocaleString()} F`}</span>
                                {deliveryFee > 0 && <p className="text-[8px] uppercase tracking-widest text-base-content/40">Simulation Max.</p>}
                            </div>
                        ) : (
                            <span className="text-[10px] font-black uppercase text-base-content/30 italic">Attente adresse</span>
                        )}
                    </div>
                    {deliveryFee > 0 && (
                        <p className="text-[9px] font-bold text-base-content/40 leading-tight bg-base-200 p-2 rounded-xl border border-base-200">
                            ✨ Notre système optimisera automatiquement le point de départ lors de la validation pour vous offrir le tarif de livraison le plus bas possible.
                        </p>
                    )}
                </div>

                <div className="pt-6 border-t border-base-200">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-base-content/40 mb-1">À PAYER</span>
                        <div className="text-right">
                           {discount > 0 && <span className="block text-sm font-bold text-base-content/30 line-through mb-[-4px]">{totalFromCart.toLocaleString()} F</span>}
                           {address?.is_valid ? (
                               <span className="text-3xl md:text-5xl font-black text-base-content tracking-tightest">{finalTotal.toLocaleString()} <span className="text-base md:text-lg text-primary relative -top-2 md:-top-4 ml-1">F</span></span>
                           ) : (
                               <div className="flex flex-col items-end">
                                   <span className="text-3xl font-black text-base-content/20 tracking-tighter">-- --- F</span>
                                   <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest mt-1">Calculé après l'adresse</span>
                               </div>
                           )}
                        </div>
                    </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 relative z-10">
                <div className="flex items-center gap-4 text-xs font-bold text-base-content/50">
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
      <div className={`modal ${showFedaPayModal ? 'modal-open' : ''} bg-neutral/95 backdrop-blur-xl p-4 md:p-6`}>
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