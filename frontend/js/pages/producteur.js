function renderProducteur() {
  const content = $(`content`);

  const addCard = renderCard(`Ajouter un produit`, `
    <div class="form-group"><label>Référence</label><input type="text" id="p-ref" placeholder="REF-001"></div>
    <div class="form-group"><label>Nom</label><input type="text" id="p-nom" placeholder="Produit X"></div>
    <div class="form-group"><label>Origine</label><input type="text" id="p-origine" placeholder="Maroc"></div>
    <div class="form-group"><label>Stock</label><input type="number" id="p-stock" placeholder="100"></div>
    <button onclick="addProduct()">Ajouter</button>
    <div id="p-add-result" style="margin-top:0.5rem"></div>
  `);

  const prodCard = renderCard(`Mise à jour production`, `
    <div class="form-group"><label>ID Produit</label><input type="number" id="pu-id" placeholder="1"></div>
    <div class="form-group"><label>Étape</label><input type="text" id="pu-etape" placeholder="Assemblage"></div>
    <button onclick="updateProduction()">Mettre à jour</button>
    <div id="pu-result" style="margin-top:0.5rem"></div>
  `);

  const finalCard = renderCard(`Finaliser produit`, `
    <div class="form-group"><label>ID Produit</label><input type="number" id="pf-id" placeholder="1"></div>
    <button onclick="finalizeProduct()">Finaliser</button>
    <div id="pf-result" style="margin-top:0.5rem"></div>
  `);

  const venteCard = renderCard(`Créer une vente`, `
    <div class="form-group"><label>ID Produit</label><input type="number" id="v-prodid" placeholder="1"></div>
    <div class="form-group"><label>Client (adresse)</label><input type="text" id="v-client" placeholder="0x..."></div>
    <div class="form-group"><label>Adresse livraison</label><input type="text" id="v-adresse" placeholder="Casablanca"></div>
    <div class="form-group"><label>Quantité</label><input type="number" id="v-qte" placeholder="10"></div>
    <button onclick="createVente()">Créer la vente</button>
    <div id="v-result" style="margin-top:0.5rem"></div>
  `);

  const assignCard = renderCard(`Assigner transporteur`, `
    <div class="form-group"><label>ID Vente</label><input type="number" id="ta-vid" placeholder="1"></div>
    <div class="form-group"><label>Transporteur (adresse)</label><input type="text" id="ta-addr" placeholder="0x..."></div>
    <button onclick="assignTransport()">Assigner</button>
    <div id="ta-result" style="margin-top:0.5rem"></div>
  `);

  const resolveCard = renderCard(`Résoudre un problème`, `
    <div class="form-group"><label>ID Vente</label><input type="number" id="rs-vid" placeholder="1"></div>
    <div class="form-group"><label>Résolution</label>
      <select id="rs-type">
        <option value="1">Remise</option>
        <option value="2">Remboursement</option>
        <option value="3">Remplacement</option>
        <option value="4">Annulation</option>
      </select>
    </div>
    <div class="form-group"><label>Note</label><input type="text" id="rs-note" placeholder="Produit endommagé"></div>
    <button onclick="resolveProblem()">Résoudre</button>
    <div id="rs-result" style="margin-top:0.5rem"></div>
  `);

  const viewCard = renderCard(`Consulter un produit`, `
    <div class="form-group"><label>ID Produit</label><input type="number" id="pv-id" placeholder="1"></div>
    <button onclick="viewProduct()">Voir</button>
    <pre id="pv-result" style="margin-top:0.5rem"></pre>
  `);

  content.innerHTML = addCard + prodCard + finalCard + venteCard + assignCard + resolveCard + viewCard;
}

let lastProductRef = "";

async function addProduct() {
  try {
    const ref = $("p-ref").value;
    const d = await api("POST", "/products", {
      ref, nom: $("p-nom").value,
      origine: $("p-origine").value, stock: Number($("p-stock").value),
    });
    lastProductRef = ref;
    const msg = `Produit ajouté! ID: ${d.productId} (tx: ${d.txHash.slice(0,20)}...)`;
    showSuccess("p-add-result", msg);
    showQRCode(ref, d.productId);
  } catch (e) { showError("p-add-result", e.message); }
}

function showQRCode(ref, id) {
  const div = document.getElementById("p-qrcode") || (() => {
    const el = document.createElement("div");
    el.id = "p-qrcode";
    el.style.marginTop = "1rem";
    document.getElementById("p-add-result").after(el);
    return el;
  })();
  div.innerHTML = `
    <h3>QR Code du produit</h3>
    <img src="/api/qrcode/${encodeURIComponent(ref)}"
         alt="QR Code" style="width:150px;height:150px;">
    <p style="margin-top:0.5rem;font-size:0.85rem;color:#666;">Réf: ${ref} | ID: ${id}</p>
    <p style="font-size:0.8rem;color:#999;">Scannez pour voir l'historique</p>`;
}

async function updateProduction() {
  try {
    const d = await api("PUT", `/products/${$("pu-id").value}/production`, { etape: $("pu-etape").value });
    showSuccess("pu-result", `Production mise à jour (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("pu-result", e.message); }
}

async function finalizeProduct() {
  try {
    const d = await api("PUT", `/products/${$("pf-id").value}/finalize`);
    showSuccess("pf-result", `Produit finalisé (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("pf-result", e.message); }
}

async function createVente() {
  try {
    const d = await api("POST", "/ventes", {
      productId: Number($("v-prodid").value), client: $("v-client").value,
      adresse: $("v-adresse").value, qte: Number($("v-qte").value),
    });
    showSuccess("v-result", `Vente créée! ID: ${d.venteId} (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("v-result", e.message); }
}

async function assignTransport() {
  try {
    const d = await api("PUT", `/ventes/${$("ta-vid").value}/transport/assign`, { transporteur: $("ta-addr").value });
    showSuccess("ta-result", `Transporteur assigné (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("ta-result", e.message); }
}

async function resolveProblem() {
  try {
    const d = await api("POST", `/ventes/${$("rs-vid").value}/resolve`, {
      resolution: Number($("rs-type").value), note: $("rs-note").value,
    });
    showSuccess("rs-result", `Problème résolu (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("rs-result", e.message); }
}

async function viewProduct() {
  try {
    const d = await api("GET", `/products/${$("pv-id").value}`);
    const ref = d.referenceProduit;
    const qr = `<div style="text-align:center;margin-bottom:1rem">
      <img src="/api/qrcode/${encodeURIComponent(ref)}"
           alt="QR" style="width:130px;height:130px;">
      <p style="font-size:0.85rem;color:#666;">Scan: ${ref}</p>
    </div>`;
    $("pv-result").innerHTML = qr + `<pre>${JSON.stringify(d, null, 2)}</pre>`;
  } catch (e) { $("pv-result").textContent = "Erreur: " + e.message; }
}
