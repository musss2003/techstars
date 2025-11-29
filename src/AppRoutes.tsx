import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const FeatureShowcasePage = lazy(() => import("./FeatureShowcasePage"));
const RealEstatePredictorPage = lazy(() => import("./RealEstatePredictorPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/features" element={<FeatureShowcasePage />} />
        <Route path="*" element={<RealEstatePredictorPage />} />
      </Routes>
    </Suspense>
  );
}
