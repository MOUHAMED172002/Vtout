/**
 * MapboxPicker - Composant de sélection de position sur Mapbox
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Search, X, Check, Navigation2, Loader2, Target, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
const BENIN_CENTER = { lat: 6.3654, lng: 2.4183, zoom: 12 };

// Helper to fix Lat/Lng vs Lng/Lat issues in center
const MAP_CENTER = [BENIN_CENTER.lng, BENIN_CENTER.lat];

const MAP_STYLES = {
    streets: "mapbox://styles/mapbox/streets-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12"
};

export default function MapboxPicker({
    onLocationSelect,
    label = "Pointer ma position sur la carte",
    readOnly = false,
    existingLat = null,
    existingLng = null,
    inline = false,
}) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [open, setOpen] = useState(inline);
    const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.streets);
    const [position, setPosition] = useState(
        existingLat && existingLng ? { lat: existingLat, lng: existingLng } : null
    );
    const [resolvedAddress, setResolvedAddress] = useState("");
    const [resolving, setResolving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Initialize map
    useEffect(() => {
        if (!open || mapRef.current || !mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: currentStyle,
            center: position ? [position.lng, position.lat] : MAP_CENTER,
            zoom: position ? 16 : BENIN_CENTER.zoom,
            pitch: 45,
            antialias: true
        });

        mapRef.current = map;

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Click handler
        map.on("click", (e) => {
            if (readOnly) return;
            const { lng, lat } = e.lngLat;
            handleSelectLocation(lat, lng);
        });

        // Add existing marker
        if (position) {
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.color = '#FE4334';

            markerRef.current = new mapboxgl.Marker({ color: "#FE4334" })
                .setLngLat([position.lng, position.lat])
                .addTo(map);
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [open]);

    // Update style
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setStyle(currentStyle);
        }
    }, [currentStyle]);

    const handleSelectLocation = useCallback(async (lat, lng) => {
        setPosition({ lat, lng });

        // Update marker
        if (mapRef.current) {
            if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
            } else {
                markerRef.current = new mapboxgl.Marker({ color: "#FE4334" })
                    .setLngLat([lng, lat])
                    .addTo(mapRef.current);
            }

            mapRef.current.flyTo({
                center: [lng, lat],
                speed: 0.8,
                curve: 1,
                zoom: 16
            });
        }

        setResolving(true);
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,neighborhood,locality,place,district,region&limit=1`
            );
            const data = await res.json();
            const feature = data.features?.[0];
            const addr = feature?.place_name || "";
            setResolvedAddress(addr);

            if (onLocationSelect) {
                const context = feature?.context || [];

                // Trying to extract hierarchy for Benin
                // neighborhood (quartier), place (commune/ville), region (departement)
                const quartier = feature?.text || context.find(c => c.id.startsWith('neighborhood'))?.text || "";
                const commune = context.find(c => c.id.startsWith('place'))?.text || "";
                const departement = context.find(c => c.id.startsWith('region'))?.text || "";

                onLocationSelect({
                    lat,
                    lng,
                    formattedAddress: addr,
                    quartier_label: quartier,
                    commune_label: commune,
                    departement_label: departement,
                    address_line: addr
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setResolving(false);
        }
    }, [onLocationSelect]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=BJ&limit=5`
            );
            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSuggestionClick = (feature) => {
        const [lng, lat] = feature.center;
        handleSelectLocation(lat, lng);
        setSuggestions([]);
        setSearchQuery(feature.place_name);
    };

    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("votre_clef")) {
        return (
            <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 text-slate-600 space-y-2">
                <p className="font-black text-xs flex items-center gap-2 text-primary">
                    <MapPin size={14} /> Mapbox non configuré
                </p>
                <p className="text-[10px] font-bold">Veuillez vérifier votre token Mapbox.</p>
            </div>
        );
    }

    const MapView = (
        <div className={`relative flex flex-col w-full ${inline ? 'h-[60vh] md:h-[500px] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl' : 'h-full flex-1'}`}>
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

            {/* Overlay Controls */}
            <div className="absolute top-6 left-6 right-6 flex flex-col gap-4 pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <div className="flex-1 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un quartier, une ville..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && suggestions.length > 0) {
                                    handleSuggestionClick(suggestions[0]);
                                }
                            }}
                            className="w-full pl-14 pr-6 py-4 bg-white/95 backdrop-blur-md border-none rounded-2xl text-sm font-bold text-slate-900 shadow-2xl focus:ring-4 focus:ring-primary/20 transition-all"
                        />
                        <AnimatePresence>
                            {suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white overflow-hidden z-[100]"
                                >
                                    {suggestions.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => handleSuggestionClick(f)}
                                            className="w-full text-left px-6 py-4 text-sm font-bold text-slate-700 hover:bg-primary/5 hover:text-primary flex items-start gap-4 border-b border-slate-50 last:border-0 transition-colors"
                                        >
                                            <MapPin size={16} className="mt-1 text-primary shrink-0" />
                                            <span>{f.place_name}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => setCurrentStyle(currentStyle === MAP_STYLES.streets ? MAP_STYLES.satellite : MAP_STYLES.streets)}
                        className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white text-slate-900 hover:bg-primary hover:text-white transition-all pointer-events-auto"
                    >
                        <Layers size={20} />
                    </button>
                </div>
            </div>

            {!position && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full backdrop-blur-xl pointer-events-none shadow-2xl z-10 border border-white/20">
                    Cliquez sur la carte pour pointer votre porte
                </div>
            )}

            {/* Footer Location Info (Inline) */}
            {inline && (
                <div className="absolute bottom-6 left-6 right-6 p-4 md:p-5 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${position ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                            <MapPin size={22} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Position sélectionnée</p>
                            <p className="text-xs md:text-sm font-bold text-slate-900 truncate">
                                {resolving ? "Analyse..." : (resolvedAddress || "Veuillez choisir un point")}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (inline) return MapView;

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`w-full flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all ${position
                    ? "border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5"
                    : "border-dashed border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/40"
                    }`}
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${position ? 'bg-primary text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                    <MapPin size={28} />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest mb-1.5">{position ? "Position définie ✓" : label}</p>
                    <p className="text-sm font-bold text-slate-700 line-clamp-1">
                        {resolving ? "Recherche..." : (resolvedAddress || "Ouvrir la carte de précision")}
                    </p>
                </div>
                <Navigation2 size={20} className="text-slate-300" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="px-10 py-8 border-b flex items-center justify-between bg-white relative z-20">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <Target size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Localisation Précise</h3>
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">Utilisez le mode satellite pour plus de précision</p>
                                    </div>
                                </div>
                                <button onClick={() => setOpen(false)} className="w-14 h-14 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-full flex items-center justify-center transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 relative">
                                {MapView}
                            </div>

                            <div className="px-10 py-8 bg-slate-50 border-t flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                                        <Navigation2 size={28} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Point sélectionné</p>
                                        <p className="text-lg font-black text-slate-900 truncate">
                                            {resolving ? "Analyse du lieu..." : (resolvedAddress || "Choisissez un point sur la carte")}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    disabled={!position || resolving}
                                    className="w-full md:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[.2em] text-[10px] hover:bg-slate-900 hover:-translate-y-1 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    Valider cette position
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
