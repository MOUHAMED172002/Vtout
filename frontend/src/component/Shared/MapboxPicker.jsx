/**
 * MapboxPicker - Composant de sélection de position sur Mapbox
 */

import React, { useState, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Search, X, Check, Navigation2, Loader2, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
const BENIN_CENTER = { latitude: 6.3654, longitude: 2.4183, zoom: 12 };

export default function MapboxPicker({
    onLocationSelect,
    label = "Pointer ma position sur la carte",
    readOnly = false,
    existingLat = null,
    existingLng = null,
}) {
    const [open, setOpen] = useState(false);
    const [viewState, setViewState] = useState({
        latitude: existingLat || BENIN_CENTER.latitude,
        longitude: existingLng || BENIN_CENTER.longitude,
        zoom: existingLat ? 15 : BENIN_CENTER.zoom
    });

    const [position, setPosition] = useState(
        existingLat && existingLng ? { lat: existingLat, lng: existingLng } : null
    );
    const [resolvedAddress, setResolvedAddress] = useState("");
    const [resolving, setResolving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const noKey = !MAPBOX_TOKEN || MAPBOX_TOKEN.includes("votre_clef");

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

    const reverseGeocode = useCallback(async (lat, lng) => {
        setResolving(true);
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=fr&limit=5`
            );
            const data = await res.json();
            const feature = data.features?.[0];
            const addr = feature?.place_name || "";
            setResolvedAddress(addr);

            // Extract detailed components
            const context = feature?.context || [];

            // Mapbox contexts for Benin: 
            // - region (Département)
            // - place (Commune)
            // - neighborhood/locality (Quartier)
            const departement = context.find(c => c.id.startsWith('region'))?.text || "";
            const commune = context.find(c => c.id.startsWith('place'))?.text || "";
            const quartier = context.find(c => c.id.startsWith('neighborhood') || c.id.startsWith('locality'))?.text || feature.text || "";

            if (onLocationSelect) {
                onLocationSelect({
                    lat,
                    lng,
                    formattedAddress: addr,
                    departement_label: departement,
                    commune_label: commune,
                    quartier_label: quartier
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setResolving(false);
        }
    }, [onLocationSelect]);

    const handleMapClick = (e) => {
        if (readOnly) return;
        const { lng, lat } = e.lngLat;
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const handleSuggestionClick = (feature) => {
        const [lng, lat] = feature.center;
        const addr = feature.place_name;

        setPosition({ lat, lng });
        setResolvedAddress(addr);
        setViewState({ ...viewState, latitude: lat, longitude: lng, zoom: 16 });
        setSuggestions([]);
        setSearchQuery(addr);

        if (onLocationSelect) {
            const city = feature.context?.find(c => c.id.startsWith('place'))?.text || "";
            onLocationSelect({ lat, lng, formattedAddress: addr, city });
        }
    };

    const handleConfirm = () => {
        setOpen(false);
    };

    if (noKey) {
        return (
            <div className="p-5 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 text-base-content/70 space-y-2">
                <p className="font-black text-xs flex items-center gap-2 text-primary">
                    <MapPin size={14} /> Mapbox non configuré
                </p>
                <p className="text-[10px] font-bold">
                    Veuillez ajouter votre jeton Mapbox dans le fichier <code className="bg-base-100 px-1 rounded">.env</code>.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !readOnly && setOpen(true)}
                className={`w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${position
                    ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5"
                    : "border-dashed border-base-300 bg-base-200 text-base-content/50 hover:border-primary/40"
                    }`}
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${position ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-base-300 text-base-content/40'}`}>
                    <MapPin size={22} />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                        {position ? "Position de livraison définie ✓" : label}
                    </p>
                    {resolving ? (
                        <p className="text-[11px] font-bold text-base-content/40 flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" /> Recherche de l'adresse...
                        </p>
                    ) : resolvedAddress ? (
                        <p className="text-[11px] font-bold text-base-content/80 line-clamp-1">{resolvedAddress}</p>
                    ) : position ? (
                        <p className="text-[11px] font-bold text-base-content/40">Coordonnées: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}</p>
                    ) : (
                        <p className="text-[11px] font-bold text-base-content/30">Cliquez pour ouvrir la carte</p>
                    )}
                </div>
                {!readOnly && <Navigation2 size={16} className="text-base-content/30" />}
            </button>

            {/* Modal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-neutral/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-base-100 w-full max-w-4xl h-[90vh] md:h-auto md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b flex items-center justify-between bg-base-100 relative z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-base-content tracking-tight">Où vous livrer ?</h3>
                                        <p className="text-xs text-base-content/40 font-bold">Déplacez le marqueur ou recherchez votre lieu</p>
                                    </div>
                                </div>
                                <button onClick={() => setOpen(false)} className="w-12 h-12 bg-base-200 hover:bg-base-300 rounded-full flex items-center justify-center transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search Component */}
                            <div className="px-8 py-4 bg-base-200 border-b relative z-10">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Saisissez votre quartier, rue ou lieu..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-base-100 border-none rounded-2xl text-sm font-bold text-base-content shadow-sm focus:ring-2 focus:ring-primary/20"
                                    />
                                    <AnimatePresence>
                                        {suggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden"
                                            >
                                                {suggestions.map((f, i) => (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => handleSuggestionClick(f)}
                                                        className="w-full text-left px-6 py-4 text-sm font-bold text-base-content/80 hover:bg-primary/5 hover:text-primary flex items-start gap-3 border-b border-base-200 last:border-0 transition-colors"
                                                    >
                                                        <MapPin size={16} className="mt-0.5 text-primary shrink-0" />
                                                        <span>{f.place_name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Map Content */}
                            <div className="flex-1 relative min-h-[400px]">
                                <Map
                                    {...viewState}
                                    onMove={evt => setViewState(evt.viewState)}
                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                    mapboxAccessToken={MAPBOX_TOKEN}
                                    onClick={handleMapClick}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <NavigationControl position="top-right" />
                                    {position && (
                                        <Marker longitude={position.lng} latitude={position.lat} color="#FE4334" />
                                    )}
                                </Map>
                                {!position && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral/80 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-full backdrop-blur-md pointer-events-none shadow-2xl">
                                        Cliquez sur la carte pour définir le point de livraison
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-6 bg-base-100 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-0.5">Lieu de livraison sélectionné</p>
                                        <p className="text-sm font-bold text-base-content truncate">
                                            {resolving ? "Recherche en cours..." : (resolvedAddress || "Veuillez choisir un point sur la carte")}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!position || resolving}
                                    className="w-full md:w-auto px-12 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    Valider ce point de livraison
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
