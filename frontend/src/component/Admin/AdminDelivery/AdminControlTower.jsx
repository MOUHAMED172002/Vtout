import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { initSocket, getSocket } from "../../../services/socketService";
import { Truck, MapPin, Package, Activity } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

const createIcon = (IconComponent, color) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{ color: color, backgroundColor: 'white', padding: '5px', borderRadius: '50%', border: `2px solid ${color}`, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            <IconComponent size={20} />
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: 'custom-admin-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

export default function AdminControlTower() {
    const [activeDrivers, setActiveDrivers] = useState({});

    useEffect(() => {
        let socket = getSocket();
        if (!socket) socket = initSocket();

        socket.on('admin_driver_update', (data) => {
            // data: { driverId, lat, lng, orderId }
            setActiveDrivers(prev => ({
                ...prev,
                [data.driverId]: {
                    ...data,
                    lastSeen: new Date()
                }
            }));
        });

        return () => socket.off('admin_driver_update');
    }, []);

    const driversArray = Object.values(activeDrivers);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Tour de Contrôle.</h2>
                    <p className="text-slate-400 font-bold">Suivi en direct de toute la flotte logistique ({driversArray.length} actifs)</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-500 rounded-2xl animate-pulse">
                    <Activity size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Temps Réel</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Map */}
                <div className="xl:col-span-9 h-[600px] bg-white p-4 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                    <MapContainer center={[6.3703, 2.3912]} zoom={13} style={{ height: "100%", width: "100%", borderRadius: '2rem' }}>
                        <TileLayer
                            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                            attribution='&copy; Google Maps'
                        />
                        
                        {driversArray.map(d => (
                            <Marker key={d.driverId} position={[d.lat, d.lng]} icon={createIcon(Truck, "#3b82f6")}>
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-black text-sm">Livreur ID: {d.driverId}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Commande: {d.orderId}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Sidebar Monitor */}
                <div className="xl:col-span-3 space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">Monitor de Charly</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[550px] pr-2">
                        {driversArray.length === 0 ? (
                            <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <p className="text-xs font-bold text-slate-400">Aucun mouvement détecté</p>
                            </div>
                        ) : (
                            driversArray.map(d => (
                                <div key={d.driverId} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-all">
                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <Truck size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-900 truncate">Livreur #{d.driverId}</p>
                                        <p className="text-[10px] font-bold text-slate-400">Ord: {d.orderId?.slice(0, 8)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase">ON</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
