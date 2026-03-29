import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Search, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Fix Leaflet marker icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const BENIN_CENTER = [6.3654, 2.4183]; // Cotonou

// Component to handle map clicks and moving the marker
function LocationMarker({ position, setPosition, onLocationChange }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            onLocationChange(lat, lng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

// Component to fly the map to a new position
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 16);
        }
    }, [center, zoom, map]);
    return null;
}

export default function UnifiedLocationPicker({ 
    onLocationSelect, 
    initialLat = null, 
    initialLng = null,
    label = "Choisir une position sur la carte"
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(initialLat && initialLng ? [initialLat, initialLng] : null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [mapCenter, setMapCenter] = useState(initialLat && initialLng ? [initialLat, initialLng] : BENIN_CENTER);

    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            const formatted = data.display_name;
            setAddress(formatted);
            
            if (onLocationSelect) {
                onLocationSelect({
                    lat,
                    lng,
                    formattedAddress: formatted,
                    raw: data.address
                });
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetCurrentPosition = () => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = [latitude, longitude];
                setPosition(newPos);
                setMapCenter(newPos);
                reverseGeocode(latitude, longitude);
            },
            (err) => {
                console.error(err);
                alert("Impossible d'obtenir votre position.");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bj&limit=5`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const selectSuggestion = (s) => {
        const lat = parseFloat(s.lat);
        const lng = parseFloat(s.lon);
        const newPos = [lat, lng];
        setPosition(newPos);
        setMapCenter(newPos);
        setAddress(s.display_name);
        setSuggestions([]);
        setSearchQuery(s.display_name);
        
        if (onLocationSelect) {
            onLocationSelect({
                lat,
                lng,
                formattedAddress: s.display_name,
                raw: s.address
            });
        }
    };

    // Open/Close logic
    const toggleMap = () => setOpen(!open);

    return (
        <div className="w-full">
            {/* Trigger Button */}
            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    onClick={toggleMap}
                    className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-3xl hover:border-primary/40 transition-all text-left shadow-sm group"
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${position ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                        <MapPin size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                            {position ? (loading ? "Calcul..." : address || "Position fixée ✓") : "Cliquer pour définir sur la carte"}
                        </p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={handleGetCurrentPosition}
                    className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-lg active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
                    Ma position actuelle
                </button>
            </div>

            {/* Modal Map */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b flex items-center justify-between bg-white z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">Localisation précise</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cliquez ou recherchez votre emplacement</p>
                                    </div>
                                </div>
                                <button onClick={() => setOpen(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Search Bar Overlay */}
                            <div className="absolute top-28 left-8 right-8 z-[1001] flex flex-col gap-2">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher une ville, un quartier..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] shadow-2xl text-sm font-bold text-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                    <AnimatePresence>
                                        {suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                                            >
                                                {suggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => selectSuggestion(s)}
                                                        className="w-full text-left px-6 py-4 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary border-b border-slate-50 last:border-0 transition-colors flex items-start gap-3"
                                                    >
                                                        <MapPin size={14} className="mt-0.5 shrink-0" />
                                                        <span>{s.display_name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Map Area */}
                            <div className="flex-1 relative z-10">
                                <MapContainer 
                                    center={mapCenter} 
                                    zoom={14} 
                                    className="w-full h-full"
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <ChangeView center={mapCenter} />
                                    <LocationMarker 
                                        position={position} 
                                        setPosition={setPosition} 
                                        onLocationChange={(lat, lng) => reverseGeocode(lat, lng)}
                                    />
                                </MapContainer>

                                {/* Center crosshair if no position */}
                                {!position && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000] flex flex-col items-center gap-4">
                                        <div className="w-1 h-10 bg-primary/40 rounded-full blur-[1px]"></div>
                                        <div className="w-10 h-1 bg-primary/40 rounded-full blur-[1px] -mt-6"></div>
                                        <div className="px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">Cliquer pour pointer</div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Info */}
                            <div className="p-8 bg-slate-50 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${address ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-slate-200 text-slate-300'}`}>
                                        <MapPin size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Adresse identifiée</p>
                                        <p className="text-sm font-black text-slate-900 truncate pr-4">
                                            {loading ? "Recherche en cours..." : (address || "Veuillez cibler votre point sur la carte")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {position && (
                                        <a 
                                            href={`https://www.google.com/maps?q=${position[0]},${position[1]}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-5 bg-white text-slate-900 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center"
                                            title="Ouvrir dans Google Maps"
                                        >
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setOpen(false)}
                                        disabled={!position || loading}
                                        className="flex-1 md:flex-none px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all disabled:opacity-50"
                                    >
                                        Valider ma position
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
