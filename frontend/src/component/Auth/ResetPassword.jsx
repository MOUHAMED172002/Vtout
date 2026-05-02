import React, { useState } from 'react';
import { authClient } from '../../lib/clerk-shim';
import { Lock, ArrowRight, Loader, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
};

const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const strength = getPasswordStrength(password);
    const passwordsMatch = password === confirm && confirm.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Extract token from URL (Better Auth sends it as ?token=...)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            toast.error('Jeton de réinitialisation manquant ou invalide.');
            return;
        }

        if (password.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        if (!passwordsMatch) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            const res = await authClient.resetPassword({ 
                newPassword: password,
                token: token // Pass the token explicitly
            });
            if (res.error) {
                toast.error(res.error.message || 'Erreur de réinitialisation');
            } else {
                toast.success('Mot de passe mis à jour avec succès !');
                setTimeout(() => {
                    window.location.href = '/auth/connexion';
                }, 1500);
            }
        } catch (err) {
            toast.error('Erreur lors de la réinitialisation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-20 px-4 min-h-[70vh]">
            <div className="max-w-md w-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-30"></div>
                <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-3xl p-8 sm:p-10 border border-white/20">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                            Nouveau mot de passe
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Choisissez un mot de passe fort d'au moins 8 caractères.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                                    placeholder="Nouveau mot de passe"
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {password.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex gap-1 h-1.5">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-bold ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500' : strength === 3 ? 'text-yellow-500' : 'text-green-600'}`}>
                                        {strengthLabels[strength]}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                                        confirm.length > 0
                                            ? passwordsMatch ? 'border-green-400 focus:ring-green-400' : 'border-red-400 focus:ring-red-400'
                                            : 'border-gray-200 dark:border-gray-700 focus:ring-teal-500'
                                    }`}
                                    placeholder="Confirmer le mot de passe"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {confirm.length > 0 && (
                                <p className={`text-xs font-bold flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                    {passwordsMatch
                                        ? <><CheckCircle className="h-3 w-3" /> Les mots de passe correspondent</>
                                        : <><XCircle className="h-3 w-3" /> Les mots de passe ne correspondent pas</>
                                    }
                                </p>
                            )}
                        </div>

                        {/* Requirements checklist */}
                        <ul className="text-xs text-gray-500 space-y-1 pl-1">
                            <li className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600 font-semibold' : ''}`}>
                                {password.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3 text-gray-300" />}
                                Au moins 8 caractères
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-600 font-semibold' : ''}`}>
                                {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3 text-gray-300" />}
                                Une lettre majuscule
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-600 font-semibold' : ''}`}>
                                {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3 text-gray-300" />}
                                Un chiffre
                            </li>
                        </ul>

                        <button
                            type="submit"
                            disabled={loading || !passwordsMatch || password.length < 8}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                                <span className="flex items-center">
                                    Mettre à jour <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

