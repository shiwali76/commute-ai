const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const aiClient = require("../services/aiClient");

exports.findMatches = async (req, res) => {
  const { pickup, drop, time } = req.body;
  
  // Frontend fallback options if inputs are blank
  const queryPickup = pickup || "Current Location";
  const queryDrop = drop || "Tech Park";
  const queryTime = time || "now";

  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { company: true }
    });

    const company = user?.company || null;

    // Call FastAPI service
    const matches = await aiClient.getMatches({
      pickup: queryPickup,
      drop: queryDrop,
      time: queryTime,
      company
    });

    res.json(matches);
  } catch (error) {
    console.warn("FastAPI match error, falling back to mock matches:", error.message);
    
    // Fallback data if FastAPI server is unreachable
    res.json([
      { name: "Tony", fare: 60, eta: "8 mins", match: 95, company: "Infosys" },
      { name: "Priya", fare: 110, eta: "10 mins", match: 78, company: "Amazon" }
    ]);
  }
};
