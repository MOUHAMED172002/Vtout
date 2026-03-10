import React, { useState } from "react";

/**
 * ShippingSettings - configuration des zones et coûts (UI only)
 */
export default function ShippingSettings() {
  const [zones, setZones] = useState([{ id: 1, name: "Zone A", cost: 5 }]);

  function add() {
    setZones((s) => [...s, { id: Date.now(), name: "Nouvelle zone", cost: 0 }]);
  }

  function save() {
    alert("Sauvegarder côté serveur / table 'shipping_zones'");
  }

  return (
    <div className="card p-4 bg-base-100 shadow">
      <h3 className="font-medium">Livraison</h3>
      <div className="space-y-2 mt-2">
        {zones.map((z, i) => (
          <div key={z.id} className="flex gap-2">
            <input className="input flex-1" value={z.name} onChange={(e) => { const v = e.target.value; setZones(prev => prev.map(p => p.id === z.id ? { ...p, name: v } : p)); }} />
            <input className="input w-32" type="number" value={z.cost} onChange={(e) => { const v = e.target.value; setZones(prev => prev.map(p => p.id === z.id ? { ...p, cost: v } : p)); }} />
          </div>
        ))}
        <div className="flex justify-between mt-2">
          <button className="btn btn-ghost" onClick={add}>Ajouter zone</button>
          <button className="btn btn-primary" onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}