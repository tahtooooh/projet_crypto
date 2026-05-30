const { Router } = require("express");
const {
  ajouterProduit,
  miseAJourProduction,
  finaliserProduit,
  getProduct,
  getProductByReference,
} = require("../services/blockchain");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { ref, nom, origine, stock } = req.body;
    if (!ref || !nom || !origine || !stock) {
      return res.status(400).json({ error: "Champs requis: ref, nom, origine, stock" });
    }
    const result = await ajouterProduit(ref, nom, origine, stock);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/production", async (req, res) => {
  try {
    const { etape } = req.body;
    if (!etape) return res.status(400).json({ error: "Champ requis: etape" });
    const txHash = await miseAJourProduction(req.params.id, etape);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/finalize", async (req, res) => {
  try {
    const txHash = await finaliserProduit(req.params.id);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await getProduct(req.params.id);
    if (product.id.toString() === "0") {
      return res.status(404).json({ error: "Produit introuvable" });
    }
    res.json(formatProduct(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/ref/:ref", async (req, res) => {
  try {
    const product = await getProductByReference(req.params.ref);
    if (product.id.toString() === "0") {
      return res.status(404).json({ error: "Référence introuvable" });
    }
    res.json(formatProduct(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function formatProduct(p) {
  return {
    id: p.id.toString(),
    referenceProduit: p.referenceProduit,
    nom: p.nom,
    origine: p.origine,
    dateProductionStart: Number(p.dateProductionStart),
    dateProductionEnd: Number(p.dateProductionEnd),
    etapeProduction: p.etapeProduction,
    stockProduit: Number(p.stockProduit),
    stockDisponible: Number(p.stockDisponible),
    stockReserve: Number(p.stockReserve),
    stockExpedie: Number(p.stockExpedie),
    producteur: p.producteur,
    statut: p.statut,
    timestampCreation: Number(p.timestampCreation),
  };
}

module.exports = router;
