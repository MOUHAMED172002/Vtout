/**
 * DeliveryMapLink - Composant utilitaire qui génère des liens Google Maps
 * pour les livreurs : voir l'adresse du client, du fournisseur, et l'itinéraire entre les deux.
 *
 * Usage :
 *   <DeliveryMapLink
 *     supplierLat={6.3703}
 *     supplierLng={2.3912}
 *     supplierAddress="Cotonou Centre"
 *     clientLat={6.4000}
 *     clientLng={2.4200}
 *     clientAddress="Akpakpa, Cotonou"
 *   />
 */
import React from "react";
import { Navigation2, MapPin, ExternalLink } from "lucide-react";

export default function DeliveryMapLink({
    supplierLat,
    supplierLng,
    supplierAddress,
    clientLat,
    clientLng,
    clientAddress,
}) {
    const hasSupplier = supplierLat && supplierLng;
    const hasClient = clientLat && clientLng;

    // Direct link to client's location
    const clientMapUrl = hasClient
        ? `https://www.google.com/maps?q=${clientLat},${clientLng}`
        : clientAddress
            ? `https://www.google.com/maps/search/${encodeURIComponent(clientAddress + ", Bénin")}`
            : null;

    // Direct link to supplier's location
    const supplierMapUrl = hasSupplier
        ? `https://www.google.com/maps?q=${supplierLat},${supplierLng}`
        : supplierAddress
            ? `https://www.google.com/maps/search/${encodeURIComponent(supplierAddress + ", Bénin")}`
            : null;

    // Full route: supplier -> client
    const routeUrl =
        hasSupplier && hasClient
            ? `https://www.google.com/maps/dir/${supplierLat},${supplierLng}/${clientLat},${clientLng}`
            : hasClient && supplierAddress
                ? `https://www.google.com/maps/dir/${encodeURIComponent(supplierAddress + ", Bénin")}/${clientLat},${clientLng}`
                : hasClient
                    ? clientMapUrl
                    : null;

    if (!clientMapUrl && !supplierMapUrl) return null;

    return (
        <div className="space-y-3">
            {/* Route button (main CTA) */}
            {routeUrl && (
                <a
                    href={routeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all group font-black"
                >
                    <div className="w-10 h-10 bg-base-100/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Navigation2 size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs uppercase tracking-widest opacity-80">Itinéraire complet</p>
                        <p className="text-sm">Voir le trajet sur Google Maps</p>
                    </div>
                    <ExternalLink size={16} className="opacity-70" />
                </a>
            )}

            <div className="grid grid-cols-2 gap-3">
                {/* Supplier location */}
                {supplierMapUrl && (
                    <a
                        href={supplierMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-200 border border-base-200 rounded-2xl transition-all text-base-content/80 font-bold"
                    >
                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                            <MapPin size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-black">Fournisseur</p>
                            <p className="text-xs truncate">{supplierAddress || "Voir sur Maps"}</p>
                        </div>
                    </a>
                )}

                {/* Client location */}
                {clientMapUrl && (
                    <a
                        href={clientMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-200 border border-base-200 rounded-2xl transition-all text-base-content/80 font-bold"
                    >
                        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                            <MapPin size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-black">Client</p>
                            <p className="text-xs truncate">{clientAddress || "Voir sur Maps"}</p>
                        </div>
                    </a>
                )}
            </div>
        </div>
    );
}
