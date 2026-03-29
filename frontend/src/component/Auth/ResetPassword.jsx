import React, { useState } from 'react';
import { authClient } from '../../lib/clerk-shim';
import { Lock, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Better Auth retrieves the token directly from ?token=... in URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authClient.resetPassword({ newPassword: password });
            if (res.error) {
                toast.error(res.error.message || "Erreur de réinitialisation");
            } else {
                toast.success('Mot de passe mis à jour avec succès !');
                setTimeout(() => {
                    window.location.href = '/login';
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
                            Veuillez définir votre nouveau mot de passe sécurisé.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                                placeholder="Nouveau mot de passe"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-70"
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
