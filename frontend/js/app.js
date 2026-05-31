const API_BASE = "http://localhost:3000/api";

async function api(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur serveur");
  return data;
}

function $(id) { return document.getElementById(id); }

function showResult(containerId, html, type) {
  const el = $(containerId);
  if (el) el.innerHTML = `<div class="${type}">${html}</div>`;
}

function showSuccess(id, msg) { showResult(id, msg, "success"); }
function showError(id, msg)   { showResult(id, msg, "error"); }

function renderCard(title, content) {
  return `<div class="card"><h2>${title}</h2>${content}</div>`;
}

// ── ROUTING ──
const pages = {
  admin:        renderAdmin,
  producteur:   renderProducteur,
  transporteur: renderTransporteur,
  client:       renderClient,
};

const pageLabels = {
  admin:        { icon: '⚙️', label: 'Administration', desc: 'Déploiement du contrat et gestion des rôles' },
  producteur:   { icon: '🏭', label: 'Producteur', desc: 'Gestion des produits, stocks et ventes' },
  transporteur: { icon: '🚚', label: 'Transporteur', desc: 'Suivi et mise à jour du transport' },
  client:       { icon: '📦', label: 'Client', desc: 'Confirmation de livraison et historique' },
  scan:         { icon: '📷', label: 'Scanner QR', desc: 'Vérifier l\'authenticité d\'un produit' },
};

function navigate(page) {
  // Update active link
  document.querySelectorAll('#nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  if (pages[page]) {
    pages[page]();
    if (page === 'scan') startQrScanner();
  }
}

function pageHeader(page) {
  const p = pageLabels[page];
  return `
    <div class="page-header">
      <h2><span class="icon">${p.icon}</span>${p.label}</h2>
      <p>${p.desc}</p>
    </div>
  `;
}



