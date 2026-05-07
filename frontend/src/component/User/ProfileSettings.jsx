import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "../../lib/clerk-shim";
import { getMyProfile, updateMyProfile } from "../../services/userService";
import { uploadSingleImage } from "../../services/uploadService";
import { authClient } from "../../lib/clerk-shim";
import toast from "react-hot-toast";
import { Camera, Lock, Mail, Phone, User as UserIcon, Shield, Loader, Save, Check, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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

      await authClient.updateUser({ image: url });
      await updateMyProfile({ ...profile, avatar_url: url }, token);

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
    <div className="flex justify-center items-center h-full min-h-[60vh]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-b-4 border-rose-400 animate-spin-slow"></div>
      </div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, duration: 0.4, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
          Paramètres du profil
        </h1>
        <p className="text-gray-500 text-sm mt-2 flex items-center">
          Gérez vos informations personnelles et sécurisez votre compte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        
        {/* Colonne gauche (Avatar et Identité) */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-gray-900/50 p-8 border border-white/50 dark:border-gray-800 flex flex-col items-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -z-10 group-hover:bg-rose-500/20 transition-all duration-500"></div>

            <div className="relative group/avatar cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={profile.avatar_url || "https://placehold.co/150x150?text=U"}
                alt="Avatar"
                className="w-36 h-36 rounded-full object-cover border-[4px] border-white dark:border-gray-800 shadow-xl z-10 bg-white"
              />
              <button 
                className="absolute bottom-2 right-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-transform hover:scale-110 shadow-lg z-30"
              >
                {uploading ? <Loader className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </button>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </div>

            <div className="mt-8 text-center w-full">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{profile.fullname || 'Utilisateur'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate mt-1">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex justify-center items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">{clerkUser?.publicMetadata?.role || 'Acheteur'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Colonne centrale & Droite (Formulaires) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informations personnelles */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-gray-900/50 p-8 border border-white/50 dark:border-gray-800 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="mb-8 pl-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl mr-3">
                    <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Informations du compte
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom complet</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-indigo-500 transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.fullname}
                    onChange={(e) => setProfile({ ...profile, fullname: e.target.value })}
                    className="pl-11 w-full rounded-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800 p-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email (Connexion)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={clerkUser?.primaryEmailAddress?.emailAddress || ''}
                    className="pl-11 w-full rounded-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-100/80 dark:bg-gray-800/80 p-3.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numéro de téléphone (WhatsApp)</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-indigo-500 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-11 w-full rounded-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800 p-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium text-gray-900 dark:text-white"
                    placeholder="+229 ... (Bénin par défaut)"
                  />
                </div>
                <p className="text-[10px] text-gray-400 italic">Ajoutez l'indicateur (ex: +228) pour les numéros hors Bénin.</p>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70"
              >
                {saving ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Enregistrer les modifs
              </motion.button>
            </div>
          </motion.div>

          {/* Mot de passe */}
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-gray-900/50 p-8 border border-white/50 dark:border-gray-800 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-400 to-orange-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="mb-8 pl-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl mr-3">
                  <Lock className="w-5 h-5 text-rose-500" />
                </div>
                Sécurité & Mot de passe
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mot de passe actuel</label>
                <div className="relative group/input">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-rose-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-11 w-full rounded-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800 p-3.5 text-sm focus:ring-2 focus:ring-rose-400 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nouveau mot de passe</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-rose-500 transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-11 w-full rounded-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-gray-50/50 dark:bg-gray-800 p-3.5 text-sm focus:ring-2 focus:ring-rose-400 focus:bg-white dark:focus:bg-gray-900 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={pwdLoading}
                  type="submit"
                  className="flex items-center px-8 py-3.5 bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl shadow-gray-200 dark:shadow-none transition-all disabled:opacity-75"
                >
                  {pwdLoading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <ChevronRight className="w-5 h-5 mr-2" />}
                  Mettre à jour mot de passe
                </motion.button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
