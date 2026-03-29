import React, { useState } from "react";
import { generateInvoicePDF } from "../../../component/context/InvoiceGenerator";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

export default function InvoiceButton({ order }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await generateInvoicePDF(order);
      toast.success("Reçus PDF générée");
    } catch (err) {
      console.error(err);
      toast.error("Erreur de génération");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      className="btn btn-ghost btn-sm gap-2 h-12 rounded-xl border border-slate-100 px-4 hover:bg-slate-50 transition-all font-black"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <Download size={14} className="text-primary" />
      )}
      Reçus
    </button>
  );
}