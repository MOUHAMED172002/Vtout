import React, { useState } from "react";

/**
 * NotificationsSettings - activer/desactiver notifications (UI only)
 */
export default function NotificationsSettings() {
  const [newOrder, setNewOrder] = useState(true);
  const [delivery, setDelivery] = useState(true);

  function save() {
    alert("Sauvegarder les préférences de notification côté serveur.");
  }

  return (
    <div className="card p-4 bg-base-100 shadow">
      <h3 className="font-medium">Notifications</h3>
      <div className="mt-2 space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={newOrder} onChange={(e) => setNewOrder(e.target.checked)} />
          <span>Nouvelles commandes</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
          <span>Mises à jour livraisons</span>
        </label>
        <div className="flex justify-end mt-2"><button className="btn btn-primary" onClick={save}>Enregistrer</button></div>
      </div>
    </div>
  );
}