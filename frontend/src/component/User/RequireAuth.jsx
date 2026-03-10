import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-vh-100">
        <div className="animate-pulse text-gray-500">Vérification en cours…</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth/connexion" replace />;
  }

  return children;
}