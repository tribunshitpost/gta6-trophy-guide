// Leonida Trophy Guide: checklist, filters, spoiler guard, roadmap and
// per-trophy guides. All data comes from data/trophies.json, a file this
// app fetches from its own server; nothing is loaded over the network.
const DATA_URL = 'data/trophies.json';
const EARNED_KEY = 'leonida-trophy-guide:earned:v1';
const SPOILER_KEY = 'leonida-trophy-guide:spoiler:v1';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function loadSpoiler() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === 'true';
}

function saveSpoiler(on) {
  localStorage.setItem(SPOILER_KEY, on ? 'true' : 'false');
}

const state = {
  data: null,
  earned: loadEarned(),
  spoiler: loadSpoiler(),
  openId: null,
  query: '',
  kind: '',
  grade: '',
  status: '',
  missableOnly: false,
  hiddenOnly: false,
};

function isSpoilerHidden(trophy) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderProgress() {
  const total = state.data.trophies.length;
  const earned = state.earned.size;
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
  $('#earned-count').textContent = earned;
  $('#earned-pct').textContent = `${pct}%`;
  $('#progress-fill').style.width = `${pct}%`;
  const left = total - earned;
  $('#progress-note').textContent =
    earned === total
      ? 'Every trophy earned — Vice Got a Price! is yours. Leonida Legend.'
      : `${earned} of ${total} earned — ${left} to go. The Platinum pops with the last one.`;
}

function renderRoadmap() {
  const list = $('#roadmap-list');
  list.innerHTML = state.data.roadmap
    .map(
      (phase) => `<li>
        <span class="roadmap-phase">${phase.phase}</span>
        <span><h3>${escapeHtml(phase.title)}</h3><p>${escapeHtml(phase.text)}</p></span>
        <span class="roadmap-time">${escapeHtml(phase.time)}</span>
      </li>`,
    )
    .join('');
}

function renderSources() {
  $('#source-list').innerHTML = state.data.sources
    .map((s) => `<li><a href="${escapeHtml(s.url)}" rel="noopener">${escapeHtml(s.name)}</a></li>`)
    .join('');
}

function trophyMatches(trophy) {
  if (state.kind && trophy.kind !== state.kind) return false;
  if (state.grade && trophy.grade !== state.grade) return false;
  if (state.status === 'earned' && !state.earned.has(trophy.id)) return false;
  if (state.status === 'unearned' && state.earned.has(trophy.id)) return false;
  if (state.missableOnly && !trophy.missable) return false;
  if (state.hiddenOnly && !trophy.hidden) return false;
  if (state.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(state.query.toLowerCase())) return false;
  }
  return true;
}

function tagHtml(trophy) {
  const tags = [
    `<span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>`,
    `<span class="tag">${kindLabel(trophy.kind)}</span>`,
  ];
  if (trophy.countLabel) tags.push(`<span class="tag flag-count">${escapeHtml(trophy.countLabel)}</span>`);
  if (trophy.hidden) tags.push('<span class="tag flag-hidden">Hidden</span>');
  if (trophy.missable) tags.push('<span class="tag flag-missable">Missable</span>');
  if (trophy.unconfirmed) tags.push('<span class="tag flag-unconfirmed">Method unconfirmed</span>');
  return tags.join('');
}

function guideHtml(trophy) {
  if (isSpoilerHidden(trophy)) {
    return `<p class="guide-label">Guide</p>
      <p>Hidden until earned — turn the spoiler guard off, or earn this trophy, to read its guide. The trophy itself is a story trophy, so its name and description stay hidden too.</p>`;
  }
  const steps = trophy.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sources = trophy.sources
    .map((s) => `<li><a href="${escapeHtml(s.url)}" rel="noopener">${escapeHtml(s.name)}</a></li>`)
    .join('');
  return `<p class="guide-label">Guide</p>
    <p>${escapeHtml(trophy.guide)}</p>
    <p class="guide-label">Steps</p>
    <ol>${steps}</ol>
    <p class="guide-label">Sources</p>
    <ul class="sources">${sources}</ul>`;
}

