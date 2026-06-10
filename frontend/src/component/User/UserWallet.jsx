import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthHooks";
import axios from "axios";
import toast from "react-hot-toast";
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserWallet() {
  const { getToken } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payout form state
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("MTN Mobile Money");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/financials/my-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(res.data.balance ?? 0);
      setTransactions(Array.isArray(res.data.transactions) ? res.data.transactions : []);
      setPayoutRequests(Array.isArray(res.data.payoutRequests) ? res.data.payoutRequests : []);
    } catch (err) {
      toast.error("Impossible de charger le portefeuille.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error("Veuillez entrer un montant valide.");
      return;
    }
    if (amount > balance) {
      toast.error("Solde insuffisant pour ce retrait.");
      return;
    }
    if (!payoutDetails.trim()) {
      toast.error("Veuillez renseigner les détails de paiement.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      await axios.post(
        `${API_URL}/financials/request-payout`,
        { amount, payment_method: payoutMethod, details: payoutDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Demande de retrait soumise avec succès !");
      setPayoutAmount("");
      setPayoutDetails("");
      fetchStatus();
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la soumission.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const getTransactionLabel = (tx) => {
    if (tx.type === "payout") return "Retrait";
    if (tx.source === "dispute_refund") return "Remboursement litige";
    if (tx.type === "adjustment") return "Ajustement";
    return tx.type || tx.source || "Transaction";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-warning badge-sm font-bold">En attente</span>;
      case "approved":
        return <span className="badge badge-info badge-sm font-bold">Approuvé</span>;
      case "paid":
        return <span className="badge badge-success badge-sm font-bold">Payé</span>;
      case "rejected":
        return <span className="badge badge-error badge-sm font-bold">Rejeté</span>;
      default:
        return <span className="badge badge-ghost badge-sm font-bold">{status}</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={14} className="text-amber-500" />;
      case "approved": return <CheckCircle size={14} className="text-blue-500" />;
      case "paid": return <CheckCircle size={14} className="text-emerald-500" />;
      case "rejected": return <XCircle size={14} className="text-red-500" />;
      default: return <AlertCircle size={14} className="text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl animate-pulse">
        <div className="bg-slate-100 rounded-[2rem] h-40" />
        <div className="bg-slate-100 rounded-[2rem] h-24" />
        <div className="bg-slate-100 rounded-[2rem] h-64" />
        <div className="bg-slate-100 rounded-[2rem] h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Balance Card */}
      <div className="bg-white rounded-[2rem] border border-primary/20 shadow-sm p-5 md:p-8">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Wallet size={18} className="text-primary" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Solde disponible</p>
        </div>
        <p className={`text-4xl md:text-5xl font-black tracking-tighter ${balance > 0 ? "text-primary" : "text-slate-400"}`}>
          {balance.toLocaleString("fr-FR")} <span className="text-xl md:text-2xl font-bold">F</span>
        </p>
        {balance > 0 && (
          <p className="mt-2 text-sm font-bold text-primary">Disponible pour retrait ou commande</p>
        )}
        {balance === 0 && (
          <p className="mt-2 text-sm font-bold text-slate-400">Aucun solde pour le moment</p>
        )}
      </div>

      {/* Info box — use wallet at checkout */}
      <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex gap-4 items-start">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle size={18} className="text-amber-600" />
        </div>
        <div>
          <p className="font-black text-amber-800 mb-1">Utiliser pour commander</p>
          <p className="text-sm font-bold text-amber-700 leading-relaxed">
            Vous pouvez utiliser votre solde directement lors du paiement en choisissant l'option{" "}
            <span className="underline">«&nbsp;Portefeuille Vtout&nbsp;»</span> à la caisse. Aucune action supplémentaire n'est requise ici.
          </p>
        </div>
      </div>

      {/* Payout Request Form */}
      <div className="bg-white rounded-[2rem] border border-primary/20 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ArrowUpRight size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Demande de retrait</h2>
            <p className="text-xs font-bold text-slate-400">Solde disponible : {balance.toLocaleString("fr-FR")} F</p>
          </div>
        </div>

        <form onSubmit={handlePayoutSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Montant (F CFA)
            </label>
            <input
              type="number"
              min="1"
              max={balance}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Ex: 5000"
              className="input input-bordered w-full rounded-2xl font-bold focus:border-primary focus:outline-none"
              required
            />
            {parseFloat(payoutAmount) > balance && (
              <p className="text-xs text-red-500 font-bold mt-1">Montant supérieur au solde disponible.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Méthode de paiement
            </label>
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              className="select select-bordered w-full rounded-2xl font-bold focus:border-primary focus:outline-none"
            >
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Moov Money">Moov Money</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Détails (numéro, nom du compte…)
            </label>
            <textarea
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              placeholder="Ex: 0699000000 — Jean Dupont"
              rows={3}
              className="textarea textarea-bordered w-full rounded-2xl font-bold focus:border-primary focus:outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || balance <= 0}
            className="btn btn-primary btn-block h-14 rounded-2xl font-black border-none shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {submitting ? "Envoi en cours…" : "Soumettre la demande"}
          </button>
        </form>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-[2rem] border border-primary/20 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ArrowDownLeft size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Historique des transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">Aucune transaction pour le moment.</div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 20).map((tx, idx) => {
              const isPayout = tx.type === "payout";
              return (
                <div
                  key={tx.id || idx}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${isPayout ? "bg-red-50" : "bg-emerald-50"}`}>
                    {isPayout ? "➡️" : "💸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{getTransactionLabel(tx)}</p>
                    <p className="text-xs font-bold text-slate-400">{formatDate(tx.created_at || tx.createdAt)}</p>
                  </div>
                  <p className={`font-black text-sm shrink-0 ${isPayout ? "text-red-500" : "text-emerald-600"}`}>
                    {isPayout ? "-" : "+"}{Number(tx.adjustment ?? tx.amount ?? 0).toLocaleString("fr-FR")} F
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payout Requests History */}
      <div className="bg-white rounded-[2rem] border border-primary/20 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Clock size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Demandes de retrait</h2>
        </div>

        {payoutRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-bold">Aucune demande de retrait.</div>
        ) : (
          <div className="space-y-3">
            {payoutRequests.map((req, idx) => (
              <div
                key={req.id || idx}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl"
              >
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                  {getStatusIcon(req.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm">{Number(req.amount).toLocaleString("fr-FR")} F</p>
                  <p className="text-xs font-bold text-slate-400">{req.payment_method} · {formatDate(req.created_at || req.createdAt)}</p>
                </div>
                {getStatusBadge(req.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
