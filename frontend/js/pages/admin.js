function renderAdmin() {
  const content = $('content');

  const deployCard = renderCard('Déployer le contrat', `
    <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:1rem;">
      Déploie le smart contract TraceChain sur le réseau Ethereum Sepolia.
    </p>
    <button onclick="deployContract()">⚡ Déployer sur Sepolia</button>
    <div id="deploy-result" style="margin-top:0.8rem"></div>
  `);

  const roleCard = renderCard('Assigner un rôle', `
    <div class="form-grid">
      <div class="form-group full">
        <label>Adresse wallet</label>
        <input type="text" id="role-address" placeholder="0x...">
      </div>
      <div class="form-group">
        <label>Rôle</label>
        <select id="role-type">
          <option value="Producteur">🏭 Producteur</option>
          <option value="Transporteur">🚚 Transporteur</option>
          <option value="Client">📦 Client</option>
        </select>
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end;">
        <button onclick="assignRole()" style="width:100%">Assigner</button>
      </div>
    </div>
    <div id="role-result" style="margin-top:0.5rem"></div>
  `);

  const checkCard = renderCard('Vérifier une adresse', `
    <div class="form-group">
      <label>Adresse wallet</label>
      <input type="text" id="check-role-address" placeholder="0x...">
    </div>
    <button onclick="checkRole()" class="btn-outline">🔍 Vérifier</button>
    <pre id="check-role-result" style="margin-top:0.8rem;display:none"></pre>
  `);

  content.innerHTML = pageHeader('admin') + deployCard + roleCard + checkCard;
}

async function deployContract() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Déploiement...';
  try {
    const data = await api("POST", "/admin/deploy");
    showSuccess("deploy-result", `Contrat déployé : <strong style="font-family:monospace">${data.address}</strong>`);
  } catch (e) {
    showError("deploy-result", e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '⚡ Déployer sur Sepolia';
  }
}

async function assignRole() {
  try {
    const address = $("role-address").value;
    const role = $("role-type").value;
    if (!address) return showError("role-result", "Adresse requise");
    const data = await api("POST", "/admin/role", { address, role });
    showSuccess("role-result", `<strong>${role}</strong> assigné à <span style="font-family:monospace">${data.address.slice(0,16)}...</span> (tx: ${data.txHash.slice(0,18)}...)`);
  } catch (e) {
    showError("role-result", e.message);
  }
}

async function checkRole() {
  const el = $("check-role-result");
  el.style.display = 'block';
  el.textContent = "Fonction disponible uniquement en lecture via Etherscan pour le contrat déployé.";
}
