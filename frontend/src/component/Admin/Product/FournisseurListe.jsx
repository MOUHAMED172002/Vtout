import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllSupplierProducts,
  updateSupplierProduct,
  deleteSupplierProduct
} from "../../../services/supplierService";
import { Truck, Edit2, Trash2, RefreshCw } from 'lucide-react';

import { useAuth } from "../../../lib/AuthHooks";;

/**
 * SupplierList
 * - affiche tous les fournisseurs et pour chacun les supplier_products liés (product + variant + prix)
 */
export default function FournisseurListe() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getAllSupplierProducts(token);
      const rows = data || [];

      // group by supplier
      const map = {};
      for (const r of rows) {
        const sid = r.supplier_id || "unknown";
        if (!map[sid]) {
          map[sid] = {
            supplier: r.supplier || { id: sid, name: "Inconnu" },
            items: []
          };
        }
        map[sid].items.push(r);
      }
      setGrouped(map);
    } catch (err) {
      console.error("fetch supplier_products error", err);
      toast.error("Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (row) => {
    const newPriceStr = window.prompt("Prix fournisseur (CFA)", row.supplier_price != null ? String(row.supplier_price) : "");
    if (newPriceStr === null) return;
    const newSku = window.prompt("SKU fournisseur (optionnel)", row.supplier_sku || "") ?? "";

    const newPrice = newPriceStr === "" ? null : Number(newPriceStr);
    if (newPriceStr !== "" && (isNaN(newPrice) || newPrice < 0)) {
      return toast.error("Prix invalide");
    }

    try {
      const token = await getToken();
      await updateSupplierProduct(row.id, {
        supplier_price: newPrice,
        supplier_sku: newSku || null
      }, token);
      toast.success("Mise à jour effectuée");
      await fetchAll();
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Supprimer la liaison fournisseur ${row.supplier?.name} ?`)) return;
    try {
      const token = await getToken();
      await deleteSupplierProduct(row.id, token);
      toast.success("Liaison supprimée");
      await fetchAll();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-100/50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Fournisseurs & Produits</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Gestion de la chaine logistique</p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="btn btn-ghost btn-sm btn-circle hover:bg-primary/10 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="loading loading-bars loading-lg text-primary"></span>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronisation des données...</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Truck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Aucune liaison fournisseur trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Object.values(grouped).map((g) => (
            <div key={g.supplier.id} className="group overflow-hidden bg-white border border-slate-100 rounded-3xl transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-lg font-black text-slate-900 tracking-tight">{g.supplier.name}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      {g.supplier.phone && <span>{g.supplier.phone}</span>}
                      {g.supplier.email && <span>• {g.supplier.email}</span>}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    {g.items.length} produit(s)
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400">Produit</th>
                      <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400">Variante</th>
                      <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400">Prix Fournisseur</th>
                      <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {g.items.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group/row">
                        <td className="font-bold text-slate-700 text-sm">
                          {r.product?.name || "Produit inconnu"}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {r.variant?.combination ? (
                              Object.entries(typeof r.variant.combination === 'string' ? JSON.parse(r.variant.combination) : r.variant.combination).map(([attr, val], i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">
                                  {attr}: {val}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-300 italic">Base</span>
                            )}
                          </div>
                        </td>
                        <td className="font-black text-slate-900 text-sm">
                          {r.supplier_price != null ? `${Number(r.supplier_price).toLocaleString()} F` : "—"}
                        </td>
                        <td>
                          <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-primary hover:bg-primary/10"
                              onClick={() => handleEdit(r)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-error hover:bg-error/10"
                              onClick={() => handleDelete(r)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
