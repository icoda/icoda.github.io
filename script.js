// script.js
(async function renderProjects() {
  try {
    const res = await fetch('projects.json', { cache: 'no-store' });
    const projects = await res.json();

    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    grid.innerHTML = projects.map(p => {
      const tags = Array.isArray(p.tags) ? p.tags.join(' · ') : '';
      const thumb = p.thumb_url
        ? `
        <div style="margin:-6px -6px 10px -6px;border-radius:10px;overflow:hidden;background:#0d1528">
          <img src="${p.thumb_url}" alt="${p.title} thumbnail" style="width:100%;height:auto;display:block">
        </div>`
        : ``;

      return `
        <article class="card proj">
          ${thumb}
          <h3>${p.title}</h3>
          <p>${p.description || ''}</p>
          ${tags ? `<p class="muted">${tags}</p>` : ``}
          <div class="spacer"></div>
          ${p.live_url ? `<a class="btn" href="${p.live_url}" target="_blank" rel="noopener">View Live</a>` : ``}
          ${p.source_url ? `<a class="btn" href="${p.source_url}" target="_blank" rel="noopener">Source</a>` : ``}
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('projectsGrid');
    if (grid) grid.innerHTML = `<p class="muted">Could not load projects at this time.</p>`;
  }
})();