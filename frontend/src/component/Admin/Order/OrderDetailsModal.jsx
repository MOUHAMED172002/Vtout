import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getOrderById, updateOrderStatus as updateOrder, getSuggestedSuppliers, assignSupplier } from "../../../services/orderService";
import { getLivreursList, adminAssignOrder } from "../../../services/deliveryService";
import OrderStatusBadge from "../Order/OrderStatusBadge";
import InvoiceButton from "../Order/InvoiceButton";
import { X, MapPin, Clock, Package, CreditCard, User, Calendar, Truck, CheckCircle2, AlertCircle, Store, UserCheck, ChevronDown, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function OrderDetailsModal({ order: initialOrder, isOpen, onClose, onUpdated = () => { } }) {
  const { getToken } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestedSuppliers, setSuggestedSuppliers] = useState([]);
  const [availableLivreurs, setAvailableLivreurs] = useState([]);
  const [assigningSupplier, setAssigningSupplier] = useState(false);
  const [assigningLivreur, setAssigningLivreur] = useState(false);

  useEffect(() => {
    if (initialOrder && isOpen) fetchDetails();
  }, [initialOrder, isOpen]);

  async function fetchDetails() {
    try {
      const token = await getToken();
      const data = await getOrderById(initialOrder.id, token);
      setOrderDetails(data);

      // Load suggestions if not already assigned
      if (!data.supplier_id) {
        const suppliers = await getSuggestedSuppliers(initialOrder.id, token);
        setSuggestedSuppliers(suppliers);
      }
      if (!data.delivery_person_id) {
        const livreurs = await getLivreursList(token);
        setAvailableLivreurs(livreurs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement des détails");
    }
    setLoading(false);
  }

  async function handleAssignSupplier(sid) {
    setAssigningSupplier(true);
    try {
      const token = await getToken();
      await assignSupplier(initialOrder.id, sid, token);
      toast.success("Fournisseur assigné");
      fetchDetails();
    } catch (err) {
      toast.error("Erreur d'assignation");
    } finally {
      setAssigningSupplier(false);
    }
  }

  async function handleAssignLivreur(lid) {
    setAssigningLivreur(true);
    try {
      const token = await getToken();
      await adminAssignOrder(token, initialOrder.id, lid);
      toast.success("Livreur assigné");
      fetchDetails();
    } catch (err) {
      toast.error("Erreur d'assignation");
    } finally {
      setAssigningLivreur(false);
    }
  }

  async function updateStatus(newStatus) {
    if (!confirm(`Passer la commande au statut "${newStatus}" ?`)) return;
    try {
      const token = await getToken();
      await updateOrder(initialOrder.id, { status: newStatus }, token);
      toast.success("Statut mis à jour");
      onUpdated();
      fetchDetails();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  async function markAsPaid() {
    if (!confirm("Confirmez-vous avoir reçu l'argent en espèces pour cette commande ?")) return;
    try {
      const token = await getToken();
      await updateOrder(initialOrder.id, { payment_status: 'payé' }, token);
      toast.success("Paiement validé !");
      onUpdated();
      fetchDetails();
    } catch (err) {
      toast.error("Erreur lors de la validation du paiement");
    }
  }

  const order = orderDetails || initialOrder || {};

  // --- Intelligenly sort Livreurs ---
  const sortedLivreurs = useMemo(() => {
    if (!availableLivreurs) return [];
    
    // We prioritize the supplier's location for pickup efficiency
    const pickupCommune = order?.supplier?.commune_label || order?.supplier?.commune;
    
    const safeLivreurs = Array.isArray(availableLivreurs) ? availableLivreurs : [];
    return [...safeLivreurs]
      .map(l => {
        let score = 0;
        
        let parsedZones = [];
        if (typeof l.service_zones === 'string') {
           try { parsedZones = JSON.parse(l.service_zones); } catch(e) {}
        } else if (Array.isArray(l.service_zones)) {
           parsedZones = l.service_zones;
        }

        const zones = parsedZones.map(z => z.toLowerCase());
        
        if (pickupCommune && zones.includes(pickupCommune.toLowerCase())) {
          score += 100;
        }

        // Potential for grouping: if livreur already has an order for this user (simulated check or add a small indicator)
        // For simplicity, we can't search all orders here without extra API, so we'll focus on the Pickup Proximity
        
        return { ...l, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [availableLivreurs, order?.supplier]);

  if (!isOpen || !initialOrder) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
              <Package size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Commande #{order.id?.slice(0, 8).toUpperCase() || "..."}</h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Calendar size={12} />
                {(() => {
                  const d = new Date(order.created_at || order.createdAt);
                  return isNaN(d) ? "Date inconnue" : `Passée le ${d.toLocaleDateString()} à ${d.toLocaleTimeString()}`;
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InvoiceButton order={order} />
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement des données...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Details & Items */}
              <div className="lg:col-span-2 space-y-8">
                {/* Articles List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3">
                    <Package size={14} /> Contenu du colis
                  </h4>
                  <div className="space-y-6">
                    {(order.items || []).map((it) => (
                      <div key={it.id} className="flex items-center gap-6 group">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 group-hover:border-primary transition-colors">
                          {it.product?.image_url || it.product?.images?.[0]?.image_url ? (
                            <img src={it.product.image_url || it.product.images[0].image_url} alt={it.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={32} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-slate-900 truncate leading-tight mb-1">{it.product?.name || `Produit #${it.product_id}`}</h5>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {it.variant?.name || "Taille Unique"} · {it.quantity} unité{it.quantity > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 leading-none mb-1">{(it.price * it.quantity).toLocaleString()} F</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{it.price.toLocaleString()} F / u</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-dashed border-slate-100 flex items-center justify-between gap-8 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Nombre de colis à récupérer</span>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={async () => {
                            const newCount = Math.max(1, (order.colis_count || 1) - 1);
                            const token = await getToken();
                            await updateOrder(order.id, { colis_count: newCount }, token);
                            fetchDetails();
                          }}
                          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                        > - </button>
                        <span className="text-xl font-black">{order.colis_count || 1}</span>
                        <button 
                          onClick={async () => {
                            const newCount = (order.colis_count || 1) + 1;
                            const token = await getToken();
                            await updateOrder(order.id, { colis_count: newCount }, token);
                            fetchDetails();
                          }}
                          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                        > + </button>
                      </div>
                    </div>
                    <div className="text-right space-y-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Somme Articles</span>
                        <span className="font-bold text-slate-900">{(Number(order.total_amount) + Number(order.discount_amount || 0) - Number(order.delivery_fee || 0)).toLocaleString()} F</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex flex-col items-end text-emerald-500">
                          <span className="text-[10px] font-black uppercase tracking-widest">Réduction {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                          <span className="font-bold">-{Number(order.discount_amount).toLocaleString()} F</span>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Total à payer</span>
                        <span className="text-3xl font-black text-primary tracking-tighter">{(order.total_amount || 0).toLocaleString()} F</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3">
                    <AlertCircle size={14} /> Action Rapide
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => updateStatus("en_attente")} className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-amber-100 bg-amber-50/50 text-amber-600 hover:bg-amber-100 transition-all group">
                      <Clock size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Attente</span>
                    </button>
                    <button onClick={() => updateStatus("confirmee")} className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-100 transition-all group">
                      <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Confirmer</span>
                    </button>
                    <button onClick={() => updateStatus("livree")} className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-emerald-100 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 transition-all group">
                      <Truck size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Livré</span>
                    </button>
                    <button onClick={() => updateStatus("annulee")} className="flex flex-col items-center gap-3 p-4 rounded-3xl border border-rose-100 bg-rose-50/50 text-rose-600 hover:bg-rose-100 transition-all group">
                      <X size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Annuler</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer, Shipping & Assignment */}
              <div className="space-y-8">
                {/* Customer Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3">
                    <User size={14} /> Informations Client
                  </h4>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-black">
                      {(order.guest_name || order.user_id || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none line-clamp-1">
                        {order.guest_name || order.user_id || "Client Inconnu"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {order.user_id ? "Client Enregistré" : "Achat Invité"}
                      </p>
                      {order.guest_email && <p className="text-[10px] text-slate-400 mt-1">{order.guest_email}</p>}
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard size={14} className="text-slate-300" />
                      <span className="text-slate-500">Paiement :</span>
                      <span className="font-bold text-slate-900 uppercase tracking-tight ml-auto">{order.payment_method === 'delivery' ? 'Cash' : 'FedaPay'}</span>
                    </div>

                    {order.payment_method === 'delivery' && (
                      <div className="flex items-center justify-between mt-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut Caisse</p>
                          <p className={`text-sm font-black ${order.payment_status === 'payé' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {order.payment_status === 'payé' ? 'ENCAISSÉ' : 'NON REMIS'}
                          </p>
                        </div>
                        {order.status === 'livree' && order.payment_status !== 'payé' && (
                          <button onClick={markAsPaid} className="btn bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-none rounded-xl text-xs font-black shadow-none gap-2 px-4">
                            <Banknote size={14} /> Récupérer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Card */}
                <div className="bg-primary rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 text-white">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900/60 mb-8 flex items-center gap-3">
                    <MapPin size={14} /> Livraison
                  </h4>
                  {order.address ? (
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900/40 mb-1">Label d'adresse</p>
                        <p className="font-black text-lg">{order.address.label}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900/40 mb-1">Destination</p>
                        <p className="text-sm font-bold opacity-90 leading-relaxed">
                          {order.address.address_line}<br />
                          {order.address.commune_label || order.address.commune}, {order.address.departement_label || order.address.departement}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Truck size={18} />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-900/40">Contact téléphonique</p>
                          <p className="font-black tracking-widest">{order.address.phone}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-white/20 rounded-[2rem]">
                      <p className="text-xs font-black uppercase tracking-widest opacity-40 italic">Inconnue</p>
                    </div>
                  )}
                </div>

                {/* --- ASSIGNMENT SECTION --- */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                    <UserCheck size={14} /> Gestion Logistique
                  </h4>

                  {/* Supplier Assignment */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fournisseur</p>
                      {order.supplier && <span className="badge badge-success badge-sm text-[8px] font-bold text-slate-900">ASSIGNÉ</span>}
                    </div>
                    {order.supplier ? (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center">
                          <Store size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 text-sm">{order.supplier.name}</p>
                          <p className="text-[10px] font-bold text-emerald-600">{order.supplier.phone} · {order.supplier.commune}</p>
                        </div>
                        <button onClick={() => setSuggestedSuppliers([]) || handleAssignSupplier(null)} className="text-xs font-bold text-slate-400 hover:text-rose-500">Changer</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {suggestedSuppliers.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {suggestedSuppliers.slice(0, 3).map(s => (
                              <button
                                key={s.id}
                                onClick={() => handleAssignSupplier(s.id)}
                                disabled={assigningSupplier}
                                className="flex items-center gap-4 p-3 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 rounded-2xl transition-all text-left group"
                              >
                                <div className="w-8 h-8 bg-white text-slate-400 rounded-lg flex items-center justify-center group-hover:text-primary transition-colors">
                                  <Store size={16} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-xs">
                                    {s.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[9px] text-slate-500">{s.commune} · {s.arrondissement || s.quartier || 'Localisation inconnue'}</p>
                                    {s.proximityScore === 3 && (
                                      <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">Arrondissement</span>
                                    )}
                                    {s.proximityScore === 2 && (
                                      <span className="text-[8px] font-black uppercase text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Commune</span>
                                    )}
                                    {s.proximityScore === 1 && (
                                      <span className="text-[8px] font-black uppercase text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">Département</span>
                                    )}
                                  </div>
                                </div>
                                <ChevronDown size={14} className="text-slate-300 -rotate-90" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Aucun fournisseur suggéré trouvé.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Deliverer Assignment */}
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Livreur</p>
                      {order.deliveryPerson && <span className="badge badge-info badge-sm text-[8px] font-bold text-slate-900">ASSIGNÉ</span>}
                    </div>
                    {order.deliveryPerson ? (
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center overflow-hidden">
                          {order.deliveryPerson.profile?.avatar_url ? (
                            <img src={order.deliveryPerson.profile.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <Truck size={20} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-900 text-sm">{order.deliveryPerson.profile?.fullname || 'Livreur'}</p>
                          <p className="text-[10px] font-bold text-blue-600">{order.deliveryPerson.profile?.phone} · {order.deliveryPerson.vehicle_type}</p>
                        </div>
                        <button onClick={() => handleAssignLivreur(null)} className="text-xs font-bold text-slate-400 hover:text-rose-500">Changer</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <select
                          className="select select-bordered select-sm w-full h-12 rounded-xl text-xs font-bold"
                          onChange={(e) => handleAssignLivreur(e.target.value)}
                          disabled={assigningLivreur}
                          defaultValue=""
                        >
                          <option value="" disabled>Sélectionner un livreur...</option>
                          {sortedLivreurs.map(l => (
                            <option key={l.id} value={l.id}>
                              {l.matchScore >= 5 ? '★ ' : ''}{l.profile?.fullname || 'Sans nom'} - {l.vehicle_type} {l.matchScore >= 5 ? '(Recommandé)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-slate-50 sticky bottom-0 z-20 flex justify-end">
          <button onClick={onClose} className="btn h-14 rounded-2xl px-12 font-black uppercase tracking-widest text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Fermer la vue
          </button>
        </div>
      </motion.div >
    </div >
  );
}
