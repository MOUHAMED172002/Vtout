import React from 'react';
import { AuthUI, UserDropdown } from './AuthUI';

// Direct re-exports are more stable for bundlers
export { AuthContext, ClerkProvider, useAuth, useUser, useClerk } from './AuthHooks';
export { SignedIn, SignedOut } from './AuthGuards';

export const SignIn = (props) => <AuthUI mode="signIn" {...props} />;
export const SignUp = (props) => <AuthUI mode="signUp" {...props} />;
export const UserButton = (props) => <UserDropdown {...props} />;
