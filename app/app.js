// Leonida Trophy Guide: checklist, filters, spoiler setting, roadmap and
// per-trophy guides. All data comes from data/trophies.json, a file inside
// app/, so the guide works with the network off. Progress lives only in
// localStorage and can be exported to, or imported from, a JSON file.
const PROGRESS_KEY = 'leonida-trophy-guide-progress-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoilers-v1';

const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const KIND_LABELS = {
  all: 'All kinds', story: 'Story', collectibles: 'Collectibles',
  activities: 'Activities', robbery: 'Robbery', money: 'Money',
  exploration: 'Exploration',
};
// Trophies shown in the demo seeded for screenshots (a believable early run).
const DEMO_EARNED = [2, 3, 4, 8, 15, 20, 21, 28, 35, 42, 51, 53];

const listEl = document.getElementById('trophyList');
const detailBody = document.getElementById('detailBody');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const statusFilter = document.getElementById('statusFilter');
const missableOnly = document.getElementById('missableOnly');
const spoilerToggle = document.getElementById('spoilerToggle');
const kindChips = document.getElementById('kindChips');
const resultCount = document.getElementById('resultCount');
const emptyNote = document.getElementById('emptyNote');

const params = new URLSearchParams(location.search);

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    if (Array.isArray(saved)) return new Set(saved.filter((n) => typeof n === 'string'));
  } catch { /* a corrupt save starts empty */ }
  return new Set();
}

function loadSpoilers() {
  const saved = localStorage.getItem(SPOILER_KEY);
  if (saved === 'off') return false;
  if (saved === 'on') return true;
  return true; // spoilers hidden by default
}

let earned = loadEarned();
let spoilerOn = loadSpoilers();
let revealed = new Set(); // hidden trophies the reader chose to reveal anyway
let selectedId = null;
let kind = 'all';
let doc = null;

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

function saveSpoilerSetting() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
}

function trophyHidden(t) {
  return t.hidden && spoilerOn && !earned.has(t.name) && !revealed.has(t.id);
}

function displayName(t) {
  return trophyHidden(t) ? 'Hidden trophy' : t.name;
}

function displayDescription(t) {
  return trophyHidden(t)
    ? 'A hidden story trophy. Earn it in the game to reveal its name and description — or reveal it here if you do not mind the spoiler.'
    : t.description;
}

function gradeBadge(t) {
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = GRADE_LETTER[t.grade] ?? '?';
  badge.title = t.grade;
  return badge;
}

function kindTag(t) {
  const tag = document.createElement('span');
  tag.className = 'kind-tag';
  tag.textContent = KIND_LABELS[t.kind] ?? t.kind;
  return tag;
}

function missableFlag(t) {
  if (!t.missable) return null;
  const flag = document.createElement('span');
  flag.className = 'missable-flag';
  flag.textContent = '⚠ Missable';
  flag.title = 'Potentially missable — see the guide';
  return flag;
}

function matchesFilters(t) {
  if (kind !== 'all' && t.kind !== kind) return false;
  if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
  const isEarned = earned.has(t.name);
  if (statusFilter.value === 'earned' && !isEarned) return false;
  if (statusFilter.value === 'unearned' && isEarned) return false;
  if (missableOnly.checked && !t.missable) return false;
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = doc.trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('earnedCount').textContent = String(done);
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressBarWrap').setAttribute('aria-valuenow', String(done));
  document.getElementById('progressText').textContent =
    done === total
      ? '100% — Platinum earned. You are a Leonida Legend.'
      : `${pct}% — the Platinum is ${total - done} ${total - done === 1 ? 'trophy' : 'trophies'} away.`;
  const counts = document.getElementById('gradeCounts');
  counts.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const have = doc.trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = doc.trophies.filter((t) => t.grade === g).length;
    const li = document.createElement('li');
    li.textContent = `${GRADE_LETTER[g]} ${have}/${all}`;
    counts.append(li);
  }
}

