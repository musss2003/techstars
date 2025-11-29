import React, { useState, useMemo, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import type { JSX } from "react";
import {
  Home,
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  DollarSign,
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
  city: string;
  m2: number;
  floor: number;
  built: number;
  lat: number;
  lng: number;
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
      const L = (window as any).L;
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
    city: "Sarajevo",
    m2: 50,
    floor: 2,
    built: 2010,
    lat: 0,
    lng: 0,
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

    // Simple ML-like estimation based on nearby properties and property features
    const nearbyProperties = mockListings.filter(
      (p) => p.city === newProperty.city && p.lat && p.lng
    );

    let basePricePerM2 = 1700; // Default base price

    if (nearbyProperties.length > 0) {
      // Calculate average price in the area
      const avgPricePerM2 =
        nearbyProperties.reduce((sum, p) => sum + p.pricePerM2, 0) /
        nearbyProperties.length;
      basePricePerM2 = avgPricePerM2;
    }

    // Adjust for property features
    const age = 2024 - newProperty.built;
    const ageFactor = age < 5 ? 1.15 : age < 15 ? 1.05 : age < 30 ? 0.95 : 0.85;
    const floorFactor =
      newProperty.floor >= 1 && newProperty.floor <= 4 ? 1.02 : 0.98;
    const sizeFactor =
      newProperty.m2 < 40 ? 1.1 : newProperty.m2 > 100 ? 0.95 : 1.0;

    const estimatedPricePerM2 = Math.round(
      basePricePerM2 * ageFactor * floorFactor * sizeFactor
    );
    const estimatedTotalPrice = estimatedPricePerM2 * newProperty.m2;
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
    value: string | number
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

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <select
                      id="city"
                      value={newProperty.city}
                      onChange={(e) =>
                        handleNewPropertyChange("city", e.target.value)
                      }
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="Sarajevo">Sarajevo</option>
                      <option value="Doboj">Doboj</option>
                      <option value="Banja Luka">Banja Luka</option>
                      <option value="Mostar">Mostar</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="m2" className="text-sm font-medium">
                      Size (m²)
                    </Label>
                    <Input
                      id="m2"
                      type="number"
                      value={newProperty.m2}
                      onChange={(e) =>
                        handleNewPropertyChange("m2", Number(e.target.value))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="floor" className="text-sm font-medium">
                      Floor
                    </Label>
                    <Input
                      id="floor"
                      type="number"
                      value={newProperty.floor}
                      onChange={(e) =>
                        handleNewPropertyChange("floor", Number(e.target.value))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="built" className="text-sm font-medium">
                      Year Built
                    </Label>
                    <Input
                      id="built"
                      type="number"
                      value={newProperty.built}
                      onChange={(e) =>
                        handleNewPropertyChange("built", Number(e.target.value))
                      }
                      className="mt-1"
                      min="1950"
                      max="2024"
                    />
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
