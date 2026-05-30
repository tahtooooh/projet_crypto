function renderScan() {
  const content = $(`content`);

  const inputCard = renderCard(`Rechercher par référence`, `
    <div class="form-group"><label>Référence produit</label><input type="text" id="scan-ref" placeholder="REF-001"></div>
    <button onclick="scanByRef()">Rechercher</button>
    <div id="scan-ref-result" style="margin-top:0.5rem"></div>
  `);

  const qrCard = renderCard(`Scanner un QR code`, `
    <div id="qr-reader" style="width:250px;margin-bottom:0.5rem"></div>
    <div id="qr-reader-result"></div>
  `);

  const resultCard = renderCard(`Résultat`, `<div id="scan-result"></div>`);

  content.innerHTML = inputCard + qrCard + resultCard;
}

function startQrScanner() {
  if (document.getElementById("qr-reader").innerHTML.includes("canvas")) return;
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
      const ref = match ? match[1] : decodedText;
      document.getElementById("scan-ref").value = ref;
      document.getElementById("qr-reader-result").innerHTML =
        `<div class="success">QR détecté: ${ref}</div>`;
      if (scanner) { scanner.stop(); scanner = null; }
      scanByRef();
    },
    () => {}
  ).catch(() => {});
}

async function scanByRef() {
  try {
    const ref = document.getElementById("scan-ref").value;
    if (!ref) return showError("scan-ref-result", "Entrez une référence");
    const product = await api("GET", `/products/ref/${ref}`);
    const history = await api("GET", `/history/product/${product.id}`);

    let html = `<pre style="margin-bottom:1rem">${JSON.stringify(product, null, 2)}</pre>`;
    html += `<h3>Historique</h3><pre>${JSON.stringify(history, null, 2)}</pre>`;

    showSuccess("scan-ref-result", `Produit trouvé: ${product.nom}`);
    document.getElementById("scan-result").innerHTML = html;
  } catch (e) {
    showError("scan-ref-result", e.message);
    document.getElementById("scan-result").innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const scanRef = params.get("scan");
  if (scanRef) {
    setTimeout(() => {
      const el = document.getElementById("scan-ref");
      if (el) { el.value = scanRef; scanByRef(); }
    }, 500);
  }
});
