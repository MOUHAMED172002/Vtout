import React, { useState } from "react";

/**
 * PaymentSettings - config paiement (stockage non implémenté)
 */
export default function PaymentSettings() {
  const [fedaKey, setFedaKey] = useState("");
  const [paypalClient, setPaypalClient] = useState("");

  function save() {
    alert("Sauvegardez ces données côté serveur (ne stockez pas de clés côté client)");
  }

  return (
    <div className="card p-4 bg-base-100 shadow">
      <h3 className="font-medium">Paiements</h3>
      <div className="space-y-2 mt-2">
        <input className="input" placeholder="FedaPay clé secrète" value={fedaKey} onChange={(e) => setFedaKey(e.target.value)} />
        <input className="input" placeholder="PayPal Client ID" value={paypalClient} onChange={(e) => setPaypalClient(e.target.value)} />
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}