"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import Script from "next/script";

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleMapSelectorProps {
    apiKey?: string;
    initialLat?: number | null;
    initialLng?: number | null;
    initialAddress?: string;
    onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export default function GoogleMapSelector({
    apiKey,
    initialLat,
    initialLng,
    initialAddress,
    onLocationSelect
}: GoogleMapSelectorProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // State to track if API is loaded
    const [isApiLoaded, setIsApiLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [markerInstance, setMarkerInstance] = useState<any>(null);
    const [autocompleteInstance, setAutocompleteInstance] = useState<any>(null);

    // Default center (Paraná, Entre Ríos)
    const defaultCenter = { lat: -31.73197, lng: -60.5238 };

    // Function to handle map initialization
    const initMap = () => {
        if (!mapRef.current || !window.google) return;

        const startLat = initialLat || defaultCenter.lat;
        const startLng = initialLng || defaultCenter.lng;

        const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: startLat, lng: startLng },
            zoom: initialLat ? 15 : 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }],
                },
            ],
        });

        const marker = new window.google.maps.Marker({
            position: { lat: startLat, lng: startLng },
            map: map,
            title: "Ubicación del Lote",
            draggable: true,
            animation: window.google.maps.Animation.DROP,
        });

        setMapInstance(map);
        setMarkerInstance(marker);

        // Marker drag end event
        marker.addListener("dragend", () => {
            const position = marker.getPosition();
            if (position) {
                const newLat = position.lat();
                const newLng = position.lng();

                // Reverse geocode to get address
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
                    if (status === "OK" && results && results[0]) {
                        onLocationSelect(newLat, newLng, results[0].formatted_address);
                        if (inputRef.current) {
                            inputRef.current.value = results[0].formatted_address;
                        }
                    } else {
                        // Fallback if geocoding fails, keep coordinates but maybe warn or keep old address?
                        // Ideally we still pass the coords.
                        onLocationSelect(newLat, newLng, inputRef.current?.value || "");
                    }
                });
            }
        });

        // Initialize Autocomplete
        if (inputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                fields: ["formatted_address", "geometry", "name"],
            });
            autocomplete.bindTo("bounds", map);
            setAutocompleteInstance(autocomplete);

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();

                if (!place.geometry || !place.geometry.location) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    return;
                }

                // If the place has a geometry, present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);
                }

                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || "";

                onLocationSelect(lat, lng, address);
            });
        }
    };

    const handleScriptLoad = () => {
        setIsApiLoaded(true);
    };

    // If script is already loaded (e.g. from previous navigation), init immediately
    useEffect(() => {
        if (window.google && window.google.maps && !isApiLoaded) {
            handleScriptLoad();
        }
    }, []);

    // We only need to init map once api is loaded and validation passed.
    useEffect(() => {
        if (isApiLoaded && !mapInstance) {
            initMap();
        }
    }, [isApiLoaded, mapInstance]);


    return (
        <div className="space-y-3">
            {/* Load Google Maps Script */}
            {!window.google && apiKey && (
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
                    onLoad={handleScriptLoad}
                    strategy="lazyOnload"
                />
            )}

            {/* Force Autocomplete styles */}
            <style jsx global>{`
                .pac-container {
                    z-index: 10000 !important;
                    pointer-events: auto !important;
                }
            `}</style>

            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Input
                    ref={inputRef}
                    defaultValue={initialAddress}
                    placeholder="Buscar dirección en Google Maps..."
                    className="pl-9 h-10 border-primary/20 focus-visible:ring-primary/30"
                />
                {!apiKey && (
                    <p className="text-[10px] text-destructive mt-1">
                        Falta configurar la API Key de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
                    </p>
                )}
            </div>

            <div
                ref={mapRef}
                className="w-full h-[200px] rounded-xl border border-border/60 bg-muted/10 relative overflow-hidden shadow-inner"
            >
                {!isApiLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-xs font-medium">Cargando mapa...</span>
                    </div>
                )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
                Puede arrastrar el marcador para corregir la ubicación exacta.
            </p>
        </div>
    );
}
