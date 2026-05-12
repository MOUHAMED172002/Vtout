import React from 'react';
import { AuthUI, UserDropdown } from './AuthUI';

export const SignIn = (props) => <AuthUI mode="signIn" {...props} />;
export const SignUp = (props) => <AuthUI mode="signUp" {...props} />;
export const UserButton = (props) => <UserDropdown {...props} />;
