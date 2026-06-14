import React, { useState } from 'react';
import { useAuth } from './AuthHooks';
import { authClient } from './auth-client';

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
                <div className="absolute right-0 mt-2 w-56 bg-base-100/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95">
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
                                        className="w-full text-left px-2 py-1.5 text-xs font-bold text-base-content/70 hover:bg-base-200 dark:hover:bg-neutral/20 rounded-lg transition-colors"
                                    >
                                        🛡️ Administration
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="px-2 py-1.5 text-[10px] font-bold text-base-content/40 italic">Aucun autre rôle actif</p>
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
