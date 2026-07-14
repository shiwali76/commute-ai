import { createContext, useContext, useState } from "react";

const RideContext = createContext();

export function RideProvider({ children }) {
  const [pickup, setPickup] = useState("Current Location");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore Center
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [matchedRider, setMatchedRider] = useState(null);
  const [currentRideId, setCurrentRideId] = useState(null);

  return (
    <RideContext.Provider
      value={{
        pickup,
        setPickup,
        destination,
        setDestination,
        pickupCoords,
        setPickupCoords,
        destinationCoords,
        setDestinationCoords,
        distance,
        setDistance,
        travelTime,
        setTravelTime,
        selectedRide,
        setSelectedRide,
        matchedRider,
        setMatchedRider,
        currentRideId,
        setCurrentRideId,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  const context = useContext(RideContext);
  if (!context) throw new Error("useRide must be used within a RideProvider");
  return context;
}
