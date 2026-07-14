const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { name, email, password, company } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Retry once on Supabase pooler connection resets (P1001)
  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, company },
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, company: user.company },
      });
    } catch (error) {
      const isConnectionError = error.code === "P1001" || error.code === "P1002";
      if (isConnectionError && attempt < MAX_ATTEMPTS) {
        console.warn(`Register DB connection error (attempt ${attempt}), retrying…`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.error("Register error:", error.message);
      res.status(500).json({ error: "Registration failed. Please try again." });
      return;
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Retry once on Supabase pooler connection resets (P1001)
  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, company: user.company },
      });
    } catch (error) {
      const isConnectionError = error.code === "P1001" || error.code === "P1002";
      if (isConnectionError && attempt < MAX_ATTEMPTS) {
        console.warn(`Login DB connection error (attempt ${attempt}), retrying…`);
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.error("Login error:", error.message);
      res.status(500).json({ error: "Login failed. Please try again." });
      return;
    }
  }
};
