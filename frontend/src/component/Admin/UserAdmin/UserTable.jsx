import React from "react";
import UserStatusToggle from "../UserAdmin/UserStatusToggle";

/**
 * UserTable - affiche la liste des profiles
 */
export default function UserTable({ users = [], loading = false, onView = () => {} }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Inscrit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center">Chargement...</td></tr>
              ) : users.length ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium flex items-center gap-2">
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full" /> : <div className="avatar-placeholder w-8 h-8 rounded-full bg-base-200" />}
                      <span>{u.fullname || u.id}</span>
                    </td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                        (u.role === 'fournisseur' || u.role === 'vendeur') ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                        u.role === 'livreur' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                        'bg-base-200 text-base-content/50 border border-base-200'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="text-sm font-medium text-base-content/40">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                    <td><UserStatusToggle userId={u.id} /></td>
                    <td><button className="btn btn-sm btn-ghost" onClick={() => onView(u)}>Voir</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center text-muted">Aucun utilisateur</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}