function renderProducteur() {
  const content = $('content');

  const addCard = renderCard('Ajouter un produit', `
    <div class="form-grid">
      <div class="form-group">
        <label>Référence</label>
        <input type="text" id="p-ref" placeholder="REF-001">
      </div>
      <div class="form-group">
        <label>Nom du produit</label>
        <input type="text" id="p-nom" placeholder="Produit X">
      </div>
      <div class="form-group">
        <label>Origine</label>
        <input type="text" id="p-origine" placeholder="Maroc">
      </div>
      <div class="form-group">
        <label>Stock initial</label>
        <input type="number" id="p-stock" placeholder="100">
      </div>
    </div>
    <button onclick="addProduct()">➕ Ajouter le produit</button>
    <div id="p-add-result" style="margin-top:0.8rem"></div>
    <div id="p-qrcode"></div>
  `);

  const prodCard = renderCard('Mise à jour production', `
    <div class="form-grid">
      <div class="form-group">
        <label>ID Produit</label>
        <input type="number" id="pu-id" placeholder="1">
      </div>
      <div class="form-group">
        <label>Étape de production</label>
        <input type="text" id="pu-etape" placeholder="Assemblage">
      </div>
    </div>
    <button onclick="updateProduction()">🔄 Mettre à jour</button>
    <div id="pu-result" style="margin-top:0.8rem"></div>
  `);

  const finalCard = renderCard('Finaliser un produit', `
    <div class="form-group">
      <label>ID Produit</label>
      <input type="number" id="pf-id" placeholder="1">
    </div>
    <button onclick="finalizeProduct()" class="btn-success">✅ Finaliser la production</button>
    <div id="pf-result" style="margin-top:0.8rem"></div>
  `);

  const venteCard = renderCard('Créer une vente', `
    <div class="form-grid">
      <div class="form-group">
        <label>ID Produit</label>
        <input type="number" id="v-prodid" placeholder="1">
      </div>
      <div class="form-group">
        <label>Quantité</label>
        <input type="number" id="v-qte" placeholder="10">
      </div>
      <div class="form-group full">
        <label>Adresse client (wallet)</label>
        <input type="text" id="v-client" placeholder="0x...">
      </div>
      <div class="form-group full">
        <label>Adresse de livraison</label>
        <input type="text" id="v-adresse" placeholder="Casablanca, Maroc">
      </div>
    </div>
    <button onclick="createVente()">🛒 Créer la vente</button>
    <div id="v-result" style="margin-top:0.8rem"></div>
  `);

  const assignCard = renderCard('Assigner un transporteur', `
    <div class="form-grid">
      <div class="form-group">
        <label>ID Vente</label>
        <input type="number" id="ta-vid" placeholder="1">
      </div>
      <div class="form-group full">
        <label>Adresse transporteur (wallet)</label>
        <input type="text" id="ta-addr" placeholder="0x...">
      </div>
    </div>
    <button onclick="assignTransport()">🚚 Assigner</button>
    <div id="ta-result" style="margin-top:0.8rem"></div>
  `);

  const resolveCard = renderCard('Résoudre un problème', `
    <div class="form-grid">
      <div class="form-group">
        <label>ID Vente</label>
        <input type="number" id="rs-vid" placeholder="1">
      </div>
      <div class="form-group">
        <label>Type de résolution</label>
        <select id="rs-type">
          <option value="1">💰 Remise</option>
          <option value="2">↩️ Remboursement</option>
          <option value="3">🔄 Remplacement</option>
          <option value="4">❌ Annulation</option>
        </select>
      </div>
      <div class="form-group full">
        <label>Note explicative</label>
        <input type="text" id="rs-note" placeholder="Produit endommagé lors du transport">
      </div>
    </div>
    <button onclick="resolveProblem()" class="btn-danger">🛠️ Résoudre</button>
    <div id="rs-result" style="margin-top:0.8rem"></div>
  `);

  const viewCard = renderCard('Consulter un produit', `
    <div class="form-group">
      <label>ID Produit</label>
      <input type="number" id="pv-id" placeholder="1">
    </div>
    <button onclick="viewProduct()" class="btn-outline">🔍 Consulter</button>
    <div id="pv-result" style="margin-top:0.8rem"></div>
  `);

  content.innerHTML = pageHeader('producteur') + addCard + prodCard + finalCard + venteCard + assignCard + resolveCard + viewCard;
}

