import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from './lib/AuthHooks';
import { CartProvider } from './component/context/CartContext';
import { ProfileProvider } from './component/context/useProfile';
import { ConfigProvider } from './component/context/ConfigContext';
import { ThemeProvider } from './component/context/ThemeContext';

export const Providers = ({ children }) => {
    return (
        <HelmetProvider>
            <ClerkProvider>
                <ConfigProvider>
                    <ProfileProvider>
                        <ThemeProvider>
                            <CartProvider>
                                {children}
                                <Toaster position="top-center" reverseOrder={false} />
                            </CartProvider>
                        </ThemeProvider>
                    </ProfileProvider>
                </ConfigProvider>
            </ClerkProvider>
        </HelmetProvider>
    );
};
