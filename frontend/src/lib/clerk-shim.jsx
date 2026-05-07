import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { createAuthClient } from 'better-auth/react';
import { AuthUI, UserDropdown } from './AuthUI';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (API_BASE_URL.startsWith('/')) {
    API_BASE_URL = window.location.origin + API_BASE_URL;
}

// console.log("[clerk-shim] Using API_BASE_URL:", API_BASE_URL);

export const authClient = createAuthClient({
    baseURL: API_BASE_URL + '/auth',
    plugins: []
});

const AuthContext = createContext({
    session: null,
    user: null,
    profile: null,
    isLoaded: false,
});

export const ClerkProvider = ({ children }) => {
    const { data, isPending } = authClient.useSession();
    const [profile, setProfile] = React.useState(null);

    // Fetch enriched profile from our API when session is active
    useEffect(() => {
        const fetchProfile = async () => {
            if (data?.session) {
                try {
                    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
                        headers: {
                            'Authorization': `Bearer ${data.session.id}`
                        }
                    });
                    if (response.ok) {
                        const profileData = await response.json();
                        setProfile(profileData);
                    } else {
                        // Fallback to basic user profile if DB fetch fails
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

export const SignedIn = ({ children }) => {
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded || !isSignedIn) return null;
    return <>{children}</>;
};

export const SignedOut = ({ children }) => {
    const { isSignedIn, isLoaded } = useAuth();
    if (!isLoaded || isSignedIn) return null;
    return <>{children}</>;
};

export const SignIn = () => <AuthUI mode="signIn" />;
export const SignUp = () => <AuthUI mode="signUp" />;
export const UserButton = () => <UserDropdown />;
