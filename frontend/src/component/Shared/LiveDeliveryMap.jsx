import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Truck, MapPin, Store } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { getSocket, initSocket } from "../../services/socketService";

// Helper to create custom icons from Lucide
const createIcon = (IconComponent, color, isPulsing = false) => {
    const iconHtml = renderToStaticMarkup(
        <div className={`relative ${isPulsing ? 'marker-pulse' : ''}`}>
            <div style={{ color: color, backgroundColor: 'white', padding: '6px', borderRadius: '50%', border: `2px solid ${color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <IconComponent size={24} />
            </div>
            {isPulsing && (
                <div style={{ 
                    position: 'absolute', 
                    top: '-4px', left: '-4px', right: '-4px', bottom: '-4px', 
                    border: `4px solid ${color}`, 
                    borderRadius: '50%', 
                    animation: 'pulse 2s infinite' 
                }} />
            )}
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng], 14);
    }, [lat, lng, map]);
    return null;
};

export default function LiveDeliveryMap({ orderId, clientLat, clientLng, supplierLat, supplierLng }) {
    const [driverPos, setDriverPos] = useState(null);

    useEffect(() => {
        let socket = getSocket();
        if (!socket) socket = initSocket();

        const channel = `order_update_${orderId}`;
        socket.on(channel, (data) => {
            console.log("Live position update:", data);
            setDriverPos({ lat: data.lat, lng: data.lng });
        });

        return () => {
            socket.off(channel);
        };
    }, [orderId]);

    const defaultCenter = [6.3703, 2.3912]; // Cotonou
    const center = driverPos ? [driverPos.lat, driverPos.lng] : (clientLat ? [clientLat, clientLng] : defaultCenter);

    return (
        <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative">
            <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                />
                
                {/* Client Marker */}
                {clientLat && (
                    <Marker position={[clientLat, clientLng]} icon={createIcon(MapPin, "#ef4444")}>
                        <Popup>Votre adresse de livraison</Popup>
                    </Marker>
                )}

                {/* Supplier Marker */}
                {supplierLat && (
                    <Marker position={[supplierLat, supplierLng]} icon={createIcon(Store, "#f59e0b")}>
                        <Popup>Point de retrait (Vendeur)</Popup>
                    </Marker>
                )}

                {/* Driver Marker */}
                {driverPos && (
                    <Marker position={[driverPos.lat, driverPos.lng]} icon={createIcon(Truck, "#3b82f6", true)}>
                        <Popup>Livreur en mouvement</Popup>
                    </Marker>
                )}

                <RecenterMap lat={driverPos?.lat} lng={driverPos?.lng} />
            </MapContainer>

            {/* Live Indicator */}
            <div className="absolute top-4 right-4 z-[1000] bg-base-100/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-blue-100">
                <div className={`w-2 h-2 rounded-full ${driverPos ? 'bg-emerald-500 animate-pulse' : 'bg-base-300'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content">
                    {driverPos ? "En Direct" : "En attente du signal"}
                </span>
            </div>
        </div>
    );
}