function renderRoadmap() {
  const phasesEl = document.getElementById('phases');
  phasesEl.replaceChildren();
  for (const phase of doc.roadmap) {
    const li = document.createElement('li');
    li.className = 'phase';
    const head = document.createElement('div');
    head.className = 'phase-head';
    const title = document.createElement('strong');
    title.textContent = `Phase ${phase.phase} — ${phase.title}`;
    const time = document.createElement('span');
    time.className = 'phase-time';
    time.textContent = phase.time;
    head.append(title, time);
    const text = document.createElement('p');
    text.textContent = phase.text;
    const chips = document.createElement('p');
    chips.className = 'phase-trophies';
    const members = doc.trophies.filter((t) => t.phase === phase.phase);
    chips.textContent = members.map((t) => (t.hidden && spoilerOn && !earned.has(t.name) ? 'Hidden trophy' : t.name)).join(' · ');
    li.append(head, text, chips);
    phasesEl.append(li);
  }
}

function renderKindChips() {
  kindChips.replaceChildren();
  const counts = {};
  for (const t of doc.trophies) counts[t.kind] = (counts[t.kind] ?? 0) + 1;
  for (const [value, label] of Object.entries(KIND_LABELS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${kind === value ? ' active' : ''}`;
    btn.textContent = value === 'all' ? `${label} (55)` : `${label} (${counts[value] ?? 0})`;
    btn.setAttribute('aria-pressed', String(kind === value));
    btn.addEventListener('click', () => { kind = value; renderKindChips(); renderList(); });
    kindChips.append(btn);
  }
}

function renderList() {
  listEl.replaceChildren();
  const visible = doc.trophies.filter(matchesFilters);
  resultCount.textContent = `Showing ${visible.length} of 55 trophies · ${earned.size} earned`;
  emptyNote.hidden = visible.length !== 0;
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = `trophy-row${earned.has(t.name) ? ' is-earned' : ''}${selectedId === t.id ? ' is-selected' : ''}`;
    li.id = `trophy-${t.id}`;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveProgress();
      renderProgress();
      renderList();
      renderDetail();
      renderRoadmap();
    });

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'trophy-main';
    main.addEventListener('click', () => { selectedId = t.id; renderList(); renderDetail(); scrollDetailIntoView(); });
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(t);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(t);
    main.append(name, desc);

    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(gradeBadge(t), kindTag(t));
    const flag = missableFlag(t);
    if (flag) meta.append(flag);
    if (t.countLabel) {
      const count = document.createElement('span');
      count.className = 'count-label';
      count.textContent = t.countLabel;
      meta.append(count);
    }
    if (trophyHidden(t)) {
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'reveal-btn';
      reveal.textContent = 'Reveal spoiler';
      reveal.addEventListener('click', (event) => {
        event.stopPropagation();
        revealed.add(t.id);
        renderList();
        renderDetail();
      });
      meta.append(reveal);
    }

    li.append(box, main, meta);
    listEl.append(li);
  }
}

function sourceList(sources) {
  const ul = document.createElement('ul');
  ul.className = 'sources';
  for (const s of sources ?? []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.rel = 'noopener';
    a.target = '_blank';
    a.textContent = s.name;
    li.append(document.createTextNode('Source: '), a);
    ul.append(li);
  }
  return ul;
}

function renderDetail() {
  detailBody.replaceChildren();
  const t = doc.trophies.find((x) => x.id === selectedId);
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy from the checklist to see its full guide: what to do, where and how, when it can be missed, and the sources behind each fact.';
    detailBody.append(p);
    return;
  }
  const head = document.createElement('div');
  head.className = 'detail-head';
  head.append(gradeBadge(t));
  const title = document.createElement('h3');
  title.textContent = displayName(t);
  head.append(title);
  detailBody.append(head);

  const official = document.createElement('p');
  official.className = 'official-desc';
  official.textContent = `Official: “${displayDescription(t)}” — ${t.grade}.`;
  detailBody.append(official);

  const tags = document.createElement('p');
  tags.className = 'detail-tags';
  tags.textContent = `${KIND_LABELS[t.kind] ?? t.kind} · Roadmap phase ${t.phase}${t.countLabel ? ` · ${t.countLabel}` : ''}${t.hidden ? ' · Hidden on PlayStation until earned' : ''}`;
  detailBody.append(tags);

  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'missable-warning';
    warn.textContent = '⚠ Potentially missable. Read the first step before you leave Chapter 1 — there is no mission replay.';
    detailBody.append(warn);
  }

  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophyHidden(t) ? 'Guide hidden with the spoiler. Reveal it above to read the steps.' : t.guide;
  detailBody.append(guide);

  if (!trophyHidden(t) && t.steps?.length) {
    const stepsHead = document.createElement('h4');
    stepsHead.textContent = 'Steps';
    const ol = document.createElement('ol');
    ol.className = 'steps';
    for (const step of t.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      ol.append(li);
    }
    detailBody.append(stepsHead, ol);
  }

  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.className = 'earned-toggle';
  earnedBtn.textContent = earned.has(t.name) ? '✓ Earned — click to unmark' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    saveProgress();
    renderProgress();
    renderList();
    renderDetail();
  });
  detailBody.append(earnedBtn);
  detailBody.append(sourceList(t.sources));
}

function scrollDetailIntoView() {
  if (window.matchMedia('(max-width: 900px)').matches) {
    document.getElementById('detailPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const s of doc.sources ?? []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.rel = 'noopener';
    a.target = '_blank';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    guide: 'Leonida Trophy Guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  if (!file) return;
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    alert('That file is not valid JSON.');
    return;
  }
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) {
    alert('That file does not hold a trophy list.');
    return;
  }
  const known = new Set(doc.trophies.map((t) => t.name));
  const kept = names.filter((n) => known.has(n));
  earned = new Set(kept);
  saveProgress();
  renderProgress();
  renderList();
  renderDetail();
  alert(`Imported ${kept.length} earned ${kept.length === 1 ? 'trophy' : 'trophies'}${names.length - kept.length ? ` (${names.length - kept.length} unknown names skipped)` : ''}.`);
}

function applyShotParams() {
  // Screenshot mode only: ?demo=1 seeds a believable early run, ?open=<id>
  // opens one trophy's guide, ?filter=<kind> and ?view=roadmap aim the shot.
  if (params.get('demo') === '1' && !localStorage.getItem(PROGRESS_KEY)) {
    earned = new Set(doc.trophies.filter((t) => DEMO_EARNED.includes(t.id)).map((t) => t.name));
    saveProgress();
  }
  const openId = Number(params.get('open'));
  if (Number.isInteger(openId) && doc.trophies.some((t) => t.id === openId)) selectedId = openId;
  const filter = params.get('filter');
  if (filter && KIND_LABELS[filter]) kind = filter;
  if (params.get('missable') === '1') missableOnly.checked = true;
  if (params.get('spoiler') === 'off') { spoilerOn = false; spoilerToggle.checked = false; }
  if (params.get('spoiler') === 'on') { spoilerOn = true; spoilerToggle.checked = true; }
}

async function init() {
  const response = await fetch('data/trophies.json');
  doc = await response.json();
  spoilerToggle.checked = spoilerOn;
  applyShotParams();
  renderProgress();
  renderRoadmap();
  renderKindChips();
  renderList();
  renderDetail();
  renderSources();

  searchInput.addEventListener('input', renderList);
  gradeFilter.addEventListener('change', renderList);
  statusFilter.addEventListener('change', renderList);
  missableOnly.addEventListener('change', renderList);
  spoilerToggle.addEventListener('change', () => {
    spoilerOn = spoilerToggle.checked;
    saveSpoilerSetting();
    renderList();
    renderDetail();
    renderRoadmap();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importInput').addEventListener('change', (event) => {
    importProgress(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone — export your progress first if you want to keep it.')) {
      earned = new Set();
      saveProgress();
      renderProgress();
      renderList();
      renderDetail();
    }
  });
  document.getElementById('showMissable').addEventListener('click', () => {
    kind = 'all';
    missableOnly.checked = true;
    renderKindChips();
    renderList();
    document.getElementById('trophyList').scrollIntoView({ behavior: 'smooth' });
  });

  // Screenshot mode, after everything has rendered (rendering the list
  // changes the page height, so scrolling earlier would land in the
  // wrong place): jump to the roadmap, or scroll the guide panel to its
  // steps and sources.
  if (params.get('view') === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
  const detailScroll = Number(params.get('detailScroll'));
  if (Number.isInteger(detailScroll)) {
    document.getElementById('detailPanel').scrollTop = detailScroll;
  }
  const pageScroll = Number(params.get('scroll'));
  if (Number.isInteger(pageScroll)) window.scrollTo(0, pageScroll);

  // Signal the screenshot script that the app has finished rendering.
  window.__shotReady = true;
}

init();
