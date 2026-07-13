const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Seed drivers if none exist in the database
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
  const { pickup, destination } = req.body;
  if (!pickup || !destination) {
    return res.status(400).json({ error: "Pickup and destination are required" });
  }

  // Generate dynamic fares based on character length of inputs to simulate route distance
  const baseDistance = (pickup.length + destination.length) * 4;
  const fares = [
    { id: 1, type: "Shared Ride", fare: Math.round(baseDistance * 1.5 + 40), eta: "8 min" },
    { id: 2, type: "Private", fare: Math.round(baseDistance * 3.2 + 80), eta: "5 min" },
    { id: 3, type: "Electric Mini", fare: Math.round(baseDistance * 1.2 + 30), eta: "12 min" }
  ];

  res.json(fares);
};

exports.bookRide = async (req, res) => {
  const { pickup, destination, rideType } = req.body;
  if (!pickup || !destination) {
    return res.status(400).json({ error: "Pickup and destination are required" });
  }

  try {
    const userId = req.user.id;
    const drivers = await getOrSeedDrivers();
    const assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];

    // Deduce simulated fare
    const baseDistance = (pickup.length + destination.length) * 4;
    let fare = baseDistance * 1.5 + 40;
    if (rideType === "Private") {
      fare = baseDistance * 3.2 + 80;
    } else if (rideType === "Electric Mini") {
      fare = baseDistance * 1.2 + 30;
    }

    const ride = await prisma.ride.create({
      data: {
        userId,
        driverId: assignedDriver.id,
        pickup,
        drop: destination,
        fare,
        status: "requested"
      }
    });

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
  const { id } = req.params;

  try {
    let ride = null;
    const parsedId = parseInt(id, 10);
    if (!isNaN(parsedId)) {
      ride = await prisma.ride.findUnique({
        where: { id: parsedId },
        include: { driver: true }
      });
    }

    // Fallback if no ride found or ID is "latest"
    if (!ride) {
      const drivers = await getOrSeedDrivers();
      const fallbackDriver = drivers[0];
      return res.json({
        driver: fallbackDriver.name,
        driverName: fallbackDriver.name,
        car: fallbackDriver.vehicle,
        vehicle: `${fallbackDriver.vehicle} - ${fallbackDriver.plate}`,
        eta: "5 min",
        arrivalTime: "9:15 AM",
        latestArrival: "9:25 AM",
        location: { lat: 17.4483, lng: 78.3915 },
        currentLocation: "Koramangala",
        destination: "Tech Park, Whitefield"
      });
    }

    res.json({
      id: ride.id,
      rideId: ride.id,
      driver: ride.driver.name,
      driverName: ride.driver.name,
      car: ride.driver.vehicle,
      vehicle: `${ride.driver.vehicle} - ${ride.driver.plate}`,
      eta: "7 mins",
      arrivalTime: "9:20 AM",
      latestArrival: "9:30 AM",
      location: { lat: 17.4483, lng: 78.3915 },
      currentLocation: ride.pickup,
      destination: ride.drop
    });
  } catch (error) {
    console.error("Track ride error:", error);
    res.status(500).json({ error: "Failed to get tracking details" });
  }
};
