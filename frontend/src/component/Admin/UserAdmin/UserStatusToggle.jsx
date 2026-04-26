import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { updateProfileStatus, getProfileById } from "../../../services/userService";

export default function UserStatusToggle({ userId }) {
  const { getToken } = useAuth();
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await getProfileById(userId, token);
        if (data && typeof data.is_active !== "undefined") setActive(!!data.is_active);
      } catch (e) { }
    })();
  }, [userId, getToken]);

  async function toggle() {
    setLoading(true);
    try {
      const token = await getToken();
      await updateProfileStatus(userId, !active, token);
      setActive(!active);
    } catch (e) {
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  }


  return (
    <button className={`btn btn-xs ${active ? "btn-success" : "btn-ghost"}`} onClick={toggle} disabled={loading}>
      {active ? "Actif" : "Désactivé"}
    </button>
  );
}