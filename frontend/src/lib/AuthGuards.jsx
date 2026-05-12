import React from 'react';
import { useAuth } from './AuthHooks';

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
