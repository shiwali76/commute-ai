const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Dynamic seeding fallback for drivers
async function getOrSeedDrivers() {
  const count = await prisma.driver.count();
  if (count === 0) {
    await prisma.driver.createMany({
      data: [
        { name: "Saber Ali", vehicle: "Tesla Model 5", plate: "TS09AB9999", rating: 4.9 },
        { name: "Rajesh K.", vehicle: "Hyundai i20", plate: "KA01AB1234", rating: 4.8 },
        { name: "Priya Singh", vehicle: "Tata Nexon EV", plate: "MH12CD5678", rating: 4.7 }
      ]
    });
  }
  return prisma.driver.findMany();
}

exports.searchRides = async (req, res) => {
  try {
    const { pickup, destination } = req.body;
    if (!pickup || !destination) {
      return res.status(400).json({ error: "Pickup and destination are required" });
    }

    // 1. Calculate mock distance and travel time based on character lengths
    // TODO: Integrate Google Maps Distance Matrix API here after Maps integration
    const distanceKm = Math.max((pickup.length + destination.length) * 0.5, 2); // Minimum 2km
    const durationMins = Math.round(distanceKm * 2.5); // Simulating 2.5 mins per km

    // 2. Generate fares based on distance
    const fares = [
      { id: 1, type: "Shared Ride", fare: Math.round(distanceKm * 15 + 40), eta: `${Math.round(durationMins * 0.8)} mins` },
      { id: 2, type: "Private", fare: Math.round(distanceKm * 30 + 80), eta: `${Math.round(durationMins * 0.6)} mins` },
      { id: 3, type: "Electric Mini", fare: Math.round(distanceKm * 18 + 30), eta: `${durationMins} mins` }
    ];

    res.json(fares);
  } catch (error) {
    console.error("Search rides error:", error);
    res.status(500).json({ error: "Failed to search rides" });
  }
};

exports.bookRide = async (req, res) => {
  try {
    const { pickup, destination, rideType } = req.body;
    if (!pickup || !destination) {
      return res.status(400).json({ error: "Pickup and destination are required" });
    }

    const userId = req.user.id;

    // Fetch user details to get company context for AI matching
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const drivers = await getOrSeedDrivers();
    const assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];

    // Calculate fare based on simulated distance
    const distanceKm = Math.max((pickup.length + destination.length) * 0.5, 2);
    const durationMins = Math.round(distanceKm * 2.5);
    
    let fare = distanceKm * 15 + 40;
    if (rideType === "Private") {
      fare = distanceKm * 30 + 80;
    } else if (rideType === "Electric Mini") {
      fare = distanceKm * 18 + 30;
    }

    // TODO: Integrate Google Maps API to fetch real latitude/longitude coordinates
    const pickupLatitude = 17.4483; // Placeholder Hyderabad coordinates
    const pickupLongitude = 78.3915;
    const destinationLatitude = 17.4834;
    const destinationLongitude = 78.3842;

    // Save the ride in PostgreSQL
    const ride = await prisma.ride.create({
      data: {
        userId,
        driverId: assignedDriver.id,
        pickup,
        drop: destination,
        fare: Math.round(fare),
        status: "requested",
        pickupLatitude,
        pickupLongitude,
        destinationLatitude,
        destinationLongitude,
        distance: distanceKm,
        travelTime: durationMins
      }
    });

    // AI Match Service Preparation
    // TODO: In step 8, connect this block to send the payload to FastAPI matching service at AI_SERVICE_URL:
    /*
    const aiPayload = {
      pickup: ride.pickup,
      drop: ride.drop,
      departureTime: ride.createdAt,
      company: user.company || "Google",
      userId: user.id
    };
    // await axios.post(`${process.env.AI_SERVICE_URL}/match`, aiPayload);
    */

    res.status(201).json({
      id: ride.id,
      rideId: ride.id,
      status: ride.status,
      driverName: assignedDriver.name,
      vehicle: `${assignedDriver.vehicle} - ${assignedDriver.plate}`
    });
  } catch (error) {
    console.error("Book ride error:", error);
    res.status(500).json({ error: "Failed to book ride" });
  }
};

exports.trackRide = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    let ride = null;
    const parsedId = parseInt(id, 10);

    if (!isNaN(parsedId)) {
      ride = await prisma.ride.findUnique({
        where: { id: parsedId },
        include: { driver: true }
      });
    }

    // Fallback: if not found by ID or ID is "latest", return user's latest booked ride
    if (!ride) {
      ride = await prisma.ride.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { driver: true }
      });
    }

    // If still no ride in database, raise error
    if (!ride) {
      return res.status(404).json({ error: "No rides found to track" });
    }

    // TODO: After Google Maps is integrated, use real driver real-time coordinates
    const mockDriverLat = ride.pickupLatitude || 17.4483;
    const mockDriverLng = ride.pickupLongitude || 78.3915;

    res.json({
      id: ride.id,
      rideId: ride.id,
      status: ride.status,
      driver: ride.driver ? ride.driver.name : "Driver Assigned",
      driverName: ride.driver ? ride.driver.name : "Driver Assigned",
      car: ride.driver ? ride.driver.vehicle : "Vehicle Assigned",
      vehicle: ride.driver ? `${ride.driver.vehicle} - ${ride.driver.plate}` : "Vehicle Assigned",
      eta: `${ride.travelTime || 7} mins`,
      arrivalTime: "9:20 AM",
      latestArrival: "9:30 AM",
      location: { lat: mockDriverLat, lng: mockDriverLng },
      currentLocation: ride.pickup,
      destination: ride.drop
    });
  } catch (error) {
    console.error("Track ride error:", error);
    res.status(500).json({ error: "Failed to get tracking details" });
  }
};
