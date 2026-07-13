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

    // Fetch user's recent rides from the database
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

    // Simple context-aware AI recommendations (e.g. based on time of day)
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
      aiRecommendation: {
        waitingTime,
        peakTraffic: traffic,
        traffic, // fallback
        bestPickup,
        recommended,
        recommendedRide: recommended, // fallback
      },
      recentRides: recentRides.length > 0 ? recentRides : undefined, // frontend falls back to standard mock if undefined
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};
