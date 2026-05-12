import React from 'react';
import { 
    AuthContext, 
    ClerkProvider, 
    useAuth, 
    useUser, 
    useClerk, 
    SignedIn, 
    SignedOut 
} from './AuthHooks';

import { AuthUI, UserDropdown } from './AuthUI';

export { 
    AuthContext, 
    ClerkProvider, 
    useAuth, 
    useUser, 
    useClerk, 
    SignedIn, 
    SignedOut 
};

export const SignIn = (props) => <AuthUI mode="signIn" {...props} />;
export const SignUp = (props) => <AuthUI mode="signUp" {...props} />;
export const UserButton = (props) => <UserDropdown {...props} />;
