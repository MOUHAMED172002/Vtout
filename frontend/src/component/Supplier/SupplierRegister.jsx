import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from "../../lib/AuthHooks";
import { SignUp, SignIn } from "../../lib/AuthComponents";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MapPin, Phone, MessageCircle, CreditCard, ShieldCheck, Store, Loader2, UserCheck, HelpCircle } from 'lucide-react';
import AddressSelector from '../context/AddressSelector';
import SupplierBlockModal from '../Shared/SupplierBlockModal';
import CountryPhoneSelector from '../Shared/CountryPhoneSelector';
import { useAppConfig } from '../context/ConfigContext';
import { registerSelfSupplier } from '../../services/supplierService';
import api from '../../services/api';

const SupplierRegister = () => {
    const [step, setStep] = useState(1);
    const [authMode, setAuthMode] = useState('signUp');
    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken, signOut } = useAuth();
    const { getConfig } = useAppConfig();
    const [showBlockModal, setShowBlockModal] = useState(false);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        shopName: '', phone: '', whatsapp: '', momoNumber: '',
        address_line: '', lat: 0, lng: 0, termsAccepted: false,
        electronicSignature: '', departement_id: '', departement_label: '',
        commune_id: '', commune_label: '', quartier_id: '', quartier_label: ''
    });

    const [policies, setPolicies] = useState([]);

    useEffect(() => {
        api.get('/policies/type/supplier').then(r => setPolicies(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        const checkRole = async () => {
            if (isSignedIn) {
                const role = user?.publicMetadata?.role;
                if (role === 'admin' || role === 'user') { setShowBlockModal(true); return; }
                try {
                    await api.get('/suppliers/me');
                    navigate('/fournisseur/dashboard');
                } catch {
                    setTimeout(() => setStep(2), 1200);
                }
            }
        };
        if (isSignedIn) checkRole();
    }, [isSignedIn, user, navigate]);

    useEffect(() => {
        if (isSignedIn && user) {
            setFormData(p => ({ ...p, phone: user.primaryPhoneNumber?.phoneNumber || p.phone }));
        }
    }, [isSignedIn, user]);

    const set = (key, val) => { setFormData(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })); };

    const validateStep2 = () => {
        const e = {};
        if (!formData.shopName?.trim()) e.shopName = 'Le nom de la boutique est obligatoire';
        if (!formData.phone) e.phone = 'Le numéro de téléphone est obligatoire';
        if (!formData.whatsapp) e.whatsapp = 'Le numéro WhatsApp est obligatoire — vous recevrez vos alertes commandes ici';
        if (!formData.momoNumber) e.momoNumber = 'Le numéro MoMo est obligatoire pour recevoir vos paiements';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = () => {
        const e = {};
        if (!formData.departement_label) e.departement = 'Veuillez sélectionner un département';
        if (!formData.commune_label) e.commune = 'Veuillez sélectionner une commune';
        if (!formData.quartier_label) e.quartier = 'Veuillez sélectionner un quartier';
        if (!formData.address_line?.trim()) e.address_line = 'Décrivez précisément votre adresse (ex: face pharmacie, 1er bâtiment rouge)';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            await registerSelfSupplier(formData, token);
            window.location.href = '/fournisseur/dashboard';
        } catch (error) {
            alert(error?.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async (toRegister = false) => {
        await signOut();
        setShowBlockModal(false);
        if (toRegister) window.location.reload();
        else navigate('/');
    };

    const steps = [
        { id: 1, title: getConfig('supplier_register_step1_title', 'Compte'), icon: <Store size={20} /> },
        { id: 2, title: getConfig('supplier_register_step2_title', 'Contact & Paiement'), icon: <Phone size={20} /> },
        { id: 3, title: getConfig('supplier_register_step3_title', 'Localisation'), icon: <MapPin size={20} /> },
        { id: 4, title: getConfig('supplier_register_step4_title', 'Validation'), icon: <ShieldCheck size={20} /> },
    ];

    if (!isLoaded) return null;

    const isLoggingIn = authMode === 'signIn' && !isSignedIn;

    const fieldClass = (err) => `w-full bg-slate-50 border-2 rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all ${err ? 'border-rose-400' : 'border-transparent'}`;
    const phoneWrap = (err) => `rounded-3xl border-2 ${err ? 'border-rose-400' : 'border-transparent'}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
            {/* Intro header */}
            <div className="text-center mb-10 space-y-3">
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ background: 'rgba(0,84,166,0.1)', color: '#0054a6' }}>
                    <Store size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                    Devenir <span style={{ color: '#f37021' }}>Vendeur.</span>
                </h1>
                <p className="text-slate-500 font-bold max-w-sm mx-auto">Ouvrez votre boutique et vendez à des milliers de clients partout au Bénin.</p>
                <button
                    onClick={() => navigate('/comment-ca-marche/vendeur')}
                    className="inline-flex items-center gap-2 border-2 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 mx-auto"
                    style={{ borderColor: 'rgba(0,84,166,0.3)', color: '#0054a6' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,84,166,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,84,166,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,84,166,0.3)'; }}
                >
                    <HelpCircle size={16} />
                    Comment ça marche ?
                </button>
            </div>
            {(!isLoggingIn && (authMode === 'signUp' || isSignedIn)) && (
                <div className="w-full max-w-4xl mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
                        <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
                        {steps.map(s => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 border-slate-50 ${step >= s.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-white text-slate-400'}`}>
                                    {step > s.id ? <Check size={20} /> : s.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${step >= s.id ? 'text-primary' : 'text-slate-400'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={`w-full ${isLoggingIn ? 'max-w-md' : 'max-w-2xl'} bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-white p-10 md:p-16 relative overflow-hidden transition-all duration-500`}>
                <AnimatePresence mode="wait">

                    {/* STEP 1: Auth */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            {!isSignedIn ? (
                                <div className="space-y-6">
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => setAuthMode('signUp')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signUp' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>{getConfig('supplier_register_sign_up_button', 'S\'inscrire')}</button>
                                        <button onClick={() => setAuthMode('signIn')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signIn' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>{getConfig('supplier_register_sign_in_button', 'Se Connecter')}</button>
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">{authMode === 'signUp' ? getConfig('supplier_register_heading_signup', 'Devenir Fournisseur') : getConfig('supplier_register_heading_signin', 'Connexion Partenaire')}</h2>
                                        {!isLoggingIn && <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{getConfig('supplier_register_step1_subtitle', 'Étape 1 : Créez votre compte d\'accès')}</p>}
                                    </div>
                                    {authMode === 'signUp' ? <SignUp /> : <SignIn />}
                                    <p className="text-center text-xs font-bold text-slate-400 italic">
                                        {authMode === 'signUp' ? getConfig('supplier_register_already_registered', 'Déjà inscrit ? Cliquez sur Se Connecter.') : getConfig('supplier_register_no_account', 'Pas encore de compte ? Cliquez sur S\'inscrire.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8 text-center py-12">
                                    <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto stroke-[2]" />
                                    <div><h3 className="text-2xl font-black text-slate-900">{getConfig('supplier_register_checking_title', 'Vérification en cours...')}</h3><p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold mt-2">{getConfig('supplier_register_checking_subtitle', 'Préparation de votre espace partenaire')}</p></div>
                                    <button onClick={async () => { await signOut(); window.location.reload(); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors">{getConfig('supplier_register_use_other_account_button', 'Utiliser un autre compte')}</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: Contact & Payment */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="text-center border-b border-slate-100 pb-6">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">{getConfig('supplier_register_step2_title', 'Infos Partenaire')}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{getConfig('supplier_register_step2_subtitle', 'Tous les champs sont obligatoires')}</p>
                            </div>

                            <div className="space-y-5">
                                {/* Shop name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 flex items-center gap-1">{getConfig('supplier_register_shop_name_label', 'Nom de la Boutique')} <span className="text-rose-500">*</span></label>
                                    <input type="text" value={formData.shopName} onChange={e => set('shopName', e.target.value)} className={fieldClass(errors.shopName)} placeholder={getConfig('supplier_register_shop_name_placeholder', 'Ex: BENIN STORE SARL')} />
                                    {errors.shopName && <p className="text-rose-500 text-[11px] font-bold px-4">{errors.shopName}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Phone */}
                                    <CountryPhoneSelector 
                                        label={getConfig('supplier_register_phone_label', 'Téléphone')} 
                                        value={formData.phone} 
                                        onChange={val => set('phone', val)} 
                                        error={errors.phone}
                                        required={true}
                                    />

                                    {/* WhatsApp */}
                                    <CountryPhoneSelector 
                                        label={getConfig('supplier_register_whatsapp_label', 'WhatsApp')} 
                                        value={formData.whatsapp} 
                                        onChange={val => set('whatsapp', val)} 
                                        error={errors.whatsapp}
                                        required={true}
                                    />
                                </div>

                                {/* MoMo */}
                                <CountryPhoneSelector
                                    label={getConfig('supplier_register_momo_label', 'Numéro Mobile Money (MoMo)')}
                                    value={formData.momoNumber}
                                    onChange={val => set('momoNumber', val)}
                                    error={errors.momoNumber}
                                    required={true}
                                />
                                {errors.momoNumber ? <p className="text-rose-500 text-[11px] font-bold px-4">{errors.momoNumber}</p> : <p className="text-amber-600 text-[10px] font-bold px-4">{getConfig('supplier_register_momo_note', '💰 Vos paiements après livraison')}</p>}
                                
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button onClick={() => setStep(s => s - 1)} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all"><ChevronLeft size={24} /></button>
                                <button onClick={() => { if (validateStep2()) setStep(s => s + 1); }} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl">{getConfig('supplier_register_next_button', 'Étape Suivante')}</button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Address */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">{getConfig('supplier_register_step3_title', 'Adresse de Boutique')}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{getConfig('supplier_register_step3_subtitle', 'Localisation exacte pour la logistique')}</p>
                            </div>

                            <AddressSelector requirePhone={false} onChange={loc => {
                                setFormData(p => ({
                                    ...p,
                                    departement_id: loc.departement_id || '', departement_label: loc.departement_label || '',
                                    commune_id: loc.commune_id || '', commune_label: loc.commune_label || '',
                                    quartier_id: loc.quartier_id || '', quartier_label: loc.quartier_label || '',
                                    address_line: loc.address_line || '', lat: loc.lat || 0, lng: loc.lng || 0,
                                }));
                                setErrors({});
                            }} />

                            {/* Address detail input */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 flex items-center gap-1"><MapPin size={12} /> {getConfig('supplier_register_address_description_label', 'Description précise de l\'adresse')} <span className="text-rose-500">*</span></label>
                                <input type="text" value={formData.address_line} onChange={e => set('address_line', e.target.value)} className={fieldClass(errors.address_line)} placeholder={getConfig('supplier_register_address_description_placeholder', 'Ex: Face pharmacie du peuple, 1er bâtiment rouge')} />
                                {errors.address_line && <p className="text-rose-500 text-[11px] font-bold px-4">{errors.address_line}</p>}
                            </div>

                            {/* Validation feedback */}
                            {(errors.departement || errors.commune || errors.quartier) && (
                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                    <p className="text-rose-600 text-[11px] font-bold">⚠️ Veuillez sélectionner votre Département, Commune et Quartier.</p>
                                </div>
                            )}
                            {formData.quartier_label && (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                    <Check size={16} className="text-emerald-500 shrink-0" />
                                    <p className="text-emerald-700 text-[11px] font-bold">{formData.quartier_label}, {formData.commune_label}, {formData.departement_label}</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button onClick={() => setStep(s => s - 1)} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all"><ChevronLeft size={24} /></button>
                                <button onClick={() => { if (validateStep3()) setStep(s => s + 1); }} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl">{getConfig('supplier_register_next_button', 'Valider la position')}</button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Terms */}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="text-center p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
                                <h2 className="text-3xl font-black tracking-tighter text-indigo-900 mb-1">{getConfig('supplier_register_step4_title', 'Dernière Étape')}</h2>
                                <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{getConfig('supplier_register_step4_subtitle', 'Accord de partenariat et confidentialité')}</p>
                            </div>

                            <div className="max-h-[240px] overflow-y-auto p-8 rounded-[30px] bg-slate-50 text-[11px] font-bold text-slate-600 leading-relaxed border border-slate-100 shadow-inner">
                                <h4 className="font-black text-slate-900 text-sm mb-4 uppercase">{getConfig('supplier_register_terms_title', 'Conditions du programme Fournisseur')}</h4>
                                {policies.length > 0 ? policies.map(p => (
                                    <div key={p.id} className="mb-4"><p className="font-black text-slate-800 text-xs mb-1">{p.title}</p><div className="whitespace-pre-wrap">{p.content}</div></div>
                                )) : (
                                    <div className="space-y-3">
                                        <p>1. <strong>Confidentialité</strong> : Vous vous engagez à ne pas divulguer les prix d'achat, les marges de la plateforme, ni les informations des clients finaux.</p>
                                        <p>2. <strong>Propriété intellectuelle</strong> : Vous cédez le droit d'utiliser vos images, logos et descriptions pour les ventes.</p>
                                        <p>3. <strong>Qualité &amp; Conformité</strong> : Vous garantissez que les produits respectent les normes en vigueur.</p>
                                        <p>4. <strong>Conditions Financières</strong> : Les paiements seront effectués sur le numéro Mobile Money renseigné après confirmation de livraison.</p>
                                        <p>5. <strong>Stock</strong> : Vous vous engagez à tenir votre stock à jour pour éviter les commandes annulées.</p>
                                        <p>6. En vous inscrivant, vous acceptez que l'administrateur modère vos produits et fixe le prix de vente final.</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 cursor-pointer p-4 rounded-[30px] border-2 border-slate-100 hover:border-primary transition-all group">
                                    <input type="checkbox" checked={formData.termsAccepted} onChange={e => setFormData(p => ({ ...p, termsAccepted: e.target.checked }))} className="w-8 h-8 rounded-xl border-none bg-slate-100 text-primary focus:ring-0 checked:bg-primary transition-all cursor-pointer" />
                                    <span className="text-xs font-black text-slate-600 group-hover:text-primary transition-colors">{getConfig('supplier_register_terms_accept_label', 'J\'ai lu et j\'accepte les termes du contrat ci-dessus.')}</span>
                                </label>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">{getConfig('supplier_register_signature_label', 'Signature Électronique')} <span className="text-rose-500">*</span></label>
                                    <input type="text" value={formData.electronicSignature} onChange={e => setFormData(p => ({ ...p, electronicSignature: e.target.value }))} className={fieldClass(!formData.electronicSignature && formData.termsAccepted)} placeholder={getConfig('supplier_register_signature_placeholder', 'Tapez votre nom complet pour signer...')} />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(s => s - 1)} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all"><ChevronLeft size={24} /></button>
                                <button onClick={handleSubmit} disabled={!formData.termsAccepted || !formData.electronicSignature || isLoading} className="flex-1 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isLoading && <Loader2 className="animate-spin" size={16} />}
                                    {getConfig('supplier_register_submit_button', 'Finaliser mon Inscription')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <SupplierBlockModal isOpen={showBlockModal} onClose={() => handleSignOut(false)} onAction={() => handleSignOut(true)} title={getConfig('supplier_register_blockmodal_title', 'Session Active Détectée')} subtitle={getConfig('supplier_register_blockmodal_subtitle', 'Compte Séparé Requis')} message={getConfig('supplier_register_blockmodal_message', 'Vous êtes déjà connecté. Pour une meilleure expérience, vous devez créer un nouveau compte dédié exclusivement à votre boutique.')} actionText={getConfig('supplier_register_blockmodal_action', 'Créer un nouveau compte marchand')} icon={UserCheck} variant="emerald" />
        </div>
    );
};

export default SupplierRegister;
