const { Router } = require("express");
const QRCode = require("qrcode");

const router = Router();

router.get("/:ref", async (req, res) => {
  try {
    const ref = req.params.ref;
    const url = `${req.protocol}://${req.get("host")}/?scan=${encodeURIComponent(ref)}`;
    const svg = await QRCode.toString(url, { type: "svg", width: 200, margin: 1 });
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
