import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, SignUp, SignIn } from '../../lib/clerk-shim';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin, Phone, MessageCircle, CreditCard, ShieldCheck, Store, Loader2, Navigation, UserCheck } from 'lucide-react';
import AddressSelector from '../context/AddressSelector';
import SupplierBlockModal from '../Shared/SupplierBlockModal';
import { registerSelfSupplier } from '../../services/supplierService';
import api from '../../services/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const SupplierRegister = () => {
    const [step, setStep] = useState(1);
    const [authMode, setAuthMode] = useState('signUp');
    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken, userId, signOut } = useAuth();
    const [showBlockModal, setShowBlockModal] = useState(false);
    const navigate = useNavigate();
    
    // REAL-TIME ROLE CHECK after sign in
    useEffect(() => {
        const checkRoleAndRedirect = async () => {
            if (isSignedIn) {
                try {
                    const token = await getToken();
                    const { data } = await api.get('/suppliers/me');
                    if (data) {
                        navigate('/fournisseur/dashboard');
                        return;
                    }
                } catch (err) {
                    console.log("User is not a supplier yet.");
                    // After a short delay to show the check happening, move to registration steps
                    setTimeout(() => setStep(2), 1500);
                }
            }
        };

        if (isSignedIn) {
            const role = user?.publicMetadata?.role;
            // Si c'est déjà un admin ou un utilisateur simple, on bloque
            if (role === 'admin' || role === 'user') {
                setShowBlockModal(true);
            } else {
                checkRoleAndRedirect();
            }
        }
    }, [isSignedIn, user, navigate, getToken]);

    const handleSignOut = async (toRegister = false) => {
        await signOut();
        setShowBlockModal(false);
        if (toRegister) {
            window.location.reload(); // Redémarrer le flux d'inscription à zéro (Clerk SignUp)
        } else {
            navigate('/');
        }
    };

    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        whatsapp: '',
        momoNumber: '',
        address_line: '',
        lat: 6.3654,
        lng: 2.4183,
        termsAccepted: false,
        electronicSignature: '',
        departement_id: '',
        departement_label: '',
        commune_id: '',
        commune_label: '',
        quartier_id: '',
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
            window.location.href = '/fournisseur/dashboard'; 
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

    // DETERMINISTIC UI: If sign-in mode and not signed in, hide everything but the login box
    const isLoggingIn = authMode === 'signIn' && !isSignedIn;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
            
            {/* ONLY SHOW STEPS IF: User is signing up OR is already signed in but needs to complete profile */}
            {(!isLoggingIn && (authMode === 'signUp' || isSignedIn)) && (
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
            )}

            {/* Content Card */}
            <div className={`w-full ${isLoggingIn ? 'max-w-md' : 'max-w-2xl'} bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-white p-10 md:p-16 relative overflow-hidden transition-all duration-500`}>
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
                                    <div className="flex justify-center gap-4 mb-4">
                                        <button 
                                            onClick={() => setAuthMode('signUp')}
                                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signUp' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            S'inscrire
                                        </button>
                                        <button 
                                            onClick={() => setAuthMode('signIn')}
                                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signIn' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            Se Connecter
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">
                                            {authMode === 'signUp' ? 'Devenir Fournisseur' : 'Connexion Partenaire'}
                                        </h2>
                                        {!isLoggingIn && (
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                Étape 1 : Créez votre compte d'accès
                                            </p>
                                        )}
                                    </div>
                                    
                                    {authMode === 'signUp' ? <SignUp /> : <SignIn />}
                                    
                                    <p className="text-center text-xs font-bold text-slate-400 italic">
                                        {authMode === 'signUp' ? 'Déjà inscrit ? Cliquez sur Se Connecter.' : 'Pas encore de compte ? Cliquez sur S\'inscrire.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8 text-center py-12">
                                    <div className="w-20 h-20 bg-primary/5 rounded-[30px] flex items-center justify-center text-primary mx-auto text-3xl shadow-xl shadow-primary/5 mb-6">
                                        <Loader2 className="w-10 h-10 animate-spin stroke-[3]" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">Vérification en cours...</h3>
                                        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest leading-loose">
                                            Nous préparons votre espace partenaire
                                        </p>
                                    </div>
                                    
                                    <div className="pt-8">
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                window.location.reload();
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            Utiliser un autre compte
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
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <PhoneInput
                                                international
                                                defaultCountry="BJ"
                                                value={formData.phone}
                                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                                className="w-full bg-slate-50 border-none rounded-3xl pl-14 pr-8 py-3.5 font-black text-sm text-slate-900 focus-within:ring-2 focus-within:ring-primary/20 transition-all [&>input]:bg-transparent [&>input]:outline-none [&>input]:w-full"
                                                placeholder="+229 00 00 00 00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 px-4 flex items-center gap-2">
                                            <MessageCircle size={14} /> WhatsApp
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                                                <MessageCircle className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <PhoneInput
                                                international
                                                defaultCountry="BJ"
                                                value={formData.whatsapp}
                                                onChange={(val) => setFormData({ ...formData, whatsapp: val })}
                                                className="w-full bg-slate-50 border-none rounded-3xl pl-14 pr-8 py-3.5 font-black text-sm text-slate-900 focus-within:ring-2 focus-within:ring-primary/20 transition-all [&>input]:bg-transparent [&>input]:outline-none [&>input]:w-full"
                                                placeholder="+229 00 00 00 00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Numéro Mobile Money (Momo Pay)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                                            <CreditCard className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <PhoneInput
                                            international
                                            defaultCountry="BJ"
                                            value={formData.momoNumber}
                                            onChange={(val) => setFormData({ ...formData, momoNumber: val })}
                                            className="w-full bg-slate-50 border-none rounded-3xl pl-14 pr-8 py-3.5 font-black text-sm text-slate-900 focus-within:ring-2 focus-within:ring-primary/20 transition-all [&>input]:bg-transparent [&>input]:outline-none [&>input]:w-full"
                                            placeholder="+229 00 00 00 00"
                                        />
                                    </div>
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
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Adresse de Boutique</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Trouvez votre quartier pour une logistique simplifiée</p>
                            </div>

                            <div className="space-y-6">
                                <AddressSelector 
                                    requirePhone={false}
                                    onChange={(loc) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            departement_id: loc.departement_id || '',
                                            departement_label: loc.departement_label || '',
                                            commune_id: loc.commune_id || '',
                                            commune_label: loc.commune_label || '',
                                            quartier_id: loc.quartier_id || '',
                                            quartier_label: loc.quartier_label || '',
                                            address_line: loc.address_line || '',
                                            lat: 0,
                                            lng: 0,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.quartier_label || !formData.commune_label}
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
            <SupplierBlockModal 
                isOpen={showBlockModal}
                onClose={() => handleSignOut(false)}
                onAction={() => handleSignOut(true)}
                title="Session Active Détectée"
                subtitle="Compte Séparé Requis"
                message="Vous êtes déjà connecté. Pour une meilleure expérience, vous devez créer un nouveau compte dédié exclusivement à votre boutique."
                actionText="Créer un nouveau compte marchand"
                icon={UserCheck}
                variant="emerald"
            />
        </div>
    );
};

export default SupplierRegister;
