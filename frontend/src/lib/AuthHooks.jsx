import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authClient } from './auth-client';
import api from '../services/api';

export const AuthContext = createContext({
    session: null,
    user: null,
    profile: null,
    isLoaded: false,
});

export const ClerkProvider = ({ children }) => {
    const { data, isPending } = authClient.useSession();
    const [profile, setProfile] = React.useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (data?.session) {
                try {
                    const response = await api.get('/profiles/me', {
                        headers: {
                            'Authorization': `Bearer ${data.session.id}`
                        }
                    });
                    if (response.data) {
                        setProfile(response.data);
                    } else {
                        setProfile({ role: 'user' });
                    }
                } catch (err) {
                    console.error("Failed to fetch enriched profile:", err);
                    setProfile({ role: 'user' });
                }
            } else {
                setProfile(null);
            }
        };

        fetchProfile();
    }, [data?.session]);

    return (
        <AuthContext.Provider value={{
            session: data?.session || null,
            user: data?.user || null,
            profile: profile,
            isLoaded: !isPending
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const { session, user, profile, isLoaded } = useContext(AuthContext);

    const getToken = useCallback(async () => session?.id, [session?.id]);
    const signOut = useCallback(async () => await authClient.signOut(), []);

    const authObject = useMemo(() => ({
        isLoaded: isLoaded && (!!session ? !!profile : true),
        isSignedIn: !!session,
        userId: user?.id || null,
        role: profile?.role || user?.role || 'user',
        isSupplier: !!profile?.isSupplier || !!profile?.Supplier,
        isDelivery: !!profile?.isDelivery || !!profile?.DeliveryPerson,
        isAdmin: !!profile?.isAdmin || profile?.role === 'admin',
        sessionId: session?.id || null,
        getToken,
        signOut,
    }), [isLoaded, session, user?.id, profile, getToken, signOut]);

    return authObject;
};

export const useUser = () => {
    const { user, profile, isLoaded } = useContext(AuthContext);

    const clerkUser = useMemo(() => {
        return user ? {
            id: user.id,
            fullName: profile?.fullname || user.name,
            firstName: (profile?.fullname || user.name)?.split(' ')[0] || '',
            lastName: (profile?.fullname || user.name)?.split(' ').slice(1).join(' ') || '',
            primaryEmailAddress: { emailAddress: user.email },
            imageUrl: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`,
            publicMetadata: { 
                role: profile?.role || user.role,
                isSupplier: !!profile?.isSupplier,
                isDelivery: !!profile?.isDelivery,
                isAdmin: !!profile?.isAdmin
            }
        } : null;
    }, [user, profile]);

    const userObject = useMemo(() => ({
        isLoaded,
        isSignedIn: !!user,
        user: clerkUser
    }), [isLoaded, user, clerkUser]);

    return userObject;
};

export const useClerk = () => {
    return {
        signOut: async () => await authClient.signOut(),
        openSignIn: () => window.location.href = '/login',
    };
};

