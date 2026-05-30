const { getContract, adminSigner, producteurSigner, transporteurSigner, clientSigner } = require("../config");

// =========================
// ADMIN
// =========================
async function addProducteur(address) {
  const contract = getContract(adminSigner);
  const tx = await contract.addProducteur(address);
  await tx.wait();
  return tx.hash;
}

async function addTransporteur(address) {
  const contract = getContract(adminSigner);
  const tx = await contract.addTransporteur(address);
  await tx.wait();
  return tx.hash;
}

async function addClient(address) {
  const contract = getContract(adminSigner);
  const tx = await contract.addClient(address);
  await tx.wait();
  return tx.hash;
}

// =========================
// PRODUITS
// =========================
async function ajouterProduit(ref, nom, origine, stock) {
  const contract = getContract(producteurSigner);
  const tx = await contract.ajouterProduit(ref, nom, origine, stock);
  const receipt = await tx.wait();
  const event = receipt.logs.find(l => l.fragment?.name === "ProduitAjoute");
  const productId = event ? event.args[0].toString() : null;
  return { txHash: tx.hash, productId };
}

async function miseAJourProduction(id, etape) {
  const contract = getContract(producteurSigner);
  const tx = await contract.miseAJourProduction(id, etape);
  await tx.wait();
  return tx.hash;
}

async function finaliserProduit(id) {
  const contract = getContract(producteurSigner);
  const tx = await contract.finaliserProduit(id);
  await tx.wait();
  return tx.hash;
}

async function getProduct(id) {
  const contract = getContract(adminSigner);
  return await contract.getProduct(id);
}

async function getProductByReference(ref) {
  const contract = getContract(adminSigner);
  return await contract.getProductByReference(ref);
}

// =========================
// VENTES
// =========================
async function vendreProduit(productId, client, adresse, qte) {
  const contract = getContract(producteurSigner);
  const tx = await contract.vendreProduit(productId, client, adresse, qte);
  const receipt = await tx.wait();
  const event = receipt.logs.find(l => l.fragment?.name === "VenteCree");
  const venteId = event ? event.args[0].toString() : null;
  return { txHash: tx.hash, venteId };
}

async function assignerTransporteur(vid, transporteur) {
  const contract = getContract(producteurSigner);
  const tx = await contract.assignerTransporteur(vid, transporteur);
  await tx.wait();
  return tx.hash;
}

async function miseAJourTransport(vid, etape, evenement, note) {
  const contract = getContract(transporteurSigner);
  const tx = await contract.miseAJourTransport(vid, etape, evenement, note);
  await tx.wait();
  return tx.hash;
}

async function confirmerLivraison(vid) {
  const contract = getContract(clientSigner);
  const tx = await contract.confirmerLivraison(vid);
  await tx.wait();
  return tx.hash;
}

async function solvePb(vid, resolution, note) {
  const contract = getContract(producteurSigner);
  const tx = await contract.solvePb(vid, resolution, note);
  await tx.wait();
  return tx.hash;
}

async function getVente(id) {
  const contract = getContract(adminSigner);
  return await contract.getVente(id);
}

// =========================
// HISTORIQUE
// =========================
async function getHistoriqueProduit(id) {
  const contract = getContract(adminSigner);
  return await contract.getHistoriqueProduit(id);
}

async function getHistoriqueVente(id) {
  const contract = getContract(adminSigner);
  return await contract.getHistoriqueVente(id);
}

module.exports = {
  addProducteur,
  addTransporteur,
  addClient,
  ajouterProduit,
  miseAJourProduction,
  finaliserProduit,
  getProduct,
  getProductByReference,
  vendreProduit,
  assignerTransporteur,
  miseAJourTransport,
  confirmerLivraison,
  solvePb,
  getVente,
  getHistoriqueProduit,
  getHistoriqueVente,
};
