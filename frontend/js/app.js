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
function showError(id, msg) { showResult(id, msg, "error"); }

function renderCard(title, content) {
  return `<div class="card"><h2>${title}</h2>${content}</div>`;
}

function renderForm(fields, submitLabel) {
  let html = "";
  for (const f of fields) {
    html += `<div class="form-group"><label>${f.label}</label>`;
    if (f.type === "select") {
      html += `<select id="${f.id}">`;
      for (const o of f.options) html += `<option value="${o.value}">${o.label}</option>`;
      html += `</select>`;
    } else {
      html += `<input type="${f.type || "text"}" id="${f.id}" placeholder="${f.placeholder || ""}">`;
    }
    html += `</div>`;
  }
  html += `<button onclick="${submitLabel}">${submitLabel}</button>`;
  return html;
}

function renderView(html) {
  return html;
}

// =========================
// ROUTING
// =========================
const pages = {
  admin: renderAdmin,
  producteur: renderProducteur,
  transporteur: renderTransporteur,
  client: renderClient,
  scan: renderScan,
};

function navigate(page) {
  if (pages[page]) {
    pages[page]();
    if (page === "scan") startQrScanner();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#nav-links a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.page);
    });
  });
  // Check URL param for scan
  const params = new URLSearchParams(window.location.search);
  const scanRef = params.get("scan");
  if (scanRef) {
    navigate("scan");
  } else {
    renderAdmin();
  }
});
