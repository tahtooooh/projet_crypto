function renderTransporteur() {
  const content = $('content');

  const updateCard = renderCard('Mettre à jour le transport', `
    <div class="step-indicator">
      <div class="step-item" id="step-1">1 · Départ</div>
      <div class="step-item" id="step-2">2 · En cours</div>
      <div class="step-item" id="step-3">3 · Arrivé</div>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>ID Vente</label>
        <input type="number" id="t-vid" placeholder="1">
      </div>
      <div class="form-group">
        <label>Étape transport</label>
        <select id="t-etape" onchange="updateStepIndicator(this.value)">
          <option value="1">🚀 Départ</option>
          <option value="2">🔄 En cours</option>
          <option value="3">✅ Arrivé</option>
        </select>
      </div>
      <div class="form-group">
        <label>Événement</label>
        <select id="t-ev">
          <option value="0">— Aucun</option>
          <option value="1">⏰ Retard</option>
          <option value="2">⚠️ Anomalie</option>
          <option value="3">🚨 Incident</option>
        </select>
      </div>
      <div class="form-group">
        <label>Note</label>
        <input type="text" id="t-note" placeholder="Retard douane, incident...">
      </div>
    </div>
    <button onclick="updateTransport()">📡 Mettre à jour</button>
    <div id="t-result" style="margin-top:0.8rem"></div>
  `);

  const viewCard = renderCard('Consulter une vente', `
    <div class="form-group">
      <label>ID Vente</label>
      <input type="number" id="tv-id" placeholder="1">
    </div>
    <button onclick="viewVente()" class="btn-outline">🔍 Consulter</button>
    <div id="tv-result" style="margin-top:0.8rem"></div>
  `);

  content.innerHTML = pageHeader('transporteur') + updateCard + viewCard;
}

function updateStepIndicator(val) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step-${i}`);
    if (!el) return;
    el.className = 'step-item';
    if (i < Number(val)) el.classList.add('done');
    else if (i === Number(val)) el.classList.add('active');
  }
}

async function updateTransport() {
  try {
    const vid = $("t-vid").value;
    if (!vid) return showError("t-result", "ID vente requis");
    const d = await api("PUT", `/ventes/${vid}/transport`, {
      etape: Number($("t-etape").value),
      evenement: Number($("t-ev").value),
      note: $("t-note").value,
    });
    showSuccess("t-result", `Transport mis à jour — tx: <span style="font-family:monospace">${d.txHash.slice(0,20)}...</span>`);
  } catch (e) {
    showError("t-result", e.message);
  }
}

async function viewVente() {
  try {
    const id = $("tv-id").value;
    if (!id) return showError("tv-result", "ID requis");
    const d = await api("GET", `/ventes/${id}`);

    const etapeLabels = { 0: 'Pas commencé', 1: 'Départ', 2: 'En cours', 3: 'Arrivé' };
    const evLabels    = { 0: 'Aucun', 1: 'Retard', 2: 'Anomalie', 3: 'Incident' };
    const statutLabels = { 0: 'En production', 1: 'Finalisé', 2: 'En vente', 3: 'Expédié', 4: 'Livré' };

    $("tv-result").innerHTML = `
      <div class="product-info" style="margin-top:0.5rem">
        <div class="info-item">
          <div class="info-label">ID Vente</div>
          <div class="info-value">#${d.id}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Statut</div>
          <div class="info-value">${statutLabels[d.statut] || d.statut}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Étape transport</div>
          <div class="info-value">${etapeLabels[d.etapeTransport] || d.etapeTransport}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Événement</div>
          <div class="info-value">${evLabels[d.evenement] || d.evenement}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Confirmée</div>
          <div class="info-value">${d.confirmee ? '✅ Oui' : '⏳ Non'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Client</div>
          <div class="info-value" style="font-size:0.75rem">${d.client ? d.client.slice(0,18)+'...' : '—'}</div>
        </div>
      </div>
    `;
  } catch (e) {
    showError("tv-result", e.message);
  }
}
