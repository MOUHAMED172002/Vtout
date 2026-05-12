import React from 'react';
import { AuthUI } from './AuthUI';
import { UserDropdown } from './UserDropdown';

export const SignIn = (props) => <AuthUI mode="signIn" {...props} />;
export const SignUp = (props) => <AuthUI mode="signUp" {...props} />;
export const UserButton = (props) => <UserDropdown {...props} />;
