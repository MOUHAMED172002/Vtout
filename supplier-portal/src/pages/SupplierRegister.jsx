import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin, Phone, MessageCircle, CreditCard, ShieldCheck, Store } from 'lucide-react';
import { registerSupplier } from '../services/supplierService';
import { toast } from 'react-hot-toast';
import MapboxPicker from '../components/Shared/MapboxPicker';


const SupplierRegister = () => {
    const [step, setStep] = useState(1);
    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        whatsapp: '',
        momoNumber: '',
        address_line: '',
        lat: 6.3654, // Default Cotonou
        lng: 2.4183,
        termsAccepted: false,
        electronicSignature: '',
        departement_id: null,
        departement_label: '',
        commune_id: null,
        commune_label: '',
        quartier_id: null,
        quartier_label: ''
    });

    const [viewState, setViewState] = useState({
        longitude: 2.4183,
        latitude: 6.3654,
        zoom: 12
    });

    // Sync with User phone if available
    useEffect(() => {
        if (isSignedIn && user) {
            setFormData(prev => ({
                ...prev,
                phone: user.primaryPhoneNumber?.phoneNumber || prev.phone
            }));
        }
    }, [isSignedIn, user]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const result = await registerSupplier(formData, token);

            toast.success('Inscription réussie ! Votre compte est en attente de validation.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Erreur inscription:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de l’inscription');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Authentification', icon: <Store size={20} /> },
        { id: 2, title: 'Contact & Paiement', icon: <Phone size={20} /> },
        { id: 3, title: 'Localisation', icon: <MapPin size={20} /> },
        { id: 4, title: 'Validation', icon: <ShieldCheck size={20} /> },
    ];

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
            {/* Header / Progress */}
            <div className="w-full max-w-4xl mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 border-slate-50 ${step >= s.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-white text-slate-400'
                                }`}>
                                {step > s.id ? <Check size={20} /> : s.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-white p-10 md:p-16 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {!isSignedIn ? (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Devenir Fournisseur</h2>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Étape 1 : Créez votre compte d'accès</p>
                                    </div>
                                    <SignUp
                                        signInUrl="/auth/connexion"
                                        forceRedirectUrl="/inscription"
                                        appearance={{
                                            elements: {
                                                rootBox: "w-full mx-auto",
                                                card: "shadow-none border-none p-0",
                                                headerTitle: "hidden",
                                                headerSubtitle: "hidden"
                                            }
                                        }}
                                    />
                                    <p className="text-center text-xs font-bold text-slate-400 italic">Déjà inscrit ? Connectez-vous d'abord.</p>
                                </div>
                            ) : (
                                <div className="space-y-8 text-center py-10">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-[30px] flex items-center justify-center text-emerald-500 mx-auto text-4xl shadow-xl shadow-emerald-100">
                                        <Check className="w-12 h-12 stroke-[3]" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Connecté avec succès !</h3>
                                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Compte: {user.primaryEmailAddress.emailAddress}</p>
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl"
                                    >
                                        Continuer vers les détails boutique
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center border-b border-slate-100 pb-8">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Infos Partenaire</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Contacts essentiels pour la gestion</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Nom de la Boutique / Entreprise</label>
                                    <input
                                        type="text"
                                        value={formData.shopName}
                                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Ex: BENIN STORE SARL"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Téléphone Principal</label>
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-3xl pl-16 pr-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="+229 ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 px-4 flex items-center gap-2">
                                            <MessageCircle size={14} /> WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="+229 ..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Numéro Mobile Money (Momo Pay)
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.momoNumber}
                                        onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Numéro pour vos règlements..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.shopName || !formData.phone}
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl disabled:opacity-50"
                                >
                                    Étape Suivante
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center border-b border-slate-100 pb-8">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Localisation</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Pointez votre boutique sur la carte</p>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-slate-50 p-2 shadow-inner">
                                    <MapboxPicker
                                        inline={true}
                                        onLocationSelect={(addr) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                lat: addr.lat,
                                                lng: addr.lng,
                                                address_line: addr.address_line,
                                                departement_label: addr.departement_label || prev.departement_label,
                                                commune_label: addr.commune_label || prev.commune_label,
                                                quartier_label: addr.quartier_label || prev.quartier_label
                                            }));
                                        }}
                                        existingLat={formData.lat}
                                        existingLng={formData.lng}
                                    />
                                </div>

                                {/* Confirmation des détails extraits par Mapbox */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ville / Commune</label>
                                        <input
                                            type="text"
                                            value={formData.commune_label}
                                            onChange={(e) => setFormData({ ...formData, commune_label: e.target.value })}
                                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0"
                                            placeholder="Ex: Cotonou"
                                        />
                                    </div>
                                    <div className="space-y-1.5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 ring-2 ring-primary/10">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-primary">Quartier / Zone *</label>
                                        <input
                                            type="text"
                                            value={formData.quartier_label}
                                            onChange={(e) => setFormData({ ...formData, quartier_label: e.target.value })}
                                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0"
                                            placeholder="Saisissez votre quartier précis"
                                        />
                                    </div>
                                </div>

                                <p className="text-[10px] font-bold text-slate-400 text-center px-10 italic">
                                    Mapbox tente de détecter votre zone automatiquement. Merci de confirmer ou corriger le quartier.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.quartier_label || !formData.lat}
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl disabled:opacity-50"
                                >
                                    Valider la position
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="text-center p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
                                <h2 className="text-3xl font-black tracking-tighter text-indigo-900 mb-2">Dernière Étape</h2>
                                <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Accord de partenariat et confidentialité</p>
                            </div>

                            <div className="space-y-6">
                                <div className="max-h-[200px] overflow-y-auto p-8 rounded-[30px] bg-slate-50 text-[11px] font-bold text-slate-500 leading-relaxed custom-scrollbar border border-slate-100 shadow-inner">
                                    <h4 className="font-black text-slate-900 text-sm mb-4 uppercase">Conditions du programme Fournisseur</h4>
                                    <p className="mb-4">1. En vous inscrivant, vous acceptez que l'administrateur de EShop modère vos produits et fixe le prix de vente final.</p>
                                    <p className="mb-4">2. Vos coordonnées WhatsApp seront partagées avec les livreurs pour faciliter la collecte des colis.</p>
                                    <p className="mb-4">3. Les paiements de vos ventes seront effectués sur le numéro Mobile Money renseigné après confirmation de livraison.</p>
                                    <p>4. Tout produit non conforme ou prix excessif pourra être révoqué sans préavis.</p>
                                </div>

                                <label className="flex items-center gap-4 cursor-pointer p-8 rounded-[30px] border-2 border-slate-100 hover:border-primary transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                        className="w-8 h-8 rounded-xl border-none bg-slate-100 text-primary focus:ring-0 checked:bg-primary transition-all cursor-pointer"
                                    />
                                    <span className="text-xs font-black text-slate-600 group-hover:text-primary transition-colors">
                                        J'accepte les conditions générales et la politique de confidentialité de EShop.
                                    </span>
                                </label>

                                {formData.termsAccepted && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mt-6">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 px-4">Signature Électronique</label>
                                        <input
                                            type="text"
                                            value={formData.electronicSignature}
                                            onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-indigo-100 rounded-3xl px-8 py-5 font-black text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-500/20 transition-all font-serif italic"
                                            placeholder="Saisissez votre nom complet pour signer..."
                                        />
                                        <p className="px-4 text-[9px] font-bold text-slate-400">En tapant votre nom, vous validez l'engagement mentionné ci-dessus.</p>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.termsAccepted || !formData.electronicSignature || formData.electronicSignature.length < 3 || loading}
                                    className="flex-1 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        'Finaliser mon Inscription'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SupplierRegister;
