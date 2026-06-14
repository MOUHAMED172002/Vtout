import React from "react";
import { Edit, Trash2, Box, Info } from "lucide-react";

export default function ProductTable({ products = [], loading = false, onEdit = () => { }, onDelete = () => { } }) {
  const formatPrice = (p) => (p == null ? "-" : `${Number(p).toLocaleString()} F`);

  const cheapestSupplier = (suppliers_summary = []) => {
    if (!suppliers_summary.length) return null;
    const withPrice = suppliers_summary.filter((s) => s.supplier_price != null);
    if (!withPrice.length) return null;
    return withPrice.reduce((min, cur) => (Number(cur.supplier_price) < Number(min.supplier_price) ? cur : min), withPrice[0]);
  };

  return (
    <div className="overflow-x-auto custom-scrollbar px-6 pb-6">
      <table className="admin-table">
        <thead>
          <tr>
            <th className="text-left">Article</th>
            <th className="text-left">Prix Vente</th>
            <th className="text-left">Stock / Variantes</th>
            <th className="text-left">Fournisseurs</th>
            <th className="text-left">Statut</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {loading ? (
            [1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="animate-pulse">
                <td colSpan="5"><div className="h-20 bg-base-200 rounded-2xl"></div></td>
              </tr>
            ))
          ) : products.length ? (
            products.map((p) => {
              const mainImg = p.images?.find(img => img.is_main)?.image_url || p.images?.[0]?.image_url;
              return (
                <tr key={p.id} className="group hover:bg-base-200/50 transition-all duration-300">
                  <td>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-base-200 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                        {mainImg ? (
                          <img src={mainImg} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base-content/30 bg-base-200">
                            <Box size={24} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-base-content leading-tight truncate max-w-[200px] hover:text-primary transition-colors cursor-default">{p.name}</p>
                        <p className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">{p.category?.name || "Général"}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <p className="font-black text-lg text-base-content">{formatPrice(p.price)}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-base-content/40 uppercase">HTVA</span>
                    </div>
                  </td>

                  <td>
                    <div className="flex flex-col gap-2">
                      <div className={`w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${(p.total_stock !== undefined ? p.total_stock : p.stock) > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {p.total_stock !== undefined ? p.total_stock : (p.stock || 0)} en stock
                      </div>
                      <div className="w-fit px-4 py-1 rounded-full bg-base-200 text-base-content/50 border border-base-200 text-[10px] font-black uppercase tracking-widest">
                        {(p.variants || []).length} variations
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-base-content/70">
                        {Math.max((p.supplierLink || []).length, p.supplier ? 1 : 0)} partenaires
                      </p>
                      {((p.supplierLink || []).length > 0 || p.supplier) && (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg">
                          <Info size={10} className="stroke-[3]" />
                          <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[100px]">Actif</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="flex flex-col gap-1">
                      {p.approval_status === 'approved' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full w-fit">Approuvé</span>
                      ) : p.approval_status === 'rejected' ? (
                        <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest rounded-full w-fit">Rejeté</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full w-fit animate-pulse">En attente</span>
                      )}
                      {p.admin_feedback && <span className="text-[8px] text-base-content/40 italic max-w-[100px] truncate">{p.admin_feedback}</span>}
                    </div>
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onEdit(p)}
                        className="w-12 h-12 flex items-center justify-center bg-base-100 border border-base-200 text-base-content/40 rounded-2xl hover:bg-neutral hover:text-white hover:border-neutral transition-all shadow-sm"
                        title="Éditer"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="w-12 h-12 flex items-center justify-center bg-base-100 border border-base-200 text-red-400 rounded-2xl hover:bg-red-500 hover:text-base-content hover:border-red-500 transition-all shadow-sm"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="py-20 text-center">
                <p className="text-base-content/40 font-bold">Aucun produit dans le catalogue.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div >
  );
}