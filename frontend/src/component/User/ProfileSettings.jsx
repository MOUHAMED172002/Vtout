import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getMyProfile, updateMyProfile } from "../../services/userService";
import { uploadSingleImage } from "../../services/uploadService";
import { authClient } from "../../lib/clerk-shim";
import toast from "react-hot-toast";
import { Camera, Lock, Mail, Phone, User, Shield, Loader, Save, Check } from "lucide-react";

export default function ProfileSettings() {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState({ fullname: "", phone: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modif password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [getToken]);

  async function loadProfile() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getMyProfile(token);
      setProfile({
        fullname: data?.fullname || clerkUser?.fullName || "",
        phone: data?.phone || "",
        avatar_url: data?.avatar_url || clerkUser?.imageUrl || "",
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

      // Update better auth name if needed
      if (profile.fullname !== clerkUser?.fullName) {
        await authClient.updateUser({ name: profile.fullname });
      }

      await updateMyProfile({
        fullname: profile.fullname.trim(),
        phone: profile.phone.trim(),
        avatar_url: profile.avatar_url
      }, token);

      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
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
      setProfile(prev => ({ ...prev, avatar_url: url }));

      await authClient.updateUser({ image: url }); // update in Better Auth
      await updateMyProfile({ ...profile, avatar_url: url }, token); // update in App DB

      toast.success("Avatar sublimé !");
    } catch (err) {
      toast.error("Échec de l'upload de la photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPwdLoading(true);
    try {
      const res = await authClient.changePassword({ newPassword, currentPassword });
      if (res.error) {
        toast.error(res.error.message);
      } else {
        toast.success("Mot de passe sécurisé !");
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setPwdLoading(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

        {/* Colonne gauche (Avatar et Identité) */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-gray-100 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>

            <div className="relative">
              <img
                src={profile.avatar_url || "https://placehold.co/150x150?text=U"}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg z-10"
              />
              <button className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-transform hover:scale-110 shadow-lg" onClick={() => document.getElementById('avatar-upload').click()}>
                {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </div>

            <div className="mt-5 text-center">
              <h3 className="text-xl font-bold text-gray-900">{profile.fullname || 'Utilisateur'}</h3>
              <p className="text-sm text-gray-500 font-medium">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
              <div className="mt-3 flex items-center justify-center space-x-1 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                <Shield className="w-3 h-3" />
                <span className="uppercase">{clerkUser?.publicMetadata?.role || 'User'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne centrale & Droite (Formulaires) */}
        <div className="md:col-span-2 space-y-6">

          {/* Informations personnelles */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-500" />
                Informations du compte
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.fullname}
                    onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
                    className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Email (Connexion)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={clerkUser?.primaryEmailAddress?.emailAddress || ''}
                    className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm text-gray-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Numéro de téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 transition-transform active:scale-95 disabled:opacity-75"
              >
                {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer les modifs
              </button>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-rose-500" />
                Sécurité
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  disabled={pwdLoading}
                  type="submit"
                  className="flex items-center px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-[0_4px_14px_0_rgb(0,0,0,39%)] transition-transform active:scale-95 disabled:opacity-75"
                >
                  {pwdLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Mettre à jour mot de passe
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
