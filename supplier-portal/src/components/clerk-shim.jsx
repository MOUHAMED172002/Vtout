import React, { createContext, useContext, useEffect } from 'react';
import { createAuthClient } from 'better-auth/react';
import { AuthUI, UserDropdown } from './AuthUI';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:3000';

export const authClient = createAuthClient({
    baseURL: API_BASE_URL,
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
    
    const getToken = React.useCallback(async () => {
        if (!session) return null;
        return session.id;
    }, [session?.id]);

    return {
        isLoaded,
        isSignedIn: !!session,
        userId: user?.id || null,
        role: user?.role || 'user',
        sessionId: session?.id || null,
        getToken,
        signOut: async () => await authClient.signOut(),
    };
};

export const useUser = () => {
    const { user, isLoaded } = useContext(AuthContext);

    const clerkUser = user ? {
        id: user.id,
        fullName: user.name,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        primaryEmailAddress: { emailAddress: user.email },
        imageUrl: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}`,
        publicMetadata: { role: user.role }
    } : null;

    return {
        isLoaded,
        isSignedIn: !!user,
        user: clerkUser
    };
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

export const SignIn = (props) => <AuthUI mode="signIn" {...props} />;
export const SignUp = (props) => <AuthUI mode="signUp" {...props} />;
export const UserButton = () => <UserDropdown />;