async function addProduct() {
  try {
    const ref = $("p-ref").value.trim();
    const nom = $("p-nom").value.trim();
    const origine = $("p-origine").value.trim();
    const stock = Number($("p-stock").value);

    if (!ref) return showError("p-add-result", "Référence requise");
    if (!nom) return showError("p-add-result", "Nom du produit requis");
    if (!origine) return showError("p-add-result", "Origine requise");
    if (!stock || stock <= 0) return showError("p-add-result", "Stock invalide");

    $("p-add-result").innerHTML = `<p style="color:var(--text-secondary);font-size:0.88rem">⏳ Transaction en cours sur la blockchain...</p>`;
    $("p-qrcode").innerHTML = "";

    const d = await api("POST", "/products", { ref, nom, origine, stock });

    showSuccess(
      "p-add-result",
      `Produit ajouté — ID: <strong>${d.productId}</strong> | tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`
    );

    await showQRCode(ref, d.productId, nom, origine, stock);
  } catch (e) {
    showError("p-add-result", e.message);
  }
}

async function showQRCode(ref, id, nom, origine, stock) {
  const div = $("p-qrcode");
  const qrUrl = `/api/qrcode/${encodeURIComponent(ref)}`;

  div.innerHTML = `
    <div class="qr-container" id="qr-result-block" style="animation:fadeUp 0.4s ease">
      <span class="badge badge-green">✓ QR Code Généré</span>
      <img id="qr-img-preview" src="${qrUrl}" alt="QR Code"
           style="width:180px;height:180px;border-radius:var(--radius-sm);border:3px solid var(--accent);padding:8px;background:#fff;margin:0.6rem 0">
      <span class="qr-ref">${ref}</span>
      <span class="qr-label" style="margin-bottom:0.8rem">ID : ${id} · ${nom} · ${origine} · Stock : ${stock}</span>
      <button id="qr-dl-btn" class="btn-outline"
              onclick="downloadQRCode('${encodeURIComponent(ref)}', '${ref}')"
              style="font-size:0.82rem;padding:6px 16px;margin-top:0.2rem">
        ⬇️ Télécharger le QR Code (PNG)
      </button>
    </div>

    <div id="qr-history-block" style="margin-top:1rem">
      <h3 style="font-size:0.93rem;margin-bottom:0.6rem;color:var(--text-secondary)">📋 Historique initial enregistré</h3>
      <p style="color:var(--text-muted);font-size:0.85rem">⏳ Chargement de l'historique...</p>
    </div>`;

  try {
    const history = await api("GET", `/history/product/${id}`);
    const histBlock = document.getElementById("qr-history-block");

    if (!history || history.length === 0) {
      histBlock.innerHTML = `
        <h3 style="font-size:0.93rem;margin-bottom:0.6rem;color:var(--text-secondary)">📋 Historique initial enregistré</h3>
        <p style="color:var(--text-muted);font-size:0.85rem">Aucune entrée pour l'instant.</p>`;
      return;
    }

    histBlock.innerHTML = `
      <h3 style="font-size:0.93rem;margin-bottom:0.6rem;color:var(--text2)">
        📋 Historique initial enregistré
      </h3>
      <div id="qr-hist-adv"></div>`;

    renderHistoryAdvanced(history, "qr-hist-adv", { ref, nom });
  } catch (err) {
    const histBlock = document.getElementById("qr-history-block");
    if (histBlock) {
      histBlock.innerHTML = `
        <h3 style="font-size:0.93rem;margin-bottom:0.6rem;color:var(--text-secondary)">📋 Historique initial enregistré</h3>
        <p style="color:var(--red);font-size:0.85rem">Impossible de charger l'historique : ${err.message}</p>`;
    }
  }
}


