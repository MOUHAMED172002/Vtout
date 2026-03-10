/**
 * GoogleMapPicker - Composant réutilisable de sélection de position sur Google Maps
 *
 * Usage :
 *   <GoogleMapPicker
 *     onLocationSelect={({ lat, lng, address }) => console.log(lat, lng, address)}
 *     initialLat={6.3703}   // Centre du Bénin par défaut
 *     initialLng={2.3912}
 *     label="Sélectionner sur la carte"
 *   />
 *
 * Props :
 *   - onLocationSelect(obj) callback : { lat, lng, formattedAddress, city, country }
 *   - initialLat / initialLng : position initiale de la carte
 *   - label : texte affiché dans le bouton d'ouverture
 *   - readOnly : boolean, affiche juste un marqueur sans interaction
 *   - existingLat / existingLng : afficher un marqueur existant
 */

import React, { useState, useCallback, useRef } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    useMap,
} from "@vis.gl/react-google-maps";
import { MapPin, Search, X, Check, Navigation2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BENIN_CENTER = { lat: 9.3077, lng: 2.3158 };
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// ------- Inner Map component (needs useMap inside APIProvider) -------
function MapContent({ position, onMapClick, onSearchSelect }) {
    const map = useMap();
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const searchRef = useRef(null);

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (!q.trim() || q.length < 3) {
            setSuggestions([]);
            return;
        }
        setSearching(true);
        try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
                { address: `${q}, Bénin`, region: "BJ" },
                (results, status) => {
                    setSearching(false);
                    if (status === "OK" && results) {
                        setSuggestions(results.slice(0, 5));
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        } catch {
            setSearching(false);
        }
    };

    const handleSuggestionClick = (result) => {
        const lat = result.geometry.location.lat();
        const lng = result.geometry.location.lng();
        setSuggestions([]);
        setSearchQuery(result.formatted_address);
        if (map) {
            map.panTo({ lat, lng });
            map.setZoom(16);
        }
        onSearchSelect({ lat, lng, formattedAddress: result.formatted_address, result });
    };

    return (
        <div className="relative h-full w-full">
            {/* Search bar over map */}
            <div className="absolute top-4 left-4 right-4 z-10" ref={searchRef}>
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une adresse au Bénin..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 shadow-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    {searching && (
                        <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                    )}
                    {searchQuery && !searching && (
                        <button
                            onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                    <div className="mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(s)}
                                className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-primary/5 hover:text-primary flex items-start gap-3 border-b border-slate-50 last:border-0 transition-colors"
                            >
                                <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                                <span className="line-clamp-2">{s.formatted_address}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map */}
            <Map
                defaultCenter={BENIN_CENTER}
                defaultZoom={7}
                mapId="eshop-map"
                gestureHandling="greedy"
                disableDefaultUI={false}
                clickableIcons={false}
                onClick={(e) => {
                    if (e.detail?.latLng) {
                        onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
                    }
                }}
                style={{ height: "100%", width: "100%" }}
            >
                {position && (
                    <AdvancedMarker position={position}>
                        <Pin
                            background="#FF4C4C"
                            borderColor="#CC0000"
                            glyphColor="#fff"
                        />
                    </AdvancedMarker>
                )}
            </Map>

            {/* Click instruction */}
            {!position && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full backdrop-blur-sm pointer-events-none">
                    Cliquez sur la carte pour marquer la position
                </div>
            )}
        </div>
    );
}

// ------- Main exported component -------
export default function GoogleMapPicker({
    onLocationSelect,
    label = "Choisir sur Google Maps",
    readOnly = false,
    existingLat = null,
    existingLng = null,
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(
        existingLat && existingLng ? { lat: existingLat, lng: existingLng } : null
    );
    const [resolvedAddress, setResolvedAddress] = useState("");
    const [resolving, setResolving] = useState(false);

    const noKey = !MAPS_API_KEY || MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE";

    const reverseGeocode = useCallback((lat, lng) => {
        setResolving(true);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            setResolving(false);
            if (status === "OK" && results[0]) {
                const addr = results[0].formatted_address;
                setResolvedAddress(addr);
                if (onLocationSelect) {
                    const cityComp = results[0].address_components?.find(c => c.types.includes("locality"))?.long_name || "";
                    const countryComp = results[0].address_components?.find(c => c.types.includes("country"))?.long_name || "";
                    onLocationSelect({ lat, lng, formattedAddress: addr, city: cityComp, country: countryComp });
                }
            }
        });
    }, [onLocationSelect]);

    const handleMapClick = (lat, lng) => {
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const handleSearchSelect = ({ lat, lng, formattedAddress, result }) => {
        setPosition({ lat, lng });
        setResolvedAddress(formattedAddress);
        if (onLocationSelect) {
            const cityComp = result?.address_components?.find(c => c.types.includes("locality"))?.long_name || "";
            const countryComp = result?.address_components?.find(c => c.types.includes("country"))?.long_name || "";
            onLocationSelect({ lat, lng, formattedAddress, city: cityComp, country: countryComp });
        }
    };

    const handleConfirm = () => {
        setOpen(false);
    };

    if (noKey) {
        return (
            <div className="p-5 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 text-amber-800 space-y-2">
                <p className="font-black text-sm flex items-center gap-2">
                    <MapPin size={16} /> Google Maps non configuré
                </p>
                <p className="text-xs font-bold">
                    Ajoutez votre clé Google Maps dans <code className="bg-amber-100 px-1 rounded">.env</code> :{" "}
                    <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=votre_clé</code>
                </p>
                <a
                    href="https://console.cloud.google.com/google/maps-apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black text-amber-700 underline underline-offset-2"
                >
                    Obtenir une clé API →
                </a>
            </div>
        );
    }

    return (
        <APIProvider apiKey={MAPS_API_KEY}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => !readOnly && setOpen(true)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${position
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-dashed border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/40 hover:text-primary"
                    }`}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${position ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                    <MapPin size={20} />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-xs font-black uppercase tracking-widest">
                        {position ? "Position sélectionnée ✓" : label}
                    </p>
                    {resolving && (
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Loader2 size={10} className="animate-spin" /> Résolution de l'adresse...
                        </p>
                    )}
                    {resolvedAddress && !resolving && (
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5 line-clamp-1">{resolvedAddress}</p>
                    )}
                    {position && !resolvedAddress && !resolving && (
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                        </p>
                    )}
                </div>
                {!readOnly && (
                    <Navigation2 size={16} className="text-slate-400" />
                )}
            </button>

            {/* Modal overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
                        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-3xl rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Sélectionner la position</h3>
                                        <p className="text-xs text-slate-400 font-bold">Cliquez sur la carte ou recherchez une adresse</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Map */}
                            <div className="h-[420px] relative">
                                <MapContent
                                    position={position}
                                    onMapClick={handleMapClick}
                                    onSearchSelect={handleSearchSelect}
                                />
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {resolving ? (
                                        <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                            Résolution de l'adresse GPS...
                                        </p>
                                    ) : position ? (
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse détectée</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">{resolvedAddress || `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-400">Aucune position sélectionnée</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!position}
                                    className="btn btn-primary rounded-2xl h-12 px-8 font-black gap-2 disabled:opacity-40"
                                >
                                    <Check size={16} />
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </APIProvider>
    );
}
