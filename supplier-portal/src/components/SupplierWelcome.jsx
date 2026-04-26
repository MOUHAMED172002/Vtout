import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, Check, MapPin, Phone, MessageCircle, CreditCard, ShieldCheck, ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { useAuth } from './clerk-shim';
import { registerSupplier } from '../services/supplierService';
import { toast } from 'react-hot-toast';
import AddressSelector from './Shared/AddressSelector';

export default function SupplierWelcome({ user }) {
    const [step, setStep] = useState(1);
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);

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
        departement_id: null,
        departement_label: '',
        commune_id: null,
        commune_label: '',
        quartier_id: null,
        quartier_label: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            await registerSupplier(formData, token);
            
            const { authClient } = await import('./clerk-shim');
            await authClient.getSession({ force: true });
            
            toast.success('Boutique créée avec succès !');
            window.location.reload(); // Refresh to load the full dashboard
        } catch (error) {
            console.error('Erreur inscription:', error);
            const errMsg = error.response?.data?.error || 'Erreur lors de la création de la boutique';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Boutique', icon: <Store size={20} /> },
        { id: 2, title: 'Localisation', icon: <MapPin size={20} /> },
        { id: 3, title: 'Contrat', icon: <ShieldCheck size={20} /> },
    ];

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 md:px-0 max-w-4xl mx-auto">
            
            {/* Header Text */}
            <div className="text-center mb-12 space-y-4">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Building2 size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                    Propulsez vos ventes.
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-lg mx-auto">
                    Bonjour {user?.firstName}, finalisez la configuration de votre boutique en 3 petites étapes pour commencer à vendre sur Vtout.
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 border-slate-50 ${step >= s.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-white text-slate-400'}`}>
                                {step > s.id ? <Check size={20} /> : s.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="text-center border-b border-slate-50 pb-8">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Informations de la Boutique</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Comment les clients vont-ils vous connaître ?</p>
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
                                            className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="+229 ..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 px-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Numéro Mobile Money
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.momoNumber}
                                        onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                                        className="w-full bg-amber-50 border-none rounded-3xl px-8 py-5 font-black text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="Numéro pour vos règlements..."
                                    />
                                    <p className="px-4 text-[9px] font-bold text-amber-600">Sur ce numéro vous recevrez vos paiements de Vtout.</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button onClick={handleNext} disabled={!formData.shopName || !formData.phone} className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50">
                                    Étape Suivante <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="text-center border-b border-slate-50 pb-8">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Où récupérer les colis ?</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Indiquez l'adresse de collecte pour nos livreurs</p>
                            </div>

                            <div className="space-y-6">
                                <AddressSelector 
                                    requirePhone={false}
                                    onChange={(loc) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            departement_id: loc.departement_id || prev.departement_id,
                                            departement_label: loc.departement_label || prev.departement_label,
                                            commune_id: loc.commune_id || prev.commune_id,
                                            commune_label: loc.commune_label || prev.commune_label,
                                            quartier_id: loc.quartier_id || prev.quartier_id,
                                            quartier_label: loc.quartier_label || prev.quartier_label,
                                            address_line: loc.address_line || prev.address_line,
                                            lat: loc.lat || 0,
                                            lng: loc.lng || 0,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={handleNext} disabled={!formData.quartier_label} className="flex-1 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50">
                                    Continuer <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="text-center bg-slate-50 rounded-[2rem] p-6 mb-8">
                                <ShieldCheck size={40} className="mx-auto text-primary mb-4" />
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Accord Partenaire</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Signature et validation</p>
                            </div>

                            <div className="space-y-6">
                                <div className="max-h-[150px] overflow-y-auto p-6 rounded-3xl bg-slate-50 text-[10px] font-bold text-slate-500 leading-relaxed custom-scrollbar border border-slate-100">
                                    <p className="mb-2 uppercase text-slate-900 font-black">Règles de fonctionnement</p>
                                    <p className="mb-2">1. Les prix que vous saisissez sont les <span className="font-black text-primary">prix finaux affichés aux clients</span>.</p>
                                    <p className="mb-2">2. Vtout prélève une commission en pourcentage sur chaque vente effectuée.</p>
                                    <p className="mb-2">3. Les colis doivent être prêts dès qu'une commande est confirmée.</p>
                                    <p>4. Vos gains seront transférés via Mobile Money après livraison réussie au client.</p>
                                </div>

                                <label className="flex items-center gap-4 cursor-pointer p-6 rounded-3xl border-2 border-slate-100 hover:border-primary/50 transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                        className="w-6 h-6 rounded-lg text-primary focus:ring-0 border-slate-200 transition-all cursor-pointer"
                                    />
                                    <span className="text-xs font-black text-slate-600 group-hover:text-primary transition-colors">
                                        J'accepte ces conditions pour la vente sur Vtout Marketplace.
                                    </span>
                                </label>

                                {formData.termsAccepted && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-4">Signature Électronique</label>
                                        <input
                                            type="text"
                                            value={formData.electronicSignature}
                                            onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                                            className="w-full bg-primary/5 border-2 border-primary/20 rounded-3xl px-8 py-5 font-black text-[13px] text-primary focus:ring-2 focus:ring-primary/40 transition-all font-serif italic placeholder:text-primary/30 placeholder:not-italic placeholder:font-sans"
                                            placeholder="Saisissez votre nom complet ici..."
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button onClick={handleBack} className="p-5 bg-slate-100 text-slate-400 rounded-3xl hover:bg-slate-200 transition-all">
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.termsAccepted || !formData.electronicSignature || formData.electronicSignature.length < 3 || loading}
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        'Activer ma Boutique'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
