import React, { useState } from 'react';
import { authClient } from './auth-client';
import { useAuth } from './clerk-shim';
import { Mail, Lock, User as UserIcon, Github, Facebook, ArrowRight, Loader, Eye, EyeOff, MessageCircle, Smartphone, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import toast from 'react-hot-toast';

export const AuthUI = ({ mode = 'signIn' }) => {
    const [isSign, setIsSign] = useState(mode === 'signIn');
    const [isForgotPath, setIsForgotPath] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [whatsappPassword, setWhatsappPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [whatsappMode, setWhatsappMode] = useState('none'); // 'none', 'request', 'verify'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // --- Persistance pour mobile ---
    // Sauvegarde l'état si on change d'app pour aller voir le code WhatsApp
    React.useEffect(() => {
        const saved = sessionStorage.getItem('vtout_auth_state');
        if (saved) {
            try {
                const { mode, ph, nm, wp, savedOtp } = JSON.parse(saved);
                if (mode) setWhatsappMode(mode);
                if (ph) setPhone(ph);
                if (nm) setName(nm);
                if (wp) setWhatsappPassword(wp);
                if (savedOtp) setOtp(savedOtp);
            } catch (e) {}
        }
    }, []);

    React.useEffect(() => {
        if (whatsappMode !== 'none') {
            sessionStorage.setItem('vtout_auth_state', JSON.stringify({
                mode: whatsappMode,
                ph: phone,
                nm: name,
                wp: whatsappPassword,
                savedOtp: otp
            }));
        } else {
            sessionStorage.removeItem('vtout_auth_state');
        }
    }, [whatsappMode, phone, name, whatsappPassword, otp]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isForgotPath) {
                await authClient.requestPasswordReset({ email, redirectTo: window.location.origin + '/reset-password' });
                toast.success("E-mail de réinitialisation envoyé !");
                setIsForgotPath(false);
            } else if (whatsappMode === 'request') {
                if (!phone) {
                    toast.error("Veuillez entrer un numéro valide");
                    setLoading(false);
                    return;
                }
                if (!whatsappPassword || whatsappPassword.length < 6) {
                    toast.error("Veuillez entrer un mot de passe (min 6 caractères)");
                    setLoading(false);
                    return;
                }
                await api.post('/auth/whatsapp/send-code', { phone });
                toast.success("Code envoyé sur WhatsApp !");
                setWhatsappMode('verify');
            } else if (whatsappMode === 'verify') {
                // 1. Vérifier le code OTP
                await api.post('/auth/whatsapp/verify-code', { phone, code: otp });
                
                // 2. Créer ou connecter l'utilisateur via Better Auth nativement avec son mot de passe
                const fakeEmail = `${phone.replace(/\\D/g, '')}@whatsapp.vtout.com`;
                let authRes = await authClient.signUp.email({ 
                    email: fakeEmail, 
                    password: whatsappPassword, 
                    name: name || 'Utilisateur WhatsApp'
                });

                if (authRes.error && (authRes.error.status === 400 || authRes.error.message?.includes('exist'))) {
                    // L'utilisateur existe déjà, on le connecte
                    authRes = await authClient.signIn.email({ email: fakeEmail, password: whatsappPassword });
                    if (authRes.error) {
                        toast.error("Ce numéro est déjà lié à un autre mot de passe.");
                        setLoading(false);
                        return;
                    }
                } else if (authRes.error) {
                    toast.error(authRes.error.message || "Erreur de création de compte");
                    setLoading(false);
                    return;
                }

                // 3. Synchroniser le profil Vtout
                try { await api.get('/profile/sync'); } catch (e) { console.error('Sync error', e); }

                toast.success("Connexion réussie !");
                window.location.href = '/';
            } else if (isSign) {
                const res = await authClient.signIn.email({ email, password });
                if (res.error) {
                    toast.error(res.error.message || "Erreur de connexion");
                } else {
                    window.location.href = '/';
                }
            } else {
                const res = await authClient.signUp.email({ email, password, name });
                if (res.error) {
                    toast.error(res.error.message || "Erreur d'inscription");
                } else {
                    window.location.href = '/';
                }
            }
        } catch (err) {
            const errorData = err.response?.data;
            toast.error(errorData?.message || errorData?.error || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };


    const socialLogin = async (provider) => {
        const res = await authClient.signIn.social({ 
            provider,
            callbackURL: window.location.origin 
        });
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
                        {whatsappMode === 'none' ? (
                            <>
                                {!isSign && !isForgotPath && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            autoComplete="name"
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
                                        autoComplete="email"
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
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            autoComplete={isSign ? "current-password" : "new-password"}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Mot de passe sécurisé"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
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
                            </>
                        ) : (
                            <div className="space-y-6">
                                {whatsappMode === 'request' ? (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                                placeholder="Votre nom complet"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Smartphone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <PhoneInput
                                                international
                                                defaultCountry="BJ"
                                                value={phone}
                                                onChange={setPhone}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all [&>input]:bg-transparent [&>input]:outline-none [&>input]:w-full"
                                                placeholder="+229 00 00 00 00"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={whatsappPassword}
                                                onChange={e => setWhatsappPassword(e.target.value)}
                                                className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                                placeholder="Créer un mot de passe"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            autoFocus
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full text-center tracking-[0.8em] text-2xl py-3 border-2 border-emerald-100 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all font-black"
                                            placeholder="000000"
                                        />
                                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Code envoyé au {phone}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r ${whatsappMode !== 'none' ? 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500' : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                                <span className="flex items-center">
                                    {isForgotPath ? "Envoyer le lien" : 
                                     whatsappMode === 'request' ? "Recevoir le code WhatsApp" : 
                                     whatsappMode === 'verify' ? "Vérifier & Continuer" : 
                                     (isSign ? "Se connecter" : "S'inscrire")}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>

                        {whatsappMode !== 'none' && (
                            <button
                                type="button"
                                onClick={() => setWhatsappMode('none')}
                                className="w-full flex justify-center items-center py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Retour aux options classiques
                            </button>
                        )}
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
                             <div className="mt-4 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => socialLogin('google')}
                                        className="flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                                        Google
                                    </button>
                                    
                                    <button
                                        onClick={() => setWhatsappMode('request')}
                                        className="flex justify-center items-center py-2.5 px-4 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm bg-emerald-50/50 dark:bg-emerald-900/10 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors duration-200 group"
                                    >
                                        <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                        WhatsApp
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
                            className="text-sm font-black uppercase tracking-widest transition-all px-6 py-2 rounded-xl mt-4 inline-block text-primary hover:bg-primary/5 border border-primary/20"
                        >
                            {isForgotPath
                                ? "Retourner à la connexion"
                                : (isSign ? "Nouveau ? Créer un compte" : "Déjà un compte ? Se connecter")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UserDropdown = () => {
    const [open, setOpen] = useState(false);
    const { user, isSupplier, isDelivery, isAdmin } = useAuth();

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
                        <a href="/user/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            Mon Profil
                        </a>
                        <a href="/user/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            Tableau de bord
                        </a>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 px-2 py-2 space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">Changer de mode</p>
                        
                        {(isSupplier || isDelivery || isAdmin) ? (
                            <>
                                <button
                                    onClick={() => window.location.href = (import.meta.env.VITE_MAIN_SITE_URL || '') + '/user/dashboard'}
                                    className="w-full text-left px-2 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    ✨ Mode Client
                                </button>

                                {isSupplier && (
                                    <button
                                        onClick={() => window.location.href = (import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com') + '/dashboard'}
                                        className="w-full text-left px-2 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                    >
                                        🏪 Mode Vendeur
                                    </button>
                                )}

                                {isDelivery && (
                                    <button
                                        onClick={() => window.location.href = (import.meta.env.VITE_MAIN_SITE_URL || '') + '/delivery-rider/dashboard'}
                                        className="w-full text-left px-2 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    >
                                        🏍️ Mode Livreur
                                    </button>
                                )}

                                {isAdmin && (
                                    <button
                                        onClick={() => window.location.href = (import.meta.env.VITE_MAIN_SITE_URL || '') + '/admin/dashboard'}
                                        className="w-full text-left px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/20 rounded-lg transition-colors"
                                    >
                                        🛡️ Administration
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="px-2 py-1.5 text-[10px] font-bold text-slate-400 italic">Aucun autre rôle actif</p>
                        )}
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
