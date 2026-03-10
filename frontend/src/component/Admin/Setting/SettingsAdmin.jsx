import React from "react";
import StoreSettings from "../Setting/StoreSettings";
import PaymentSettings from "../Setting/PaymentSettings";
import ShippingSettings from "../Setting/ShippingSettings";
import AdminAccountSettings from "../Setting/AdminAccountSettings";
import NotificationsSettings from "../Setting/NotificationsSettings";

/**
 * SettingsAdmin - wrapper simple pour différentes sections de configuration.
 * Attention: ces composants sont des formulaires front-end — il faudra stocker les réglages soit dans une table 'settings',
 * soit via un endpoint backend / storage.
 */
export default function SettingsAdmin() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StoreSettings />
        <PaymentSettings />
        <ShippingSettings />
        <AdminAccountSettings />
        <NotificationsSettings />
      </div>
    </div>
  );
}