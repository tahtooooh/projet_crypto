function renderML() {
  const content = $(`content`);
  content.innerHTML = `
    <div class="card">
      <h2>Prédiction de Retard Logistique</h2>
      <p style="margin-bottom:1rem;color:#888;">Remplissez les champs pour prédire si une expédition aura du retard</p>
      <div class="form-grid">
        <div class="form-group">
          <label>Camion</label>
          <select id="ml-asset_id">
            <option value="Truck_7">Truck 7</option><option value="Truck_6">Truck 6</option>
            <option value="Truck_10">Truck 10</option><option value="Truck_9">Truck 9</option>
            <option value="Truck_3">Truck 3</option><option value="Truck_5">Truck 5</option>
            <option value="Truck_1">Truck 1</option><option value="Truck_4">Truck 4</option>
            <option value="Truck_8">Truck 8</option><option value="Truck_2">Truck 2</option>
          </select>
        </div>
        <div class="form-group">
          <label>Statut expédition</label>
          <select id="ml-shipment_status">
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Delayed">Delayed</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Pickup Scheduled">Pickup Scheduled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div class="form-group">
          <label>Etat du trafic</label>
          <select id="ml-traffic_status">
            <option value="Clear">Clear</option>
            <option value="Heavy">Heavy</option>
            <option value="Detour">Detour</option>
          </select>
        </div>
        <div class="form-group">
          <label>Raison du retard</label>
          <select id="ml-logistics_delay_reason">
            <option value="">Aucune</option>
            <option value="Weather">Weather</option>
            <option value="Traffic">Traffic</option>
            <option value="Customs">Customs</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Staff">Staff</option>
            <option value="Documentation">Documentation</option>
          </select>
        </div>
        <div class="form-group">
          <label>Température (°C)</label>
          <input type="number" id="ml-temperature" value="25" step="0.1">
        </div>
        <div class="form-group">
          <label>Humidité (%)</label>
          <input type="number" id="ml-humidity" value="50" step="0.1">
        </div>
        <div class="form-group">
          <label>Temps d'attente (min)</label>
          <input type="number" id="ml-waiting_time" value="15">
        </div>
        <div class="form-group">
          <label>Niveau de stock</label>
          <input type="number" id="ml-inventory_level" value="300">
        </div>
        <div class="form-group">
          <label>Utilisation (%)</label>
          <input type="number" id="ml-asset_utilization" value="75" step="0.1">
        </div>
        <div class="form-group">
          <label>Prévision de demande</label>
          <input type="number" id="ml-demand_forecast" value="200">
        </div>
        <div class="form-group">
          <label>Montant transaction</label>
          <input type="number" id="ml-user_transaction_amount" value="350">
        </div>
        <div class="form-group">
          <label>Fréquence d'achat</label>
          <input type="number" id="ml-user_purchase_frequency" value="5">
        </div>
        <div class="form-group">
          <label>Latitude</label>
          <input type="number" id="ml-latitude" value="30" step="0.0001">
        </div>
        <div class="form-group">
          <label>Longitude</label>
          <input type="number" id="ml-longitude" value="-10" step="0.0001">
        </div>
      </div>
      <button onclick="predictDelay()" class="btn-primary" style="margin-top:1rem">Prédire</button>
      <div id="ml-result" style="margin-top:1rem"></div>
    </div>
  `;
}

async function predictDelay() {
  const get = id => document.getElementById(id)?.value;
  const payload = {
    asset_id: get("ml-asset_id"),
    shipment_status: get("ml-shipment_status"),
    traffic_status: get("ml-traffic_status"),
    logistics_delay_reason: get("ml-logistics_delay_reason"),
    temperature: parseFloat(get("ml-temperature")) || 0,
    humidity: parseFloat(get("ml-humidity")) || 0,
    waiting_time: parseInt(get("ml-waiting_time")) || 0,
    inventory_level: parseInt(get("ml-inventory_level")) || 0,
    asset_utilization: parseFloat(get("ml-asset_utilization")) || 0,
    demand_forecast: parseInt(get("ml-demand_forecast")) || 0,
    user_transaction_amount: parseInt(get("ml-user_transaction_amount")) || 0,
    user_purchase_frequency: parseInt(get("ml-user_purchase_frequency")) || 0,
    latitude: parseFloat(get("ml-latitude")) || 0,
    longitude: parseFloat(get("ml-longitude")) || 0,
  };

  try {
    const res = await api("POST", "/ml/predict", payload);
    const el = document.getElementById("ml-result");
    if (res.error) {
      el.innerHTML = `<div class="error">${res.error}</div>`;
      return;
    }
    const isDelay = res.prediction === 1;
    el.innerHTML = `
      <div class="result-card ${isDelay ? 'delay' : 'ok'}">
        <div style="font-size:1.5rem;font-weight:bold;margin-bottom:0.5rem">
          ${isDelay ? "⚠️ Retard probable" : "✅ Pas de retard"}
        </div>
        <div style="display:flex;gap:2rem;justify-content:center">
          <div><small>Pas de retard</small><br><strong>${(res.probability_0 * 100).toFixed(1)}%</strong></div>
          <div><small>Retard</small><br><strong>${(res.probability_1 * 100).toFixed(1)}%</strong></div>
        </div>
      </div>
    `;
  } catch (e) {
    document.getElementById("ml-result").innerHTML = `<div class="error">Erreur: ${e.message}</div>`;
  }
}
