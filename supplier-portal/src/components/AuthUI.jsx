import React, { useState } from 'react';
import { authClient } from './clerk-shim';
import { Mail, Lock, User, Github, Facebook, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthUI = ({ mode = 'signIn' }) => {
    const [isSign, setIsSign] = useState(mode === 'signIn');
    const [isForgotPath, setIsForgotPath] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isForgotPath) {
                // Assume better auth handle forgot password
                await authClient.forgetPassword({ email, redirectTo: window.location.origin + '/reset-password' });
                toast.success("E-mail de réinitialisation envoyé !");
                setIsForgotPath(false);
            } else if (isSign) {
                const res = await authClient.signIn.email({ email, password });
                if (res.error) toast.error(res.error.message || "Erreur de connexion");
            } else {
                const res = await authClient.signUp.email({ email, password, name });
                if (res.error) toast.error(res.error.message || "Erreur d'inscription");
            }
        } catch (err) {
            toast.error('Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const socialLogin = async (provider) => {
        const res = await authClient.signIn.social({ provider });
        if (res.error) toast.error("La connexion avec " + provider + " a échoué.");
    };

    return (
        <div className="flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-30"></div>
                <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-3xl p-8 sm:p-10 border border-white/20">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                            {isForgotPath ? "Mot de passe oublié ?" : (isSign ? "Bon retour ! 👋" : "Créez votre compte 🚀")}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isForgotPath
                                ? "Saisissez votre e-mail pour réinitialiser"
                                : (isSign ? "Connectez-vous pour continuer sur Vtout" : "Rejoignez la meilleure plateforme e-commerce")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isSign && !isForgotPath && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Votre nom complet"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                placeholder="Votre adresse e-mail"
                            />
                        </div>

                        {!isForgotPath && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    placeholder="Mot de passe sécurisé"
                                />
                            </div>
                        )}

                        {isSign && !isForgotPath && (
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPath(true)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                                <span className="flex items-center">
                                    {isForgotPath ? "Envoyer le lien" : (isSign ? "Se connecter" : "S'inscrire")}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    {!isForgotPath && (
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white/80 dark:bg-gray-900/80 text-gray-500">Ou continuer avec</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => socialLogin('google')}
                                    className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                                    Google
                                </button>
                                <button
                                    onClick={() => socialLogin('facebook')}
                                    className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                                    Facebook
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsForgotPath(false);
                                setIsSign(!isSign);
                            }}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                        >
                            {isForgotPath
                                ? "Retourner à la connexion"
                                : (isSign ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UserDropdown = () => {
    const [open, setOpen] = useState(false);
    const { session, user } = authClient.useSession().data || {};

    if (!user) return null;

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 focus:outline-none">
                <img
                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-sm hover:shadow-lg transition-transform hover:scale-105 object-cover"
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <span className="mt-1 inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">
                            {user.role || 'Utilisateur'}
                        </span>
                    </div>

                    <div className="py-2 space-y-1">
                        <a href="/profile-settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            Mon Profil
                        </a>
                        <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            Tableau de bord
                        </a>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => authClient.signOut().then(() => window.location.href = '/')}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