function renderList() {
  const list = $('#trophy-list');
  const visible = state.data.trophies.filter(trophyMatches);
  list.innerHTML = visible
    .map((trophy) => {
      const earned = state.earned.has(trophy.id);
      const hidden = isSpoilerHidden(trophy);
      const open = state.openId === trophy.id;
      return `<li class="trophy${earned ? ' earned' : ''}${hidden ? ' spoiler-hidden' : ''}" data-id="${trophy.id}">
        <div class="trophy-top">
          <input class="trophy-check" type="checkbox" data-id="${trophy.id}" ${earned ? 'checked' : ''}
            aria-label="Mark ${escapeHtml(trophy.name)} as earned">
          <div class="trophy-main">
            <button class="trophy-name" type="button" data-id="${trophy.id}" aria-expanded="${open}">
              <span class="trophy-name-text">${escapeHtml(trophy.name)}</span>
            </button>
            <p class="trophy-desc">${escapeHtml(trophy.description)}</p>
            <div class="trophy-tags">${tagHtml(trophy)}</div>
            <div class="trophy-guide" ${open ? '' : 'hidden'}>${guideHtml(trophy)}</div>
          </div>
        </div>
      </li>`;
    })
    .join('');
  $('#empty-note').hidden = visible.length > 0;
  $('#result-count').textContent = `Showing ${visible.length} of ${state.data.trophies.length} trophies.`;
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderSources();
  renderList();
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  if (params.has('spoiler')) state.spoiler = params.get('spoiler') !== 'off';
  if (params.get('kind')) state.kind = params.get('kind');
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('q')) state.query = params.get('q');
  if (params.get('open')) state.openId = Number(params.get('open')) || null;
  $('#spoiler-toggle').checked = state.spoiler;
  $('#filter-kind').value = state.kind;
  $('#filter-grade').value = state.grade;
  $('#search').value = state.query;
}

function exportProgress() {
  const payload = {
    app: 'leonida-trophy-guide',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data.earned) ? data.earned : Array.isArray(data) ? data : null;
      if (!ids) throw new Error('no earned list');
      const known = new Set(state.data.trophies.map((t) => t.id));
      const next = new Set(ids.filter((n) => Number.isInteger(n) && known.has(n)));
      state.earned = next;
      saveEarned(next);
      renderAll();
    } catch {
      alert('That file is not a Leonida Trophy Guide progress export.');
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderList();
  });
  $('#filter-kind').addEventListener('change', (e) => {
    state.kind = e.target.value;
    renderList();
  });
  $('#filter-grade').addEventListener('change', (e) => {
    state.grade = e.target.value;
    renderList();
  });
  $('#filter-status').addEventListener('change', (e) => {
    state.status = e.target.value;
    renderList();
  });
  $('#filter-missable').addEventListener('change', (e) => {
    state.missableOnly = e.target.checked;
    renderList();
  });
  $('#filter-hidden').addEventListener('change', (e) => {
    state.hiddenOnly = e.target.checked;
    renderList();
  });
  $('#spoiler-toggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    saveSpoiler(state.spoiler);
    renderList();
  });
  $('#export-btn').addEventListener('click', exportProgress);
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  $('#reset-btn').addEventListener('click', () => {
    if (confirm('Clear every earned tick? This cannot be undone. Export a backup first if you want one.')) {
      state.earned = new Set();
      saveEarned(state.earned);
      renderAll();
    }
  });
  $('#trophy-list').addEventListener('click', (e) => {
    const nameBtn = e.target.closest('.trophy-name');
    if (nameBtn) {
      const id = Number(nameBtn.dataset.id);
      state.openId = state.openId === id ? null : id;
      renderList();
      return;
    }
  });
  $('#trophy-list').addEventListener('change', (e) => {
    const box = e.target.closest('.trophy-check');
    if (!box) return;
    const id = Number(box.dataset.id);
    if (box.checked) state.earned.add(id);
    else state.earned.delete(id);
    saveEarned(state.earned);
    renderProgress();
    // Update just this row in place: a full re-render would drop the
    // reader's scroll position and the open guide.
    const row = box.closest('.trophy');
    const trophy = state.data.trophies.find((t) => t.id === id);
    row.classList.toggle('earned', box.checked);
    row.classList.toggle('spoiler-hidden', isSpoilerHidden(trophy));
    const guide = $('.trophy-guide', row);
    if (guide) guide.innerHTML = guideHtml(trophy);
    if (state.status) renderList();
  });
}

async function init() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`could not load ${DATA_URL}`);
  state.data = await res.json();
  applyUrlParams();
  bindEvents();
  renderAll();
  if (state.openId) {
    const row = $(`.trophy[data-id="${state.openId}"]`);
    if (row) row.scrollIntoView({ block: 'center' });
  }
}

init().catch((err) => {
  $('#trophy-list').innerHTML = `<li class="trophy"><p>Could not load the trophy list: ${escapeHtml(err.message)}</p></li>`;
});
