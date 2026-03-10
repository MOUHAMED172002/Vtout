import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getAllOrders } from "../../../services/orderService";
import { getLivreursList, adminAssignOrder } from "../../../services/deliveryService";
import { Truck, MapPin, Phone, Package, ChevronDown, ChevronUp, Search, RefreshCcw, UserPlus, Store, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OrderStatusBadge from "./OrderStatusBadge";
import { getSuggestedSuppliers, assignSupplier } from "../../../services/orderService";
import toast from "react-hot-toast";

export default function DeliveryManager() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [livreurs, setLivreurs] = useState([]);
  const [suggestedSuppliers, setSuggestedSuppliers] = useState({});
  const [assigning, setAssigning] = useState(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [ordersData, livreursData] = await Promise.all([
        getAllOrders(token),
        getLivreursList(token)
      ]);
      setOrders(ordersData || []);
      setLivreurs(livreursData || []);
    } catch (err) {
      console.error(err);
      toast.error("Échec du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (orderId, deliveryPersonId) => {
    if (!deliveryPersonId) return;
    setAssigning(orderId);
    try {
      const token = await getToken();
      await adminAssignOrder(token, orderId, deliveryPersonId);
      toast.success("Livreur assigné !");
      fetchData();
    } catch (err) {
      toast.error("Erreur d'assignation");
    } finally {
      setAssigning(null);
    }
  };

  const fetchSuggestions = async (orderId) => {
    if (loadingSuppliers[orderId] || suggestedSuppliers[orderId]) return;
    setLoadingSuppliers(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = await getToken();
      const data = await getSuggestedSuppliers(orderId, token);
      setSuggestedSuppliers(prev => ({ ...prev, [orderId]: data }));
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setLoadingSuppliers(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleAssignSupplier = async (orderId, supplierId) => {
    try {
      const token = await getToken();
      await assignSupplier(orderId, supplierId, token);
      toast.success("Fournisseur assigné !");
      fetchData();
    } catch (err) {
      toast.error("Erreur assignation fournisseur");
    }
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.address?.phone || "").includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
            <Truck size={14} /> Logistique
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Gestion des <span className="text-slate-400">Livraisons</span></h1>
          <p className="text-slate-500 font-bold max-w-lg">Supervisez les tournées, coordonnez les livreurs et assurez la satisfaction client.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Réf ou téléphone..."
              className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Préparation de la liste...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((o) => (
            <div
              key={o.id}
              className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${expandedId === o.id ? 'border-primary ring-4 ring-primary/5 shadow-2xl' : 'border-slate-50 hover:border-slate-200 shadow-sm'}`}
            >
              <div
                className="p-8 flex flex-wrap items-center justify-between gap-6 cursor-pointer"
                onClick={() => {
                  const newExpanded = expandedId === o.id ? null : o.id;
                  setExpandedId(newExpanded);
                  if (newExpanded) fetchSuggestions(o.id);
                }}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${expandedId === o.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <h3 className="text-lg font-black text-slate-900">{o.address?.address_line || "Adresse non fournie"}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Téléphone</p>
                    <div className="flex items-center gap-2 font-black text-slate-700">
                      <Phone size={14} className="text-primary" /> {o.address?.phone || "—"}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>
                  <div className="text-center sm:text-right pr-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Statut</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    {expandedId === o.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === o.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-50 bg-slate-50/30"
                  >
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                          <MapPin size={14} /> Destination détaillée
                        </h4>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2">
                          <p className="font-bold text-slate-600">{o.address?.address_line}</p>
                          <p className="text-sm text-slate-400">{o.address?.quartier_label}, {o.address?.commune_label}</p>
                          <p className="text-sm text-slate-400">{o.address?.departement_label}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                          <Package size={14} /> Colis ({o.items?.length || 0})
                        </h4>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                          {o.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="font-bold text-slate-600 truncate mr-4">{it.product?.name}</span>
                              <span className="font-black text-primary bg-primary/5 px-2 py-1 rounded-lg text-[10px] flex-shrink-0">×{it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                          <Truck size={14} /> Infos Paiement
                        </h4>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Méthode</span>
                            <span className="font-bold uppercase tracking-tight">{o.payment_method === 'delivery' ? 'À la livraison' : 'En ligne'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total</span>
                            <span className="font-black text-slate-900">{Number(o.total_amount).toLocaleString()} F</span>
                          </div>
                          {o.payment_method === 'delivery' && (
                            <div className="flex justify-between pt-3 border-t border-slate-50 mt-3 top-line">
                              <span className="text-slate-400">Statut Caisse</span>
                              <span className={`font-black text-[10px] uppercase tracking-widest px-2 py-1 rounded-lg ${o.payment_status === 'payé' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                {o.payment_status === 'payé' ? 'ENCAISSÉ' : 'NON REMIS'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Supplier & Assignment Section */}
                      <div className="lg:col-span-3 space-y-12 pt-10 border-t border-slate-100">
                        {/* 1. Supplier Selection (The "Proximity" request) */}
                        <div className="space-y-6">
                          <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-primary">
                            <Store size={14} /> Fournisseur (Proximité suggérée)
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loadingSuppliers[o.id] ? (
                              <div className="col-span-full py-4 text-center text-xs font-bold text-slate-400">Recherche des meilleurs partenaires...</div>
                            ) : suggestedSuppliers[o.id]?.map((s, idx) => (
                              <div
                                key={s.id}
                                onClick={() => handleAssignSupplier(o.id, s.id)}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${o.supplier_id === s.id ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${o.supplier_id === s.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    <Store size={18} />
                                  </div>
                                  <div>
                                    <p className="font-black text-sm text-slate-900 line-clamp-1">{s.name}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">{s.quartier_name || 'Quartier Proche'}</span>
                                      {idx === 0 && <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black">LE PLUS PROCHE</span>}
                                    </div>
                                  </div>
                                </div>
                                {o.supplier_id === s.id && <CheckCircle size={18} className="text-primary" />}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Delivery Person Assignment */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
                          <div className="space-y-1 relative z-10">
                            <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-indigo-400">
                              <UserPlus size={14} /> Assignation Livreur
                            </h4>
                            <p className="text-sm text-white/60 font-medium">
                              {o.delivery_person_id
                                ? "Opérationnel : " + (livreurs.find(l => l.id === o.delivery_person_id)?.profile?.fullname || "Livreur assigné")
                                : "En attente d'un livreur disponible dans cette zone."}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                            <div className="relative flex-1 md:w-72">
                              <select
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-sm focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer outline-none backdrop-blur-md"
                                defaultValue={o.delivery_person_id || ""}
                                onChange={(e) => handleAssign(o.id, e.target.value)}
                                disabled={assigning === o.id}
                              >
                                <option value="" className="text-slate-900 font-bold">Choisir un livreur...</option>
                                {Array.isArray(livreurs) && livreurs.map(l => (
                                  <option key={l.id} value={l.id} className="text-slate-900 font-bold">
                                    {l.profile?.fullname} • {l.vehicle_type}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                            </div>
                            {assigning === o.id && <span className="loading loading-spinner loading-sm text-primary" />}
                          </div>

                          {/* Design blur */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16 rounded-full text-white"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
            <p className="font-black text-slate-400 uppercase tracking-widest">Aucune livraison correspondante</p>
          </div>
        )}
      </div>
    </div>
  );
}
