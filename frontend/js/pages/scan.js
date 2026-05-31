// =============================================================
// scan.js — Utilitaires QR partagés (Client + Transporteur)
// La page "Scan QR" indépendante a été supprimée du menu.
// Ce fichier expose renderQRScanCard() et scanByRef() globalement.
// =============================================================

let _scanner = null;

function loadScript(url, cb) {
  if (document.querySelector(`script[src="${url}"]`)) { cb(); return; }
  const s = document.createElement("script");
  s.src = url; s.onload = cb;
  document.head.appendChild(s);
}

// ── Arrête le scanner s'il tourne (changement de page) ──
function stopQrScanner() {
  if (_scanner) {
    _scanner.stop().catch(() => {});
    _scanner = null;
  }
}

// ── Génère le HTML d'une carte "Scanner QR" ──
// readerId   : id du div caméra
// refInputId : id du champ texte à remplir après scan
// resultId   : id du div de feedback
function renderQRScanCard(readerId, refInputId, resultId) {
  return renderCard('📷 Scanner un QR code', `
    <p style="color:var(--text2);font-size:0.85rem;margin-bottom:0.8rem">
      Pointez la caméra sur le QR code du produit — la référence sera détectée automatiquement.
    </p>
    <button id="${readerId}-btn" class="btn-outline"
            style="margin-bottom:0.8rem;font-size:0.85rem"
            onclick="startQrScanner('${readerId}','${refInputId}','${resultId}','${readerId}-btn')">
      📷 Activer la caméra
    </button>
    <div id="${readerId}" style="width:260px;border-radius:var(--radius-sm);overflow:hidden"></div>
    <div id="${resultId}" style="margin-top:0.6rem"></div>
  `);
}

// ── Démarre le scanner dans un readerId donné ──
function startQrScanner(readerId, refInputId, resultId, btnId) {
  const btn = document.getElementById(btnId);
  if (btn) { btn.textContent = "⏳ Démarrage caméra..."; btn.disabled = true; }

  stopQrScanner(); // stoppe l'éventuel scanner précédent

  function initScanner() {
    _scanner = new Html5Qrcode(readerId);
    _scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 200, height: 200 } },
      (decodedText) => {
        // Extraire la référence depuis l'URL encodée ou le texte brut
        const match = decodedText.match(/scan=([^&]+)/);
        const ref   = match ? decodeURIComponent(match[1]) : decodedText;

        const refEl = document.getElementById(refInputId);
        if (refEl) refEl.value = ref;

        const resEl = document.getElementById(resultId);
        if (resEl) resEl.innerHTML = `<div class="success">✅ QR détecté : <strong>${ref}</strong></div>`;

        if (btn) { btn.textContent = "📷 Activer la caméra"; btn.disabled = false; }
        stopQrScanner();

        // Déclencher la recherche selon le contexte (client ou transporteur)
        const searchBtn = document.getElementById(refInputId + "-search-btn");
        if (searchBtn) searchBtn.click();
      },
      () => {}
    ).then(() => {
      if (btn) { btn.textContent = "⏹ Arrêter la caméra"; btn.disabled = false; btn.onclick = () => { stopQrScanner(); btn.textContent = "📷 Activer la caméra"; btn.disabled = false; btn.onclick = () => startQrScanner(readerId, refInputId, resultId, btnId); }; }
    }).catch((err) => {
      if (btn) { btn.textContent = "📷 Activer la caméra"; btn.disabled = false; }
      const resEl = document.getElementById(resultId);
      if (resEl) resEl.innerHTML = `<div class="error">Caméra inaccessible : ${err}</div>`;
    });
  }

  if (typeof Html5Qrcode === "undefined") {
    loadScript("https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js", initScanner);
  } else {
    initScanner();
  }
}

// ── Recherche produit par référence (utilisée par client + URL ?scan=) ──
async function scanByRef(refInputId, resultContainerId, histContainerId) {
  const refEl = document.getElementById(refInputId || "scan-ref");
  const ref   = refEl ? refEl.value.trim() : "";
  if (!ref) return showError(refInputId ? refInputId + "-result" : "scan-ref-result", "Entrez une référence produit");

  const resId  = resultContainerId || "scan-ref-result";
  const histId = histContainerId   || "scan-history-adv";

  showSuccess(resId, "Recherche en cours...");
  const resContainer = document.getElementById(histId);
  if (resContainer) resContainer.innerHTML = `<p style="color:var(--text2);font-size:0.85rem">⏳ Chargement...</p>`;

  try {
    const product = await api("GET", `/products/ref/${encodeURIComponent(ref)}`);
    const history = await api("GET", `/history/product/${product.id}`);

    const statutLabels = { 0: "En production", 1: "Finalisé", 2: "En vente", 3: "Expédié", 4: "Livré" };
    const statutColors = { 0: "badge-orange", 1: "badge-green", 2: "badge-blue", 3: "badge-orange", 4: "badge-green" };

    showSuccess(resId, `Produit authentifié : <strong>${product.nom}</strong>`);

    document.getElementById(resId).innerHTML += `
      <div style="margin:0.6rem 0 0.4rem">
        <span class="badge badge-green">✓ Authentique</span>
        <span class="badge ${statutColors[product.statut] || 'badge-blue'}" style="margin-left:6px">
          ${statutLabels[product.statut] || product.statut}
        </span>
      </div>
      <div class="product-info" style="margin-bottom:0.8rem">
        <div class="info-item">
          <div class="info-label">Référence</div>
          <div class="info-value" style="font-family:var(--mono)">${product.referenceProduit}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Nom</div>
          <div class="info-value">${product.nom}</div>
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
      <div class="qr-container" style="padding:0.8rem;margin-bottom:0.8rem">
        <img src="/api/qrcode/${encodeURIComponent(product.referenceProduit)}" alt="QR Code"
             style="width:150px;height:150px;border-radius:var(--radius-sm);border:3px solid var(--accent);padding:6px;background:#fff;margin:0.3rem 0">
        <span class="qr-ref">${product.referenceProduit}</span>
        <button class="btn-outline"
                style="font-size:0.78rem;padding:4px 12px;margin-top:0.3rem"
                onclick="downloadQRCode('${encodeURIComponent(product.referenceProduit)}', '${product.referenceProduit}')">
          ⬇️ Télécharger QR (PNG)
        </button>
      </div>
      <h3 style="font-size:0.92rem;margin-bottom:0.4rem;color:var(--text2)">📋 Historique complet</h3>
      <div id="${histId}"></div>`;

    renderHistoryAdvanced(history, histId, {
      ref: product.referenceProduit,
      nom: product.nom
    });

  } catch (e) {
    showError(resId, e.message);
    if (resContainer) resContainer.innerHTML = "";
  }
}

// ── Gestion URL ?scan=REF (redirection depuis un QR scanné externe) ──
// Appelé au chargement depuis app.js si le param est présent
function handleScanParam(ref) {
  // Naviguer vers la page client et pré-remplir
  navigate("client");
  setTimeout(() => {
    const el = document.getElementById("ch-ref");
    if (el) { el.value = ref; }
    const btn = document.getElementById("ch-search-btn");
    if (btn) btn.click();
  }, 400);
}