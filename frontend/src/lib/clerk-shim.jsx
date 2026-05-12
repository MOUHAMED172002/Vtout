import React from 'react';

// Re-exports from the new modular structure
export { AuthContext, ClerkProvider, useAuth, useUser, useClerk } from './AuthHooks';
export { SignedIn, SignedOut } from './AuthGuards';
export { SignIn, SignUp, UserButton } from './AuthComponents';
