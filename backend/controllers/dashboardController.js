const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getRelativeTimeString(date) {
  const diffMs = new Date() - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate user presence in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1. Fetch user's recent rides from the database
    const dbRides = await prisma.ride.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentRides = dbRides.map((ride) => ({
      id: ride.id,
      route: `${ride.pickup} → ${ride.drop}`,
      date: getRelativeTimeString(ride.createdAt),
      fare: `₹${ride.fare.toFixed(0)}`,
      status: ride.status,
    }));

    // 2. Perform Prisma aggregations for statistics
    const totalRidesCount = await prisma.ride.count({
      where: { userId }
    });

    const completedRidesCount = await prisma.ride.count({
      where: { userId, status: "completed" }
    });

    const upcomingRidesCount = await prisma.ride.count({
      where: {
        userId,
        status: { in: ["requested", "matched", "ongoing"] }
      }
    });

    // Compute metrics combining database count + historical offset for demo fidelity
    const moneySavedVal = 12400 + (totalRidesCount * 85);
    const carbonSavedVal = 28 + (totalRidesCount * 0.4);

    // 3. Context-aware AI recommendations (fallback placeholder logic)
    // TODO: Replace with dynamic FastAPI endpoints when real AI match metrics are linked
    const hour = new Date().getHours();
    let traffic = "Moderate";
    let waitingTime = "5 mins";
    let bestPickup = "Main Gate";
    let recommended = "Electric Mini";

    if (hour >= 8 && hour <= 11) {
      traffic = "High";
      waitingTime = "9 mins";
      bestPickup = "Sector 3 Stand";
      recommended = "Shared Ride";
    } else if (hour >= 17 && hour <= 20) {
      traffic = "Very High";
      waitingTime = "12 mins";
      bestPickup = "Tech Park Gate 2";
      recommended = "Shared Ride";
    } else if (hour >= 22 || hour <= 5) {
      traffic = "Low";
      waitingTime = "4 mins";
      bestPickup = "Main lobby exit";
      recommended = "Private Cab";
    }

    res.json({
      userName: user.name,
      totalRidesCompleted: completedRidesCount,
      upcomingRides: upcomingRidesCount,
      moneySaved: `₹${moneySavedVal.toLocaleString("en-IN")}`,
      carbonSaved: `${carbonSavedVal.toFixed(1)} kg`,
      aiRecommendation: {
        waitingTime,
        peakTraffic: traffic,
        traffic, // fallback
        bestPickup,
        recommended,
        recommendedRide: recommended, // fallback
      },
      trafficStatus: traffic,
      bestPickupPoint: bestPickup,
      recentRides: recentRides.length > 0 ? recentRides : undefined,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};
