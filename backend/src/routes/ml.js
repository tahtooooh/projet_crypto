const { Router } = require("express");
const { getContract, adminSigner } = require("../config");

const router = Router();

router.get("/export", async (_req, res) => {
  try {
    const contract = getContract(adminSigner);

    const nextProductId = Number(await contract.nextProductId());
    const nextVenteId = Number(await contract.nextVenteId());

    const products = [];
    for (let i = 1; i < nextProductId; i++) {
      const p = await contract.getProduct(i);
      if (p.id.toString() !== "0") {
        products.push(formatProduct(p));
      }
    }

    const ventes = [];
    for (let i = 1; i < nextVenteId; i++) {
      const v = await contract.getVente(i);
      if (v.id.toString() !== "0") {
        ventes.push(formatVente(v));
      }
    }

    res.json({
      totalProducts: products.length,
      totalVentes: ventes.length,
      products,
      ventes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/product/:id", async (req, res) => {
  try {
    const contract = getContract(adminSigner);
    const hist = await contract.getHistoriqueProduit(req.params.id);
    res.json(hist.map(formatHistory));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/vente/:id", async (req, res) => {
  try {
    const contract = getContract(adminSigner);
    const hist = await contract.getHistoriqueVente(req.params.id);
    res.json(hist.map(formatHistory));
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

function formatVente(v) {
  return {
    id: v.id.toString(),
    productId: v.productId.toString(),
    client: v.client,
    adresseLivraison: v.adresseLivraison,
    quantite: Number(v.quantite),
    transporteur: v.transporteur,
    etapeTransport: v.etapeTransport,
    evenement: v.evenement,
    statut: v.statut,
    confirmee: v.confirmee,
    resolution: v.resolution,
    resolutionNote: v.resolutionNote,
    resolu: v.resolu,
    timestamp: Number(v.timestamp),
  };
}

function formatHistory(h) {
  return {
    productId: h.productId.toString(),
    venteId: h.venteId.toString(),
    source: h.source,
    etape: h.etape,
    note: h.note,
    acteur: h.acteur,
    timestamp: Number(h.timestamp),
  };
}

module.exports = router;
