import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RideProvider } from "./context/RideContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SearchRide from "./pages/SearchRide";
import RideSelection from "./pages/RideSelection";
import RideSummary from "./pages/RideSummary";
import RideMatch from "./pages/RideMatch";
import RiderProfile from "./pages/RiderProfile";
import MatchConfirmed from "./pages/MatchConfirmed";
import Tracking from "./pages/Tracking";
import FareCompare from "./pages/FareCompare";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <RideProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/choose-ride"
              element={
                <ProtectedRoute>
                  <RideSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ride-summary"
              element={
                <ProtectedRoute>
                  <RideSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <RideMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:riderId"
              element={
                <ProtectedRoute>
                  <RiderProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/confirmed"
              element={
                <ProtectedRoute>
                  <MatchConfirmed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track/:rideId"
              element={
                <ProtectedRoute>
                  <Tracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fare-compare"
              element={
                <ProtectedRoute>
                  <FareCompare />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </RideProvider>
    </BrowserRouter>
  );
}

export default App;
