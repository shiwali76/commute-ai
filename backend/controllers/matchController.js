const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const aiClient = require("../services/aiClient");

exports.findMatches = async (req, res) => {
  try {
    const { pickup, drop, time } = req.body;
    if (!pickup || !drop) {
      return res.status(400).json({ error: "Pickup and drop locations are required" });
    }

    const queryPickup = pickup;
    const queryDrop = drop;
    const queryTime = time || "now";
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { company: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const company = user.company || "Google";

    // Call FastAPI matching service via Proxy Client
    const matches = await aiClient.getMatches({
      pickup: queryPickup,
      drop: queryDrop,
      time: queryTime,
      company
    });

    // Save the RideRequest record in the database
    const rideRequest = await prisma.rideRequest.create({
      data: {
        userId,
        pickup: queryPickup,
        drop: queryDrop,
        time: queryTime
      }
    });

    // Save corresponding RideMatch records in the database
    for (const match of matches) {
      await prisma.rideMatch.create({
        data: {
          requestId: rideRequest.id,
          matchedWith: 1, // Matched entity placeholder ID
          score: parseFloat(match.match) || 0.0
        }
      });
    }

    res.json(matches);
  } catch (error) {
    console.error("Match error calling FastAPI service:", error.message);
    res.status(503).json({ message: "AI Service unavailable" });
  }
};
