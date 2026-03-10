import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getMyProfile, updateMyProfile } from "../../services/userService";
import { uploadSingleImage } from "../../services/uploadService";
import toast from "react-hot-toast";

export default function ProfileSettings() {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState({ fullname: "", phone: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [getToken]);

  async function loadProfile() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getMyProfile(token);
      setProfile({
        fullname: data?.fullname || (data?.first_name ? `${data.first_name} ${data.last_name}` : ""),
        phone: data?.phone || "",
        avatar_url: data?.avatar_url || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement du profil");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const token = await getToken();
      await updateMyProfile({
        fullname: profile.fullname.trim(),
        phone: profile.phone.trim(),
        avatar_url: profile.avatar_url
      }, token);

      toast.success("Profil mis à jour !");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de mettre à jour le profil");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = await getToken();
      const url = await uploadSingleImage(file, token);

      // Mettre à jour localement l'état
      setProfile(prev => ({ ...prev, avatar_url: url }));

      // On sauvegarde immédiatement le changement de photo
      await updateMyProfile({ ...profile, avatar_url: url }, token);

      toast.success("Avatar mis à jour !");
    } catch (err) {
      console.error("Avatar upload error", err);
      toast.error("Échec de l'upload de l'avatar.");
    } finally {
      setUploading(false);
    }
  }



  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 border">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Mon profil
      </h2>

      {/* Avatar + Email */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={profile.avatar_url || "https://placehold.co/120x120?text=Avatar"}
          alt="Avatar"
          className="w-28 h-28 rounded-full object-cover border mb-3"
        />

        {editing && (
          <div className="text-sm">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>
        )}

        <p className="text-gray-600 mt-2 text-sm">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
      </div>


      {/* Infos profil */}
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Nom complet</label>
          <input
            type="text"
            value={profile.fullname}
            disabled={!editing}
            onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
            className={`w-full border rounded-md p-2 ${editing ? "bg-white" : "bg-gray-50"
              }`}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Téléphone</label>
          <input
            type="text"
            value={profile.phone}
            disabled={!editing}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className={`w-full border rounded-md p-2 ${editing ? "bg-white" : "bg-gray-50"
              }`}
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="mt-6 flex gap-3 justify-end">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Modifier mon profil
          </button>
        ) : (
          <>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}
