function renderClient() {
  const content = $(`content`);

  const confirmCard = renderCard(`Confirmer la livraison`, `
    <div class="form-group"><label>ID Vente</label><input type="number" id="c-vid" placeholder="1"></div>
    <button onclick="confirmDelivery()">Confirmer</button>
    <div id="c-result" style="margin-top:0.5rem"></div>
  `);

  const histCard = renderCard(`Historique d'un produit`, `
    <div class="form-group"><label>ID Produit</label><input type="number" id="ch-pid" placeholder="1"></div>
    <button onclick="viewHistProduct()">Voir</button>
    <pre id="ch-result" style="margin-top:0.5rem"></pre>
  `);

  const histVenteCard = renderCard(`Historique d'une vente`, `
    <div class="form-group"><label>ID Vente</label><input type="number" id="ch-vid" placeholder="1"></div>
    <button onclick="viewHistVente()">Voir</button>
    <pre id="chv-result" style="margin-top:0.5rem"></pre>
  `);

  content.innerHTML = confirmCard + histCard + histVenteCard;
}

async function confirmDelivery() {
  try {
    const d = await api("PUT", `/ventes/${$("c-vid").value}/confirm`);
    showSuccess("c-result", `Livraison confirmée (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("c-result", e.message); }
}

async function viewHistProduct() {
  try {
    const d = await api("GET", `/history/product/${$("ch-pid").value}`);
    $("ch-result").textContent = JSON.stringify(d, null, 2);
  } catch (e) { $("ch-result").textContent = "Erreur: " + e.message; }
}

async function viewHistVente() {
  try {
    const d = await api("GET", `/history/vente/${$("ch-vid").value}`);
    $("chv-result").textContent = JSON.stringify(d, null, 2);
  } catch (e) { $("chv-result").textContent = "Erreur: " + e.message; }
}
