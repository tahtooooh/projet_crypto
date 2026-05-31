function renderClient() {
  const content = $('content');
  stopQrScanner(); // stoppe caméra si on revient sur cette page

  const confirmCard = renderCard('Confirmer la livraison', `
    <p style="color:var(--text2);font-size:0.88rem;margin-bottom:1rem">
      Confirmez la réception de votre commande une fois le colis arrivé.
    </p>
    <div class="form-group">
      <label>ID Vente</label>
      <input type="number" id="c-vid" placeholder="1">
    </div>
    <button onclick="confirmDelivery()" class="btn-success">✅ Confirmer la livraison</button>
    <div id="c-result" style="margin-top:0.8rem"></div>
  `);

  const scanCard = renderQRScanCard("c-qr-reader", "ch-ref", "c-qr-result");

  const histProdCard = renderCard('🔍 Rechercher & voir l\'historique', `
    <p style="color:var(--text2);font-size:0.85rem;margin-bottom:1rem">
      Entrez la référence manuellement ou scannez le QR code ci-dessus.
    </p>
    <div class="form-grid">
      <div class="form-group">
        <label>Référence produit</label>
        <input type="text" id="ch-ref" placeholder="REF-001"
               style="text-transform:uppercase"
               oninput="$('ch-pid').value=''">
      </div>
      <div class="form-group">
        <label>— ou — ID Produit</label>
        <input type="number" id="ch-pid" placeholder="1"
               oninput="$('ch-ref').value=''">
      </div>
    </div>
    <button id="ch-search-btn" class="btn-outline" onclick="viewHistProduct()">
      📋 Voir l'historique produit
    </button>
    <div id="ch-result" style="margin-top:0.8rem"></div>
    <div id="ch-hist"   style="margin-top:0.6rem"></div>
  `);

  const histVenteCard = renderCard('Historique d\'une vente', `
    <div class="form-group">
      <label>ID Vente</label>
      <input type="number" id="ch-vid" placeholder="1">
    </div>
    <button onclick="viewHistVente()" class="btn-outline">📋 Voir l'historique vente</button>
    <div id="chv-result" style="margin-top:0.8rem"></div>
    <div id="chv-hist"   style="margin-top:0.6rem"></div>
  `);

  content.innerHTML = pageHeader('client') + confirmCard + scanCard + histProdCard + histVenteCard;
}

async function confirmDelivery() {
  try {
    const vid = $("c-vid").value;
    if (!vid) return showError("c-result", "ID vente requis");
    const d = await api("PUT", `/ventes/${vid}/confirm`);
    showSuccess("c-result", `Livraison confirmée — tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("c-result", e.message);
  }
}

async function viewHistProduct() {
  const ref = $("ch-ref") ? $("ch-ref").value.trim().toUpperCase() : "";
  const pid = $("ch-pid") ? $("ch-pid").value.trim() : "";

  if (!ref && !pid) return showError("ch-result", "Entrez une référence ou un ID produit");

  $("ch-result").innerHTML = `<p style="color:var(--text2);font-size:0.85rem">⏳ Chargement...</p>`;
  $("ch-hist").innerHTML = "";

  try {
    let product, history;

    if (ref) {
      product = await api("GET", `/products/ref/${encodeURIComponent(ref)}`);
      history = await api("GET", `/history/product/${product.id}`);
    } else {
      product = await api("GET", `/products/${pid}`);
      history = await api("GET", `/history/product/${pid}`);
    }

    const statutLabels = { 0: "En production", 1: "Finalisé", 2: "En vente", 3: "Expédié", 4: "Livré" };
    const statutColors = { 0: "badge-orange", 1: "badge-green", 2: "badge-blue", 3: "badge-orange", 4: "badge-green" };

    showSuccess("ch-result", `Produit trouvé : <strong>${product.nom}</strong>`);

    $("ch-result").innerHTML += `
      <div style="margin:0.5rem 0">
        <span class="badge badge-green">✓ Authentique</span>
        <span class="badge ${statutColors[product.statut] || 'badge-blue'}" style="margin-left:6px">
          ${statutLabels[product.statut] || product.statut}
        </span>
      </div>
      <div class="product-info" style="margin-bottom:0.6rem">
        <div class="info-item">
          <div class="info-label">Référence</div>
          <div class="info-value" style="font-family:var(--mono)">${product.referenceProduit}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Origine</div>
          <div class="info-value">${product.origine}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Stock</div>
          <div class="info-value">${product.stockDisponible} / ${product.stockProduit}</div>
        </div>
      </div>
      <div class="qr-container" style="padding:0.8rem;margin-bottom:0.6rem">
        <img src="/api/qrcode/${encodeURIComponent(product.referenceProduit)}" alt="QR"
             style="width:150px;height:150px;border-radius:var(--radius-sm);border:3px solid var(--accent);padding:6px;background:#fff;margin:0.3rem 0">
        <span class="qr-ref">${product.referenceProduit}</span>
        <button class="btn-outline"
                style="font-size:0.78rem;padding:4px 12px;margin-top:0.3rem"
                onclick="downloadQRCode('${encodeURIComponent(product.referenceProduit)}', '${product.referenceProduit}')">
          ⬇️ Télécharger QR (PNG)
        </button>
      </div>
      <h3 style="font-size:0.92rem;margin-bottom:0.4rem;color:var(--text2)">📋 Historique complet</h3>`;

    renderHistoryAdvanced(history, "ch-hist", {
      ref: product.referenceProduit,
      nom: product.nom
    });

  } catch (e) {
    showError("ch-result", e.message);
    $("ch-hist").innerHTML = "";
  }
}

async function viewHistVente() {
  const vid = $("ch-vid") ? $("ch-vid").value.trim() : "";
  if (!vid) return showError("chv-result", "ID vente requis");

  $("chv-result").innerHTML = `<p style="color:var(--text2);font-size:0.85rem">⏳ Chargement...</p>`;
  $("chv-hist").innerHTML = "";

  try {
    const history = await api("GET", `/history/vente/${vid}`);

    let venteMeta = { ref: `vente-${vid}`, nom: `Vente #${vid}` };
    try {
      const vente = await api("GET", `/ventes/${vid}`);
      if (vente && vente.productId) {
        const product = await api("GET", `/products/${vente.productId}`);
        venteMeta = { ref: product.referenceProduit, nom: `${product.nom} — Vente #${vid}` };
      }
    } catch (_) {}

    showSuccess("chv-result", `Historique vente <strong>#${vid}</strong> — ${history.length} entrée(s)`);
    renderHistoryAdvanced(history, "chv-hist", venteMeta);

  } catch (e) {
    showError("chv-result", e.message);
    $("chv-hist").innerHTML = "";
  }
}