import React, { useState } from 'react';
import { authClient } from './clerk-shim';
import { Mail, Lock, User, Github, Facebook, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthUI = ({ mode = 'signIn', role = 'user' }) => {
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
                await authClient.requestPasswordReset({ email, redirectTo: window.location.origin + '/reset-password' });
                toast.success("E-mail de réinitialisation envoyé !");
                setIsForgotPath(false);
            } else if (isSign) {
                const res = await authClient.signIn.email({ email, password });
                if (res.error) {
                    toast.error(res.error.message || "Erreur de connexion");
                } else {
                    toast.success("Connexion réussie ! Redirection...");
                    // REDIRECTION DIRECTE au dashboard
                    window.location.href = '/dashboard';
                }
            } else {
                const res = await authClient.signUp.email({ 
                    email, 
                    password, 
                    name,
                    role 
                });
                if (res.error) {
                    toast.error(res.error.message || "Erreur d'inscription");
                } else {
                    toast.success("Compte créé avec succès ! Redirection...");
                    window.location.href = '/dashboard';
                }
            }
        } catch (err) {
            toast.error('Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full relative py-4">
            {/* Effet de fond Premium */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-indigo-500/10 blur-2xl opacity-50 rounded-[40px] pointer-events-none"></div>
            
            <div className="relative space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                        {isForgotPath ? "Récupération" : (isSign ? "Bon Retour !" : "Prêt à vendre ?")}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {isForgotPath ? "Lien sécurisé par e-mail" : (isSign ? "Espace Partenaire Vtout" : "Créez votre boutique en 2 min")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isSign && !isForgotPath && (
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-5 tracking-widest group-focus-within:text-primary transition-colors">Nom de l'administrateur</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm text-slate-900 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    placeholder="Nom complet"
                                />
                            </div>
                        </div>
                    )}

                    <div className="group space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-5 tracking-widest group-focus-within:text-primary transition-colors">Adresse E-mail Professionnelle</label>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm text-slate-900 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                placeholder="votre@agence.com"
                            />
                        </div>
                    </div>

                    {!isForgotPath && (
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-5 tracking-widest group-focus-within:text-primary transition-colors">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-7 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-bold text-sm text-slate-900 focus:bg-white focus:border-primary/10 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary transition-all shadow-xl shadow-slate-200 hover:shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3 mt-4 active:scale-95"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                {isForgotPath ? "Récupérer mon accès" : (isSign ? "Accéder au Dashboard" : "Continuer l'inscription")}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {!isForgotPath && (
                    <>
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="bg-white px-4">Ou continuer avec</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={async () => {
                                    await authClient.signIn.social({ 
                                        provider: 'google',
                                        callbackURL: window.location.origin + '/register' 
                                    });
                                }}
                                className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-50 rounded-[24px] hover:border-primary/20 transition-all active:scale-95"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Google</span>
                            </button>
                            <button
                                onClick={async () => {
                                    await authClient.signIn.social({ 
                                        provider: 'facebook',
                                        callbackURL: window.location.origin + '/register' 
                                    });
                                }}
                                className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-50 rounded-[24px] hover:border-primary/20 transition-all active:scale-95"
                            >
                                <Facebook className="text-blue-600" size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Facebook</span>
                            </button>
                        </div>
                    </>
                )}

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setIsForgotPath(false);
                            setIsSign(!isSign);
                        }}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors p-2"
                    >
                        {isForgotPath ? "Retour à la connexion" : (isSign ? "Devenir fournisseur" : "Déjà inscrit ? Connexion")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const UserDropdown = () => {
    const [open, setOpen] = useState(false);
    const { user } = authClient.useSession().data || {};

    if (!user) return null;

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="focus:outline-none active:scale-90 transition-transform">
                <img
                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`}
                    alt="Avatar"
                    className="w-11 h-11 rounded-[18px] border-2 border-white shadow-xl object-cover ring-2 ring-primary/5"
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-widest">{user.role || 'Partner'}</p>
                    </div>

                    <div className="py-2">
                        <a href="/dashboard" className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors">
                            Tableau de bord
                        </a>
                        <button
                            onClick={() => authClient.signOut().then(() => window.location.href = '/')}
                            className="w-full text-left px-5 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
