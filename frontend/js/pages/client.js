function renderClient() {
  const content = $('content');

  const confirmCard = renderCard('Confirmer la livraison', `
    <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:1rem;">
      Confirmez la réception de votre commande une fois le colis arrivé.
    </p>
    <div class="form-group">
      <label>ID Vente</label>
      <input type="number" id="c-vid" placeholder="1">
    </div>
    <button onclick="confirmDelivery()" class="btn-success">✅ Confirmer la livraison</button>
    <div id="c-result" style="margin-top:0.8rem"></div>
  `);

  const histProdCard = renderCard('Historique d\'un produit', `
    <div class="form-group">
      <label>ID Produit</label>
      <input type="number" id="ch-pid" placeholder="1">
    </div>
    <button onclick="viewHistProduct()" class="btn-outline">📋 Voir l'historique</button>
    <div id="ch-result" style="margin-top:0.8rem"></div>
  `);

  const histVenteCard = renderCard('Historique d\'une vente', `
    <div class="form-group">
      <label>ID Vente</label>
      <input type="number" id="ch-vid" placeholder="1">
    </div>
    <button onclick="viewHistVente()" class="btn-outline">📋 Voir l'historique</button>
    <div id="chv-result" style="margin-top:0.8rem"></div>
  `);

  content.innerHTML = pageHeader('client') + confirmCard + histProdCard + histVenteCard;
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
  try {
    const pid = $("ch-pid").value;
    if (!pid) return showError("ch-result", "ID requis");
    const d = await api("GET", `/history/product/${pid}`);
    $("ch-result").innerHTML = renderHistory(d);
  } catch (e) {
    showError("ch-result", e.message);
  }
}

async function viewHistVente() {
  try {
    const vid = $("ch-vid").value;
    if (!vid) return showError("chv-result", "ID requis");
    const d = await api("GET", `/history/vente/${vid}`);
    $("chv-result").innerHTML = renderHistory(d);
  } catch (e) {
    showError("chv-result", e.message);
  }
}

function renderHistory(entries) {
  if (!entries || entries.length === 0) {
    return `<p style="color:var(--text-secondary);font-size:0.88rem;padding:0.5rem 0">Aucun historique disponible.</p>`;
  }

  const items = entries.map(e => {
    const date = e.timestamp
      ? new Date(e.timestamp * 1000).toLocaleString('fr-FR')
      : '—';
    return `
      <div class="history-entry">
        <div class="h-etape">${e.etape || '—'}</div>
        <div class="h-meta">${date} · ${e.source || ''} · <span style="font-size:0.72rem">${e.acteur ? e.acteur.slice(0,14)+'...' : ''}</span></div>
        ${e.note ? `<div class="h-note">${e.note}</div>` : ''}
      </div>`;
  }).join('');

  return `<div style="margin-top:0.5rem">${items}</div>`;
}
