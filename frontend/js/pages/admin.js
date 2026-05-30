function renderAdmin() {
  const content = $(`content`);

  const deployCard = renderCard(`Déployer le contrat`, `
    <button onclick="deployContract()">Déployer sur Sepolia</button>
    <div id="deploy-result" style="margin-top:0.5rem"></div>
  `);

  const roleCard = renderCard(`Assigner un rôle`, `
    <div class="form-group">
      <label>Adresse wallet</label>
      <input type="text" id="role-address" placeholder="0x...">
    </div>
    <div class="form-group">
      <label>Rôle</label>
      <select id="role-type">
        <option value="Producteur">Producteur</option>
        <option value="Transporteur">Transporteur</option>
        <option value="Client">Client</option>
      </select>
    </div>
    <button onclick="assignRole()">Assigner</button>
    <div id="role-result" style="margin-top:0.5rem"></div>
  `);

  const viewCard = renderCard(`Voir le rôle d'une adresse`, `
    <div class="form-group">
      <input type="text" id="check-role-address" placeholder="0x...">
    </div>
    <button onclick="checkRole()">Vérifier</button>
    <pre id="check-role-result" style="margin-top:0.5rem"></pre>
  `);

  content.innerHTML = deployCard + roleCard + viewCard;
}

async function deployContract() {
  try {
    const data = await api("POST", "/admin/deploy");
    showSuccess("deploy-result", `Contrat déployé à <strong>${data.address}</strong>`);
  } catch (e) {
    showError("deploy-result", e.message);
  }
}

async function assignRole() {
  try {
    const address = $("role-address").value;
    const role = $("role-type").value;
    const data = await api("POST", "/admin/role", { address, role });
    showSuccess("role-result", `${role} ajouté: ${data.address} (tx: ${data.txHash.slice(0, 20)}...)`);
  } catch (e) {
    showError("role-result", e.message);
  }
}

async function checkRole() {
  try {
    const addr = $("check-role-address").value;
    // On utilise l'endpoint product pour vérifier si l'adresse a un rôle (via le contract read-only)
    // Simple fallback: on affiche l'adresse
    $("check-role-result").textContent = "Fonction non disponible en lecture directe. Consultez l'adresse du contrat sur Etherscan.";
  } catch (e) {
    $("check-role-result").textContent = "Erreur: " + e.message;
  }
}
