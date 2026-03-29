import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin, Phone, MessageCircle, CreditCard, ShieldCheck, Store, Loader2, Navigation } from 'lucide-react';
import UnifiedLocationPicker from '../Shared/UnifiedLocationPicker';
import { registerSelfSupplier } from '../../services/supplierService';
import api from '../../services/api';

// Remplacez par votre token Mapbox ou utilisez une variable d'env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibW91aGFtZWQxNzIwMDIiLCJhIjoiY203eHRyb2ZlMDN2dTJrcGZtbm80ZmU2ZSJ9.v_Mh_V_V_V_V_V_V_V_V_V_V'; // Token temporaire ou placeholder

const SupplierRegister = () => {
    const [step, setStep] = useState(1);
    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken, signOut } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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
        departement_label: '',
        commune_label: '',
        quartier_label: ''
    });

    const [policies, setPolicies] = useState([]);
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const { data } = await api.get('/policies/type/supplier');
                setPolicies(data);
            } catch (err) {
                console.error("Policiies load error:", err);
            }
        };
        fetchPolicies();
    }, []);

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
        setIsLoading(true);
        try {
            const token = await getToken();
            await registerSelfSupplier(formData, token);
            alert('Inscription réussie ! Votre compte est en attente de validation par l\'administrateur.');
            navigate('/fournisseur/dashboard'); // usually suppliers are redirected to their dashboard, which shows   En attente state
        } catch (error) {
            console.error('Erreur inscription:', error);
            alert(error?.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
        } finally {
            setIsLoading(false);
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
                                        forceRedirectUrl="/fournisseur/inscription"
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
                                <div className="space-y-8 text-center py-6">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center text-emerald-500 mx-auto text-3xl shadow-xl shadow-emerald-100 mb-6">
                                        <Check className="w-10 h-10 stroke-[3]" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">Confirmation de Compte</h3>
                                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest bg-slate-50 py-3 rounded-2xl border border-slate-100">
                                            Connecté en tant que : <span className="text-slate-900">{user.primaryEmailAddress.emailAddress}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="p-6 bg-amber-50 rounded-[30px] border border-amber-100 flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-amber-700 leading-tight">
                                            Voulez-vous continuer avec ce compte ou utiliser un autre ?
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                window.location.href = "/auth/connexion?redirect=/fournisseur/inscription";
                                            }}
                                            className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                                        >
                                            Changer de compte
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-primary/20 transition-all"
                                        >
                                            Continuer ainsi
                                        </button>
                                    </div>
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
                            <div className="text-center">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Localisation</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Positionnez votre boutique sur la carte</p>
                            </div>

                            <div className="space-y-6">
                                <UnifiedLocationPicker 
                                    onLocationSelect={(loc) => {
                                        setFormData({
                                            ...formData,
                                            lat: loc.lat,
                                            lng: loc.lng,
                                            address_line: loc.formattedAddress
                                        });
                                    }}
                                    initialLat={formData.lat}
                                    initialLng={formData.lng}
                                    label="DÉFINIR L'EMPLACEMENT DE LA BOUTIQUE"
                                />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Adresse Textuelle Complémentaire (Ex: Porte, Immeuble)</label>
                                    <textarea
                                        value={formData.address_line}
                                        onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Ex: Akpakpa, rue 123, immeuble en face de..."
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.lat}
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
                                <div className="max-h-[250px] overflow-y-auto p-8 rounded-[30px] bg-slate-50 text-[11px] font-bold text-slate-600 leading-relaxed custom-scrollbar border border-slate-100 shadow-inner">
                                    <h4 className="font-black text-slate-900 text-sm mb-4 uppercase">Conditions du programme Fournisseur</h4>
                                    {policies.length > 0 ? (
                                        <div className="space-y-4">
                                            {policies.map(p => (
                                                <div key={p.id}>
                                                    <p className="font-black text-slate-800 text-xs mb-1">{p.title}</p>
                                                    <div className="whitespace-pre-wrap">{p.content}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="mb-4">1. <strong>Confidentialité</strong> : Vous vous engagez à ne pas divulguer les prix d'achat/de gros, les marges de la plateforme, ni les informations des clients finaux.</p>
                                            <p className="mb-4">2. <strong>Propriété intellectuelle</strong> : Vous cédez le droit d'utiliser vos images, logos et descriptions de produits pour les ventes.</p>
                                            <p className="mb-4">3. <strong>Qualité & Conformité</strong> : Vous garantissez que les produits vendus respectent les normes en vigueur et ne sont pas des contrefaçons.</p>
                                            <p className="mb-4">4. <strong>Conditions Financières et Paiement</strong> : Les paiements de vos ventes (après déduction des commissions) seront effectués sur le numéro Mobile Money ou compte bancaire renseigné après confirmation de livraison.</p>
                                            <p className="mb-4">5. <strong>Délais d'expédition/Stock</strong> : Vous vous engagez à tenir votre stock à jour pour éviter les commandes annulées.</p>
                                            <p>6. En vous inscrivant, vous acceptez que l'administrateur modère vos produits et fixe le prix de vente final.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-4 cursor-pointer p-4 rounded-[30px] border-2 border-slate-100 hover:border-primary transition-all group">
                                        <input
                                            type="checkbox"
                                            checked={formData.termsAccepted}
                                            onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                            className="w-8 h-8 rounded-xl border-none bg-slate-100 text-primary focus:ring-0 checked:bg-primary transition-all cursor-pointer"
                                        />
                                        <span className="text-xs font-black text-slate-600 group-hover:text-primary transition-colors">
                                            J'ai lu et j'accepte les termes du contrat ci-dessus.
                                        </span>
                                    </label>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Signature Électronique</label>
                                        <input
                                            type="text"
                                            value={formData.electronicSignature}
                                            onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Tapez votre nom complet pour signer..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.termsAccepted || !formData.electronicSignature || isLoading}
                                    className="flex-1 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isLoading && <Loader2 className="animate-spin" size={16} />}
                                    Finaliser mon Inscription
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
