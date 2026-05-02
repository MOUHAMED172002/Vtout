import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { createAuthClient } from 'better-auth/react';
import { AuthUI, UserDropdown } from './AuthUI';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
if (API_BASE_URL.startsWith('/')) {
    API_BASE_URL = window.location.origin + API_BASE_URL;
}

console.log("[clerk-shim] Using API_BASE_URL:", API_BASE_URL);

export const authClient = createAuthClient({
    baseURL: API_BASE_URL + '/auth',
    plugins: []
});

const AuthContext = createContext({
    session: null,
    user: null,
    isLoaded: false,
});

export const ClerkProvider = ({ children }) => {
    const { data, isPending } = authClient.useSession();

    // Expose global so debugging keeps working if needed
    useEffect(() => {
        window.BetterAuthSession = data;
    }, [data]);

    return (
        <AuthContext.Provider value={{
            session: data?.session || null,
            user: data?.user || null,
            isLoaded: !isPending
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const { session, user, isLoaded } = useContext(AuthContext);

    const getToken = useCallback(async () => session?.id, [session?.id]);
    const signOut = useCallback(async () => await authClient.signOut(), []);

    const authObject = useMemo(() => ({
        isLoaded,
        isSignedIn: !!session,
        userId: user?.id || null,
        sessionId: session?.id || null,
        getToken,
        signOut,
    }), [isLoaded, session, user?.id, getToken, signOut]);

    return authObject;
};

export const useUser = () => {
    const { user, isLoaded } = useContext(AuthContext);

    const clerkUser = useMemo(() => {
        return user ? {
            id: user.id,
            fullName: user.name,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            primaryEmailAddress: { emailAddress: user.email },
            imageUrl: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`,
            publicMetadata: { role: user.role }
        } : null;
    }, [user]);

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