async function updateProduction() {
  try {
    const id = $("pu-id").value;
    const etape = $("pu-etape").value;
    if (!id || !etape) return showError("pu-result", "ID et étape requis");
    const d = await api("PUT", `/products/${id}/production`, { etape });
    showSuccess("pu-result", `Production mise à jour — tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("pu-result", e.message);
  }
}

async function finalizeProduct() {
  try {
    const id = $("pf-id").value;
    if (!id) return showError("pf-result", "ID requis");
    const d = await api("PUT", `/products/${id}/finalize`);
    showSuccess("pf-result", `Produit finalisé — tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("pf-result", e.message);
  }
}

async function createVente() {
  try {
    const d = await api("POST", "/ventes", {
      productId: Number($("v-prodid").value),
      client: $("v-client").value,
      adresse: $("v-adresse").value,
      qte: Number($("v-qte").value),
    });
    showSuccess("v-result", `Vente créée — ID: <strong>${d.venteId}</strong> | tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("v-result", e.message);
  }
}

async function assignTransport() {
  try {
    const vid = $("ta-vid").value;
    const addr = $("ta-addr").value;
    if (!vid || !addr) return showError("ta-result", "ID vente et adresse requis");
    const d = await api("PUT", `/ventes/${vid}/transport/assign`, { transporteur: addr });
    showSuccess("ta-result", `Transporteur assigné — tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("ta-result", e.message);
  }
}

async function resolveProblem() {
  try {
    const vid = $("rs-vid").value;
    if (!vid) return showError("rs-result", "ID vente requis");
    const d = await api("POST", `/ventes/${vid}/resolve`, {
      resolution: Number($("rs-type").value),
      note: $("rs-note").value,
    });
    showSuccess("rs-result", `Problème résolu — tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("rs-result", e.message);
  }
}

async function viewProduct() {
  try {
    const id = $("pv-id").value;
    if (!id) return showError("pv-result", "ID requis");
    const d = await api("GET", `/products/${id}`);
    const ref = d.referenceProduit;

    const statutLabels = { 0: 'En production', 1: 'Finalisé', 2: 'En vente', 3: 'Expédié', 4: 'Livré' };
    const statutBadge = `<span class="badge badge-cyan">${statutLabels[d.statut] || d.statut}</span>`;

    $("pv-result").innerHTML = `
      <div class="product-info" style="margin-top:0.5rem">
        <div class="info-item">
          <div class="info-label">Référence</div>
          <div class="info-value">${ref}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Nom</div>
          <div class="info-value">${d.nom}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Origine</div>
          <div class="info-value">${d.origine}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Stock disponible</div>
          <div class="info-value">${d.stockDisponible} / ${d.stockProduit}</div>
        </div>
      </div>
      <div style="margin-bottom:1rem">${statutBadge}</div>
      <div class="qr-container" style="padding:1rem">
        <img src="/api/qrcode/${encodeURIComponent(ref)}" alt="QR Code"
             style="width:180px;height:180px;border-radius:var(--radius-sm);border:3px solid var(--accent);padding:8px;background:#fff;margin:0.4rem 0">
        <span class="qr-ref">${ref}</span>
        <button class="btn-outline"
                onclick="downloadQRCode('${encodeURIComponent(ref)}', '${ref}')"
                style="font-size:0.82rem;padding:6px 16px;margin-top:0.4rem">
          ⬇️ Télécharger le QR Code (PNG)
        </button>
      </div>
    `;
  } catch (e) {
    showError("pv-result", e.message);
  }
}