// =========================
// UTILITAIRE GLOBAL : Historique avancé (filtrage + export CSV/PDF)
// Paramètres :
//   entries    — tableau d'entrées historique depuis l'API
//   containerId — id du div où injecter le rendu
//   meta       — { ref, nom } infos produit pour les exports (optionnel)
// =========================
function renderHistoryAdvanced(entries, containerId, meta = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!entries || entries.length === 0) {
    container.innerHTML = `<p style="color:var(--text3);font-size:0.88rem;padding:0.5rem 0">Aucun historique disponible.</p>`;
    return;
  }

  const filterId = containerId + "-filter";
  const listId   = containerId + "-list";
  const countId  = containerId + "-count";
  const csvBtnId = containerId + "-csv";
  const pdfBtnId = containerId + "-pdf";

  const allSources = [...new Set(entries.map(e => e.source || "—"))];

  function sourceBadge(source) {
    const s = (source || "").toUpperCase();
    if (s === "PRODUCTION") return `<span class="badge badge-green"  style="font-size:0.7rem">🏭 Production</span>`;
    if (s === "VENTE")      return `<span class="badge badge-blue"   style="font-size:0.7rem">🛒 Vente</span>`;
    if (s === "TRANSPORT")  return `<span class="badge badge-orange" style="font-size:0.7rem">🚚 Transport</span>`;
    return `<span class="badge badge-blue" style="font-size:0.7rem">${source}</span>`;
  }

  function buildList(filtered) {
    if (filtered.length === 0) {
      return `<p style="color:var(--text3);font-size:0.85rem;padding:0.4rem 0">Aucune entrée pour ce filtre.</p>`;
    }
    return filtered.map(e => {
      const date = e.timestamp ? new Date(e.timestamp * 1000).toLocaleString("fr-FR") : "—";
      return `
        <div class="history-entry">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span class="h-etape" style="margin:0">${e.etape || "—"}</span>
            ${sourceBadge(e.source)}
          </div>
          <div class="h-meta">${date} · <span style="font-family:var(--mono);font-size:0.7rem">${e.acteur ? e.acteur.slice(0,16)+"..." : "—"}</span></div>
          ${e.note ? `<div class="h-note">${e.note}</div>` : ""}
        </div>`;
    }).join("");
  }

  function getFiltered() {
    const sel = document.getElementById(filterId);
    const val = sel ? sel.value : "all";
    return val === "all" ? entries : entries.filter(e => (e.source || "—") === val);
  }

  function applyFilter() {
    const filtered = getFiltered();
    const list = document.getElementById(listId);
    if (list) list.innerHTML = buildList(filtered);
    const countEl = document.getElementById(countId);
    if (countEl) countEl.textContent = filtered.length + " entrée" + (filtered.length > 1 ? "s" : "");
  }

  function doExportCSV() {
    const filtered = getFiltered();
    const header = ["ID Produit","ID Vente","Source","Étape","Note","Acteur","Date"];
    const rows = filtered.map(e => [
      e.productId || "",
      e.venteId   || "",
      e.source    || "",
      e.etape     || "",
      (e.note     || "").replace(/,/g, ";"),
      e.acteur    || "",
      e.timestamp ? new Date(e.timestamp * 1000).toLocaleString("fr-FR") : ""
    ]);
    const csv  = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "historique_" + (meta.ref || "produit") + "_" + Date.now() + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function doExportPDF() {
    const filtered = getFiltered();
    const rows = filtered.map(e => {
      const date = e.timestamp ? new Date(e.timestamp * 1000).toLocaleString("fr-FR") : "—";
      return "<tr><td>" + (e.etape||"—") + "</td><td>" + (e.source||"—") + "</td><td>" + date +
        "</td><td style=\"font-family:monospace;font-size:11px\">" +
        (e.acteur ? e.acteur.slice(0,20)+"..." : "—") +
        "</td><td>" + (e.note||"") + "</td></tr>";
    }).join("");

    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\">" +
      "<title>Historique — " + (meta.ref||"") + " " + (meta.nom||"") + "</title>" +
      "<style>body{font-family:Arial,sans-serif;padding:24px;font-size:13px;color:#1e293b}" +
      "h1{font-size:18px;margin-bottom:4px}p.sub{color:#64748b;font-size:12px;margin-bottom:20px}" +
      "table{width:100%;border-collapse:collapse}th{background:#2563eb;color:#fff;padding:8px 10px;text-align:left;font-size:12px}" +
      "td{padding:7px 10px;border-bottom:1px solid #e2e8f0}tr:nth-child(even)td{background:#f8fafc}" +
      "@media print{body{padding:0}}</style></head><body>" +
      "<h1>📋 Historique produit — " + (meta.ref||"N/A") + "</h1>" +
      "<p class=\"sub\">Nom : " + (meta.nom||"—") + " · Exporté le " + new Date().toLocaleString("fr-FR") +
      " · " + filtered.length + " entrée(s)</p>" +
      "<table><thead><tr><th>Étape</th><th>Source</th><th>Date</th><th>Acteur</th><th>Note</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></body></html>";

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  const filterOptions = [
    `<option value="all">Toutes les étapes (${entries.length})</option>`,
    ...allSources.map(s => {
      const count = entries.filter(e => (e.source||"—") === s).length;
      return `<option value="${s}">${s} (${count})</option>`;
    })
  ].join("");

  // ── Injection HTML propre — zéro logique dans les onclick ──
  container.innerHTML = `
    <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:0.8rem">
      <span id="${countId}" class="badge badge-blue" style="font-size:0.75rem">
        ${entries.length} entrée${entries.length > 1 ? "s" : ""}
      </span>
      <select id="${filterId}"
              style="font-size:0.8rem;padding:4px 8px;border-radius:6px;border:1.5px solid var(--border);background:var(--bg-card2);color:var(--text);cursor:pointer">
        ${filterOptions}
      </select>
      <button id="${csvBtnId}" class="btn-outline" style="font-size:0.78rem;padding:4px 12px">
        ⬇️ CSV
      </button>
      <button id="${pdfBtnId}" class="btn-outline" style="font-size:0.78rem;padding:4px 12px">
        🖨️ PDF
      </button>
    </div>
    <div id="${listId}">
      ${buildList(entries)}
    </div>`;

  // ── Attachement des événements APRÈS injection ──
  const selEl  = document.getElementById(filterId);
  const csvBtn = document.getElementById(csvBtnId);
  const pdfBtn = document.getElementById(pdfBtnId);

  if (selEl)  selEl.addEventListener("change", applyFilter);
  if (csvBtn) csvBtn.addEventListener("click",  doExportCSV);
  if (pdfBtn) pdfBtn.addEventListener("click",  doExportPDF);
}

// =========================
// UTILITAIRE GLOBAL : Téléchargement QR Code (PNG)
// Disponible depuis toutes les pages (producteur, scan, client...)
// =========================
async function downloadQRCode(encodedRef, ref) {
  const btn = document.getElementById("qr-dl-btn");
  // Chercher aussi un bouton par data-ref si l'id n'est pas unique
  const btnByRef = document.querySelector(`button[data-qr-ref="${ref}"]`);
  const target = btn || btnByRef;

  if (target) target.textContent = "⏳ Préparation...";

  try {
    const response = await fetch(`/api/qrcode/${encodedRef}`);
    if (!response.ok) throw new Error("Erreur réseau");
    const svgText = await response.text();

    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `QR_${ref}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      if (target) {
        target.textContent = "✅ Téléchargé !";
        setTimeout(() => { target.innerHTML = "⬇️ Télécharger le QR Code (PNG)"; }, 2500);
      }
    };

    img.onerror = () => {
      if (target) target.textContent = "❌ Erreur — réessayez";
    };

    img.src = url;
  } catch (err) {
    if (target) target.textContent = "❌ Erreur — réessayez";
    console.error("downloadQRCode:", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      stopQrScanner(); // stoppe la caméra si active avant de changer de page
      navigate(link.dataset.page);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const scanRef = params.get("scan");
  if (scanRef) {
    // QR scanné depuis l'extérieur → aller sur la page Client et pré-remplir
    navigate("client");
    setTimeout(() => {
      const el = document.getElementById("ch-ref");
      if (el) { el.value = scanRef; }
      const btn = document.getElementById("ch-search-btn");
      if (btn) btn.click();
    }, 400);
  } else {
    navigate("admin");
  }
});