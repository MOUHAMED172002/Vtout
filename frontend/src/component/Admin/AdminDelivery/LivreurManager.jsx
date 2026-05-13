import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getLivreursList, verifyLivreur, deleteLivreur } from "../../../services/deliveryService";
import toast from "react-hot-toast";
import { Truck, ShieldCheck, Mail, Phone, User, Check, X, ExternalLink, Search, Filter, AlertCircle, Clock, FileText, Trash2 } from "lucide-react";

export default function LivreurManager({ globalSearchQuery = "" }) {
    const { getToken } = useAuth();
    const [livreurs, setLivreurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all"); //   En attente, verified, all
    const [search, setSearch] = useState("");
    const [zoneFilter, setZoneFilter] = useState("");

    useEffect(() => {
        fetchLivreurs();
    }, []);

    const fetchLivreurs = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getLivreursList(token);
            setLivreurs(data);
        } catch (err) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            const token = await getToken();
            await verifyLivreur(token, id, status);
            toast.success(status ? "Livreur validÃ© et rÃ´le mis Ã  jour !" : "Statut mis Ã  jour");
            fetchLivreurs();
        } catch (err) {
            toast.error("Erreur de modification");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce dossier de livreur ? Cette action est irrÃ©versible.")) return;
        try {
            const token = await getToken();
            await deleteLivreur(token, id);
            toast.success("Dossier supprimÃ©");
            fetchLivreurs();
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const filteredLivreurs = livreurs.filter(l => { const query = (search || globalSearchQuery).toLowerCase();
        const matchesSearch = (l.profile?.fullname || "").toLowerCase().includes(search.toLowerCase()) ||
            (l.profile?.email || "").toLowerCase().includes(search.toLowerCase());

        // Robust zones parsing
        let zones = [];
        try {
            if (Array.isArray(l.service_zones)) {
                zones = l.service_zones;
            } else if (typeof l.service_zones === 'string') {
                const parsed = JSON.parse(l.service_zones);
                zones = Array.isArray(parsed) ? parsed : [parsed];
            }
        } catch (e) { 
            zones = l.service_zones ? [l.service_zones] : []; 
        }
        
        // Final normalization: if we have a string that looks like JSON inside an array
        if (zones.length === 1 && typeof zones[0] === 'string' && (zones[0].startsWith('[') || zones[0].startsWith('{'))) {
            try {
                const inner = JSON.parse(zones[0]);
                if (Array.isArray(inner)) zones = inner;
            } catch(e) {}
        }

        const matchesZone = !zoneFilter || zones.some(z => String(z).toLowerCase().includes(zoneFilter.toLowerCase()));
        const isOnline = l.status !== 'hors_ligne';

        if (filter === "  En attente") return !l.is_verified && matchesSearch && matchesZone;
        if (filter === "verified") return l.is_verified && matchesSearch && matchesZone;
        if (filter === "available") return l.is_verified && isOnline && matchesSearch && matchesZone;

        return matchesSearch && matchesZone;
    });

    const stats = {
        'En attente': livreurs.filter(l => !l.is_verified).length,
        verified: livreurs.filter(l => l.is_verified).length,
        total: livreurs.length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header section identical to other admin pages */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
                        <Truck size={14} /> Logistique
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Gestion des <span className="text-slate-400">Livreurs</span></h1>
                    <p className="text-slate-500 font-bold max-w-lg">VÃ©rifiez les nouveaux inscrits et gÃ©rez votre flotte de livraison.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm min-w-[250px]">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Nom/Email..."
                            className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm min-w-[250px]">
                        <Truck size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filtrer par Zone (ex: Cotonou)..."
                            className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-full"
                            value={zoneFilter}
                            onChange={(e) => setZoneFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats & Tabs */}
            <div className="flex flex-wrap items-center gap-4">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${filter === "all" ? 'bg-slate-900 text-white shadow-lg shadow-slate-300' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    Tous ({stats.total})
                </button>
                <button
                    onClick={() => setFilter("  En attente")}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${filter === "  En attente" ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <Clock size={16} /> Candidatures ({stats['En attente']})
                </button>
                <button
                    onClick={() => setFilter("available")}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${filter === "available" ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div> En Ligne
                </button>
                <button
                    onClick={() => setFilter("verified")}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${filter === "verified" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <ShieldCheck size={16} /> ApprouvÃ©s ({stats.verified})
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-10">IdentitÃ©</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">VÃ©hicule</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Zone / Statut</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6">Documents</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-right pr-10">Actions de validation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></td></tr>
                            ) : filteredLivreurs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-32 space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                            <AlertCircle size={40} />
                                        </div>
                                        <p className="font-black text-slate-300 uppercase tracking-widest text-sm italic py-20">Aucun dossier dans cette catÃ©gorie</p>
                                    </td>
                                </tr>
                            ) : filteredLivreurs.map((l) => (
                                <tr key={l.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                    <td className="py-8 pl-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner overflow-hidden">
                                                {l.profile?.avatar_url ? <img src={l.profile.avatar_url} className="w-full h-full object-cover" /> : <User size={28} />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 text-lg leading-tight">{l.profile?.fullname || "Candidat Anonyme"}</p>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                        <Mail size={12} className="text-primary/40" /> {l.profile?.email || 'Pas d\'email'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                        <Phone size={12} className="text-primary/40" /> {l.profile?.phone || 'Pas de numÃ©ro'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block min-w-[180px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Truck size={14} className="text-slate-400" />
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                                    {l.vehicle_type === 'moto' ? 'Moto / ZÃ©m' : l.vehicle_type === 'car' ? 'Voiture / Van' : 'VÃ©lo'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 uppercase">{l.vehicle_model || "ModÃ¨le inconnu"}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{l.license_plate || "SANS PLAQUE"}</p>
                                        </div>
                                    </td>
                                    <td className="py-8">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                                {(() => {
                                                    let zones = [];
                                                    try {
                                                        const raw = l.service_zones;
                                                        if (Array.isArray(raw)) {
                                                            zones = raw;
                                                        } else if (typeof raw === 'string') {
                                                            const parsed = JSON.parse(raw);
                                                            zones = Array.isArray(parsed) ? parsed : [parsed];
                                                        }
                                                        
                                                        // Deep parse if nested strings
                                                        zones = zones.flatMap(z => {
                                                            if (typeof z === 'string' && (z.startsWith('[') || z.startsWith('{'))) {
                                                                try { return JSON.parse(z); } catch(e) { return z; }
                                                            }
                                                            return z;
                                                        });
                                                    } catch (e) { 
                                                        zones = Array.isArray(l.service_zones) ? l.service_zones : []; 
                                                    }

                                                    // Filter out empty or non-string values and remove duplicates
                                                    const cleanZones = [...new Set(zones.filter(z => typeof z === 'string' && z.length > 1))];

                                                    if (cleanZones.length === 0) return <span className="text-[10px] font-bold text-slate-300 italic">Aucune zone spÃ©cifiÃ©e</span>;

                                                    return cleanZones.map((zone, zIdx) => (
                                                        <span key={`${l.id}-${zone}-${zIdx}`} className="px-3 py-1 bg-indigo-50 text-[9px] font-black text-indigo-600 rounded-full uppercase tracking-tighter border border-indigo-100 shadow-sm">
                                                            {zone}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${l.status === 'hors_ligne' ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {l.status === 'hors_ligne' ? 'Hors Ligne' : l.status === 'disponible' ? 'En ligne / Disponible' : 'En mission'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8">
                                        {l.id_card_url ? (
                                            <div className="space-y-3">
                                                <a
                                                    href={l.id_card_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 px-5 py-3 rounded-xl w-fit transition-colors border border-primary/10"
                                                >
                                                    <FileText size={16} /> PIÃˆCE D'IDENTITÃ‰ <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] font-black text-rose-300 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">DOCUMENT MANQUANT</span>
                                        )}
                                    </td>
                                    <td className="py-8 text-right pr-10">
                                        <div className="flex justify-end gap-3">
                                            {!l.is_verified ? (
                                                <>
                                                    <button
                                                        onClick={() => handleVerify(l.id, true)}
                                                        className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                                    >
                                                        <Check size={16} /> Approuver
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(l.id)}
                                                        className="flex items-center gap-2 bg-rose-50 text-rose-500 border border-rose-100 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white active:scale-95 transition-all"
                                                        title="Rejeter et supprimer la demande"
                                                    >
                                                        <Trash2 size={16} /> Rejeter
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleVerify(l.id, false)}
                                                    className="flex items-center gap-2 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all group"
                                                >
                                                    <X size={16} className="group-hover:rotate-90 transition-transform" /> RÃ©voquer l'accÃ¨s
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

