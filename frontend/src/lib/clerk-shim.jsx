import React from 'react';
import { 
    AuthContext, 
    ClerkProvider, 
    useAuth, 
    useUser, 
    useClerk
} from './AuthHooks';
import { SignedIn, SignedOut } from './AuthGuards';

import { AuthUI, UserDropdown } from './AuthUI';

export const SignIn = (props) => <AuthUI mode="signIn" {...props} />;
export const SignUp = (props) => <AuthUI mode="signUp" {...props} />;
export const UserButton = (props) => <UserDropdown {...props} />;

export { 
    AuthContext, 
    ClerkProvider, 
    useAuth, 
    useUser, 
    useClerk, 
    SignedIn, 
    SignedOut 
};
