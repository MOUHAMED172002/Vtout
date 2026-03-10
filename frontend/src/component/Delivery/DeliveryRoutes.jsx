import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DeliveryDashboard from "./DeliveryDashboard";
import DeliveryPolicies from "./DeliveryPolicies";
import { useProfile } from "../context/useProfile";

export default function DeliveryRoutes() {
    const { user, loading } = useProfile();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    // Protection: Only allow livreur and admin
    if (!user || (user.role !== 'livreur' && user.role !== 'admin')) {
        return <Navigate to="/" replace />;
    }

    return (
        <Routes>
            <Route index element={<DeliveryDashboard />} />
            <Route path="policies" element={<DeliveryPolicies />} />
            {/* Potential sub-routes: history, profile, earnings */}
        </Routes>
    );
}
