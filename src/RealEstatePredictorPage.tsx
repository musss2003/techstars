import React, { useState, useMemo, useEffect, useRef } from "react";
import type { JSX } from "react";
import {
  Home,
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  DollarSign,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

export interface Listing {
  id: string;
  title: string;
  city: string;
  m2: number;
  floor: number;
  built: number;
  price: number;
  pricePerM2: number;
  lat?: number;
  lng?: number;
}

export interface PredictedListing extends Listing {
  predictedPrice?: number;
  predictedPricePerM2?: number;
  confidence?: number;
}

interface NewPropertyForm {
  // Location
  municipality: string;
  lat: number;
  lng: number;
  
  // Basic Info
  price: number;
  condition: string;
  propertyType: string;
  
  // Size & Structure
  numberOfRooms: number;
  squareFootage: number;
  squareFootageOfLand: number;
  numberOfBathrooms: number;
  level: number;
  
  // Features
  equipment: string;
  typeOfHeating: string;
  yearBuilt: number;
  typeOfFloor: string;
  parking: string;
  orientation: string;
  
  // Additional Features (boolean)
  hasGarage: boolean;
  hasElevator: boolean;
  hasWater: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasInternet: boolean;
  hasParkingCircle: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  isRegistered: boolean;
  hasAlarm: boolean;
  hasVideoSurveillance: boolean;
}

function PropertyMap({
  listings,
  selectedProperty,
  onSelectProperty,
  newPropertyLocation,
  onMapClick,
}: {
  listings: Listing[];
  selectedProperty: PredictedListing | null;
  onSelectProperty: (listing: Listing) => void;
  newPropertyLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const newMarkerRef = useRef<any>(null);

  const getValueRating = (
    pricePerM2: number
  ): { color: string; label: string } => {
    if (pricePerM2 < 1400)
      return { color: "#10b981", label: "Excellent Value" };
    if (pricePerM2 < 1600) return { color: "#3b82f6", label: "Good Value" };
    if (pricePerM2 < 1800) return { color: "#f59e0b", label: "Fair Value" };
    if (pricePerM2 < 2000) return { color: "#ef4444", label: "Above Market" };
    return { color: "#991b1b", label: "Overpriced" };
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.async = true;

    script.onload = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        const L = (window as any).L;

        const map = L.map(mapRef.current).setView([43.8563, 18.4131], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add click handler for map
        map.on("click", (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });

        listings.forEach((listing) => {
          if (listing.lat && listing.lng) {
            const rating = getValueRating(listing.pricePerM2);

            const icon = L.divIcon({
              className: "custom-marker",
              html: `
                <div style="
                  background-color: ${rating.color};
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const marker = L.marker([listing.lat, listing.lng], { icon }).addTo(
              map
            ).bindPopup(`
                <div style="min-width: 200px;">
                  <h4 style="font-weight: 600; margin-bottom: 8px;">${
                    listing.title
                  }</h4>
                  <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
                    ${listing.city} • ${listing.m2} m²
                  </p>
                  <p style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">
                    ${listing.price.toLocaleString()} BAM
                  </p>
                  <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
                    ${listing.pricePerM2} BAM/m²
                  </p>
                  <div style="
                    display: inline-block;
                    padding: 4px 8px;
                    background-color: ${rating.color}20;
                    color: ${rating.color};
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                  ">
                    ${rating.label}
                  </div>
                </div>
              `);

            marker.on("click", () => {
              onSelectProperty(listing);
            });

            markersRef.current.push(marker);
          }
        });

        if (listings.length > 0 && listings.some((l) => l.lat && l.lng)) {
          const bounds = L.latLngBounds(
            listings.filter((l) => l.lat && l.lng).map((l) => [l.lat!, l.lng!])
          );
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      }
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings]);

  // Handle new property marker
  useEffect(() => {
    if (mapInstanceRef.current && newPropertyLocation) {
      const L = (window as any).L;

      // Remove old marker if exists
      if (newMarkerRef.current) {
        newMarkerRef.current.remove();
      }

      // Create new marker with pulsing animation
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #8b5cf6;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 2px 12px rgba(139,92,246,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      newMarkerRef.current = L.marker(
        [newPropertyLocation.lat, newPropertyLocation.lng],
        { icon }
      )
        .addTo(mapInstanceRef.current)
        .bindPopup(
          '<div style="text-align: center; font-weight: 600;">New Property Location</div>'
        )
        .openPopup();

      mapInstanceRef.current.setView(
        [newPropertyLocation.lat, newPropertyLocation.lng],
        14,
        {
          animate: true,
        }
      );
    }
  }, [newPropertyLocation]);

  useEffect(() => {
    if (
      mapInstanceRef.current &&
      selectedProperty &&
      selectedProperty.lat &&
      selectedProperty.lng
    ) {
      mapInstanceRef.current.setView(
        [selectedProperty.lat, selectedProperty.lng],
        14,
        {
          animate: true,
        }
      );
    }
  }, [selectedProperty]);

  return (
    <div
      ref={mapRef}
      className="h-96 rounded-lg overflow-hidden border border-slate-200 cursor-crosshair"
      style={{ zIndex: 1 }}
    />
  );
}

// Municipalities in Canton Sarajevo
const SARAJEVO_MUNICIPALITIES = [
  "Centar",
  "Novo Sarajevo",
  "Novi Grad",
  "Stari Grad",
  "Hadžići",
  "Ilidža",
  "Ilijaš",
  "Trnovo",
  "Vogošća"
];

export default function RealEstatePricePredictorPage(): JSX.Element {
  const [selectedProperty, setSelectedProperty] =
    useState<PredictedListing | null>(null);
  const [timeToSellEstimate, setTimeToSellEstimate] = useState<number | null>(
    null
  );
  const [newPropertyLocation, setNewPropertyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [newProperty, setNewProperty] = useState<NewPropertyForm>({
    // Location
    municipality: "Centar",
    lat: 0,
    lng: 0,
    
    // Basic Info
    price: 0,
    condition: "new",
    propertyType: "apartment",
    
    // Size & Structure
    numberOfRooms: 2,
    squareFootage: 50,
    squareFootageOfLand: 0,
    numberOfBathrooms: 1,
    level: 2,
    
    // Features
    equipment: "furnished",
    typeOfHeating: "central",
    yearBuilt: 2010,
    typeOfFloor: "parquet",
    parking: "garage",
    orientation: "south",
    
    // Additional Features
    hasGarage: false,
    hasElevator: false,
    hasWater: true,
    hasElectricity: true,
    hasGas: false,
    hasInternet: true,
    hasParkingCircle: false,
    hasBalcony: false,
    hasTerrace: false,
    isRegistered: false,
    hasAlarm: false,
    hasVideoSurveillance: false,
  });
  const [estimatedPrice, setEstimatedPrice] = useState<{
    price: number;
    pricePerM2: number;
    confidence: number;
    rating: string;
  } | null>(null);

  const mockListings: Listing[] = useMemo(
    () => [
      {
        id: "p1",
        title: "1-bedroom apartment - Ilidža",
        city: "Sarajevo",
        m2: 45,
        floor: 2,
        built: 2005,
        price: 85000,
        pricePerM2: 1888,
        lat: 43.8311,
        lng: 18.3147,
      },
      {
        id: "p2",
        title: "2-bedroom - Centar",
        city: "Sarajevo",
        m2: 65,
        floor: 3,
        built: 1998,
        price: 125000,
        pricePerM2: 1923,
        lat: 43.8563,
        lng: 18.4131,
      },
      {
        id: "p3",
        title: "Studio - Ilidža (renovated)",
        city: "Sarajevo",
        m2: 28,
        floor: 1,
        built: 2010,
        price: 42000,
        pricePerM2: 1500,
        lat: 43.8289,
        lng: 18.3089,
      },
      {
        id: "p4",
        title: "3-bedroom family apartment - Novi Grad",
        city: "Doboj",
        m2: 95,
        floor: 4,
        built: 1985,
        price: 95000,
        pricePerM2: 1000,
        lat: 44.7321,
        lng: 18.087,
      },
    ],
    []
  );

  const getValueRating = (
    pricePerM2: number
  ): { color: string; label: string } => {
    if (pricePerM2 < 1400)
      return { color: "#10b981", label: "Excellent Value" };
    if (pricePerM2 < 1600) return { color: "#3b82f6", label: "Good Value" };
    if (pricePerM2 < 1800) return { color: "#f59e0b", label: "Fair Value" };
    if (pricePerM2 < 2000) return { color: "#ef4444", label: "Above Market" };
    return { color: "#991b1b", label: "Overpriced" };
  };

  const generatePrediction = React.useCallback((listing: Listing) => {
    const randomFactor = 0.9 + Math.random() * 0.3;
    const predictedPricePerM2 = Math.round(listing.pricePerM2 * randomFactor);
    const predictedPrice = predictedPricePerM2 * listing.m2;
    const confidence = Math.round(60 + Math.random() * 35);

    return { predictedPrice, predictedPricePerM2, confidence };
  }, []);

  function handlePredictPrice(listing: Listing): void {
    const { predictedPrice, predictedPricePerM2, confidence } =
      generatePrediction(listing);

    setSelectedProperty({
      ...listing,
      predictedPrice,
      predictedPricePerM2,
      confidence,
    });
  }

  function handleEstimateTimeToSell(price: number, listing: Listing): void {
    const cityMedian = 1700;
    const factor = price / (listing.m2 * cityMedian);
    const days = Math.round(7 + factor * 60 + Math.random() * 30);
    setTimeToSellEstimate(days);
  }

  function handleMapClick(lat: number, lng: number): void {
    setNewPropertyLocation({ lat, lng });
    setNewProperty((prev) => ({ ...prev, lat, lng }));
    setEstimatedPrice(null);
  }

  function handleEstimateNewProperty(): void {
    if (!newPropertyLocation) {
      alert("Please click on the map to select a location first.");
      return;
    }

    // Enhanced ML-like estimation based on all property features
    const nearbyProperties = mockListings.filter(
      (p) => p.city === "Sarajevo" && p.lat && p.lng
    );

    let basePricePerM2 = 1700; // Default base price for Sarajevo

    if (nearbyProperties.length > 0) {
      const avgPricePerM2 =
        nearbyProperties.reduce((sum, p) => sum + p.pricePerM2, 0) /
        nearbyProperties.length;
      basePricePerM2 = avgPricePerM2;
    }

    // Age factor
    const age = 2024 - newProperty.yearBuilt;
    const ageFactor = age < 5 ? 1.15 : age < 15 ? 1.05 : age < 30 ? 0.95 : 0.85;
    
    // Floor/Level factor
    const floorFactor = newProperty.level >= 1 && newProperty.level <= 4 ? 1.02 : 0.98;
    
    // Size factor
    const sizeFactor = newProperty.squareFootage < 40 ? 1.1 : newProperty.squareFootage > 100 ? 0.95 : 1.0;
    
    // Condition factor
    const conditionFactor = newProperty.condition === "new" ? 1.15 :
                           newProperty.condition === "renovated" ? 1.08 :
                           newProperty.condition === "good" ? 1.0 : 0.9;
    
    // Property type factor
    const typeFactor = newProperty.propertyType === "house" ? 1.1 :
                      newProperty.propertyType === "apartment" ? 1.0 : 0.95;
    
    // Heating factor
    const heatingFactor = newProperty.typeOfHeating === "central" ? 1.05 :
                         newProperty.typeOfHeating === "gas" ? 1.03 : 1.0;
    
    // Equipment factor
    const equipmentFactor = newProperty.equipment === "furnished" ? 1.08 :
                           newProperty.equipment === "semi-furnished" ? 1.03 : 1.0;
    
    // Orientation factor
    const orientationFactor = newProperty.orientation === "south" ? 1.03 :
                             newProperty.orientation === "east" || newProperty.orientation === "west" ? 1.0 : 0.97;
    
    // Additional features bonus
    let featureBonus = 1.0;
    if (newProperty.hasElevator) featureBonus += 0.02;
    if (newProperty.hasGarage || newProperty.hasParkingCircle) featureBonus += 0.03;
    if (newProperty.hasBalcony) featureBonus += 0.02;
    if (newProperty.hasTerrace) featureBonus += 0.03;
    if (newProperty.hasAlarm) featureBonus += 0.01;
    if (newProperty.hasVideoSurveillance) featureBonus += 0.01;
    if (newProperty.isRegistered) featureBonus += 0.02;
    
    // Calculate final price
    const estimatedPricePerM2 = Math.round(
      basePricePerM2 * ageFactor * floorFactor * sizeFactor * conditionFactor *
      typeFactor * heatingFactor * equipmentFactor * orientationFactor * featureBonus
    );
    const estimatedTotalPrice = estimatedPricePerM2 * newProperty.squareFootage;
    const confidence = Math.round(65 + Math.random() * 25);
    const rating = getValueRating(estimatedPricePerM2);

    setEstimatedPrice({
      price: estimatedTotalPrice,
      pricePerM2: estimatedPricePerM2,
      confidence,
      rating: rating.label,
    });
  }

  function handleNewPropertyChange(
    field: keyof NewPropertyForm,
    value: string | number | boolean
  ) {
    setNewProperty((prev) => ({ ...prev, [field]: value }));
    setEstimatedPrice(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  RealEstate IQ
                </h1>
                <p className="text-xs text-slate-600">
                  AI-powered pricing for Bosnia & Herzegovina
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE - Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Interactive Property Map
                </CardTitle>
                <CardDescription>
                  Click on the map to select a location for your property or
                  explore existing listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PropertyMap
                  listings={mockListings}
                  selectedProperty={selectedProperty}
                  onSelectProperty={(listing) => {
                    setSelectedProperty(listing);
                    handlePredictPrice(listing);
                    setNewPropertyLocation(null);
                    setEstimatedPrice(null);
                  }}
                  newPropertyLocation={newPropertyLocation}
                  onMapClick={handleMapClick}
                />

                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-700 mb-2">
                    Map Legend
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#10b981" }}
                      ></div>
                      <span>Excellent Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#3b82f6" }}
                      ></div>
                      <span>Good Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                      ></div>
                      <span>Fair Value</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#ef4444" }}
                      ></div>
                      <span>Above Market</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
                      <span>Your New Property</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - Forms */}
          <div className="space-y-6">
            {/* New Property Form */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Plus className="w-5 h-5" />
                  Add New Property
                </CardTitle>
                <CardDescription>
                  Click on the map to set location, then fill in details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {newPropertyLocation && (
                  <div className="p-2 bg-purple-100 rounded text-xs text-purple-900">
                    📍 Location: {newPropertyLocation.lat.toFixed(4)},{" "}
                    {newPropertyLocation.lng.toFixed(4)}
                  </div>
                )}

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {/* Location Section */}
                  <div className="space-y-3 pb-3 border-b">
                    <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h3>
                    <div>
                      <Label htmlFor="municipality" className="text-sm font-medium">
                        Municipality (Canton Sarajevo)
                      </Label>
                      <select
                        id="municipality"
                        value={newProperty.municipality}
                        onChange={(e) =>
                          handleNewPropertyChange("municipality", e.target.value)
                        }
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-white text-sm"
                      >
                        {SARAJEVO_MUNICIPALITIES.map((mun) => (
                          <option key={mun} value={mun}>{mun}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Basic Info Section */}
                  <div className="space-y-3 pb-3 border-b">
                    <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="propertyType" className="text-xs font-medium">
                          Property Type
                        </Label>
                        <select
                          id="propertyType"
                          value={newProperty.propertyType}
                          onChange={(e) =>
                            handleNewPropertyChange("propertyType", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="studio">Studio</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="condition" className="text-xs font-medium">
                          Condition
                        </Label>
                        <select
                          id="condition"
                          value={newProperty.condition}
                          onChange={(e) =>
                            handleNewPropertyChange("condition", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="new">New</option>
                          <option value="renovated">Renovated</option>
                          <option value="good">Good</option>
                          <option value="needs-renovation">Needs Renovation</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-xs font-medium">
                        Asking Price (BAM)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProperty.price}
                        onChange={(e) =>
                          handleNewPropertyChange("price", Number(e.target.value))
                        }
                        className="mt-1 text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Size & Structure Section */}
                  <div className="space-y-3 pb-3 border-b">
                    <h3 className="text-sm font-semibold text-purple-900">Size & Structure</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="squareFootage" className="text-xs font-medium">
                          Square Footage (m²)
                        </Label>
                        <Input
                          id="squareFootage"
                          type="number"
                          value={newProperty.squareFootage}
                          onChange={(e) =>
                            handleNewPropertyChange("squareFootage", Number(e.target.value))
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="squareFootageOfLand" className="text-xs font-medium">
                          Land (m²)
                        </Label>
                        <Input
                          id="squareFootageOfLand"
                          type="number"
                          value={newProperty.squareFootageOfLand}
                          onChange={(e) =>
                            handleNewPropertyChange("squareFootageOfLand", Number(e.target.value))
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numberOfRooms" className="text-xs font-medium">
                          Rooms
                        </Label>
                        <Input
                          id="numberOfRooms"
                          type="number"
                          value={newProperty.numberOfRooms}
                          onChange={(e) =>
                            handleNewPropertyChange("numberOfRooms", Number(e.target.value))
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numberOfBathrooms" className="text-xs font-medium">
                          Bathrooms
                        </Label>
                        <Input
                          id="numberOfBathrooms"
                          type="number"
                          value={newProperty.numberOfBathrooms}
                          onChange={(e) =>
                            handleNewPropertyChange("numberOfBathrooms", Number(e.target.value))
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="level" className="text-xs font-medium">
                          Level/Floor
                        </Label>
                        <Input
                          id="level"
                          type="number"
                          value={newProperty.level}
                          onChange={(e) =>
                            handleNewPropertyChange("level", Number(e.target.value))
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="yearBuilt" className="text-xs font-medium">
                          Year Built
                        </Label>
                        <Input
                          id="yearBuilt"
                          type="number"
                          value={newProperty.yearBuilt}
                          onChange={(e) =>
                            handleNewPropertyChange("yearBuilt", Number(e.target.value))
                          }
                          className="mt-1 text-sm"
                          min="1950"
                          max="2024"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="space-y-3 pb-3 border-b">
                    <h3 className="text-sm font-semibold text-purple-900">Features</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="equipment" className="text-xs font-medium">
                          Equipment
                        </Label>
                        <select
                          id="equipment"
                          value={newProperty.equipment}
                          onChange={(e) =>
                            handleNewPropertyChange("equipment", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="furnished">Furnished</option>
                          <option value="semi-furnished">Semi-Furnished</option>
                          <option value="unfurnished">Unfurnished</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="typeOfHeating" className="text-xs font-medium">
                          Heating
                        </Label>
                        <select
                          id="typeOfHeating"
                          value={newProperty.typeOfHeating}
                          onChange={(e) =>
                            handleNewPropertyChange("typeOfHeating", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="central">Central</option>
                          <option value="gas">Gas</option>
                          <option value="electric">Electric</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="typeOfFloor" className="text-xs font-medium">
                          Floor Type
                        </Label>
                        <select
                          id="typeOfFloor"
                          value={newProperty.typeOfFloor}
                          onChange={(e) =>
                            handleNewPropertyChange("typeOfFloor", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="parquet">Parquet</option>
                          <option value="tiles">Tiles</option>
                          <option value="laminate">Laminate</option>
                          <option value="marble">Marble</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="parking" className="text-xs font-medium">
                          Parking
                        </Label>
                        <select
                          id="parking"
                          value={newProperty.parking}
                          onChange={(e) =>
                            handleNewPropertyChange("parking", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="garage">Garage</option>
                          <option value="parking-space">Parking Space</option>
                          <option value="street">Street</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="orientation" className="text-xs font-medium">
                          Orientation
                        </Label>
                        <select
                          id="orientation"
                          value={newProperty.orientation}
                          onChange={(e) =>
                            handleNewPropertyChange("orientation", e.target.value)
                          }
                          className="w-full mt-1 px-2 py-1.5 border rounded-md bg-white text-sm"
                        >
                          <option value="north">North</option>
                          <option value="south">South</option>
                          <option value="east">East</option>
                          <option value="west">West</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Features Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-purple-900">Additional Features</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasGarage}
                          onChange={(e) =>
                            handleNewPropertyChange("hasGarage", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Garage</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasElevator}
                          onChange={(e) =>
                            handleNewPropertyChange("hasElevator", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Elevator</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasWater}
                          onChange={(e) =>
                            handleNewPropertyChange("hasWater", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Water</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasElectricity}
                          onChange={(e) =>
                            handleNewPropertyChange("hasElectricity", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Electricity</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasGas}
                          onChange={(e) =>
                            handleNewPropertyChange("hasGas", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Gas</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasInternet}
                          onChange={(e) =>
                            handleNewPropertyChange("hasInternet", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Internet</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasParkingCircle}
                          onChange={(e) =>
                            handleNewPropertyChange("hasParkingCircle", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Parking Circle</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasBalcony}
                          onChange={(e) =>
                            handleNewPropertyChange("hasBalcony", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Balcony</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasTerrace}
                          onChange={(e) =>
                            handleNewPropertyChange("hasTerrace", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Terrace</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.isRegistered}
                          onChange={(e) =>
                            handleNewPropertyChange("isRegistered", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Registered</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasAlarm}
                          onChange={(e) =>
                            handleNewPropertyChange("hasAlarm", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Alarm</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProperty.hasVideoSurveillance}
                          onChange={(e) =>
                            handleNewPropertyChange("hasVideoSurveillance", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-purple-600"
                        />
                        <span>Video Surveillance</span>
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleEstimateNewProperty}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  disabled={!newPropertyLocation}
                >
                  <DollarSign className="w-4 h-4" />
                  Estimate Fair Price
                </Button>

                {estimatedPrice && (
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-purple-900 mb-1">
                      ESTIMATED FAIR PRICE
                    </p>
                    <p className="text-3xl font-bold text-purple-900 mb-2">
                      {estimatedPrice.price.toLocaleString()} BAM
                    </p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-purple-700">
                        {estimatedPrice.pricePerM2} BAM/m²
                      </span>
                      <Badge className="bg-purple-200 text-purple-900">
                        {estimatedPrice.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-purple-200">
                      <span className="text-xs font-medium text-purple-900">
                        Value Rating: {estimatedPrice.rating}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Existing Property Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Property Analysis
                </CardTitle>
                <CardDescription>
                  Click on a marker to analyze existing properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProperty ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {selectedProperty.title}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {selectedProperty.m2} m² • Floor{" "}
                        {selectedProperty.floor} • Built{" "}
                        {selectedProperty.built}
                      </p>
                    </div>

                    {selectedProperty.predictedPrice ? (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          AI PREDICTED PRICE
                        </p>
                        <p className="text-3xl font-bold text-blue-900">
                          {selectedProperty.predictedPrice.toLocaleString()} BAM
                        </p>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-slate-600">
                            ~{selectedProperty.predictedPricePerM2} BAM/m²
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            {selectedProperty.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Button
                        onClick={() =>
                          selectedProperty &&
                          handlePredictPrice(selectedProperty)
                        }
                        className="w-full gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Generate Prediction
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedProperty)
                            handleEstimateTimeToSell(
                              selectedProperty.price,
                              selectedProperty
                            );
                        }}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Estimate Sell Time
                      </Button>
                    </div>

                    {timeToSellEstimate && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs font-medium text-amber-900 mb-1">
                          ESTIMATED TIME TO SELL
                        </p>
                        <p className="text-2xl font-bold text-amber-900">
                          {timeToSellEstimate} days
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      Click on a property marker to view analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              © {new Date().getFullYear()} RealEstate IQ — Built for BiH
            </div>
            <div className="flex gap-6">
              <button className="hover:text-slate-900 transition-colors">
                Privacy
              </button>
              <button className="hover:text-slate-900 transition-colors">
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
