import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, ShieldCheck, FileText, ChevronRight, Upload, CheckCircle2, AlertCircle, Search, Mail, Lock, Smartphone, ArrowRight, ArrowLeft, User as UserIcon } from "lucide-react";
import { useAuth, useUser, SignIn, SignUp } from "../../lib/clerk-shim";
import { useProfile } from "../context/useProfile";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

import { uploadSingleImage } from "../../services/uploadService";
import { registerLivreur } from "../../services/deliveryService";
import { getCommunesParDepartement } from "../../utils/communes";

export default function DevenirLivreur() {
    const { getToken, signOut } = useAuth();
    const { isSignedIn, user } = useUser();
    const { user: profileUser, refreshProfile } = useProfile();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [authMode, setAuthMode] = useState('signUp');
    
    // Redirect active livreurs
    React.useEffect(() => {
        if (isSignedIn && profileUser?.role === 'livreur') {
            navigate('/delivery-rider');
        }
    }, [isSignedIn, profileUser, navigate]);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [zoneSearch, setZoneSearch] = useState("");
    const [policies, setPolicies] = useState([]);

    React.useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const { data } = await api.get('/policies/type/delivery');
                setPolicies(data);
            } catch (err) {
                console.error("Policiies load error:", err);
            }
        };
        fetchPolicies();
    }, []);
    const [form, setForm] = useState({
        phone: user?.primaryPhoneNumber?.phoneNumber || "",
        fullname: user?.fullName || "",
        vehicle_type: "moto",
        vehicle_model: "",
        license_plate: "",
        id_card_url: "",
        service_zones: []
    });

    const communesParDept = useMemo(() => getCommunesParDepartement(), []);
    const filteredDepts = useMemo(() => {
        if (!zoneSearch.trim()) return communesParDept;
        const q = zoneSearch.toLowerCase();
        return communesParDept
            .map(d => ({ ...d, communes: d.communes.filter(c => c.toLowerCase().includes(q)) }))
            .filter(d => d.communes.length > 0);
    }, [communesParDept, zoneSearch]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = await getToken();
            const url = await uploadSingleImage(file, token);
            setForm(prev => ({ ...prev, id_card_url: url }));
            toast.success("Pièce d'identité enregistrée !");
        } catch (err) {
            toast.error("Erreur lors de l'envoi de l'image");
        } finally {
            setUploading(false);
        }
    };

    const handleRegister = async () => {
        if (!isSignedIn) return navigate("/auth/connexion");
        if (!form.id_card_url) return toast.error("Veuillez fournir une copie de votre pièce d'identité");
        if (!form.phone) return toast.error("Veuillez fournir un numéro de téléphone");

        setLoading(true);
        try {
            const token = await getToken();
            await registerLivreur(token, form);
            await refreshProfile();
            setStep(3);
            toast.success("Demande envoyée !");
        } catch (err) {
            console.error(err);
            let msg = "Erreur lors de l'inscription";
            try {
                const parsed = JSON.parse(err.message);
                if (parsed.error) msg = parsed.error;
            } catch(e) {}
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-20 px-4 relative overflow-hidden">
            {/* Premium design background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 transform -skew-y-6 sm:skew-y-0 sm:-rotate-3"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12 space-y-4">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-primary/5"
                    >
                        <Truck size={40} />
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">Devenir <span className="text-primary underline decoration-indigo-200">Livreur.</span></h1>
                    <p className="text-gray-500 font-bold max-w-md mx-auto text-lg">Rejoignez la plus grande flotte de livraison au Bénin et boostez vos revenus.</p>
                </div>

                <div className="relative">
                    {/* Skewed decorative background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-2 sm:skew-y-0 sm:rotate-2 sm:rounded-[4rem] opacity-20"></div>

                    <div className="relative backdrop-blur-2xl bg-white/80 border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {step === 1 && !isSignedIn && (
                                <motion.div
                                    key="auth"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex justify-center gap-4">
                                        <button 
                                            onClick={() => setAuthMode('signUp')}
                                            className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${authMode === 'signUp' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            S'inscrire
                                        </button>
                                        <button 
                                            onClick={() => setAuthMode('signIn')}
                                            className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${authMode === 'signIn' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            Se Connecter
                                        </button>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900">
                                            {authMode === 'signUp' ? 'Créer mon profil' : 'Bon retour !'}
                                        </h2>
                                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                            {authMode === 'signUp' ? 'Étape 1 : Authentification' : 'Accès à votre espace Livreur'}
                                        </p>
                                    </div>
                                    
                                    <div className="max-w-md mx-auto">
                                        {authMode === 'signUp' ? <SignUp /> : <SignIn />}
                                    </div>
                                </motion.div>
                            )}

                            {step === 1 && isSignedIn && (
                                <motion.div
                                    key="terms"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Conditions d'admission</h2>
                                        </div>
                                        <div className="grid gap-5">
                                            {policies.length > 0 ? (
                                                policies.map((p) => (
                                                    <div key={p.id} className="group p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-primary/30 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                                <CheckCircle2 size={20} />
                                                            </div>
                                                            <p className="font-black text-gray-900 tracking-tight">{p.title}</p>
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-500 leading-relaxed pl-14 opacity-80">
                                                            {p.content}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                ["Avoir au moins 18 ans", "Moyen de déplacement propre", "Smartphone & Connexion Internet", "Pièce d'identité valide"].map((text, i) => (
                                                    <div key={i} className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-gray-700">
                                                        <CheckCircle2 size={24} className="text-emerald-500" />
                                                        {text}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6 pt-6">
                                        <label className="flex items-center gap-5 cursor-pointer group bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary rounded-xl w-7 h-7 border-slate-300"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            />
                                            <span className="text-gray-700 font-bold group-hover:text-primary transition-colors">J'accepte les conditions de partenariat d'Vtout</span>
                                        </label>
                                        <button
                                            disabled={!acceptedTerms}
                                            onClick={() => setStep(2)}
                                            className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                                        >
                                            Accepter et continuer <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-12"
                                >
                                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                            <FileText size={24} />
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Détails de Profil</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nom Complet</label>
                                            <div className="relative">
                                                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" className="w-full pl-12 h-16 rounded-2xl font-black bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none" value={form.fullname} onChange={e => setForm({ ...form, fullname: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">WhatsApp</label>
                                            <div className="relative">
                                                <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" className="w-full pl-12 h-16 rounded-2xl font-black bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type de véhicule</label>
                                            <select className="w-full px-6 h-16 rounded-2xl font-black bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none appearance-none" value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}>
                                                <option value="moto">Moto (Zémidjan)</option>
                                                <option value="car">Voiture</option>
                                                <option value="bicycle">Vélo / À pied</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Modèle du véhicule</label>
                                            <input type="text" className="w-full px-6 h-16 rounded-2xl font-black bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none" value={form.vehicle_model} onChange={e => setForm({ ...form, vehicle_model: e.target.value })} placeholder="Ex: Haojue 110" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] ml-1 block">Zones de service <span className="text-primary">({(form.service_zones || []).length})</span></label>
                                        <div className="relative">
                                            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input type="text" placeholder="Rechercher une commune..." value={zoneSearch} onChange={e => setZoneSearch(e.target.value)} className="w-full pl-14 h-16 rounded-3xl font-bold bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white transition-all outline-none shadow-inner" />
                                        </div>

                                        <div className="bg-slate-50/50 rounded-[2rem] p-8 max-h-[400px] overflow-y-auto border border-slate-100 space-y-8 shadow-inner custom-scrollbar">
                                            {filteredDepts.map(dept => (
                                                <div key={dept.departement} className="space-y-4">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                                        <span className="w-8 h-px bg-slate-200"></span>
                                                        {dept.departement}
                                                    </p>
                                                    <div className="flex flex-wrap gap-3">
                                                        {dept.communes.map(zone => (
                                                            <button
                                                                key={zone}
                                                                type="button"
                                                                onClick={() => {
                                                                    const zones = form.service_zones || [];
                                                                    const newZones = zones.includes(zone) ? zones.filter(z => z !== zone) : [...zones, zone];
                                                                    setForm({ ...form, service_zones: newZones });
                                                                }}
                                                                className={`px-5 py-3 rounded-2xl font-black text-xs transition-all border ${form.service_zones?.includes(zone) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary hover:bg-primary/5'}`}
                                                            >
                                                                {zone}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] ml-1 block">Pièce d'identité (Scan/Photo)</label>
                                        <div className={`relative border-4 border-dashed rounded-[3rem] p-16 text-center space-y-6 transition-all group ${form.id_card_url ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 hover:border-primary/20 hover:bg-primary/5'}`}>
                                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={handleFileChange} disabled={uploading} />
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all shadow-xl ${form.id_card_url ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-400 group-hover:bg-primary group-hover:text-white shadow-slate-100'}`}>
                                                {uploading ? <Loader2 size={32} className="animate-spin" /> : form.id_card_url ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                            </div>
                                            <div className="space-y-2">
                                                {form.id_card_url ? (
                                                    <p className="font-black text-emerald-600 text-lg uppercase tracking-widest">Document prêt !</p>
                                                ) : (
                                                    <>
                                                        <p className="font-black text-gray-900 text-xl tracking-tight leading-tight">Téléversez votre pièce</p>
                                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest opacity-60">Format JPG, PNG ou PDF</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 pt-6">
                                        <button onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl font-black text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest text-[11px]">Retour</button>
                                        <button
                                            onClick={handleRegister}
                                            disabled={loading || uploading || !form.id_card_url || !form.service_zones?.length}
                                            className="flex-[3] h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                        >
                                            {loading ? <Loader2 size={24} className="animate-spin" /> : "Envoyer ma demande"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-10 space-y-10"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                                        <div className="relative w-40 h-40 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100">
                                            <CheckCircle2 size={80} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight">C'est parti !</h2>
                                        <p className="text-gray-500 font-bold text-xl max-w-sm mx-auto leading-relaxed">
                                            Votre demande est en cours d'examen. Notre équipe vous contactera sous <span className="text-primary">24h</span>.
                                        </p>
                                    </div>
                                    <button onClick={() => navigate("/")} className="w-full max-w-xs h-20 bg-slate-900 text-white hover:bg-black rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                                        Retour à l'accueil
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
}

