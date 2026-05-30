function renderScan() {
  const content = $('content');

  const searchCard = renderCard('Rechercher par référence', `
    <div class="form-group">
      <label>Référence produit</label>
      <input type="text" id="scan-ref" placeholder="REF-001">
    </div>
    <button onclick="scanByRef()">🔍 Rechercher</button>
    <div id="scan-ref-result" style="margin-top:0.8rem"></div>
  `);

  const qrCard = renderCard('Scanner un QR code', `
    <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:1rem;">
      Pointez votre caméra sur le QR code du produit pour vérifier son authenticité.
    </p>
    <div id="qr-reader" style="width:280px;margin-bottom:0.8rem"></div>
    <div id="qr-reader-result"></div>
  `);

  const resultCard = renderCard('Résultat de vérification', `
    <div id="scan-result">
      <p style="color:var(--text-muted);font-size:0.88rem">Scannez un QR code ou entrez une référence pour voir les résultats.</p>
    </div>
  `);

  content.innerHTML = pageHeader('scan') + searchCard + qrCard + resultCard;

  // Auto-fill from URL param
  const params = new URLSearchParams(window.location.search);
  const scanRef = params.get("scan");
  if (scanRef) {
    setTimeout(() => {
      const el = document.getElementById("scan-ref");
      if (el) { el.value = scanRef; scanByRef(); }
    }, 500);
  }
}

function startQrScanner() {
  const reader = document.getElementById("qr-reader");
  if (!reader || reader.innerHTML.includes("canvas")) return;

  if (typeof Html5Qrcode === "undefined") {
    loadScript("https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js", () => initScanner());
  } else {
    initScanner();
  }
}

function loadScript(url, cb) {
  const s = document.createElement("script");
  s.src = url;
  s.onload = cb;
  document.head.appendChild(s);
}

let scanner = null;

function initScanner() {
  if (scanner) return;
  scanner = new Html5Qrcode("qr-reader");
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 200, height: 200 } },
    (decodedText) => {
      const match = decodedText.match(/scan=([^&]+)/);
      const ref = match ? decodeURIComponent(match[1]) : decodedText;
      const el = document.getElementById("scan-ref");
      if (el) el.value = ref;
      document.getElementById("qr-reader-result").innerHTML =
        `<div class="success">QR détecté : ${ref}</div>`;
      if (scanner) { scanner.stop(); scanner = null; }
      scanByRef();
    },
    () => {}
  ).catch(() => {});
}

async function scanByRef() {
  const refEl = document.getElementById("scan-ref");
  const ref = refEl ? refEl.value.trim() : "";
  if (!ref) return showError("scan-ref-result", "Entrez une référence produit");

  showSuccess("scan-ref-result", "Recherche en cours...");
  document.getElementById("scan-result").innerHTML =
    `<p style="color:var(--text-muted);font-size:0.88rem">Chargement...</p>`;

  try {
    const product = await api("GET", `/products/ref/${ref}`);
    const history = await api("GET", `/history/product/${product.id}`);

    const statutLabels = { 0: 'En production', 1: 'Finalisé', 2: 'En vente', 3: 'Expédié', 4: 'Livré' };

    const histHTML = (history && history.length > 0)
      ? history.map(e => {
          const date = e.timestamp
            ? new Date(e.timestamp * 1000).toLocaleString('fr-FR')
            : '—';
          return `
            <div class="history-entry">
              <div class="h-etape">${e.etape || '—'}</div>
              <div class="h-meta">${date} · ${e.source || ''}</div>
              ${e.note ? `<div class="h-note">${e.note}</div>` : ''}
            </div>`;
        }).join('')
      : `<p style="color:var(--text-muted);font-size:0.85rem">Aucun historique.</p>`;

    showSuccess("scan-ref-result", `Produit authentifié : <strong>${product.nom}</strong>`);

    document.getElementById("scan-result").innerHTML = `
      <div style="margin-bottom:1rem">
        <span class="badge badge-green">✓ Authentique</span>
        <span class="badge badge-cyan" style="margin-left:6px">${statutLabels[product.statut] || product.statut}</span>
      </div>
      <div class="product-info" style="margin-bottom:1.2rem">
        <div class="info-item">
          <div class="info-label">Référence</div>
          <div class="info-value">${product.referenceProduit}</div>
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
      <div class="qr-container" style="margin-bottom:1.2rem;padding:1rem">
        <img src="/api/qrcode/${encodeURIComponent(ref)}" alt="QR Code">
        <span class="qr-ref">${ref}</span>
      </div>
      <h3 style="font-size:0.95rem;margin-bottom:0.8rem;color:var(--text-secondary)">
        📋 Historique complet
      </h3>
      ${histHTML}
    `;
  } catch (e) {
    showError("scan-ref-result", e.message);
    document.getElementById("scan-result").innerHTML =
      `<p style="color:var(--text-muted);font-size:0.88rem">Produit introuvable.</p>`;
  }
}
