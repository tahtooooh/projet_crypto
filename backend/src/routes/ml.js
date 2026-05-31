const { Router } = require("express");

const router = Router();
const ML_URL = "http://127.0.0.1:5001";

router.post("/predict", async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "ML service indisponible: " + err.message });
  }
});

router.get("/features", async (_req, res) => {
  try {
    const response = await fetch(`${ML_URL}/features`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "ML service indisponible: " + err.message });
  }
});

router.get("/health", async (_req, res) => {
  try {
    const response = await fetch(`${ML_URL}/health`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "ML service indisponible" });
  }
});

module.exports = router;
