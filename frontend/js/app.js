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
  scan:         renderScan,
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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const scanRef = params.get("scan");
  if (scanRef) {
    navigate("scan");
  } else {
    navigate("admin");
  }
});
