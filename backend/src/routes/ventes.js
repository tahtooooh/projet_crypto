const { Router } = require("express");
const { ethers } = require("ethers");
const {
  vendreProduit,
  assignerTransporteur,
  miseAJourTransport,
  confirmerLivraison,
  solvePb,
  getVente,
} = require("../services/blockchain");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { productId, client, adresse, qte } = req.body;
    if (!productId || !client || !adresse || !qte) {
      return res.status(400).json({ error: "Champs requis: productId, client, adresse, qte" });
    }
    if (!ethers.isAddress(client)) {
      return res.status(400).json({ error: "Adresse client invalide" });
    }
    const result = await vendreProduit(productId, client, adresse, qte);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:vid/transport/assign", async (req, res) => {
  try {
    const { transporteur } = req.body;
    if (!transporteur) return res.status(400).json({ error: "Champ requis: transporteur" });
    const txHash = await assignerTransporteur(req.params.vid, transporteur);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:vid/transport", async (req, res) => {
  try {
    const { etape, evenement, note } = req.body;
    if (etape === undefined || evenement === undefined) {
      return res.status(400).json({ error: "Champs requis: etape, evenement" });
    }
    const txHash = await miseAJourTransport(req.params.vid, etape, evenement, note || "");
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:vid/confirm", async (req, res) => {
  try {
    const txHash = await confirmerLivraison(req.params.vid);
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:vid/resolve", async (req, res) => {
  try {
    const { resolution, note } = req.body;
    if (resolution === undefined) {
      return res.status(400).json({ error: "Champ requis: resolution" });
    }
    const txHash = await solvePb(req.params.vid, resolution, note || "");
    res.json({ success: true, txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const vente = await getVente(req.params.id);
    if (vente.id.toString() === "0") {
      return res.status(404).json({ error: "Vente introuvable" });
    }
    res.json(formatVente(vente));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

module.exports = router;
