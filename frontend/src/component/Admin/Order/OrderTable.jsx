import React from "react";
import OrderStatusBadge from "../Order/OrderStatusBadge";
import { Calendar, User, CreditCard, ChevronRight, AlertCircle } from "lucide-react";

/**
 * OrderTable - simple tableau des commandes
 * props: orders, loading, onView(order)
 */
export default function OrderTable({ orders = [], loading = false, onView = () => { } }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/40 font-bold uppercase tracking-widest text-xs">Chargement des commandes...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-base-content/40 font-bold uppercase tracking-widest text-xs">Aucune commande trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full border-separate border-spacing-y-4 px-4">
        <thead>
          <tr className="text-base-content/40 font-black uppercase text-[10px] tracking-[0.2em] border-none">
            <th className="bg-transparent pl-8">Référence</th>
            <th className="bg-transparent">Client</th>
            <th className="bg-transparent">Montant</th>
            <th className="bg-transparent">Statut</th>
            <th className="bg-transparent">Date</th>
            <th className="bg-transparent pr-8 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {orders.map((o) => (
            <tr
              key={o.id}
              className="group bg-base-100 hover:bg-base-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => onView(o)}
            >
              <td className="pl-8 py-5 rounded-l-[1.5rem] border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase">REF</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-black text-base-content leading-none">
                        #{o.id ? o.id.slice(0, 8).toUpperCase() : "N/A"}
                      </p>
                      {o.parent_id && (
                        <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-md border border-indigo-100 uppercase tracking-tighter">Multi-Boutique</span>
                      )}
                      {o.dispute_status && !['annule', 'resolu'].includes(o.dispute_status) && (
                        <span className="text-[8px] font-black bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md border border-rose-100 uppercase tracking-tighter flex items-center gap-0.5">
                          <AlertCircle size={8}/> Litige
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest leading-none line-clamp-1 w-24">
                      ID: {o.id || "N/A"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="border-none">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-base-content/30" />
                  <span className="text-sm font-bold text-base-content/70">
                    {o.guest_name || (o.user_id ? `${o.user_id.slice(0, 8)}...` : "Client Invité")}
                  </span>
                </div>
              </td>
              <td className="border-none">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-primary/40" />
                  <span className="text-sm font-black text-base-content">{(Number(o.total_amount) || 0).toLocaleString()} F</span>
                </div>
              </td>
              <td className="border-none">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="border-none">
                <div className="flex items-center gap-2 text-base-content/40">
                  <Calendar size={14} />
                  <span className="text-xs font-bold">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}</span>
                </div>
              </td>
              <td className="pr-8 rounded-r-[1.5rem] border-none text-right">
                <button className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40 hover:bg-primary hover:text-white transition-all ml-auto">
                  <ChevronRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
