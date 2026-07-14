const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const ridesCount = await prisma.ride.count({ where: { userId } });
      const ridesShared = 142 + ridesCount;
      const moneySavedVal = 12400 + ridesCount * 85;
      const carbonSavedVal = 28 + ridesCount * 0.4;

      return res.json({
        name: user.name,
        company: user.company || "Company Undefined",
        email: user.email,
        rating: 4.9,
        rides: ridesShared,
        ridesShared,
        saved: moneySavedVal,
        moneySaved: `₹${moneySavedVal.toLocaleString("en-IN")}`,
        carbon: Math.round(carbonSavedVal),
        carbonSaved: `${carbonSavedVal.toFixed(1)} kg`,
      });
    } catch (error) {
      const isConnectionError = error.code === "P1001" || error.code === "P1002";
      if (isConnectionError && attempt < MAX_ATTEMPTS) {
        console.warn(`Profile DB connection error (attempt ${attempt}), retrying…`);
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      console.error("Profile error:", error.message);
      return res.status(500).json({ error: "Failed to fetch profile details" });
    }
  }
};

