import React, { useState, useMemo } from "react";
import type { ChangeEvent } from "react";
import type { JSX } from "react";
import { Search, Home, TrendingUp, Clock, Mail, MapPin, Layers, Filter, X, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";



// ----------------------
// Type Definitions
// ----------------------
export interface Listing {
  id: string;
  title: string;
  city: string;
  m2: number;
  floor: number;
  built: number;
  price: number;
  pricePerM2: number;
}

export interface PredictedListing extends Listing {
  predictedPrice?: number;
  predictedPricePerM2?: number;
  confidence?: number;
}

// ----------------------
// Main Component
// ----------------------
export default function RealEstatePricePredictorPage(): JSX.Element {
  const [query, setQuery] = useState<string>("");
  const [city, setCity] = useState<string>("Sarajevo");
  const [minM2, setMinM2] = useState<number>(20);
  const [maxM2, setMaxM2] = useState<number>(120);
  const [ownerMode, setOwnerMode] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PredictedListing | null>(null);
  const [timeToSellEstimate, setTimeToSellEstimate] = useState<number | null>(
    null
  );
  const [email, setEmail] = useState<string>("");

  // ----------------------
  // Mock Data
  // ----------------------
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
      },
    ],
    []
  );

  // ----------------------
  // Undervalued deals
  // ----------------------
  const undervaluedDeals = useMemo<Listing[]>(() => {
    return mockListings.filter((p) => p.pricePerM2 < 1600);
  }, []);

  // ----------------------
  // Filter Logic
  // ----------------------
  const filtered = useMemo<Listing[]>(() => {
    return mockListings.filter((p) => {
      if (city && p.city !== city) return false;
      if (p.m2 < minM2 || p.m2 > maxM2) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [query, city, minM2, maxM2, mockListings]);

  // ----------------------
  // Handlers
  // ----------------------

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

  function handleContactOwner(): void {
    alert("Thanks! We'll reach out — replace this with real contact flow.");
  }

  function handleNumberChange(setter: (value: number) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value || 0);
      setter(Number.isFinite(val) ? val : 0);
    };
  }

  function handleJoinWaitlist(): void {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }
    alert(`Joined waitlist with ${email} (demo)`);
    setEmail("");
  }

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
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

            <div className="flex items-center gap-2">
              <Button
                variant={!ownerMode ? "default" : "outline"}
                onClick={() => setOwnerMode(false)}
                size="sm"
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Investor
              </Button>
              <Button
                variant={ownerMode ? "default" : "outline"}
                onClick={() => setOwnerMode(true)}
                size="sm"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Owner
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by neighbourhood..."
                        className="pl-10"
                      />
                    </div>

                    <select
                      value={city}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setCity(e.target.value)
                      }
                      className="px-4 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Sarajevo">Sarajevo</option>
                      <option value="Doboj">Doboj</option>
                      <option value="Banja Luka">Banja Luka</option>
                      <option value="Mostar">Mostar</option>
                    </select>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("");
                        setMinM2(20);
                        setMaxM2(120);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {/* Size filters */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        value={minM2}
                        onChange={handleNumberChange(setMinM2)}
                        className="w-20 h-9"
                        placeholder="Min"
                      />
                      <span className="text-slate-400">—</span>
                      <Input
                        type="number"
                        value={maxM2}
                        onChange={handleNumberChange(setMaxM2)}
                        className="w-20 h-9"
                        placeholder="Max"
                      />
                      <span className="text-sm text-slate-600">m²</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listings */}
            <div className="space-y-4">
              {filtered.map((p) => (
                <Card key={p.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {p.title}
                          </h3>
                          {p.pricePerM2 < 1600 && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Great Deal
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {p.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-4 h-4" />
                            {p.m2} m²
                          </span>
                          <span>Floor {p.floor}</span>
                          <span>Built {p.built}</span>
                        </div>

                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-slate-900">
                            {p.price.toLocaleString()} BAM
                          </span>
                          <span className="text-sm text-slate-500">
                            {p.pricePerM2} BAM/m²
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handlePredictPrice(p)}
                          variant="outline"
                          size="sm"
                          className="gap-2 whitespace-nowrap"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Predict Price
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedProperty(p);
                            handleEstimateTimeToSell(p.price, p);
                          }}
                          variant="outline"
                          size="sm"
                          className="gap-2 whitespace-nowrap"
                        >
                          <Clock className="w-4 h-4" />
                          Time to Sell
                        </Button>
                        <Button
                          onClick={handleContactOwner}
                          variant="link"
                          size="sm"
                          className="gap-1"
                        >
                          Contact
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-slate-400 mb-2">
                      <Search className="w-12 h-12 mx-auto mb-3" />
                    </div>
                    <p className="text-slate-600">No listings found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Undervalued Deals */}
            {undervaluedDeals.length > 0 && (
              <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-emerald-900">
                        <Sparkles className="w-5 h-5" />
                        Undervalued Opportunities
                      </CardTitle>
                      <CardDescription>Auto-detected below-market listings</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald-600 text-emerald-700">
                      {undervaluedDeals.length} deals
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {undervaluedDeals.map((d) => (
                      <Card key={d.id} className="bg-white">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-slate-900 mb-2">{d.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                            <MapPin className="w-3 h-3" />
                            {d.city} • {d.m2} m²
                          </div>
                          <div className="mb-3">
                            <span className="text-xl font-bold text-slate-900">
                              {d.price.toLocaleString()} BAM
                            </span>
                            <span className="text-sm text-slate-500 ml-2">
                              {d.pricePerM2} BAM/m²
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePredictPrice(d)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              Analyze
                            </Button>
                            <Button
                              onClick={handleContactOwner}
                              size="sm"
                              className="flex-1"
                            >
                              Contact
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDE - Sidebar */}
          <div className="space-y-6">
            {/* Quick Prediction */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  AI Price Prediction
                </CardTitle>
                <CardDescription>
                  Select a listing to generate instant pricing analysis
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
                        {selectedProperty.m2} m² • Floor {selectedProperty.floor}
                      </p>
                    </div>

                    {selectedProperty.predictedPrice ? (
                      <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
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
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {selectedProperty.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-sm text-slate-500 mb-3">
                          No prediction generated yet
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={() => selectedProperty && handlePredictPrice(selectedProperty)}
                        className="w-full gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Generate Prediction
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedProperty)
                            handleEstimateTimeToSell(selectedProperty.price, selectedProperty);
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
                    <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      Select a property to begin analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Map integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waitlist */}
            <Card className="bg-linear-to-br from-indigo-600 to-blue-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Early Access
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Join the waitlist for advanced features & API access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-indigo-200"
                  />
                  <Button
                    onClick={handleJoinWaitlist}
                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
                  >
                    Join Waitlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>© {new Date().getFullYear()} RealEstate IQ — Built for BiH</div>
            <div className="flex gap-6">
              <button className="hover:text-slate-900 transition-colors">Privacy</button>
              <button className="hover:text-slate-900 transition-colors">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}