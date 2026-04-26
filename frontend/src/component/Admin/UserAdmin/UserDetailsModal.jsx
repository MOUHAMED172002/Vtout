import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getUserAddresses } from "../../../services/addressService";

export default function UserDetailsModal({ user, isOpen, onClose, onUpdated = () => { } }) {
  const { getToken } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) fetchAddresses();
  }, [user, isOpen]);

  async function fetchAddresses() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getUserAddresses(user.id, token);
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }


  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="bg-base-100 card w-full max-w-2xl shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <h3 className="card-title">{user.fullname || user.id}</h3>
            <div className="text-sm text-muted">ID: {user.id}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>Téléphone: {user.phone || "-"}</div>
              <div className="mt-2">Avatar:</div>
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-24 h-24 rounded" /> : <div className="w-24 h-24 bg-base-200 rounded" />}
            </div>
            <div>
              <h4 className="font-medium">Adresses</h4>
              {loading ? <div>Chargement...</div> : addresses.length ? (
                <ul className="mt-2 space-y-2">
                  {addresses.map(a => (
                    <li key={a.id} className="border rounded p-2">
                      <div className="font-medium">{a.label || a.address_line}</div>
                      <div className="text-sm text-muted">{a.commune_label} — {a.departement_label}</div>
                      <div>Tél: {a.phone}</div>
                    </li>
                  ))}
                </ul>
              ) : <div className="text-sm text-muted mt-2">Aucune adresse</div>}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}