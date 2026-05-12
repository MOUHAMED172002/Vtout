import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from './lib/AuthHooks';
import { CartProvider } from './component/context/CartContext';
import { ProfileProvider } from './component/context/useProfile';
import { ConfigProvider } from './component/context/ConfigContext';

export const Providers = ({ children }) => {
    return (
        <HelmetProvider>
            <ClerkProvider>
                <ConfigProvider>
                    <ProfileProvider>
                        <CartProvider>
                            {children}
                            <Toaster position="top-center" reverseOrder={false} />
                        </CartProvider>
                    </ProfileProvider>
                </ConfigProvider>
            </ClerkProvider>
        </HelmetProvider>
    );
};
