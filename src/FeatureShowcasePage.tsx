import React, { useState, useCallback } from "react";

type MoneyTier = "$" | "$$" | "$$$";

interface FeatureMeta {
  id: string;
  title: string;
  bullets: string[];
  tier: MoneyTier;
  demoComponent: React.ReactNode;
}

function FeatureCard(props: { meta: FeatureMeta }) {
  const { meta } = props;
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{meta.title}</h3>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            {meta.bullets.map((b, i) => (
              <div key={i}>• {b}</div>
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-500">Monetization</div>
          <div className="mt-1 px-2 py-1 rounded-md bg-slate-100 text-sm font-medium">{meta.tier}</div>
        </div>
      </div>

      <div className="pt-2 border-t">{meta.demoComponent}</div>
    </div>
  );
}

/* --------------------------
   1) Fair Price Predictor
   -------------------------- */
interface PricePrediction {
  predictedPrice: number;
  predictedPerM2: number;
  confidence: number;
}

function FairPricePredictorDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricePrediction | null>(null);
  const [price, setPrice] = useState<number>(85000);
  const [m2, setM2] = useState<number>(45);

  // keep randomness inside callback so linter won't complain
  const predict = useCallback(async () => {
    setLoading(true);
    setResult(null);

    // simulate API latency
    await new Promise((r) => setTimeout(r, 700));

    // mocked model result (replace with fetch to your backend)
    const basePerM2 = Math.round((price / m2) || 1000);
    const factor = 0.9 + Math.random() * 0.4; // impure inside callback -> safe
    const predictedPerM2 = Math.round(basePerM2 * factor);
    const predictedPrice = predictedPerM2 * m2;
    const confidence = Math.round(60 + Math.random() * 35);

    setResult({ predictedPrice, predictedPerM2, confidence });
    setLoading(false);
  }, [price, m2]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col text-sm">
          Current price (BAM)
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col text-sm">
          Area (m²)
          <input type="number" value={m2} onChange={(e) => setM2(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={predict} disabled={loading} className="px-3 py-2 rounded bg-indigo-600 text-white">
          {loading ? "Predicting..." : "Get Fair Price"}
        </button>
        <button onClick={() => { setResult(null); setPrice(85000); setM2(45); }} className="px-3 py-2 rounded border">
          Reset
        </button>
      </div>

      {result && (
        <div className="mt-2 p-3 rounded bg-slate-50 border">
          <div className="text-sm text-slate-600">Predicted price</div>
          <div className="text-xl font-semibold">{result.predictedPrice.toLocaleString()} BAM</div>
          <div className="text-sm text-slate-500">~{result.predictedPerM2} BAM/m² • Confidence: {result.confidence}%</div>
        </div>
      )}
    </div>
  );
}

/* --------------------------
   2) Time-to-Sell Forecast
   -------------------------- */
function TimeToSellDemo() {
  const [price, setPrice] = useState<number>(85000);
  const [m2, setM2] = useState<number>(45);
  const [days, setDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = useCallback(async () => {
    setLoading(true);
    setDays(null);
    await new Promise((r) => setTimeout(r, 500));

    // heuristic: cheaper price relative to local median sells faster
    const localMedianPerM2 = 1700;
    const perM2 = Math.round(price / m2 || 1000);
    const ratio = perM2 / localMedianPerM2;
    const base = 10; // base days
    const noise = Math.round(Math.random() * 10);
    const estimateDays = Math.max(2, Math.round(base + (ratio - 1) * 40 + noise));

    setDays(estimateDays);
    setLoading(false);
  }, [price, m2]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        <input type="number" value={m2} onChange={(e) => setM2(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
      </div>

      <div className="flex gap-2">
        <button onClick={estimate} disabled={loading} className="px-3 py-2 bg-emerald-600 text-white rounded">
          {loading ? "Estimating..." : "Estimate time to sell"}
        </button>
        <button onClick={() => setDays(null)} className="px-3 py-2 rounded border">Clear</button>
      </div>

      {days !== null && (
        <div className="mt-2 p-3 bg-slate-50 rounded border">
          <div className="text-sm text-slate-600">Estimated time to sell</div>
          <div className="text-2xl font-semibold">{days} days</div>
          <div className="text-sm text-slate-500">Shows how listing price affects selling speed (demo)</div>
        </div>
      )}
    </div>
  );
}

/* --------------------------
   3) Dynamic Price Optimization Simulator
   -------------------------- */
function PriceOptimizerDemo() {
  const [basePrice, setBasePrice] = useState<number>(85000);
  const [m2, setM2] = useState<number>(45);
  const [scenarioGap, setScenarioGap] = useState<number>(5); // percent steps
  const [result, setResult] = useState<{ price: number; sellProb: number; estDays: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const runScenarios = useCallback(async () => {
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 700));

    const scenarios: { price: number; sellProb: number; estDays: number }[] = [];
    for (let delta = -20; delta <= 20; delta += scenarioGap) {
      const price = Math.round(basePrice * (1 + delta / 100));
      // demo heuristics:
      const perM2 = price / m2;
      const sellProb = Math.max(5, Math.round(100 - (perM2 / 1700 - 1) * 60 + Math.random() * 10));
      const estDays = Math.max(2, Math.round(7 + (perM2 / 1700 - 1) * 50 + Math.random() * 20));
      scenarios.push({ price, sellProb, estDays });
    }

    setResult(scenarios);
    setLoading(false);
  }, [basePrice, m2, scenarioGap]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        <input type="number" value={m2} onChange={(e) => setM2(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        <input type="number" value={scenarioGap} onChange={(e) => setScenarioGap(Math.max(1, Number(e.target.value || 1)))} className="border rounded px-2 py-1" />
      </div>

      <div className="flex gap-2">
        <button onClick={runScenarios} disabled={loading} className="px-3 py-2 bg-indigo-600 text-white rounded">
          {loading ? "Simulating..." : "Run scenarios"}
        </button>
        <button onClick={() => setResult(null)} className="px-3 py-2 rounded border">Clear</button>
      </div>

      {result && (
        <div className="mt-2 grid grid-cols-1 gap-2">
          {result.map((r) => (
            <div key={r.price} className="p-2 rounded border flex items-center justify-between">
              <div>
                <div className="font-medium">{r.price.toLocaleString()} BAM</div>
                <div className="text-sm text-slate-600">Sell probability: {r.sellProb}% • est {r.estDays} days</div>
              </div>
              <div className="text-sm">
                <div className={`px-2 py-1 rounded ${r.sellProb > 60 ? "bg-emerald-100 text-emerald-700" : r.sellProb > 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  {r.sellProb}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------
   4) Neighbourhood Impact Forecast
   -------------------------- */
function NeighbourhoodForecastDemo() {
  const [address, setAddress] = useState<string>("Ilidža, Sarajevo");
  const [years, setYears] = useState<number>(3);
  const [pred, setPred] = useState<{ changePct: number; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setPred(null);
    await new Promise((r) => setTimeout(r, 800));

    // mocked scenarios: infrastructure = +, construction nearby = -, school = +
    const random = Math.random();
    const changePct = Math.round((random - 0.3) * 10 + years * 1.2);
    const reason = random > 0.6 ? "New tram line & park planned" : random > 0.35 ? "Planned commercial project" : "Road upgrade and school nearby";

    setPred({ changePct, reason });
    setLoading(false);
  }, [address, years]);

  return (
    <div className="space-y-3">
      <input className="border rounded px-2 py-1" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="flex gap-2">
        <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value || 0))} className="border rounded px-2 py-1 w-24" />
        <button onClick={run} disabled={loading} className="px-3 py-2 bg-rose-600 text-white rounded">
          {loading ? "Analyzing..." : "Forecast"}
        </button>
      </div>

      {pred && (
        <div className="p-3 rounded bg-slate-50 border">
          <div className="text-sm text-slate-600">Expected price change over {years} years</div>
          <div className="text-2xl font-semibold">{pred.changePct >= 0 ? `+${pred.changePct}%` : `${pred.changePct}%`}</div>
          <div className="text-sm text-slate-500">Drivers: {pred.reason}</div>
        </div>
      )}
    </div>
  );
}

/* --------------------------
   5) Renovation ROI Calculator
   -------------------------- */
function RenovationROIDemo() {
  const [currentPrice, setCurrentPrice] = useState<number>(85000);
  const [upgradeCost, setUpgradeCost] = useState<number>(3000);
  const [expectedUpliftPct, setExpectedUpliftPct] = useState<number>(5);
  const [result, setResult] = useState<{ newPrice: number; roiPct: number } | null>(null);

  const calc = useCallback(() => {
    const newPrice = Math.round(currentPrice * (1 + expectedUpliftPct / 100));
    const profit = newPrice - currentPrice - upgradeCost;
    const roiPct = Math.round((profit / upgradeCost) * 100);
    setResult({ newPrice, roiPct });
  }, [currentPrice, expectedUpliftPct, upgradeCost]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        <input type="number" value={upgradeCost} onChange={(e) => setUpgradeCost(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
        <input type="number" value={expectedUpliftPct} onChange={(e) => setExpectedUpliftPct(Number(e.target.value || 0))} className="border rounded px-2 py-1" />
      </div>

      <div className="flex gap-2">
        <button onClick={calc} className="px-3 py-2 bg-amber-600 text-white rounded">Calculate ROI</button>
        <button onClick={() => setResult(null)} className="px-3 py-2 rounded border">Clear</button>
      </div>

      {result && (
        <div className="p-3 rounded border bg-slate-50">
          <div className="text-sm text-slate-600">New estimated price</div>
          <div className="text-xl font-semibold">{result.newPrice.toLocaleString()} BAM</div>
          <div className="text-sm text-slate-500">Estimated ROI: {result.roiPct}% (profit after renovation)</div>
        </div>
      )}
    </div>
  );
}

/* --------------------------
   Page assembling the features
   -------------------------- */
export default function FeatureShowcasePage() {
  const features: FeatureMeta[] = [
    {
      id: "fair-price",
      title: "Fair Price Predictor",
      bullets: ["Helps sellers avoid losing money", "Predicts real market value using AI"],
      tier: "$",
      demoComponent: <FairPricePredictorDemo />,
    },
    {
      id: "time-to-sell",
      title: "Time-to-Sell Forecast",
      bullets: ["Predicts how long a property will stay on the market", "Helps choose the fastest selling price"],
      tier: "$$",
      demoComponent: <TimeToSellDemo />,
    },
    {
      id: "price-optimizer",
      title: "Dynamic Price Optimization Simulator",
      bullets: ["Shows how adjusting price changes selling probability", "Try different pricing scenarios"],
      tier: "$$",
      demoComponent: <PriceOptimizerDemo />,
    },
    {
      id: "neighbourhood",
      title: "Neighbourhood Impact Forecast",
      bullets: ["Predicts price changes due to construction, roads, schools", "Future value estimation"],
      tier: "$$$",
      demoComponent: <NeighbourhoodForecastDemo />,
    },
    {
      id: "renovation",
      title: "Renovation ROI Calculator",
      bullets: ["Shows if small renovations increase price", "Tells what NOT to renovate"],
      tier: "$",
      demoComponent: <RenovationROIDemo />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Monetizable Seller Features — Demo UI</h1>
          <p className="text-sm text-slate-600 mt-1">Interactive mockups for investor demos and product planning.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.id} meta={f} />
          ))}
        </div>

        <footer className="mt-8 text-sm text-slate-500">
          <div>Note: these are front-end demos with mocked logic — replace demo callbacks with real API endpoints returning model predictions and analytics.</div>
        </footer>
      </div>
    </div>
  );
}
