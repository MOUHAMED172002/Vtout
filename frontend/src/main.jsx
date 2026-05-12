import { StrictMode } from 'react'
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from './lib/AuthHooks';
import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from './component/Shared/ErrorBoundary.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CartProvider } from "./component/context/CartContext.jsx";
import { ProfileProvider } from "./component/context/useProfile";

import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from "./component/context/ConfigContext.jsx";
import { ThemeProvider } from "./component/context/ThemeContext.jsx";

// Importez votre clé publishable
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <HelmetProvider>
          <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            afterSignOutUrl="/"
            clerkJSVersion="5.22.0"
          >
            <ConfigProvider>
              <ProfileProvider>
                <CartProvider>
                  <ThemeProvider>
                    <Toaster position="top-right" reverseOrder={false} />
                    <App />
                  </ThemeProvider>
                </CartProvider>
              </ProfileProvider>
            </ConfigProvider>
          </ClerkProvider>
        </HelmetProvider>
      </Router>
    </ErrorBoundary>
  </StrictMode>
)
