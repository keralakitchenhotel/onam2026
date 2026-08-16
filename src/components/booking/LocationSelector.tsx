'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Edit3, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

interface LocationSelectorProps {
  address: string;
  landmark: string;
  pincode: string;
  deliveryInstructions: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  onUpdateLocation: (data: {
    address: string;
    landmark: string;
    pincode: string;
    deliveryInstructions: string;
    latitude: number | null;
    longitude: number | null;
    locationAccuracy: number | null;
  }) => void;
}

export default function LocationSelector({
  address,
  landmark,
  pincode,
  deliveryInstructions,
  latitude,
  longitude,
  locationAccuracy,
  onUpdateLocation,
}: LocationSelectorProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState<string | null>(
    latitude && longitude ? 'Location detected successfully' : null
  );

  const [localAddress, setLocalAddress] = useState(address);
  const [localLandmark, setLocalLandmark] = useState(landmark);
  const [localPincode, setLocalPincode] = useState(pincode || '673602');
  const [localInstructions, setLocalInstructions] = useState(deliveryInstructions);
  const [isEditing, setIsEditing] = useState(!address);

  // Sync local state when props change (e.g. saved address selected, GPS captured)
  useEffect(() => {
    setLocalAddress(address);
    setLocalLandmark(landmark);
    setLocalPincode(pincode || '673602');
    setLocalInstructions(deliveryInstructions);
    if (address) {
      setIsEditing(false);
    }
  }, [address, landmark, pincode, deliveryInstructions]);

  // Auto-sync text and GPS changes to parent draft to avoid requiring a separate Confirm button click
  useEffect(() => {
    onUpdateLocation({
      address: localAddress,
      landmark: localLandmark,
      pincode: localPincode,
      deliveryInstructions: localInstructions,
      latitude,
      longitude,
      locationAccuracy,
    });
  }, [localAddress, localLandmark, localPincode, localInstructions, latitude, longitude, locationAccuracy]);

  // Reset transient GPS status when the captured location clears
  useEffect(() => {
    if (!latitude && !longitude) {
      setGeoSuccess(null);
      setGeoError(null);
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    setGeoError(null);
    setGeoSuccess(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter your address manually.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy);

        setIsLocating(false);
        setGeoSuccess('Location detected successfully');

        onUpdateLocation({
          address: localAddress || 'Current GPS Location Detected',
          landmark: localLandmark,
          pincode: localPincode,
          deliveryInstructions: localInstructions,
          latitude: lat,
          longitude: lng,
          locationAccuracy: acc,
        });
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please enter your address manually below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information unavailable. Please enter address manually.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Please try again or enter address manually.');
            break;
          default:
            setGeoError('An unknown error occurred capturing location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirmLocation = () => {
    onUpdateLocation({
      address: localAddress,
      landmark: localLandmark,
      pincode: localPincode,
      deliveryInstructions: localInstructions,
      latitude,
      longitude,
      locationAccuracy,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. USE CURRENT LOCATION BUTTON */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 rounded-2xl border border-amber-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              Delivery Location Capture
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Use GPS for exact delivery coordinates (Optional) or enter your doorstep address manually.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow hover:shadow-md transition text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-emerald-100" />
                <span>📍 Use My Current Location</span>
              </>
            )}
          </button>
        </div>

        {/* GPS SUCCESS STATUS */}
        {geoSuccess && (
          <div className="mt-3 flex items-center gap-2 bg-emerald-100/80 text-emerald-900 text-xs px-3 py-2 rounded-xl border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span className="font-medium">📍 Location detected successfully</span>
            {latitude && longitude && (
              <span className="ml-auto text-[11px] text-emerald-700 opacity-80">
                (GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)} • ±{locationAccuracy || 15}m)
              </span>
            )}
          </div>
        )}

        {/* GPS ERROR STATUS */}
        {geoError && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-800 text-xs px-3 py-2 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* 2. MANUAL ADDRESS & CONFIRMATION UI */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-serif font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-600" />
            Doorstep Address & Landmark
          </h4>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Location Details
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={localAddress}
                onChange={(e) => setLocalAddress(e.target.value)}
                placeholder="House 23, Valiyaparamba, Main Road..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Landmark (Required for local delivery)
                </label>
                <input
                  type="text"
                  value={localLandmark}
                  onChange={(e) => setLocalLandmark(e.target.value)}
                  placeholder="Near main road / Opposite temple"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kerala PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localPincode}
                  onChange={(e) => setLocalPincode(e.target.value)}
                  placeholder="673602"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Instructions
              </label>
              <input
                type="text"
                value={localInstructions}
                onChange={(e) => setLocalInstructions(e.target.value)}
                placeholder="Call before arriving / Leave with gate security"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmLocation}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition text-sm shadow flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        ) : (
          /* CONFIRMED LOCATION CARD */
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-900">Address: </span>
                <span className="text-slate-700">{localAddress}</span>
              </div>
            </div>

            {localLandmark && (
              <div className="text-xs text-slate-600 pl-6">
                <span className="font-medium text-slate-800">Landmark: </span>
                {localLandmark}
              </div>
            )}

            {localInstructions && (
              <div className="text-xs text-slate-600 pl-6">
                <span className="font-medium text-slate-800">Instructions: </span>
                {localInstructions}
              </div>
            )}

            {latitude && longitude && (
              <div className="text-[11px] text-emerald-700 pl-6 font-mono">
                GPS Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
