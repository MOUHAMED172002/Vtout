import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../lib/AuthHooks";
import { 
    Settings, 
    Save, 
    Facebook, 
    Instagram, 
    Phone, 
    Mail, 
    Clock, 
    Truck, 
    Globe, 
    CheckCircle2, 
    Loader2, 
    Trash2,
    Plus,
    Layout,
    Star,
    Users,
    UserCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ConfigManager = () => {
    const { getToken } = useAuth();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Grouped configs
    const [groups, setGroups] = useState({});
    
    // Add modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [newConfig, setNewConfig] = useState({ key: '', value: '', group: 'general', description: '' });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/configs`, { withCredentials: true });
            const data = res.data;
            setConfigs(data);
            
            // Organize by group
            const uniqueData = data.filter((v, i, a) => a.findIndex(t => t.key === v.key) === i);
            
            // Ensure marketplace configs exist in the UI even if not in DB

            // Gestion des frais de livraison dynamiques
            if (!uniqueData.find(c => c.key === 'intra_department_fee')) {
                uniqueData.push({
                    key: 'intra_department_fee',
                    value: '500',
                    group: 'marketplace',
                    description: 'Supplément livraison (communes diff. même département)'
                });
            }
            if (!uniqueData.find(c => c.key === 'inter_department_fee')) {
                uniqueData.push({
                    key: 'inter_department_fee',
                    value: '1000',
                    group: 'marketplace',
                    description: 'Supplément livraison (départements différents)'
                });
            }
            if (!uniqueData.find(c => c.key === 'crossing_fees')) {
                uniqueData.push({
                    key: 'crossing_fees',
                    value: JSON.stringify({ "1-2": 1500, "1-3": 2000 }),
                    group: 'marketplace',
                    description: 'Matrice des tarifs par croisement de départements (JSON: {"id1-id2": prix})'
                });
            }

            if (!uniqueData.find(c => c.key === 'delivery_fee_tiers')) {
                uniqueData.push({
                    key: 'delivery_fee_tiers',
                    value: JSON.stringify([
                        { min: 0, max: 500, fee: 300 },
                        { min: 500, max: 2000, fee: 500 },
                        { min: 2000, max: 5000, fee: 700 },
                        { min: 5000, max: 15000, fee: 1000 },
                        { min: 15000, max: 1000000, fee: 1500 }
                    ]),
                    group: 'marketplace',
                    description: 'Grille des frais de livraison dynamiques (JSON: min, max, fee)'
                });
            }

            if (!uniqueData.find(c => c.key === 'hero_carousel')) {
                uniqueData.push({
                    key: 'hero_carousel',
                    value: JSON.stringify([
                        {
                            id: 1,
                            img: '/src/assets/hero/hero_shopping.png',
                            subtitle: 'VOTRE ACHAT EN TOUTE CONFIANCE',
                            title: "Le shopping en ligne",
                            title2: "pensé pour le Bénin",
                            description: "Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple, sécurisée et fiable.",
                            color: "from-emerald-500/20 to-teal-500/10",
                            textColor: "text-emerald-400"
                        }
                    ]),
                    group: 'hero',
                    description: 'Diapositives de la page d\'accueil (Hero)'
                });
            }

            if (!uniqueData.find(c => c.key === 'promotions_carousel')) {
                uniqueData.push({
                    key: 'promotions_carousel',
                    value: JSON.stringify([
                        {
                            id: 1,
                            badge: "Offres Spéciales",
                            title: "Les meilleures",
                            titleAccent: "offres du moment",
                            subtitle: "Profitez de réductions exceptionnelles proposées par nos vendeurs partout au Bénin.",
                            circleBadgeText: "Jusqu'à",
                            circleBadgeVal: "-50%",
                            img: "/src/assets/hero/promo_offers.png",
                            buttonText: "Voir les offres",
                            link: "/promotions/flash",
                            button2Text: "Toutes les catégories",
                            button2Link: "/categories"
                        },
                        {
                            id: 2,
                            badge: "Remises en Gros",
                            title: "Plus d'achats,",
                            titleAccent: "moins de frais",
                            subtitle: "Économisez automatiquement par paliers configurés directement par les grossistes.",
                            circleBadgeText: "Gros",
                            circleBadgeVal: "-20%",
                            img: "/src/assets/hero/promo_offers.png",
                            buttonText: "Voir le gros",
                            link: "/promotions/quantite",
                            button2Text: "Toutes les catégories",
                            button2Link: "/categories"
                        },
                        {
                            id: 3,
                            badge: "Packs Tout-en-un",
                            title: "Kits complets",
                            titleAccent: "à prix sacrifié",
                            subtitle: "Achetez des lots d'articles complémentaires en 1-clic avec des remises cumulées importantes.",
                            circleBadgeText: "Pack",
                            circleBadgeVal: "-30%",
                            img: "/src/assets/hero/promo_offers.png",
                            buttonText: "Découvrir",
                            link: "/promotions/kits",
                            button2Text: "Toutes les catégories",
                            button2Link: "/categories"
                        }
                    ]),
                    group: 'hero',
                    description: 'Bannières promotionnelles de la page d\'accueil'
                });
            }

            if (!uniqueData.find(c => c.key === 'about_team')) {
                uniqueData.push({
                    key: 'about_team',
                    value: JSON.stringify([
                        { name: "Amina Diallo", role: "Visionnaire & Fondatrice", avatar: "https://ui-avatars.com/api/?name=Amina+Diallo&background=f97316&color=fff" },
                        { name: "Karim Soglo", role: "Directeur de Collection", avatar: "https://ui-avatars.com/api/?name=Karim+Soglo&background=0f172a&color=fff" }
                    ]),
                    group: 'about',
                    description: 'Équipe de la page À Propos'
                });
            }

            if (!uniqueData.find(c => c.key === 'about_stats')) {
                uniqueData.push({
                    key: 'about_stats',
                    value: JSON.stringify([
                        { label: "Clients Heureux", value: "12k+" },
                        { label: "Articles Premium", value: "1.2k" }
                    ]),
                    group: 'about',
                    description: 'Statistiques de la page À Propos'
                });
            }

            if (!uniqueData.find(c => c.key === 'about_title')) {
                uniqueData.push({ key: 'about_title', value: 'Notre Histoire', group: 'about', description: 'Titre de la page À Propos' });
            }
            if (!uniqueData.find(c => c.key === 'about_tagline')) {
                uniqueData.push({ key: 'about_tagline', value: 'L\'excellence au service de votre style.', group: 'about', description: 'Accroche de la page À Propos' });
            }
            if (!uniqueData.find(c => c.key === 'about_mission')) {
                uniqueData.push({ key: 'about_mission', value: 'Notre mission est de démocratiser le luxe...', group: 'about', description: 'Mission de la page À Propos' });
            }

            const grouped = uniqueData.reduce((acc, curr) => {
                const g = curr.group || 'general';
                if (!acc[g]) acc[g] = [];
                acc[g].push(curr);
                return acc;
            }, {});
            setGroups(grouped);
        } catch (error) {
            toast.error("Erreur lors du chargement des configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, value, group, description) => {
        try {
            setSaving(true);
            await axios.post(`${API_URL}/configs/upsert`, {
                key, value, group, description
            }, { withCredentials: true });
            toast.success(`${key} mis à jour`);
            fetchConfigs();
        } catch (error) {
            toast.error("Erreur de mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const handleGenericUpload = async (file) => {
        const token = await getToken();
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await axios.post(`${API_URL}/upload/single`, formData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' 
            },
            withCredentials: true
        });
        return uploadRes.data.url;
    };

    const handleFileUpload = async (e, key, group, description) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSaving(true);
            const imageUrl = await handleGenericUpload(file);
            await handleUpdate(key, imageUrl, group, description);
            toast.success("Image mise à jour avec succès");
        } catch (error) {
            console.error(error);
            toast.error("Échec de l'upload du logo");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (group, key, newValue) => {
        setGroups(prev => ({
            ...prev,
            [group]: prev[group].map(cfg => cfg.key === key ? { ...cfg, value: newValue } : cfg)
        }));
    };

    const groupIcons = {
        hero: <Layout className="text-pink-500" />,
        marketplace: <Star className="text-yellow-500" />,
        branding: <Layout className="text-blue-500" />,
        social: <Globe className="text-purple-500" />,
        contact: <Phone className="text-emerald-500" />,
        hours: <Clock className="text-amber-500" />,
        features: <Truck className="text-rose-500" />,
        api: <Plus className="text-cyan-500" />,
        about: <Users className="text-indigo-500" />,
        general: <Settings className="text-slate-500" />
    };

    const groupLabels = {
        hero: "Bannière & Hero",
        marketplace: "Paramètres Marketplace",
        branding: "Identité visuelle",
        social: "Réseaux Sociaux",
        contact: "Coordonnées & Support",
        hours: "Horaires d'ouverture",
        features: "Fonctionnalités & Tarifs",
        api: "API & Services Externes",
        about: "Page À Propos (Équipe)",
        general: "Paramètres Généraux"
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Initialisation du panneau de contrôle...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration Royale</h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">Personnalisez votre boutique sans toucher au code</p>
                    </div>
                </div>
                <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Global Status: Online</div>
                </div>
            </header>

            {/* Config Groups */}
            <div className="grid grid-cols-1 gap-10">
                {Object.keys(groupLabels).map((groupKey) => (
                    groups[groupKey] && (
                        <section key={groupKey} className="space-y-6">
                            <div className="flex items-center gap-4 ml-6">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    {groupIcons[groupKey]}
                                </div>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">{groupLabels[groupKey]}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groups[groupKey].map((cfg) => (
                                    <motion.div 
                                        key={cfg.key}
                                        whileHover={{ y: -5 }}
                                        className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5 transition-all hover:shadow-xl hover:shadow-slate-200/50 ${cfg.key === 'about_team' || cfg.key === 'about_stats' || cfg.key === 'hero_carousel' || cfg.key === 'promotions_carousel' ? 'md:col-span-2' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                                {cfg.key}
                                            </div>
                                            {saving && <Loader2 size={14} className="animate-spin text-primary" />}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-600 ml-1 block">{cfg.description}</label>
                                            
                                            {cfg.key === 'hero_carousel' ? (
                                                <HeroManager 
                                                    value={cfg.value} 
                                                    onChange={(newValue) => handleChange(groupKey, cfg.key, newValue)} 
                                                    onSave={() => handleUpdate(cfg.key, cfg.value, cfg.group, cfg.description)}
                                                    uploadImage={handleGenericUpload}
                                                />
                                            ) : cfg.key === 'promotions_carousel' ? (
                                                <PromotionsManager 
                                                    value={cfg.value} 
                                                    onChange={(newValue) => handleChange(groupKey, cfg.key, newValue)} 
                                                    onSave={() => handleUpdate(cfg.key, cfg.value, cfg.group, cfg.description)}
                                                    uploadImage={handleGenericUpload}
                                                />
                                            ) : cfg.key === 'about_team' ? (
                                                <TeamManager 
                                                    value={cfg.value} 
                                                    onChange={(newValue) => handleChange(groupKey, cfg.key, newValue)} 
                                                    onSave={() => handleUpdate(cfg.key, cfg.value, cfg.group, cfg.description)}
                                                    uploadImage={handleGenericUpload}
                                                />
                                            ) : cfg.key === 'about_stats' ? (
                                                <StatsManager 
                                                    value={cfg.value} 
                                                    onChange={(newValue) => handleChange(groupKey, cfg.key, newValue)} 
                                                    onSave={() => handleUpdate(cfg.key, cfg.value, cfg.group, cfg.description)}
                                                />
                                            ) : cfg.key.toLowerCase().includes('logo') || cfg.key.toLowerCase().includes('image') || cfg.key.toLowerCase().includes('avatar') ? (
                                                <div className="space-y-4">
                                                    {cfg.value && (
                                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center">
                                                            <img src={cfg.value} alt="Preview" className="max-w-full max-h-full object-contain" />
                                                        </div>
                                                    )}
                                                    <label className="flex flex-col items-center justify-center w-full px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                                            <Plus size={16} />
                                                            {cfg.value ? 'Changer l\'image' : 'Choisir une image'}
                                                        </div>
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*"
                                                            onChange={(e) => handleFileUpload(e, cfg.key, cfg.group, cfg.description)}
                                                        />
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        value={cfg.value || ''}
                                                        onChange={(e) => handleChange(groupKey, cfg.key, e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 text-[10px] font-mono text-slate-400 border-none rounded-xl"
                                                        placeholder="URL manuelle (optionnel)"
                                                    />
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text"
                                                    value={cfg.value || ''}
                                                    onChange={(e) => handleChange(groupKey, cfg.key, e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner group-hover:bg-slate-100"
                                                    placeholder="Saisissez une valeur..."
                                                />
                                            )}
                                        </div>

                                        {cfg.key !== 'about_team' && cfg.key !== 'about_stats' && cfg.key !== 'hero_carousel' && (
                                            <button 
                                                onClick={() => handleUpdate(cfg.key, cfg.value, cfg.group, cfg.description)}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:border-primary/30 hover:text-primary hover:bg-primary/5 active:scale-95"
                                            >
                                                <Save size={14} /> Enregistrer
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )
                ))}
            </div>

            {/* Custom Config Add (Advanced) */}
            <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black tracking-tight italic">Envie d'ajouter un nouveau paramètre ?</h3>
                        <p className="text-slate-400 font-bold">Vous pouvez créer vos propres variables de configuration à la volée.</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-10 py-5 bg-primary text-white rounded-3xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Plus size={24} /> Créer une Variable
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative z-10 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nouvelle Variable</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><Trash2 size={20}/></button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate(newConfig.key, newConfig.value, newConfig.group, newConfig.description);
                                setShowAddModal(false);
                                setNewConfig({ key: '', value: '', group: 'general', description: '' });
                            }} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Clé (Unique, sans espace)</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="ex: commission_rate, site_title..."
                                        value={newConfig.key}
                                        onChange={e => setNewConfig({...newConfig, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Valeur</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Valeur initiale"
                                        value={newConfig.value}
                                        onChange={e => setNewConfig({...newConfig, value: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Groupe</label>
                                    <select 
                                        value={newConfig.group}
                                        onChange={e => setNewConfig({...newConfig, group: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none"
                                    >
                                        {Object.keys(groupLabels).map(k => <option key={k} value={k}>{groupLabels[k]}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description locale</label>
                                    <input 
                                        type="text" 
                                        placeholder="À quoi sert cette variable ?"
                                        value={newConfig.description}
                                        onChange={e => setNewConfig({...newConfig, description: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20"
                                    />
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                    {saving ? <Loader2 className="animate-spin mx-auto"/> : "Créer le paramètre"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Specialized Managers for About Page ---

const TeamManager = ({ value, onChange, onSave, uploadImage }) => {
    const items = value ? JSON.parse(value) : [];

    const addItem = () => {
        const newItems = [...items, { name: 'Nouveau Membre', role: 'Poste', avatar: 'https://ui-avatars.com/api/?name=New+Member' }];
        onChange(JSON.stringify(newItems));
    };

    const updateItem = (index, field, newVal) => {
        const newItems = [...items];
        newItems[index][field] = newVal;
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    const [uploadingObj, setUploadingObj] = useState(null);

    const handleFileChange = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingObj(index);
            const url = await uploadImage(file);
            updateItem(index, 'avatar', url);
        } catch (err) {
            toast.error("Erreur lors de l'upload de l'image");
        } finally {
            setUploadingObj(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((member, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 relative group">
                        <button onClick={() => removeItem(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={12} />
                        </button>
                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 bg-white relative border-2 border-white shadow-md">
                            {uploadingObj === i && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-primary" size={20}/></div>}
                            <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                                <Plus size={20} className="text-white"/>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, i)} />
                            </label>
                        </div>
                        <div className="text-center">
                            <label className="text-[9px] font-black text-primary uppercase cursor-pointer hover:underline">
                                Changer photo
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, i)} />
                            </label>
                        </div>
                        <input 
                            value={member.name} 
                            onChange={e => updateItem(i, 'name', e.target.value)}
                            placeholder="Nom"
                            className="w-full bg-transparent text-xs font-black text-center focus:outline-none"
                        />
                        <input 
                            value={member.role} 
                            onChange={e => updateItem(i, 'role', e.target.value)}
                            placeholder="Rôle"
                            className="w-full bg-transparent text-[10px] text-slate-400 font-bold text-center focus:outline-none"
                        />
                        <input 
                            value={member.avatar} 
                            onChange={e => updateItem(i, 'avatar', e.target.value)}
                            placeholder="URL Avatar manuelle"
                            className="w-full bg-white/50 p-1 rounded text-[8px] font-mono focus:outline-none"
                        />
                    </div>
                ))}
                <button 
                    onClick={addItem}
                    className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-all text-slate-400 hover:text-primary min-h-[160px]"
                >
                    <Plus size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">Ajouter</span>
                </button>
            </div>
            <button 
                onClick={onSave}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
                Enregistrer l'équipe
            </button>
        </div>
    );
};

const StatsManager = ({ value, onChange, onSave }) => {
    const items = value ? JSON.parse(value) : [];

    const addItem = () => {
        const newItems = [...items, { label: 'Titre Stat', value: '100+' }];
        onChange(JSON.stringify(newItems));
    };

    const updateItem = (index, field, newVal) => {
        const newItems = [...items];
        newItems[index][field] = newVal;
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((stat, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                        <button onClick={() => removeItem(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={12} />
                        </button>
                        <div className="flex-1 space-y-2">
                            <input 
                                value={stat.value} 
                                onChange={e => updateItem(i, 'value', e.target.value)}
                                placeholder="Valeur (ex: 12k+)"
                                className="w-full bg-transparent font-black text-slate-900 focus:outline-none"
                            />
                            <input 
                                value={stat.label} 
                                onChange={e => updateItem(i, 'label', e.target.value)}
                                placeholder="Libellé"
                                className="w-full bg-transparent text-[10px] font-black uppercase text-slate-400 tracking-widest focus:outline-none"
                            />
                        </div>
                    </div>
                ))}
                <button 
                    onClick={addItem}
                    className="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-4 hover:bg-slate-50 transition-all text-slate-400 hover:text-primary min-h-[80px]"
                >
                    <Plus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest ml-2">Ajouter</span>
                </button>
            </div>
            <button 
                onClick={onSave}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
            >
                Enregistrer les stats
            </button>
        </div>
    );
};

const HeroManager = ({ value, onChange, onSave, uploadImage }) => {
    const items = value ? JSON.parse(value) : [];
    const [uploadingObj, setUploadingObj] = useState(null);

    const addItem = () => {
        const newItems = [...items, { 
            id: Date.now(), 
            img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500', 
            subtitle: 'Sous-titre', 
            title: 'Titre Principal', 
            title2: 'Texte Secondaire', 
            color: 'from-blue-500/20 to-indigo-500/10', 
            textColor: 'text-blue-600' 
        }];
        onChange(JSON.stringify(newItems));
    };

    const updateItem = (index, field, newVal) => {
        const newItems = [...items];
        newItems[index][field] = newVal;
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    const handleFileChange = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingObj(index);
            const url = await uploadImage(file);
            updateItem(index, 'img', url);
        } catch (err) {
            toast.error("Erreur lors de l'upload de l'image");
        } finally {
            setUploadingObj(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((slide, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 relative group">
                        <button onClick={() => removeItem(i)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Trash2 size={14} />
                        </button>
                        
                        <div className="h-40 rounded-2xl overflow-hidden mx-auto bg-white relative flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-primary/30 transition-colors">
                            {uploadingObj === i && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20"><Loader2 className="animate-spin text-primary" size={24}/></div>}
                            <img src={slide.img} alt="Slide Preview" className="w-full h-full object-contain p-2" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                                <span className="bg-white/20 px-4 py-2 rounded-xl text-white text-[10px] font-black backdrop-blur-md flex items-center gap-2 border border-white/20">
                                    <Plus size={16}/> Remplacer l'image
                                </span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, i)} />
                            </label>
                        </div>
                        <div className="text-center">
                            <label className="text-[10px] font-black text-pink-500 uppercase cursor-pointer hover:underline flex items-center justify-center gap-2">
                                <Layout size={12}/> Modifier l'image du slide
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, i)} />
                            </label>
                        </div>
                        
                        <div className="space-y-2">
                            <input 
                                value={slide.subtitle} 
                                onChange={e => updateItem(i, 'subtitle', e.target.value)}
                                placeholder="Sous-titre (ex: Nouveauté)"
                                className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <input 
                                value={slide.title} 
                                onChange={e => updateItem(i, 'title', e.target.value)}
                                placeholder="Titre Principal"
                                className="w-full bg-white px-3 py-2 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <input 
                                value={slide.title2} 
                                onChange={e => updateItem(i, 'title2', e.target.value)}
                                placeholder="Texte Secondaire"
                                className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                value={slide.color} 
                                onChange={e => updateItem(i, 'color', e.target.value)}
                                placeholder="Couleur BG (from-X to-Y)"
                                className="w-full bg-slate-200/50 px-2 py-1 rounded text-[9px] font-mono focus:outline-none"
                            />
                            <input 
                                value={slide.textColor} 
                                onChange={e => updateItem(i, 'textColor', e.target.value)}
                                placeholder="Couleur Texte (text-X)"
                                className="w-full bg-slate-200/50 px-2 py-1 rounded text-[9px] font-mono focus:outline-none"
                            />
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={addItem}
                    className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 hover:bg-slate-50 transition-all text-slate-400 hover:text-primary min-h-[350px] group"
                >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                        <Plus size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Ajouter un Slide</span>
                </button>
            </div>
            
            <button 
                onClick={onSave}
                className="w-full py-4 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-200 hover:bg-pink-700 hover:-translate-y-1 transition-all"
            >
                Enregistrer le Carousel Hero
            </button>
        </div>
    );
};

const PromotionsManager = ({ value, onChange, onSave, uploadImage }) => {
    const items = value ? JSON.parse(value) : [];
    const [uploadingObj, setUploadingObj] = useState(null);

    const addItem = () => {
        const newItems = [...items, { 
            id: Date.now(), 
            badge: 'Nouvelle Promotion', 
            title: 'Titre Promo', 
            titleAccent: 'Accent', 
            subtitle: 'Description de la promotion', 
            circleBadgeText: "Jusqu'à",
            circleBadgeVal: '-30%',
            img: '/src/assets/hero/promo_offers.png',
            buttonText: 'Découvrir',
            link: '/promotions/flash',
            button2Text: 'Toutes les catégories',
            button2Link: '/categories'
        }];
        onChange(JSON.stringify(newItems));
    };

    const updateItem = (index, field, newVal) => {
        const newItems = [...items];
        newItems[index][field] = newVal;
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(JSON.stringify(newItems));
    };

    const handleFileChange = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploadingObj(index);
            const url = await uploadImage(file);
            updateItem(index, 'img', url);
        } catch (err) {
            toast.error("Erreur lors de l'upload de l'image");
        } finally {
            setUploadingObj(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((slide, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 relative group">
                        <button onClick={() => removeItem(i)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Trash2 size={14} />
                        </button>
                        
                        <div className="h-40 rounded-2xl overflow-hidden mx-auto bg-white relative flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-primary/30 transition-colors">
                            {uploadingObj === i && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20"><Loader2 className="animate-spin text-primary" size={24}/></div>}
                            <img src={slide.img} alt="Promo Preview" className="w-full h-full object-contain p-2" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                                <span className="bg-white/20 px-4 py-2 rounded-xl text-white text-[10px] font-black backdrop-blur-md flex items-center gap-2 border border-white/20">
                                    <Plus size={16}/> Remplacer l'image
                                </span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, i)} />
                            </label>
                        </div>
                        
                        <div className="space-y-2">
                            <input 
                                value={slide.badge} 
                                onChange={e => updateItem(i, 'badge', e.target.value)}
                                placeholder="Badge (ex: Vente Flash)"
                                className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    value={slide.title} 
                                    onChange={e => updateItem(i, 'title', e.target.value)}
                                    placeholder="Titre de début"
                                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <input 
                                    value={slide.titleAccent} 
                                    onChange={e => updateItem(i, 'titleAccent', e.target.value)}
                                    placeholder="Titre accentué"
                                    className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <textarea 
                                value={slide.subtitle} 
                                onChange={e => updateItem(i, 'subtitle', e.target.value)}
                                placeholder="Description"
                                className="w-full bg-white px-3 py-2 rounded-xl text-xs font-bold text-slate-500 focus:ring-2 focus:ring-primary/20 outline-none h-16 resize-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    value={slide.circleBadgeText} 
                                    onChange={e => updateItem(i, 'circleBadgeText', e.target.value)}
                                    placeholder="Texte Rond (Jusqu'à)"
                                    className="w-full bg-white px-2 py-1 rounded text-[10px] font-bold focus:outline-none"
                                />
                                <input 
                                    value={slide.circleBadgeVal} 
                                    onChange={e => updateItem(i, 'circleBadgeVal', e.target.value)}
                                    placeholder="Valeur Rond (-50%)"
                                    className="w-full bg-white px-2 py-1 rounded text-[10px] font-bold focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    value={slide.buttonText} 
                                    onChange={e => updateItem(i, 'buttonText', e.target.value)}
                                    placeholder="Texte Bouton 1"
                                    className="w-full bg-slate-200/50 px-2 py-1 rounded text-[9px] font-bold focus:outline-none"
                                />
                                <input 
                                    value={slide.link} 
                                    onChange={e => updateItem(i, 'link', e.target.value)}
                                    placeholder="Lien Bouton 1"
                                    className="w-full bg-slate-200/50 px-2 py-1 rounded text-[9px] font-mono focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={addItem}
                    className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 hover:bg-slate-50 transition-all text-slate-400 hover:text-primary min-h-[350px] group"
                >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                        <Plus size={24} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Ajouter une Promo</span>
                </button>
            </div>
            
            <button 
                onClick={onSave}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all"
            >
                Enregistrer les Promotions
            </button>
        </div>
    );
};

export default ConfigManager;

