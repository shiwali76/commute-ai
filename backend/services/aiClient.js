const axios = require("axios");

exports.getMatches = async (payload) => {
  const url = `${process.env.AI_SERVICE_URL}/match`;
  try {
    const res = await axios.post(url, payload);
    return res.data;
  } catch (error) {
    console.error("FastAPI Match Proxy error:", error.message);
    throw new Error("FastAPI microservice unreachable");
  }
};
