import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, ShieldCheck, FileText, ChevronRight, Upload, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { useAuth, useUser, SignIn, SignUp } from "../../lib/clerk-shim";
import { useProfile } from "../context/useProfile";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
    const [accountConfirmed, setAccountConfirmed] = useState(false);
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
        <div className="bg-slate-50 min-h-screen py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12">
                        <Truck size={40} />
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Devenir <span className="text-primary">Livreur.</span></h1>
                    <p className="text-gray-500 font-bold max-w-md mx-auto">Rejoignez la plus grande flotte de livraison au Bénin et boostez vos revenus.</p>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-gray-100 p-10 md:p-16 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && !isSignedIn && (
                             <motion.div
                                 key="auth"
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: 20 }}
                                 className="space-y-8"
                             >
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
                                            {authMode === 'signUp' ? 'Devenir Livreur' : 'Bon retour !'}
                                        </h2>
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                            {authMode === 'signUp' ? 'Étape 1 : Créez votre compte d\'accès' : 'Connectez-vous à votre espace livreur'}
                                        </p>
                                    </div>
                                    
                                    {authMode === 'signUp' ? <SignUp /> : <SignIn />}
                             </motion.div>
                        )}

                        {step === 1 && isSignedIn && !accountConfirmed && (
                            <motion.div
                                key="confirm-account"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8 py-6"
                            >
                                <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col items-center text-center space-y-6">
                                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl border border-primary/20">
                                        <img src={user?.imageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Bienvenue, {user?.fullName} !</h2>
                                        <p className="text-slate-500 font-bold text-sm max-w-xs mx-auto">Voulez-vous utiliser ce compte existant pour devenir livreur sur Vtout ?</p>
                                    </div>
                                    <div className="flex flex-col w-full gap-3 pt-4">
                                        <button 
                                            onClick={() => setAccountConfirmed(true)} 
                                            className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                                        >
                                            Oui, continuer avec ce compte
                                        </button>
                                        <button 
                                            onClick={() => signOut()} 
                                            className="text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest py-3"
                                        >
                                            Non, utiliser un autre compte
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && isSignedIn && accountConfirmed && (
                            <motion.div
                                key="terms"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-gray-900 border-l-4 border-primary pl-4 uppercase tracking-tighter">Conditions d'admission</h2>
                                        <button onClick={() => setAccountConfirmed(false)} className="text-[10px] font-black text-slate-400 uppercase hover:text-primary">Retour</button>
                                    </div>
                                    <div className="grid gap-4">
                                        {policies.length > 0 ? (
                                            policies.map((p, i) => (
                                                <div key={p.id} className="flex flex-col gap-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle2 size={18} />
                                                        </div>
                                                        <p className="font-black text-gray-900 text-sm">{p.title}</p>
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-500 leading-relaxed pl-11 whitespace-pre-wrap">
                                                        {p.content}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            [
                                                { icon: <CheckCircle2 className="text-emerald-500" />, text: "Avoir au moins 18 ans" },
                                                { icon: <CheckCircle2 className="text-emerald-500" />, text: "Posséder un moyen de déplacement propre (Moto, Voiture)" },
                                                { icon: <CheckCircle2 className="text-emerald-500" />, text: "Avoir un smartphone avec connexion internet" },
                                                { icon: <CheckCircle2 className="text-emerald-500" />, text: "Fournir une pièce d'identité valide (CIP, CNI ou Passeport)" },
                                                { icon: <CheckCircle2 className="text-emerald-500" />, text: "Être courtois et respectueux envers les clients" },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-gray-700">
                                                    {item.icon}
                                                    {item.text}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 pt-6">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary rounded-lg w-6 h-6 border-slate-300"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        />
                                        <span className="text-gray-600 font-bold group-hover:text-gray-900 font-sm">J'accepte les conditions de partenariat d'Vtout</span>
                                    </label>
                                    <button
                                        disabled={!acceptedTerms}
                                        onClick={() => setStep(2)}
                                        className="btn btn-primary h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 gap-3 uppercase tracking-widest"
                                    >
                                        Accepter et continuer <ChevronRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <h2 className="text-2xl font-black text-gray-900 border-l-4 border-primary pl-4">Vos Informations</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nom Complet</label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full h-14 rounded-2xl font-bold bg-slate-50 border-slate-100"
                                            value={form.fullname}
                                            onChange={e => setForm({ ...form, fullname: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Téléphone (WhatsApp de préference)</label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full h-14 rounded-2xl font-bold bg-slate-50 border-slate-100"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Type de véhicule</label>
                                        <select
                                            className="select select-bordered w-full h-14 rounded-2xl font-bold bg-slate-50 border-slate-100"
                                            value={form.vehicle_type}
                                            onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
                                        >
                                            <option value="moto">Moto (Zémidjan)</option>
                                            <option value="car">Voiture</option>
                                            <option value="bicycle">Vélo / À pied</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Modèle (Ex: Haojue 110)</label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full h-14 rounded-2xl font-bold bg-slate-50 border-slate-100"
                                            value={form.vehicle_model}
                                            onChange={e => setForm({ ...form, vehicle_model: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                                        Zones de service souhaitées
                                        <span className="ml-2 text-primary">({(form.service_zones || []).length} sélectionnée(s))</span>
                                    </label>

                                    {/* Search */}
                                    <div className="relative">
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher une commune..."
                                            value={zoneSearch}
                                            onChange={e => setZoneSearch(e.target.value)}
                                            className="input input-bordered w-full h-12 rounded-2xl font-bold bg-slate-50 border-slate-100 pl-10"
                                        />
                                    </div>

                                    {/* Communes grouped by dept */}
                                    <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
                                        {filteredDepts.map(dept => (
                                            <div key={dept.departement}>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <span className="inline-block w-4 h-px bg-slate-200"></span>
                                                    {dept.departement}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {dept.communes.map(zone => (
                                                        <button
                                                            key={zone}
                                                            type="button"
                                                            onClick={() => {
                                                                const zones = form.service_zones || [];
                                                                const newZones = zones.includes(zone)
                                                                    ? zones.filter(z => z !== zone)
                                                                    : [...zones, zone];
                                                                setForm({ ...form, service_zones: newZones });
                                                            }}
                                                            className={`px-3 py-2 rounded-xl font-bold text-xs transition-all border ${form.service_zones?.includes(zone)
                                                                    ? 'bg-primary/10 border-primary text-primary shadow-md shadow-primary/10'
                                                                    : 'bg-slate-50 border-slate-100 text-gray-400 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {zone}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredDepts.length === 0 && (
                                            <p className="text-slate-400 text-sm font-bold text-center py-3">Aucune commune trouvée.</p>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase italic">* Vous pourrez modifier ces zones plus tard depuis votre dashboard.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Pièce d'identité (Scan/Photo)</label>
                                    <div className={`relative border-4 border-dashed rounded-[2rem] p-12 text-center space-y-4 transition-all group ${form.id_card_url ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 hover:border-primary/20 hover:bg-slate-50'}`}>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            disabled={uploading}
                                        />
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors ${form.id_card_url ? 'bg-emerald-100 text-emerald-500' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                            {uploading ? <span className="loading loading-spinner text-primary"></span> : form.id_card_url ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                                        </div>
                                        <div>
                                            {form.id_card_url ? (
                                                <>
                                                    <p className="font-black text-emerald-600">Document reçu !</p>
                                                    <p className="text-[10px] text-emerald-400 font-bold uppercase truncate max-w-[200px] mx-auto">{form.id_card_url}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-black text-gray-900">Cliquez pour téléverser votre pièce</p>
                                                    <p className="text-sm text-gray-400 font-medium">Format JPG, PNG ou PDF (Max. 5Mo)</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button onClick={() => setStep(1)} className="btn btn-ghost h-14 rounded-2xl font-black px-8">Retour</button>
                                    <button
                                        onClick={handleRegister}
                                        disabled={loading || uploading || !form.id_card_url || !form.service_zones?.length}
                                        className="btn btn-primary flex-1 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                                    >
                                        {loading ? <span className="loading loading-spinner"></span> : "Finaliser l'inscription"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10 space-y-8"
                            >
                                <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 scale-110">
                                    <CheckCircle2 size={64} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">C'est parti !</h2>
                                    <p className="text-gray-500 font-bold max-w-sm mx-auto leading-relaxed">
                                        Votre demande est en cours d'examen par notre équipe. Vous recevrez un appel ou un mail sous 24h pour la validation finale.
                                    </p>
                                </div>
                                <button onClick={() => navigate("/")} className="btn bg-gray-900 text-white hover:bg-black h-14 rounded-2xl font-black px-12 mt-8">
                                    Retour à l'accueil
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
