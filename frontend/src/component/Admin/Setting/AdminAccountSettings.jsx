import React, { useState } from "react";

/**
 * AdminAccountSettings - formulaire local pour e-mail/mot de passe admin.
 * NOTE: changer mot de passe doit se faire via l'API auth (Supabase auth admin).
 */
export default function AdminAccountSettings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function save() {
    alert("Pour modifier e-mail/mot de passe admin, utilisez l'API d'authentification côté serveur.");
  }

  return (
    <div className="card p-4 bg-base-100 shadow">
      <h3 className="font-medium">Compte Admin</h3>
      <div className="space-y-2 mt-2">
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email admin" />
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nouveau mot de passe" />
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}