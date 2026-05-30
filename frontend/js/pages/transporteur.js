function renderTransporteur() {
  const content = $(`content`);

  const updateCard = renderCard(`Mettre à jour le transport`, `
    <div class="form-group"><label>ID Vente</label><input type="number" id="t-vid" placeholder="1"></div>
    <div class="form-group"><label>Étape transport</label>
      <select id="t-etape">
        <option value="1">Départ</option>
        <option value="2">En cours</option>
        <option value="3">Arrivé</option>
      </select>
    </div>
    <div class="form-group"><label>Événement</label>
      <select id="t-ev">
        <option value="0">Aucun</option>
        <option value="1">Retard</option>
        <option value="2">Anomalie</option>
        <option value="3">Incident</option>
      </select>
    </div>
    <div class="form-group"><label>Note</label><input type="text" id="t-note" placeholder="Retard douane"></div>
    <button onclick="updateTransport()">Mettre à jour</button>
    <div id="t-result" style="margin-top:0.5rem"></div>
  `);

  const viewCard = renderCard(`Consulter une vente`, `
    <div class="form-group"><label>ID Vente</label><input type="number" id="tv-id" placeholder="1"></div>
    <button onclick="viewVente()">Voir</button>
    <pre id="tv-result" style="margin-top:0.5rem"></pre>
  `);

  content.innerHTML = updateCard + viewCard;
}

async function updateTransport() {
  try {
    const d = await api("PUT", `/ventes/${$("t-vid").value}/transport`, {
      etape: Number($("t-etape").value),
      evenement: Number($("t-ev").value),
      note: $("t-note").value,
    });
    showSuccess("t-result", `Transport mis à jour (tx: ${d.txHash.slice(0,20)}...)`);
  } catch (e) { showError("t-result", e.message); }
}

async function viewVente() {
  try {
    const d = await api("GET", `/ventes/${$("tv-id").value}`);
    $("tv-result").textContent = JSON.stringify(d, null, 2);
  } catch (e) { $("tv-result").textContent = "Erreur: " + e.message; }
}
