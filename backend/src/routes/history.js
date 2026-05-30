const { Router } = require("express");
const {
  getHistoriqueProduit,
  getHistoriqueVente,
} = require("../services/blockchain");

const router = Router();

router.get("/product/:id", async (req, res) => {
  try {
    const history = await getHistoriqueProduit(req.params.id);
    res.json(history.map(formatEntry));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vente/:id", async (req, res) => {
  try {
    const history = await getHistoriqueVente(req.params.id);
    res.json(history.map(formatEntry));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function formatEntry(e) {
  return {
    productId: e.productId.toString(),
    venteId: e.venteId.toString(),
    source: e.source,
    etape: e.etape,
    note: e.note,
    acteur: e.acteur,
    timestamp: Number(e.timestamp),
  };
}

module.exports = router;
