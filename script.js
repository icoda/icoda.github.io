// script.js
(async function () {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  try {
    // 1) Fetch as TEXT so we can always log what we received
    const res = await fetch("projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching projects.json`);
    const raw = await res.text();

    // 2) Log raw text for debugging
    console.log("Raw projects.json →\n", raw);

    // 3) Parse JSON safely
    let projects;
    try {
      projects = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      grid.innerHTML =
        `<p class="muted">Projects data could not be parsed. Please fix <code>projects.json</code>.</p>`;
      return;
    }

    // 4) Basic validation
    if (!Array.isArray(projects)) {
      grid.innerHTML =
        `<p class="muted">Projects data is not an array. Check <code>projects.json</code>.</p>`;
      return;
    }

    // 5) Render
    grid.innerHTML = projects.map(p => {
      const title = p.title || "Untitled";
      const desc = p.description || "";
      const tags = Array.isArray(p.tags) ? p.tags.join(" · ") : "";
      const thumb = p.thumb_url
        ? `
          <div style="margin:-6px -6px 10px -6px;border-radius:10px;overflow:hidden;background:#0d1528">
            <img src="${p.thumb_url}" alt="${title} thumbnail" style="width:100%;height:auto;display:block">
          </div>`
        : ``;

      return `
        <article class="card proj">
          ${thumb}
          <h3>${title}</h3>
          <p>${desc}</p>
          ${tags ? `<p class="muted">${tags}</p>` : ``}
          <div class="spacer"></div>
          ${p.live_url ? `<a class="btn" href="${p.live_url}" target="_blank" rel="noopener">View Live</a>` : ``}
          ${p.source_url ? `<a class="btn" href="${p.source_url}" target="_blank" rel="noopener">Source</a>` : ``}
        </article>
      `;
    }).join("");

  } catch (err) {
    console.error("Projects loader error:", err);
    grid.innerHTML =
      `<p class="muted">Could not load projects at this time. (${String(err)})</p>`;
  }
})();