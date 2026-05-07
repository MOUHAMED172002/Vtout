
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { notificationService } from '../../services/notificationService';
import { Truck, MapPin, User } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons using Lucide
const createCustomIcon = (iconComponent, color) => {
    const iconMarkup = renderToStaticMarkup(
        <div style={{ color: color, backgroundColor: 'white', padding: '5px', borderRadius: '50%', border: `2px solid ${color}`, display: 'flex' }}>
            {iconComponent}
        </div>
    );
    return L.divIcon({
        html: iconMarkup,
        className: 'custom-leaflet-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

const riderIcon = createCustomIcon(<Truck size={20} />, '#3b82f6'); // Blue
const customerIcon = createCustomIcon(<User size={20} />, '#ef4444'); // Red
const supplierIcon = createCustomIcon(<MapPin size={20} />, '#10b981'); // Green

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function OrderTrackingMap({ orderId, customerPos, supplierPos }) {
    const [riderPos, setRiderPos] = useState(null);

    useEffect(() => {
        // Listen for rider location updates via socket
        const handleLocationUpdate = (data) => {
            if (data.orderId === orderId && data.lat && data.lng) {
                setRiderPos([data.lat, data.lng]);
            }
        };

        notificationService.on(`order_update_${orderId}`, handleLocationUpdate);

        return () => {
            notificationService.off(`order_update_${orderId}`, handleLocationUpdate);
        };
    }, [orderId]);

    const center = customerPos || supplierPos || [6.3667, 2.4333]; // Default to Cotonou

    return (
        <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {customerPos && (
                    <Marker position={customerPos} icon={customerIcon}>
                        <Popup>Votre position de livraison</Popup>
                    </Marker>
                )}

                {supplierPos && (
                    <Marker position={supplierPos} icon={supplierIcon}>
                        <Popup>Boutique du fournisseur</Popup>
                    </Marker>
                )}

                {riderPos && (
                    <Marker position={riderPos} icon={riderIcon}>
                        <Popup>Le livreur est ici</Popup>
                    </Marker>
                )}
            </MapContainer>
            
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 shadow-lg text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Légende : 
                <span className="ml-2 inline-flex items-center gap-1 text-blue-500"><div className="w-2 h-2 bg-blue-500 rounded-full"/> Livreur</span>
                <span className="ml-2 inline-flex items-center gap-1 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full"/> Vous</span>
            </div>
        </div>
    );
}
