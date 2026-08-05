import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../User/DashboardLayout";
import HomeCards from "../User/HomeCards";
import OrdersList from "./../User/OrdersList";
import OrderDetail from "../User/OrderDetail";
import InvoicesList from "../User/InvoicesList";
import AddressesManager from "../User/AddresseManager";
import CartPage from "../../component/context/CartPage";
import Favorites from "../User/Favorites";

// import ReturnsManagers from "../User/ReturnsManagers";
import ShipmentsTimeline from "../User/ShipmentsTimeline";
import PaymentsHistory from "../User/PaymentsHistory";
import ProfileSettings from "../User/ProfileSettings";
import SessionsManagers from "../User/SessionsManagers";
import ReviewsManager from "../User/ReviewsManager";
import CouponsPannel from "../User/CouponsPannel";
import UserWallet from "../User/UserWallet";
import ReferralPage from "../User/ReferralPage";

/**
 * DashboardRoutes: import into your main router.
 *
 * Example:
 * <Route path="/dashboard/*" element={<DashboardLayout/>}>
 *   <Route index element={<HomeCards/>} />
 *   ...
 * </Route>
 */

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<HomeCards />} />
        <Route path="orders" element={<OrdersList />} />
        <Route path="orders/:orderId/reviews" element={<ReviewsManager />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="addresses" element={<AddressesManager />} />
        <Route path="shipments" element={<ShipmentsTimeline />} />
        <Route path="payments" element={<PaymentsHistory />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="sessions" element={<SessionsManagers />} />
        <Route path="wallet" element={<UserWallet />} />
        <Route path="referral" element={<ReferralPage />} />
      </Route>
    </Routes>
  );
}