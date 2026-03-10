import React from "react";
import { Clock, CheckCircle2, Truck, XCircle, AlertCircle } from "lucide-react";

export default function OrderStatusBadge({ status }) {
  const configs = {
    en_attente: {
      label: "En attente",
      icon: Clock,
      className: "bg-amber-50 text-amber-600 border-amber-100",
    },
    confirmee: {
      label: "Confirmé",
      icon: CheckCircle2,
      className: "bg-blue-50 text-blue-600 border-blue-100",
    },
    confirme: {
      label: "Confirmé",
      icon: CheckCircle2,
      className: "bg-blue-50 text-blue-600 border-blue-100",
    },
    livree: {
      label: "Livré",
      icon: Truck,
      className: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    livre: {
      label: "Livré",
      icon: Truck,
      className: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    annulee: {
      label: "Annulé",
      icon: XCircle,
      className: "bg-rose-50 text-rose-600 border-rose-100",
    },
    annule: {
      label: "Annulé",
      icon: XCircle,
      className: "bg-rose-50 text-rose-600 border-rose-100",
    },
  };

  const config = configs[status] || {
    label: status || "Inconnu",
    icon: AlertCircle,
    className: "bg-slate-50 text-slate-500 border-slate-100",
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${config.className}`}>
      <Icon size={12} strokeWidth={3} />
      {config.label}
    </span>
  );
}