// script.js

// -----------------------------
// Utilities
// -----------------------------
function escapeHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// -----------------------------
// Projects grid loader
// -----------------------------
async function loadProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  grid.setAttribute("aria-busy", "true");

  try {
    const res = await fetch("projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching projects.json`);

    const raw = await res.text();
    console.log("Raw projects.json →\n", raw);

    let projects;
    try {
      projects = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      grid.innerHTML =
        `<p class="muted">Projects data could not be parsed. Please fix <code>projects.json</code>.</p>`;
      return;
    }

    if (!Array.isArray(projects)) {
      grid.innerHTML =
        `<p class="muted">Projects data is not an array. Check <code>projects.json</code>.</p>`;
      return;
    }

    if (projects.length === 0) {
      grid.innerHTML = `<p class="muted">No projects yet. Check back soon.</p>`;
      return;
    }

    // Optionally: sort newest-first if you have a "date" field
    // projects.sort((a,b) => (b.date || "").localeCompare(a.date || ""));

    grid.innerHTML = projects.map(p => {
      const title = escapeHTML(p.title || "Untitled");
      const desc = p.description ? escapeHTML(p.description) : "";
      const tags = Array.isArray(p.tags) ? p.tags.map(escapeHTML).join(" · ") : "";
      const thumbURL = p.thumb_url ? String(p.thumb_url) : "";

      const thumb = thumbURL
        ? `
          <div class="thumb" style="margin:-6px -6px 10px -6px;border-radius:10px;overflow:hidden;background:#0d1528">
            <img src="${thumbURL}"
                 alt="${title} thumbnail"
                 loading="lazy"
                 style="width:100%;height:auto;display:block"
                 onerror="this.style.display='none'">
          </div>`
        : ``;

      const liveBtn = p.live_url
        ? `<a class="btn" href="${escapeHTML(p.live_url)}" target="_blank" rel="noopener noreferrer">View Live</a>`
        : ``;

      const srcBtn = p.source_url
        ? `<a class="btn" href="${escapeHTML(p.source_url)}" target="_blank" rel="noopener noreferrer">Source</a>`
        : ``;

      return `
        <article class="card proj">
          ${thumb}
          <h3>${title}</h3>
          ${desc ? `<p>${desc}</p>` : ``}
          ${tags ? `<p class="muted">${tags}</p>` : ``}
          <div class="spacer"></div>
          ${liveBtn}${srcBtn}
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error("Projects loader error:", err);
    grid.innerHTML =
      `<p class="muted">Could not load projects at this time. (${escapeHTML(String(err))})</p>`;
  } finally {
    grid.removeAttribute("aria-busy");
  }
}

// -----------------------------
// Contact form (Formspree) handler
// -----------------------------
function wireContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const status = document.getElementById("formStatus");
  const submitBtn = form.querySelector('button[type="submit"]');
  const honeypot = form.querySelector('input[name="website"]');
  let inFlight = false;

  async function handleSubmit(e) {
    e.preventDefault();
    if (inFlight) return;

    // Basic bot check (honeypot)
    if (honeypot && honeypot.value.trim() !== "") {
      if (status) status.textContent = "Submission blocked.";
      return;
    }

    // Native validation
    if (!form.reportValidity()) return;

    inFlight = true;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
    if (status) { status.textContent = ""; status.setAttribute("aria-busy", "true"); }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000); // 20s safety
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        form.reset();
        if (status) status.textContent = "Thanks! Your message was sent.";
      } else {
        if (status) status.textContent = "There was a problem sending your message. Please try again.";
      }
    } catch (err) {
      console.error("Contact form error:", err);
      if (status) status.textContent = "Network error. Please try again.";
    } finally {
      inFlight = false;
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send"; }
      if (status) status.removeAttribute("aria-busy");
    }
  }

  form.addEventListener("submit", handleSubmit);
}

// -----------------------------
// Boot
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  wireContactForm();
});