// ─── Hauptanwendung ──────────────────────────────────────────────────────────

// ── Hilfsfunktion: Symbol → LaTeX-String ─────────────────────────────────────
// "fprime" → "f'",  "aprime" → "a'",  "betaprime" → "\\beta'",
// "beta"   → "\\beta",  "delta" → "\\delta", etc.
function formatSymbol(sym) {
  return sym
    .replace(/^beta$/,       "\\beta")
    .replace(/^betaprime$/,  "\\beta'")
    .replace(/^delta$/,      "\\delta")
    .replace(/^alpha$/,      "\\alpha")
    .replace(/^theta$/,      "\\theta")
    .replace(/^lambda$/,     "\\lambda")
    .replace(/^nu$/,         "\\nu")
    .replace(/^rho$/,        "\\rho")
    .replace(/^tau$/,        "\\tau")
    .replace(/^eta$/,        "\\eta")
    .replace(/^epsilon$/,    "\\varepsilon")
    .replace(/^gamma$/,      "\\Gamma'")
    .replace(/prime/g,       "'")
    .replace(/_([A-Za-z0-9]+)/g, "_{$1}");
}

let currentTab = 'start';
let currentCategory = 'Alle';
let searchQuery = '';
let selectedFormula = null;
let rayTracer = null;
let rtObjAtInfinity = false;   // Modul-global: Objekt im Unendlichen (Strahlengang-Tracer)

// ── Initialisierung ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Badge sofort setzen
  const badge = document.getElementById('formula-count');
  if (badge) badge.textContent = FORMULAS.length;
  const gridCount = document.getElementById('formula-grid-count');
  if (gridCount) gridCount.textContent = FORMULAS.length + ' Formeln';

  renderCategoryList();
  renderFormulaGrid('formulas-grid', getFilteredFormulas());
  setupSearch();
  setupTabs();
  initRayTracer();
  renderFavorites();
  setupKeyboard();
  setupTheme();
  document.getElementById('print-btn')?.addEventListener('click', () => window.print());
  // Startseite ist Standard-Tab → Sidebar (nur Formeln) zunächst ausblenden
  const sb = document.getElementById('sidebar');
  if (sb) sb.style.display = 'none';

  // KaTeX-Rendering des Formelrasters – robust gegen Timing:
  // sofort rendern, falls KaTeX bereits geladen ist, sonst auf das Event warten.
  document.addEventListener('katex-ready', renderGridMath);
  renderGridMath();   // falls KaTeX schon verfügbar war (Cache) → Event ggf. verpasst
});

// Rendert die Mathematik im Formelraster (nach jedem Neuaufbau aufrufen).
function renderGridMath() {
  const grid = document.getElementById('formulas-grid');
  if (grid && window.renderMathInElement) {
    renderMathInElement(grid, {
      delimiters: [{ left: '$', right: '$', display: false }, { left: '$$', right: '$$', display: true }],
      throwOnError: false
    });
  }
}

// ── Theme (Hell/Dunkel) ───────────────────────────────────────────────────────
function setupTheme() {
  const root = document.documentElement;
  const btn  = document.getElementById('theme-toggle');
  const apply = (light) => {
    if (light) root.setAttribute('data-theme', 'light');
    else       root.removeAttribute('data-theme');
    if (btn) btn.textContent = light ? '☀' : '🌙';
  };
  let light = false;
  try { light = localStorage.getItem('ao_theme') === 'light'; } catch {}
  apply(light);
  btn?.addEventListener('click', () => {
    light = root.getAttribute('data-theme') !== 'light';
    apply(light);
    try { localStorage.setItem('ao_theme', light ? 'light' : 'dark'); } catch {}
  });
}

// ── Tab-Navigation ────────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
  // Sidebar nur bei Formeln anzeigen
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.style.display = tab === 'formulas' ? '' : 'none';
  if (tab === 'favorites')  renderFavorites();
  if (tab === 'raytracer')  { setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50); }
  if (tab === 'register')   renderRegister();
  if (tab === 'prism')      initPrism();
  if (tab === 'refraction') initRefraction();
  if (tab === 'beta')       initBeta();
}

// ── Suche ─────────────────────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderFormulaGrid('formulas-grid', getFilteredFormulas());
    renderGridMath();
    // Show/hide clear button
    document.getElementById('search-clear').style.display = searchQuery ? 'flex' : 'none';
  });
  document.getElementById('search-clear').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    searchQuery = '';
    document.getElementById('search-clear').style.display = 'none';
    renderFormulaGrid('formulas-grid', getFilteredFormulas());
    renderGridMath();
  });
}

function getFilteredFormulas(favOnly = false) {
  let list = FORMULAS;
  if (favOnly) list = list.filter(f => isFavorite(f.id));
  if (currentCategory !== 'Alle' && !favOnly) {
    list = list.filter(f => f.category === currentCategory);
  }
  if (searchQuery) {
    // Symbol-tolerante Normalisierung: Apostrophe/Leerzeichen entfernen, damit
    // "S'_Tr", "f'", "β'" auch ohne exakte Schreibweise gefunden werden.
    const norm = s => (s || '').toLowerCase().replace(/[''`\s]/g, '');
    const q  = searchQuery;
    const qn = norm(q);
    list = list.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.formula.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some(t => t.includes(q)) ||
      f.category.toLowerCase().includes(q) ||
      norm(f.formula).includes(qn) ||
      norm(f.latex).includes(qn) ||
      (f.variables || []).some(v => norm(v.symbol).includes(qn) || (v.name || '').toLowerCase().includes(q))
    );
  }
  return list;
}

// ── Kategorie-Sidebar ─────────────────────────────────────────────────────────
function renderCategoryList() {
  const list = document.getElementById('category-list');
  const cats = ['Alle', ...CATEGORIES];
  list.innerHTML = cats.map(cat => {
    const count = cat === 'Alle' ? FORMULAS.length : FORMULAS.filter(f => f.category === cat).length;
    return `<button class="cat-btn ${cat === currentCategory ? 'active' : ''}" data-cat="${cat}">
      <span class="cat-name">${cat}</span>
      <span class="cat-count">${count}</span>
    </button>`;
  }).join('');
  list.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderFormulaGrid('formulas-grid', getFilteredFormulas());
      renderGridMath();
    });
  });
}

// ── Formel-Grid ───────────────────────────────────────────────────────────────
function renderFormulaGrid(containerId, formulas) {
  const grid = document.getElementById(containerId);
  if (formulas.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <div>Keine Formeln gefunden</div>
      <div class="empty-sub">Suchbegriff anpassen oder Kategorie wechseln</div>
    </div>`;
    return;
  }
  grid.innerHTML = formulas.map(f => buildFormulaCard(f)).join('');
  grid.querySelectorAll('.formula-card').forEach(card => {
    card.addEventListener('click', () => openFormulaDetail(card.dataset.id));
  });
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const isFav = toggleFavorite(id);
      btn.classList.toggle('active', isFav);
      btn.title = isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
      if (currentTab === 'favorites') renderFavorites();
    });
  });
  // Render LaTeX
  if (window.renderMathInElement) {
    renderMathInElement(grid, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false
    });
  }
}

function buildFormulaCard(f) {
  const fav = isFavorite(f.id);
  return `<div class="formula-card" data-id="${f.id}" tabindex="0" role="button" aria-label="${f.name}">
    <div class="card-header">
      <div class="card-category">${f.category}</div>
      <button class="fav-btn ${fav ? 'active' : ''}" data-id="${f.id}" title="${fav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}" aria-label="Favorit">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>
    <h3 class="card-title">${f.name}</h3>
    <div class="card-formula">$${f.latex}$</div>
    <p class="card-desc">${f.description.slice(0, 100)}${f.description.length > 100 ? '…' : ''}</p>
    <div class="card-footer">
      <span class="card-vars">${f.variables.length} Variablen</span>
      <span class="card-calc-hint">Klicken zum Berechnen →</span>
    </div>
  </div>`;
}

// ── Formel-Detail / Taschenrechner ────────────────────────────────────────────
function openFormulaDetail(id) {
  const formula = FORMULAS.find(f => f.id === id);
  if (!formula) return;
  selectedFormula = formula;

  const modal = document.getElementById('formula-modal');
  const content = document.getElementById('modal-content');

  const solveOptions = Object.keys(formula.solveFor);

  content.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-category">${formula.category}</div>
        <h2 class="modal-title">${formula.name}</h2>
      </div>
      <div class="modal-header-actions">
        <button class="modal-print" id="modal-print-btn" title="Berechnung als PDF drucken" aria-label="Drucken">🖨</button>
        <button class="modal-close" id="modal-close-btn" aria-label="Schließen">✕</button>
      </div>
    </div>

    <div class="modal-formula-display">$$${formula.latex}$$</div>

    <p class="modal-desc">${formula.description}</p>

    <div class="modal-calculator">
      <h3 class="calc-title">Berechnen</h3>
      <div class="calc-solve-row">
        <label>Berechne:</label>
        <select id="solve-for-select" class="solve-select">
          ${solveOptions.map(sym => {
            const varDef = formula.variables.find(v => v.symbol === sym);
            const label  = varDef ? varDef.name : sym.replace(/prime/g, "'");
            return `<option value="${sym}">${label}</option>`;
          }).join('')}
        </select>
      </div>

      <div class="variables-grid" id="variables-grid">
        ${formula.variables.map(v => buildVariableInput(v, solveOptions[0])).join('')}
      </div>

      <div class="calc-btn-row">
        <button class="calc-btn" id="calc-run-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Berechnen
        </button>
        <button class="calc-clear-btn" id="calc-clear-btn" title="Alle Eingaben löschen">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          Löschen
        </button>
      </div>

      <div class="calc-result" id="calc-result"></div>
    </div>

    <div class="modal-variables">
      <h3>Variablenbeschreibung</h3>
      <table class="var-table">
        <thead><tr><th>Symbol</th><th>Name</th><th>Einheit</th><th>Beschreibung</th></tr></thead>
        <tbody>
          ${formula.variables.map(v => `
            <tr>
              <td class="var-sym">$${formatSymbol(v.symbol)}$</td>
              <td>${v.name}</td>
              <td class="var-unit">${v.unit}</td>
              <td>${v.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="modal-tags">
      ${formula.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Event listeners
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('calc-clear-btn').addEventListener('click', () => {
    content.querySelectorAll('.var-input').forEach(inp => { inp.value = ''; });
    document.getElementById('calc-result').innerHTML = '';
  });

  const select = document.getElementById('solve-for-select');
  select.addEventListener('change', () => {
    updateInputStates(formula, select.value);
    // Beim Umschalten: altes Ergebnis & evtl. Altwert im neuen Ergebnisfeld entfernen
    const rb = document.getElementById('calc-result'); if (rb) rb.innerHTML = '';
    const rf = document.getElementById(`var-${select.value}`); if (rf) rf.value = '';
  });
  updateInputStates(formula, solveOptions[0]);

  document.getElementById('calc-run-btn').addEventListener('click', () => runCalculation(formula));
  document.getElementById('modal-print-btn').addEventListener('click', () => printFormulaCalc(formula));

  // Allow Enter key to calculate
  content.querySelectorAll('.var-input').forEach(inp => {
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') runCalculation(formula); });
  });

  // Render LaTeX
  if (window.renderMathInElement) {
    renderMathInElement(content, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false
    });
  }
}

function buildVariableInput(v, solveForSym) {
  const isResult = v.symbol === solveForSym;
  return `<div class="var-input-row ${isResult ? 'result-row' : ''}" data-sym="${v.symbol}">
    <label class="var-label">
      <span class="var-sym-label">$${formatSymbol(v.symbol)}$</span>
      <span class="var-name-label">${v.name}</span>
    </label>
    <div class="var-input-wrap">
      <input type="number" class="var-input" id="var-${v.symbol}"
        placeholder="${isResult ? 'Ergebnis' : 'Eingabe'}"
        step="any"
        ${isResult ? 'readonly' : ''}
        aria-label="${v.name}">
      <span class="var-unit-badge">${v.unit}</span>
    </div>
  </div>`;
}

function updateInputStates(formula, solveForSym) {
  formula.variables.forEach(v => {
    const row = document.querySelector(`.var-input-row[data-sym="${v.symbol}"]`);
    const input = document.getElementById(`var-${v.symbol}`);
    if (!row || !input) return;
    const isResult = v.symbol === solveForSym;
    row.classList.toggle('result-row', isResult);
    input.readOnly = isResult;
    input.placeholder = isResult ? 'Ergebnis' : 'Eingabe';
  });
}

function runCalculation(formula) {
  const solveForSym = document.getElementById('solve-for-select').value;
  const inputs = {};
  let allFilled = true;

  const missing = [];
  formula.variables.forEach(v => {
    if (v.symbol === solveForSym) return;
    const input = document.getElementById(`var-${v.symbol}`);
    const val   = input ? parseFloat(input.value) : NaN;
    if (!input || input.value.trim() === '' || !isFinite(val)) { allFilled = false; missing.push(v.name); return; }
    inputs[v.symbol] = val;
  });

  const resultBox = document.getElementById('calc-result');

  if (!allFilled) {
    resultBox.innerHTML = `<div class="result-error">⚠ Bitte alle Eingabefelder ausfüllen: ${missing.join(', ')}.</div>`;
    return;
  }

  try {
    const result = formula.solveFor[solveForSym](inputs);
    if (!isFinite(result)) throw new Error('Division durch Null oder ungültige Eingabe');

    const varDef = formula.variables.find(v => v.symbol === solveForSym);
    const unit = varDef ? varDef.unit : '';
    const name = varDef ? varDef.name : solveForSym;

    // Write result to input
    const resultInput = document.getElementById(`var-${solveForSym}`);
    if (resultInput) resultInput.value = result.toFixed(4);

    // Format result
    let formatted = Math.abs(result) < 0.001 || Math.abs(result) > 99999
      ? result.toExponential(4)
      : result.toFixed(4).replace(/\.?0+$/, '');

    resultBox.innerHTML = `
      <div class="result-success">
        <div class="result-label">${name}</div>
        <div class="result-value">${formatted} <span class="result-unit">${unit}</span></div>
      </div>`;
  } catch (e) {
    resultBox.innerHTML = `<div class="result-error">⚠ Fehler: ${e.message}</div>`;
  }
}

function closeModal() {
  document.getElementById('formula-modal').classList.remove('open');
  document.body.style.overflow = '';
  selectedFormula = null;
}

// Liefert mögliche LaTeX-Schreibweisen eines Variablensymbols (für robustes
// Ersetzen im LaTeX-String, da Symbol- und LaTeX-Notation oft abweichen, z. B.
// 'n1' ↔ 'n_1', 'theta1' ↔ '\theta_1', 'S_Tr' ↔ 'S_{Tr}').
const _GREEK = { theta:'\\theta', alpha:'\\alpha', beta:'\\beta', delta:'\\delta',
  lambda:'\\lambda', nu:'\\nu', rho:'\\rho', tau:'\\tau', eta:'\\eta',
  epsilon:'\\varepsilon', gamma:'\\Gamma', phi:'\\varphi', omega:'\\omega',
  mu:'\\mu', sigma:'\\sigma', Delta:'\\Delta' };
function _symVariants(sym) {
  const set = new Set();
  set.add(formatSymbol(sym));
  set.add(sym);
  const s     = sym.replace(/prime/g, "'");
  set.add(s);
  const prime = s.endsWith("'") ? "'" : '';
  const core  = prime ? s.slice(0, -1) : s;
  let baseRaw, sub = '';
  const um = core.match(/^([A-Za-z]+?)_(.+)$/);
  const dm = core.match(/^([A-Za-z]+?)(\d+)$/);
  if (um)      { baseRaw = um[1]; sub = um[2]; }
  else if (dm) { baseRaw = dm[1]; sub = dm[2]; }
  else         { baseRaw = core; }
  const base = _GREEK[baseRaw] || baseRaw;
  if (sub) { set.add(`${base}_${sub}${prime}`); set.add(`${base}_{${sub}}${prime}`); }
  else     { set.add(`${base}${prime}`); }
  return [...set].filter(Boolean).sort((a, b) => b.length - a.length);
}

// Ersetzt die Variablensymbole in einem LaTeX-String durch die eingegebenen Zahlen.
// Schützt LaTeX-Befehle (z. B. \dfrac), indem nur „freistehende" Symbole ersetzt
// werden (nicht von Buchstaben/Backslash umgeben).
function _substituteLatex(formula, solveForSym, inputs) {
  let tex = formula.latex;
  const vars = formula.variables
    .filter(v => v.symbol !== solveForSym && inputs[v.symbol] != null && isFinite(inputs[v.symbol]))
    .map(v => ({ variants: _symVariants(v.symbol), val: inputs[v.symbol] }))
    // Variablen mit längstem Token zuerst, damit Teil-Treffer nicht stören
    .sort((a, b) => b.variants[0].length - a.variants[0].length);

  for (const { variants, val } of vars) {
    const f   = (+val.toFixed(4)).toString().replace('.', '{,}');
    const num = val < 0 ? `\\left(${f}\\right)` : f;
    for (const tok of variants) {
      const esc = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Befehls-Tokens (\theta …) dürfen auf andere Befehle folgen (\sin\theta);
      // Buchstaben-Tokens (a, n) nicht in Wörtern/Befehlen stehen.
      const lb  = /^\\/.test(tok) ? "(?<!\\\\)" : "(?<![A-Za-z\\\\])";
      const re  = new RegExp(lb + esc + "(?![A-Za-z_'^{])", 'g');
      if (re.test(tex)) { tex = tex.replace(re, `\\;${num}\\;`); break; }
    }
  }
  return tex;
}

// ── Berechnungsprotokoll als PDF/Druck ─────────────────────────────────────────
function printFormulaCalc(formula) {
  const fmt = x => (Math.abs(x) < 0.001 || Math.abs(x) > 99999)
    ? x.toExponential(4) : (+x.toFixed(4)).toString().replace('.', ',');

  // Aktuelle Auswahl + Eingaben einsammeln
  const solveForSym = document.getElementById('solve-for-select')?.value || Object.keys(formula.solveFor)[0];
  const targetDef   = formula.variables.find(v => v.symbol === solveForSym) || { name: solveForSym, unit: '' };
  const inputs = {};
  const given  = [];
  let allFilled = true;
  formula.variables.forEach(v => {
    if (v.symbol === solveForSym) return;
    const el = document.getElementById(`var-${v.symbol}`);
    const raw = el ? el.value : '';
    if (raw === '' || isNaN(parseFloat(raw))) { allFilled = false; return; }
    inputs[v.symbol] = parseFloat(raw);
    given.push(`${v.name} = ${raw.replace('.', ',')} ${v.unit}`);
  });

  // Ergebnis + eingesetzte Formel (falls alle Werte vorhanden)
  let resultLine = '';
  let substLatex = '';
  if (allFilled) {
    try {
      const r = formula.solveFor[solveForSym](inputs);
      if (isFinite(r)) resultLine = `<strong>${targetDef.name} = ${fmt(r)} ${targetDef.unit}</strong>`;
      substLatex = _substituteLatex(formula, solveForSym, inputs);
    } catch { /* ignorieren */ }
  }
  const substHtml = substLatex
    ? `<li>Formel eingesetzt: $$${substLatex}$$</li>`
    : '';

  const givenHtml = given.length
    ? `<ul class="pa-given">${given.map(g => `<li>${g}</li>`).join('')}</ul>`
    : '<em>– keine Eingaben –</em>';

  // Schrittweise Umstellung nach der gesuchten Größe.
  // Vorrang: vorformulierte Schritte (FORMULA_STEPS) → sonst Algebra-Engine.
  let umstellHtml = '';
  let steps = (window.FORMULA_STEPS && window.FORMULA_STEPS[formula.id] && window.FORMULA_STEPS[formula.id][solveForSym]) || null;
  if (!steps) {
    const eq = formula.eq || (window.FORMULA_EQ && window.FORMULA_EQ[formula.id]);
    if (eq && window.Algebra) steps = window.Algebra.rearrangeSteps(eq, solveForSym);
  }
  if (steps && steps.length > 1) {
    umstellHtml = `<div class="pa-block"><h3>Umstellung nach ${targetDef.name}</h3>
      <ol class="pa-steps">${steps.map(s =>
        `<li>$$${s.tex}$$${s.note ? `<span class="pa-note">${s.note}</span>` : ''}</li>`
      ).join('')}</ol></div>`;
  }

  const varRows = formula.variables.map(v =>
    `<tr><td>${v.symbol.replace(/prime/g, "'")}</td><td>${v.name}</td><td>${v.unit}</td><td>${v.description}</td></tr>`
  ).join('');

  const today = new Date().toLocaleDateString('de-DE');

  let area = document.getElementById('print-area');
  if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
  area.innerHTML = `
    <div class="pa-head">
      <span class="pa-app">Augenoptik-Rechner · Berechnungsprotokoll</span>
      <span class="pa-date">${today}</span>
    </div>
    <div class="pa-cat">${formula.category}</div>
    <h1>${formula.name}</h1>
    <div class="pa-formula">$$${formula.latex}$$</div>
    <p class="pa-desc">${formula.description}</p>

    ${umstellHtml}

    <div class="pa-block">
      <h3>Rechenweg</h3>
      <ol class="pa-flow">
        <li>Gesucht: <strong>${targetDef.name}</strong></li>
        <li>Gegeben:${givenHtml}</li>
        ${substHtml}
        <li>Ergebnis: ${resultLine || '<em>(Werte unvollständig)</em>'}</li>
      </ol>
    </div>

    <div class="pa-block">
      <h3>Variablen</h3>
      <table class="pa-vartable">
        <thead><tr><th>Symbol</th><th>Name</th><th>Einheit</th><th>Beschreibung</th></tr></thead>
        <tbody>${varRows}</tbody>
      </table>
    </div>
  `;

  // Formel wie im Popup mit KaTeX rendern (statt ASCII)
  if (window.renderMathInElement) {
    renderMathInElement(area, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false,
    });
  }

  document.body.classList.add('printing-formula');
  const cleanup = () => { document.body.classList.remove('printing-formula'); window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

// ── Register / Symbolverzeichnis ──────────────────────────────────────────────
let regActiveCat = 'Alle';
let regInitDone  = false;

function renderRegister() {
  const searchEl  = document.getElementById('reg-search');
  const filterEl  = document.getElementById('reg-cat-filter');
  const contentEl = document.getElementById('register-content');
  if (!searchEl || !contentEl || typeof GLOSSARY === 'undefined') return;

  if (!regInitDone) {
    regInitDone = true;
    searchEl.addEventListener('input', drawRegContent);
  }

  buildRegFilter();
  drawRegContent();
}

function buildRegFilter() {
  const filterEl = document.getElementById('reg-cat-filter');
  if (!filterEl) return;
  const cats = [...new Set(GLOSSARY.map(e => e.category))];
  filterEl.innerHTML = ['Alle', ...cats].map(c =>
    `<button class="reg-cat-btn ${c === regActiveCat ? 'active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');
  filterEl.querySelectorAll('.reg-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      regActiveCat = btn.dataset.cat;
      buildRegFilter();
      drawRegContent();
    });
  });
}

function drawRegContent() {
  const searchEl  = document.getElementById('reg-search');
  const contentEl = document.getElementById('register-content');
  if (!searchEl || !contentEl) return;

  const query = searchEl.value.toLowerCase();
  let entries = GLOSSARY;
  if (regActiveCat !== 'Alle') entries = entries.filter(e => e.category === regActiveCat);
  if (query) entries = entries.filter(e =>
    e.symbol.toLowerCase().includes(query) ||
    e.name.toLowerCase().includes(query) ||
    e.description.toLowerCase().includes(query)
  );

  if (entries.length === 0) {
    contentEl.innerHTML = '<div class="reg-empty">Kein Symbol gefunden.</div>';
    return;
  }

  // Nach Kategorie gruppieren (Reihenfolge erhalten)
  const groups = {};
  entries.forEach(e => {
    if (!groups[e.category]) groups[e.category] = [];
    groups[e.category].push(e);
  });

  contentEl.innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="reg-category-block">
      <div class="reg-category-title">${cat}</div>
      <table class="reg-table">
        <thead><tr>
          <th>Symbol</th><th>Name</th><th>Einheit</th><th>Beschreibung</th>
        </tr></thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td class="reg-sym-cell">$${item.latex}$</td>
              <td>${item.name}</td>
              <td class="reg-unit-cell">${item.unit || '–'}</td>
              <td class="reg-desc-cell">${item.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  if (window.renderMathInElement) {
    renderMathInElement(contentEl, {
      delimiters: [{ left: '$', right: '$', display: false }],
      throwOnError: false
    });
  }
}

// ── Favoriten ─────────────────────────────────────────────────────────────────
function renderFavorites() {
  renderFormulaGrid('favorites-grid', getFilteredFormulas(true));
}

// ── Prismen-Rechner ───────────────────────────────────────────────────────────
let prismViz      = null;
let prismInitDone = false;

function initPrism() {
  const canvas = document.getElementById('prism-canvas');
  if (!canvas) return;

  if (!prismInitDone) {
    // Event-Listener ZUERST und unabhängig von der Canvas-Initialisierung anhängen.
    // calcAndDrawPrism() bricht selbst ab, falls prismViz noch nicht existiert,
    // d.h. die Eingaben reagieren auch dann, wenn die Visualisierung scheitert.
    document.querySelectorAll('.pr-input').forEach(inp => {
      inp.addEventListener('input', calcAndDrawPrism);
    });

    // Richtungsschnellbuttons
    document.querySelectorAll('.prism-dir-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const eye  = btn.dataset.eye;
        const axEl = document.getElementById(`pr-${eye}-pax`);
        if (axEl) { axEl.value = btn.dataset.angle; calcAndDrawPrism(); }
        document.querySelectorAll(`.prism-dir-btn[data-eye="${eye}"]`)
          .forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    window.addEventListener('resize', () => {
      if (prismViz) { prismViz.resize(); calcAndDrawPrism(); }
    });

    // Reset-Button: alle Eingaben auf 0 zurücksetzen
    const resetBtn = document.getElementById('pr-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.pr-input').forEach(inp => { inp.value = '0'; });
      document.querySelectorAll('.prism-dir-btn').forEach(b => b.classList.remove('active'));
      calcAndDrawPrism();
    });

    // Link-Button: teilbaren URL mit aktuellem Zustand kopieren
    document.getElementById('pr-link')?.addEventListener('click', (e) => _prShareLink(e.currentTarget));

    // Kopieren-Button: Ergebnisse als Text in die Zwischenablage
    const copyBtn = document.getElementById('pr-copy');
    if (copyBtn) copyBtn.addEventListener('click', () => {
      const res = document.getElementById('prism-results');
      const txt = res ? res.innerText.replace(/\n{2,}/g, '\n').trim() : '';
      if (!txt) return;
      navigator.clipboard?.writeText('Prismen-Berechnung\n──────────────\n' + txt)
        .then(() => { const o = copyBtn.textContent; copyBtn.textContent = '✓ Kopiert'; setTimeout(() => copyBtn.textContent = o, 1500); })
        .catch(() => {});
    });

    // Canvas-Visualisierung initialisieren (darf fehlschlagen, ohne die Eingaben zu blockieren)
    try {
      prismViz = new PrismVisualizer(canvas);
      prismViz.resize();
    } catch (err) {
      console.error('PrismVisualizer-Init fehlgeschlagen:', err);
    }

    _prLoad();   // gespeicherte Eingaben wiederherstellen
    prismInitDone = true;   // erst nach erfolgreichem Setup setzen
  }

  if (prismViz) prismViz.resize();
  calcAndDrawPrism();
}

function _prGet(id) { return parseFloat(document.getElementById(id)?.value) || 0; }

// ── Prismen-Persistenz (localStorage) ─────────────────────────────────────────
function _prSave() {
  try {
    const data = {};
    document.querySelectorAll('.pr-input').forEach(inp => { data[inp.id] = inp.value; });
    localStorage.setItem('ao_prism', JSON.stringify(data));
  } catch { /* localStorage nicht verfügbar → ignorieren */ }
}
function _prLoad() {
  try {
    // URL-Hash (#pr=...) hat Vorrang vor localStorage (teilbarer Zustand)
    let data = null;
    const m = location.hash.match(/pr=([^&]+)/);
    if (m) { try { data = JSON.parse(decodeURIComponent(m[1])); } catch {} }
    if (!data) data = JSON.parse(localStorage.getItem('ao_prism') || '{}');
    Object.entries(data).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val != null) el.value = val;
    });
  } catch { /* ignorieren */ }
}

// Teilbaren Link mit dem aktuellen Prismen-Zustand in die Zwischenablage
function _prShareLink(btn) {
  const data = {};
  document.querySelectorAll('.pr-input').forEach(inp => {
    if (parseFloat(inp.value)) data[inp.id] = inp.value;   // nur belegte Felder
  });
  const url = location.origin + location.pathname + '#pr=' + encodeURIComponent(JSON.stringify(data));
  navigator.clipboard?.writeText(url)
    .then(() => { const o = btn.textContent; btn.textContent = '✓ kopiert'; setTimeout(() => btn.textContent = o, 1500); })
    .catch(() => {});
}

function calcAndDrawPrism() {
  const R = { S: _prGet('pr-R-sph'), C: _prGet('pr-R-cyl'), ax: _prGet('pr-R-ax'),
              dx: _prGet('pr-R-dx'), dy: _prGet('pr-R-dy'),
              pVal: _prGet('pr-R-pval'), pAx: _prGet('pr-R-pax') };
  const L = { S: _prGet('pr-L-sph'), C: _prGet('pr-L-cyl'), ax: _prGet('pr-L-ax'),
              dx: _prGet('pr-L-dx'), dy: _prGet('pr-L-dy'),
              pVal: _prGet('pr-L-pval'), pAx: _prGet('pr-L-pax') };

  // Eingabe-Konvention: Δx nasal-positiv (nach innen) für BEIDE Augen, Δy oben-positiv.
  // Nasal entspricht in TABO dem 0°-Strahl beim rechten und dem 180°-Strahl beim
  // linken Auge. Der interne Rechen-Frame hat +x = 0° (TABO). Damit positives Δx
  // beim RA nach 0° und beim LA nach 180° zeigt: RA direkt (+), LA spiegeln (−).
  const dxR_int = +R.dx;
  const dxL_int = -L.dx;

  // PNW (Prismatische Nebenwirkung durch Fehlzentrierung)
  const pnwR  = calcPNW(R.S, R.C, R.ax, dxR_int, R.dy);
  const pnwL  = calcPNW(L.S, L.C, L.ax, dxL_int, L.dy);
  // Verschriebene Prismen
  const prescR = prismFromPolar(R.pVal, R.pAx);
  const prescL = prismFromPolar(L.pVal, L.pAx);
  // Summe pro Auge (Vektoraddition)
  const totalR = addPrisms(pnwR, prescR);
  const totalL = addPrisms(pnwL, prescL);
  const polR   = prismToPolar(totalR);
  const polL   = prismToPolar(totalL);

  // Binokulare Kenngrössen
  const vertImb    = Math.abs(totalR.Py - totalL.Py);
  // H-Gesamtwirkung in B-in-Konvention: RA Px>0 = B-in (nasal), LA Px<0 = B-in.
  // Netto-B-in (nasal/divergent) = Px_R − Px_L.
  const horConvDem = totalR.Px - totalL.Px;

  if (prismViz) prismViz.draw(polR, polL, null);
  displayPrismResults(pnwR, pnwL, prescR, prescL, totalR, totalL, polR, polL, vertImb, horConvDem, R, L);
  _prSave();
}

// ── Meridianwirkung (Scheitelbrechwert im H-/V-Hauptschnitt) ──────────────────
function _meridianPowers(S, C, axDeg) {
  const r  = axDeg * Math.PI / 180;
  const Dh = S + C * Math.sin(r) ** 2;   // horizontaler Hauptschnitt (= calcPNW Dxx)
  const Dv = S + C * Math.cos(r) ** 2;   // vertikaler Hauptschnitt   (= calcPNW Dyy)
  return { Dh, Dv };
}

// ── Abgabefähigkeit nach ISO 21987 / DIN-Grenzabweichungstabelle ─────────────
// Liefert die zulässige Grenzabweichung (cm/m) für H und V abhängig von der
// Hauptschnittwirkung und dem Rezeptprisma-Betrag im jeweiligen Meridian.
function _grenzabweichung(power, rxPrism, axis /* 'h' | 'v' */) {
  const P = Math.abs(power), rx = Math.abs(rxPrism);
  if (axis === 'h') {
    if (P <= 3.25) return rx <= 2 ? 0.67 : rx <= 10 ? 1.00 : 1.25;
    // stärkere Hauptschnittwirkung → aus Dezentration abgeleitet (Prentice)
    if (rx <= 2)  return 0.2 * P;            // 2 mm Dezentration
    if (rx <= 10) return 0.33 + 0.1 * P;     // 0,33 + Prisma aus 1 mm
    return 0.06 + 0.1 * P;
  } else {
    if (P <= 5.00) return rx <= 2 ? 0.50 : rx <= 10 ? 0.75 : 1.00;
    if (rx <= 2)  return 0.1 * P;            // 1 mm Dezentration
    if (rx <= 10) return 0.25 + 0.1 * P;
    return 0.50 + 0.1 * P;
  }
}

function _abgabeCheck(glass, pnw, presc) {
  const { Dh, Dv } = _meridianPowers(glass.S, glass.C, glass.ax);
  const tolH = _grenzabweichung(Dh, presc.Px, 'h');
  const tolV = _grenzabweichung(Dv, presc.Py, 'v');
  const devH = Math.abs(pnw.Px || 0);   // ungewollte H-Abweichung aus Fehlzentrierung
  const devV = Math.abs(pnw.Py || 0);
  return { Dh, Dv, tolH, tolV, devH, devV,
           passH: devH <= tolH + 1e-9, passV: devV <= tolV + 1e-9 };
}

function displayPrismResults(pnwR, pnwL, prescR, prescL, totalR, totalL, polR, polL, vertImb, horConv, glassR, glassL) {
  const el = document.getElementById('prism-results');
  if (!el) return;

  function row(label, value, cls = '') {
    return `<div class="prism-res-row">
      <span class="prism-res-label">${label}</span>
      <span class="prism-res-value ${cls}">${value}</span>
    </div>`;
  }

  const f2 = x => x.toFixed(2).replace('.', ',');

  function eyeBlock(title, pnw, presc, total, pol, eye, glass) {
    const pPNW  = prismToPolar(pnw);
    const pPres = prismToPolar(presc);
    const a360  = n => ((n % 360) + 360) % 360;

    // Abgabefähigkeit (ISO 21987) – nur sinnvoll, wenn eine Fehlzentrierung vorliegt
    let abgabeRows = '';
    if (glass && pPNW.mag >= 0.005) {
      const a = _abgabeCheck(glass, pnw, presc);
      const line = (lbl, dev, tol, pass) => row(
        lbl,
        `${f2(dev)} / max ${f2(tol)} pdpt ${pass ? '✓' : '⚠'}`,
        pass ? 'prism-res-ok' : 'prism-res-warn');
      abgabeRows =
        `<div class="prism-res-row" style="margin-top:4px"><span class="prism-res-label" style="opacity:.7">Abgabefähig (ISO 21987)</span><span class="prism-res-value">${a.passH && a.passV ? '✓ abgabefähig' : '⚠ nicht abgabefähig'}</span></div>` +
        line(`· horizontal (HS ${f2(a.Dh)} dpt)`, a.devH, a.tolH, a.passH) +
        line(`· vertikal (HS ${f2(a.Dv)} dpt)`,   a.devV, a.tolV, a.passV);
    }

    return `<div class="prism-res-section">
      <div class="prism-res-title">${title}</div>
      ${row('PNW (Fehlzentrierung)',
        pPNW.mag >= 0.005
          ? `${f2(pPNW.mag)} pdpt · ${baseName(pPNW.angle, eye)} (${a360(pPNW.angle).toFixed(0)}°)`
          : '– (keine Fehlzentrierung)')}
      ${row('Rezeptprisma',
        pPres.mag >= 0.005
          ? `${f2(pPres.mag)} pdpt · ${baseName(pPres.angle, eye)} (${a360(pPres.angle).toFixed(0)}°)`
          : '– (kein Rezeptprisma)')}
      ${row('Gesamtprisma',
        pol.mag < 0.005 ? '<em>–</em>' : `<strong>${f2(pol.mag)} pdpt</strong>`)}
      ${pol.mag >= 0.005 ? row('Basislage', `${baseName(pol.angle, eye)} · ${a360(pol.angle).toFixed(0)}°`) : ''}
      ${pol.mag >= 0.005 ? row('H-Anteil', hCompLabel(total.Px, eye)) : ''}
      ${pol.mag >= 0.005 ? row('V-Anteil', vCompLabel(total.Py)) : ''}
      ${abgabeRows}
    </div>`;
  }

  const vCls = vertImb > 1.0 ? 'prism-res-warn' : vertImb > 0.001 ? '' : 'prism-res-ok';
  const hTxt = Math.abs(horConv) < 0.005 ? '–'
    : horConv > 0 ? `${f2(horConv)} pdpt B in (divergierend)`
                  : `${f2(Math.abs(horConv))} pdpt B out (konvergierend)`;

  // Binokulare klinische Bewertung nur zeigen, wenn überhaupt Prismenwirkung vorliegt
  const anyPrism = polR.mag >= 0.005 || polL.mag >= 0.005;
  const binoRows = anyPrism
    ? row('Vertikale Imbalance', `${f2(vertImb)} pdpt`, vCls) +
      row('H-Gesamtanteil (B-in)', hTxt) +
      row('Klinisch (Vertikalbalance)',
          vertImb <= 1.0 ? '✓ im fusionalen Bereich' : '⚠ Imbalance klinisch relevant',
          vertImb <= 1.0 ? 'prism-res-ok' : 'prism-res-warn')
    : row('Status', 'Keine Prismenwirkung – Werte eingeben');

  el.innerHTML =
    eyeBlock('Rechtes Auge (R)', pnwR, prescR, totalR, polR, 'R', glassR) +
    eyeBlock('Linkes Auge (L)',  pnwL, prescL, totalL, polL, 'L', glassL) +
    `<div class="prism-res-section">
      <div class="prism-res-title">Binokulare Gesamtwirkung</div>
      ${binoRows}
    </div>`;
}

// ── Strahlengang-Tracer UI ────────────────────────────────────────────────────
function initRayTracer() {
  const canvas = document.getElementById('ray-canvas');
  if (!canvas) return;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const dpr  = window.devicePixelRatio || 1;
    // offsetWidth liefert die tatsächliche CSS-Breite nach Layout
    const cssW = wrap.offsetWidth || canvas.offsetWidth || 800;
    const cssH = Math.max(300, Math.min(520, window.innerHeight * 0.52));
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    // Breite per CSS (width:100%) — kein fixer px-Wert, damit flex:1 greift
    canvas.style.height = cssH + 'px';
    if (rayTracer) { rayTracer.dpr = dpr; rayTracer.draw(); }
  }

  rayTracer = new RayTracer(canvas);
  rayTracer.addLens(0, 5, 0.035);   // Position 0 m, 5 dpt, Apertur 0,035 m
  rayTracer.setObject(-0.18, 0.025); // Gegenstand 0,18 m links, Höhe 0,025 m
  rayTracer.autoViewport();

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // ── Zoom per Mausrad (Koordinaten in CSS-Pixeln) ──────────────────────────
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect   = canvas.getBoundingClientRect();
    const px     = e.clientX - rect.left;   // CSS-Pixel (= logische Pixel)
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
    rayTracer.zoomAt(factor, px);
    rayTracer.draw();
  }, { passive: false });

  // ── Pan per Drag (CSS-Pixel-Deltas) ──────────────────────────────────────
  let _drag = null;
  canvas.addEventListener('mousedown', (e) => {
    _drag = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!_drag) return;
    rayTracer.panBy(e.clientX - _drag.x, e.clientY - _drag.y);
    _drag = { x: e.clientX, y: e.clientY };
    rayTracer.draw();
  });
  canvas.addEventListener('mouseup',    () => { _drag = null; canvas.style.cursor = ''; });
  canvas.addEventListener('mouseleave', () => { _drag = null; canvas.style.cursor = ''; });

  // ── Zoom-Buttons (Mittelpunkt in CSS-Pixeln) ──────────────────────────────
  document.getElementById('rt-zoom-in').addEventListener('click', () => {
    rayTracer.zoomAt(1 / 1.3, canvas.offsetWidth / 2); rayTracer.draw();
  });
  document.getElementById('rt-zoom-out').addEventListener('click', () => {
    rayTracer.zoomAt(1.3, canvas.offsetWidth / 2); rayTracer.draw();
  });
  document.getElementById('rt-zoom-reset').addEventListener('click', () => {
    rayTracer.autoViewport(); rayTracer.draw();
  });

  renderLensList();
  renderStopList();
  setupRayTracerControls();
  setupPresets();
  rayTracer.draw();
}

// ── Vorlagen (Presets) ────────────────────────────────────────────────────────
const RT_PRESETS = {
  einzellinse: {
    label: 'Einzellinse',
    lenses: [{ x: 0, power: 5, aperture: 0.035 }],
    stops:  [],
    objX: -0.25, objH: 0.025, infinity: false,
    rays: { parallel: true, focal: true, central: true, virtual: true,
            marginal: false, chief: false, oblique: false },
  },
  lupe: {
    label: 'Lupe',
    lenses: [{ x: 0, power: 10, aperture: 0.020 }],
    stops:  [],
    // Objekt knapp innerhalb F (f'=100mm → F bei x=−0,1m; Objekt bei −0,08m)
    objX: -0.08, objH: 0.015, infinity: false,
    rays: { parallel: true, focal: true, central: true, virtual: true,
            marginal: false, chief: false, oblique: false },
  },
  kepler: {
    label: 'Kepler-Fernrohr',
    // Objektiv f'=200mm (5 dpt), Ø=64mm | Okular f'=50mm (20 dpt), Ø=30mm
    // Baulänge L = f'_Obj + f'_Ok = 250mm | Γ' = −4× (umgekehrt)
    lenses: [
      { x: 0,    power:  5, aperture: 0.032 },
      { x: 0.25, power: 20, aperture: 0.015 },
    ],
    stops:  [{ x: 0, radius: 0.032 }],
    objX: -9999, objH: 0.020, infinity: true,
    rays: { parallel: true, focal: true, central: true, virtual: false,
            marginal: false, chief: true, oblique: true },
  },
  galilei: {
    label: 'Galilei-Fernrohr',
    // Objektiv f'=200mm (5 dpt) | Negativokular f'=−50mm (−20 dpt)
    // Baulänge L = f'_Obj + f'_Ok = 150mm | Γ' = +4× (aufrecht)
    lenses: [
      { x: 0,    power:  5, aperture: 0.032 },
      { x: 0.15, power: -20, aperture: 0.015 },
    ],
    stops:  [{ x: 0, radius: 0.032 }],
    objX: -9999, objH: 0.020, infinity: true,
    rays: { parallel: true, focal: true, central: true, virtual: false,
            marginal: false, chief: true, oblique: true },
  },
  mikroskop: {
    label: 'Mikroskop',
    // Objektiv f'=20mm (50 dpt) | Okular f'=100mm (10 dpt) | Tubuslänge Δ≈300mm
    // Objekt knapp außerhalb F_Obj → Zwischenbild bei x≈0,22m → Okular bei x=0,32m
    lenses: [
      { x: 0,    power: 50, aperture: 0.008 },
      { x: 0.32, power: 10, aperture: 0.020 },
    ],
    stops:  [{ x: 0, radius: 0.008 }],
    objX: -0.022, objH: 0.001, infinity: false,
    rays: { parallel: true, focal: true, central: true, virtual: true,
            marginal: false, chief: false, oblique: false },
  },
  kamera: {
    label: 'Kamera',
    // Kameraobjektiv f'=50mm (20 dpt) | Objekt 1m vor der Linse
    lenses: [{ x: 0, power: 20, aperture: 0.025 }],
    stops:  [],
    objX: -1.0, objH: 0.060, infinity: false,
    rays: { parallel: true, focal: true, central: true, virtual: false,
            marginal: false, chief: false, oblique: false },
  },
};

let activePreset = null;

function setupPresets() {
  document.querySelectorAll('.rt-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadPreset(btn.dataset.preset);
    });
  });
}

function loadPreset(name) {
  const preset = RT_PRESETS[name];
  if (!preset || !rayTracer) return;
  activePreset = name;

  // ── Zustand zurücksetzen ────────────────────────────────────────────────
  rayTracer.lenses = [];
  rayTracer.stops  = [];
  preset.lenses.forEach(l => rayTracer.addLens(l.x, l.power, l.aperture));
  preset.stops.forEach(s  => rayTracer.addStop(s.x, s.radius));
  rayTracer.setObject(preset.objX, preset.objH);
  rayTracer.setRays(preset.rays);
  rayTracer.autoViewport();

  // ── Checkboxen synchronisieren ──────────────────────────────────────────
  Object.entries(preset.rays).forEach(([type, val]) => {
    const cb = document.getElementById(`rt-ray-${type}`);
    if (cb) cb.checked = val;
  });

  // ── Objekt-Steuerelemente synchronisieren ──────────────────────────────
  const objAtInf = preset.infinity;
  rtObjAtInfinity = objAtInf;   // Modul-globale Variable setzen!
  const infBtn   = document.getElementById('rt-obj-infinity');
  const objPos   = document.getElementById('rt-obj-pos');
  const objH     = document.getElementById('rt-obj-height');
  const objPosT  = document.getElementById('rt-obj-pos-text');
  const objHT    = document.getElementById('rt-obj-h-text');

  if (infBtn) infBtn.classList.toggle('active', objAtInf);
  if (objPos)  { objPos.disabled  = objAtInf; }
  if (objPosT) { objPosT.disabled = objAtInf; }

  if (objAtInf) {
    if (objPosT) objPosT.value = '∞';
    const posVal = document.getElementById('rt-obj-pos-val');
    if (posVal)  posVal.textContent = '∞';
  } else {
    const posAbs = Math.abs(preset.objX);
    if (objPos)  objPos.value  = -posAbs;
    if (objPosT) objPosT.value = (-posAbs).toFixed(3);
    const posVal = document.getElementById('rt-obj-pos-val');
    if (posVal)  posVal.textContent = 'a = ' + (-posAbs).toFixed(3).replace('.', ',').replace('-', '−') + ' m';
  }
  if (objH)  objH.value  = preset.objH;
  if (objHT) objHT.value = preset.objH.toFixed(3);
  const hVal = document.getElementById('rt-obj-h-val');
  if (hVal) hVal.textContent = preset.objH.toFixed(3).replace('.', ',') + ' m';

  // ── Linsen- und Blenden-Liste neu rendern ───────────────────────────────
  renderLensList();
  renderStopList();

  // ── Aktiven Preset markieren ────────────────────────────────────────────
  document.querySelectorAll('.rt-preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === name);
  });

  updateInfoBox();
  rayTracer.draw();
}

function setupRayTracerControls() {
  const objPos     = document.getElementById('rt-obj-pos');
  const objH       = document.getElementById('rt-obj-height');
  const objPosText = document.getElementById('rt-obj-pos-text');
  const objHText   = document.getElementById('rt-obj-h-text');
  // Nutzt rtObjAtInfinity (Modul-global) statt lokaler Variable,
  // damit loadPreset() den Zustand korrekt setzen kann.

  function updateObject() {
    let pos, h;
    if (rtObjAtInfinity) {
      pos = 9999;
      h   = parseFloat(objHText?.value) || 0.025;
      if (objPosText) objPosText.value = '∞';
      document.getElementById('rt-obj-pos-val').textContent = '∞';
    } else {
      // ISO 13666: Strecken entgegen der Lichtrichtung sind negativ.
      // Das Objekt liegt vor dem System → a < 0. Eingabe darf mit oder ohne
      // Vorzeichen erfolgen; intern/Anzeige wird der vorzeichenrichtige Wert genutzt.
      pos = Math.abs(parseFloat(objPosText?.value)) || Math.abs(parseFloat(objPos?.value)) || 0.18;
      h   = parseFloat(objHText?.value) || parseFloat(objH?.value) || 0.025;
      const signed = -pos;   // a (negativ, ISO 13666)
      // Schieberegler synchronisieren (Slider-Bereich negativ: −4 bis −0,01)
      if (objPos) objPos.value = Math.max(-4, Math.min(-0.01, signed));
      document.getElementById('rt-obj-pos-val').textContent =
        'a = ' + signed.toFixed(3).replace('.', ',').replace('-', '−') + ' m';
    }
    if (objH)    objH.value    = h;
    if (objHText) objHText.value = h;
    document.getElementById('rt-obj-h-val').textContent = h.toFixed(3).replace('.', ',') + ' m';
    rayTracer.setObject(-pos, h);   // Raytracer erwartet negative x-Position links der Linse
    // autoViewport() wird hier NICHT aufgerufen, damit manuelles Zoomen/Verschieben
    // nicht bei jeder Reglerbewegung zurückgesetzt wird.
    rayTracer.draw();
    updateInfoBox();
  }

  // Textfelder → update
  if (objPosText) objPosText.addEventListener('input', () => {
    rtObjAtInfinity = false;
    // Preset-Markierung löschen wenn manuell verändert
    document.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
    updateObject();
  });
  if (objHText) objHText.addEventListener('input', () => {
    document.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
    updateObject();
  });

  // Schieberegler → sync zu Textfeld
  objPos.addEventListener('input', () => {
    rtObjAtInfinity = false;
    document.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
    const signed = parseFloat(objPos.value) || -0.18;   // Slider ist bereits negativ
    if (objPosText) objPosText.value = signed.toFixed(3);
    updateObject();
  });
  objH.addEventListener('input', () => {
    document.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
    const hv = parseFloat(objH.value) || 0.025;
    if (objHText) objHText.value = hv.toFixed(3);
    updateObject();
  });

  // ∞ Taste
  const infBtn = document.getElementById('rt-obj-infinity');
  if (infBtn) infBtn.addEventListener('click', () => {
    rtObjAtInfinity = !rtObjAtInfinity;
    infBtn.classList.toggle('active', rtObjAtInfinity);
    if (objPosText) objPosText.disabled = rtObjAtInfinity;
    if (objPos)     objPos.disabled     = rtObjAtInfinity;
    document.querySelectorAll('.rt-preset-btn').forEach(b => b.classList.remove('active'));
    updateObject();
  });

  document.getElementById('rt-add-lens').addEventListener('click', () => {
    const lastX = rayTracer.lenses.length > 0
      ? rayTracer.lenses[rayTracer.lenses.length - 1].x + 0.08 : 0;
    rayTracer.addLens(lastX, 5, 0.035);
    renderLensList();
    rayTracer.autoViewport();
    rayTracer.draw();
    updateInfoBox();
  });

  document.getElementById('rt-add-aperture').addEventListener('click', () => {
    rayTracer.addStop(0.05, 0.025);
    renderStopList();
    rayTracer.draw();
  });

  // Strahltypen (inkl. virtuelle Strahlen)
  ['parallel', 'focal', 'central', 'virtual', 'marginal', 'chief', 'oblique'].forEach(type => {
    const cb = document.getElementById(`rt-ray-${type}`);
    if (cb) cb.addEventListener('change', () => {
      rayTracer.setRays({ [type]: cb.checked });
      rayTracer.draw();
    });
  });

  // Systemhauptebenen & -brennpunkte (nur bei ≥2 Linsen sichtbar)
  const cardCb = document.getElementById('rt-show-cardinals');
  if (cardCb) {
    rayTracer.showCardinals = cardCb.checked;
    cardCb.addEventListener('change', () => {
      rayTracer.showCardinals = cardCb.checked;
      rayTracer.draw();
    });
  }

  document.getElementById('rt-auto-viewport').addEventListener('click', () => {
    rayTracer.autoViewport();
    rayTracer.draw();
  });
}

function renderLensList() {
  const list = document.getElementById('lens-list');
  if (!rayTracer) return;
  if (rayTracer.lenses.length === 0) {
    list.innerHTML = '<div class="rt-empty">Keine Linsen — "+ Linse" klicken.</div>';
    return;
  }
  list.innerHTML = rayTracer.lenses.map((lens, i) => {
    const f_m = lens.power !== 0 ? (1 / lens.power).toFixed(3).replace('.', ',') : '∞';
    const typ = lens.power > 0 ? 'Sammellinse' : lens.power < 0 ? 'Zerstreuungslinse' : '–';
    return `<div class="rt-item">
      <div class="rt-item-header">
        <span class="rt-item-title">Linse ${i + 1}</span>
        <button class="rt-remove-btn" data-type="lens" data-idx="${i}">✕</button>
      </div>
      <div class="rt-item-controls">
        <label>Position (m)<input type="number" class="rt-input" data-prop="x"       data-idx="${i}" data-type="lens" value="${lens.x.toFixed(3)}"       step="0.005"></label>
        <label>Brechkraft (dpt)<input type="number" class="rt-input" data-prop="power"   data-idx="${i}" data-type="lens" value="${lens.power}"   step="0.25"></label>
        <label>Apertur Ø (m)<input type="number" class="rt-input" data-prop="aperture" data-idx="${i}" data-type="lens" value="${lens.aperture.toFixed(3)}" step="0.002"></label>
      </div>
      <div class="rt-item-info">f' = ${f_m} m &middot; ${typ}</div>
    </div>`;
  }).join('');

  list.querySelectorAll('.rt-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const idx  = parseInt(inp.dataset.idx);
      const prop = inp.dataset.prop;
      const val  = parseFloat(inp.value);
      if (!isNaN(val)) rayTracer.updateLens(idx, { [prop]: val });
      // info aktualisieren
      const infoEl = inp.closest('.rt-item').querySelector('.rt-item-info');
      if (infoEl && prop !== 'x' && prop !== 'aperture') {
        const p2 = rayTracer.lenses[idx].power;
        const f2 = p2 !== 0 ? (1 / p2).toFixed(3).replace('.', ',') : '∞';
        const t2 = p2 > 0 ? 'Sammellinse' : 'Zerstreuungslinse';
        infoEl.innerHTML = `f' = ${f2} m &middot; ${t2}`;
      }
      rayTracer.draw();
      updateInfoBox();
    });
  });

  list.querySelectorAll('.rt-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rayTracer.removeLens(parseInt(btn.dataset.idx));
      renderLensList();
      rayTracer.autoViewport();   // Beim Entfernen einer Linse neu zentrieren
      rayTracer.draw();
      updateInfoBox();
    });
  });
}

function renderStopList() {
  const list = document.getElementById('aperture-list');
  if (!rayTracer) return;
  if (rayTracer.stops.length === 0) {
    list.innerHTML = '<div class="rt-empty">Keine Blenden.</div>';
    return;
  }
  list.innerHTML = rayTracer.stops.map((st, i) => `
    <div class="rt-item">
      <div class="rt-item-header">
        <span class="rt-item-title">Blende ${i + 1}</span>
        <button class="rt-remove-btn" data-type="stop" data-idx="${i}">✕</button>
      </div>
      <div class="rt-item-controls">
        <label>Position (m)<input type="number" class="rt-input" data-prop="x"      data-idx="${i}" data-type="stop" value="${st.x.toFixed(3)}"      step="0.005"></label>
        <label>Radius (m)<input type="number" class="rt-input" data-prop="radius" data-idx="${i}" data-type="stop" value="${st.radius.toFixed(3)}" step="0.002"></label>
      </div>
    </div>`
  ).join('');

  list.querySelectorAll('.rt-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const idx  = parseInt(inp.dataset.idx);
      const prop = inp.dataset.prop;
      const val  = parseFloat(inp.value);
      if (!isNaN(val)) rayTracer.stops[idx][prop] = val;
      rayTracer.draw();
    });
  });
  list.querySelectorAll('.rt-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rayTracer.removeStop(parseInt(btn.dataset.idx));
      renderStopList();
      rayTracer.draw();
    });
  });
}

function updateInfoBox() {
  const el  = document.getElementById('rt-info');
  if (!el || !rayTracer) return;
  const img = rayTracer.findImage();
  const num = x => x.toFixed(3).replace('.', ',');

  // ── Zeile 1: Bilddaten ──────────────────────────────────────────────────
  let line1;
  if (img && img.afocal) {
    line1 = "B′ → ∞ (afokales System)";
  } else if (!img || !isFinite(img.x)) {
    line1 = 'Kein Bild berechenbar';
  } else {
    const objInf = rayTracer.objX < -6;
    const lastX  = rayTracer.lenses.length > 0 ? [...rayTracer.lenses].sort((a,b)=>a.x-b.x).slice(-1)[0].x : 0;
    const aStr   = objInf ? '∞' : `${num(rayTracer.objX - lastX)} m`;
    const ypStr  = isFinite(img.y) ? `${img.y.toFixed(4).replace('.', ',')} m` : '∞';
    line1 = `a' = ${num(img.b)} m &nbsp;|&nbsp; a = ${aStr} &nbsp;|&nbsp; y' = ${ypStr} &nbsp;|&nbsp; β' = ${isFinite(img.beta) ? img.beta.toFixed(3).replace('.', ',') : '∞'} &nbsp;|&nbsp; ${img.real ? 'reelles Bild' : 'virtuelles Bild'}`;
  }

  // ── Zeile 2: Systemdaten (nur bei ≥2 Linsen) ────────────────────────────
  let line2 = '';
  if (rayTracer.lenses.length >= 2) {
    const sc  = rayTracer.systemCardinalPoints();
    const mag = rayTracer.systemAngularMag();
    if (mag != null) {
      line2 = `<span class="rt-info-sys">System: afokal &nbsp;·&nbsp; Γ′ = ${mag.toFixed(2).replace('.', ',')}× ${mag < 0 ? '(umgekehrt)' : '(aufrecht)'}</span>`;
    } else if (sc && !sc.afocal) {
      const fp = (sc.F  != null && isFinite(sc.F))  ? num(sc.F)  : '–';
      const fpp= (sc.Fp != null && isFinite(sc.Fp)) ? num(sc.Fp) : '–';
      const h  = (sc.H  != null && isFinite(sc.H))  ? num(sc.H)  : '–';
      const hp = (sc.Hp != null && isFinite(sc.Hp)) ? num(sc.Hp) : '–';
      line2 = `<span class="rt-info-sys">System: f′ = ${num(sc.fEff)} m &nbsp;·&nbsp; D = ${(1/sc.fEff).toFixed(2).replace('.', ',')} dpt &nbsp;·&nbsp; H = ${h} · H′ = ${hp} &nbsp;·&nbsp; F = ${fp} · F′ = ${fpp} m</span>`;
    }
  }

  el.innerHTML = line1 + (line2 ? '<br>' + line2 : '');
}

// ── Refraktion UI — Diepes-Logik: BSG → Methodenwahl → Zylinderbestimmung ─────
// Zustände: 'BSG' | 'METHOD_SELECT' | 'ZNM' | 'ZNM_V' | 'KZM' | 'KZM_V' | 'DONE'

let refPatient  = null;
let refTrueRx   = null;
let refEye      = 'R';
let refPhase    = 'BSG';
let refBsgRx    = null;
let refMethod   = null;
let refInitDone = false;

function initRefraction() {
  if (!refInitDone) {
    refInitDone = true;

    document.querySelectorAll('.ref-eye-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        refEye = btn.dataset.eye;
        document.querySelectorAll('.ref-eye-btn').forEach(b => b.classList.toggle('active', b === btn));
        refUpdatePatientInfo();
      });
    });

    document.getElementById('ref-new-case')?.addEventListener('click', refStartCase);

    document.getElementById('ref-reset-rx')?.addEventListener('click', () => {
      refSetInputs(0, 0, 0);
      const sec = document.getElementById('ref-assessment');
      if (sec) sec.style.display = 'none';
    });

    document.querySelectorAll('.ref-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rx = refReadInputs();
        if      (btn.dataset.ds  !== undefined) refSetInputs(rx.S + parseFloat(btn.dataset.ds),  rx.C, rx.ax);
        else if (btn.dataset.dc  !== undefined) refSetInputs(rx.S, rx.C + parseFloat(btn.dataset.dc),  rx.ax);
        else if (btn.dataset.dax !== undefined) refSetInputs(rx.S, rx.C, rx.ax + parseFloat(btn.dataset.dax));
      });
    });

    document.getElementById('ref-test-btn')?.addEventListener('click', refTestLens);
    document.getElementById('ref-reveal-btn')?.addEventListener('click', refReveal);
  }
  refStartCase();
}

function refStartCase() {
  refTrueRx  = generateRandomRx();
  refPatient = new PatientSimulator(refTrueRx);
  refPhase   = 'BSG';
  refBsgRx   = null;
  refMethod  = null;
  refSetInputs(0, 0, 0);
  const sec = document.getElementById('ref-assessment');
  if (sec) sec.style.display = 'none';
  const btn = document.getElementById('ref-reveal-btn');
  if (btn) {
    btn.innerHTML = '👁 Lösung anzeigen';
    btn.style.cssText = 'width:100%;color:var(--warning);border-color:rgba(251,191,36,0.35);padding:9px';
  }
  refUpdatePatientInfo();
  refRenderPhasePanel();
}

function refUpdatePatientInfo() {
  const el = document.getElementById('ref-patient-info');
  if (!el) return;
  const phaseNames = {
    BSG: 'BSG', METHOD_SELECT: 'Methode wählen',
    ZNM: 'ZNM', ZNM_V: 'ZNM-Var.', KZM: 'KZM', KZM_V: 'KZM-Var.', DONE: 'Abschluss',
  };
  const eyeLabel = refEye === 'R' ? 'Rechtes Auge' : 'Linkes Auge';
  el.innerHTML = `<strong>${eyeLabel}</strong> &nbsp;·&nbsp;
    <span class="ref-phase-chip">${phaseNames[refPhase] || refPhase}</span>`;
}

// ── Phasen-Panel: rendert die phasenspezifische Führung ───────────────────────
function refRenderPhasePanel() {
  const panel = document.getElementById('ref-phase-panel');
  if (!panel) return;
  refUpdatePatientInfo();

  // ── Phase: BSG ──────────────────────────────────────────────────────────────
  if (refPhase === 'BSG') {
    panel.innerHTML = `
      <div class="rt-section ref-phase-section">
        <div class="rt-section-header">
          <span class="rt-section-title">Phase 1 — BSG (Bestes Sphärisches Glas)</span>
        </div>
        <div class="rt-section-body">
          <div class="ref-phase-hint">
            <strong>1. Nebeln (Donders):</strong> +1,50 dpt auf einmal — Ziel Vis ≤ 0,5.<br>
            <strong>2. Ausnebeln:</strong> −0,25 dpt-weise; "besser?" → weiter; "gleich/schlechter" → Stop.<br>
            <strong>3. Probe:</strong> +0,25 vorhalten → "schlechter" → BSG gesichert ✓
          </div>
          <div class="ref-phase-actions">
            <button class="ref-phase-btn" id="ref-btn-fog">+1,50 Nebel</button>
            <button class="ref-phase-btn" id="ref-btn-defog">−0,25 Ausnebeln</button>
            <button class="ref-phase-btn ref-phase-btn-confirm" id="ref-bsg-confirm">BSG bestätigt →</button>
          </div>
        </div>
      </div>`;
    document.getElementById('ref-btn-fog')?.addEventListener('click', () => {
      const rx = refReadInputs(); refSetInputs(rx.S + 1.5, rx.C, rx.ax); refTestLens();
    });
    document.getElementById('ref-btn-defog')?.addEventListener('click', () => {
      const rx = refReadInputs(); refSetInputs(rx.S - 0.25, rx.C, rx.ax); refTestLens();
    });
    document.getElementById('ref-bsg-confirm')?.addEventListener('click', () => {
      refBsgRx = refReadInputs();
      refPhase = 'METHOD_SELECT';
      refRenderPhasePanel();
    });

  // ── Phase: Methodenwahl (nach BSG) ──────────────────────────────────────────
  } else if (refPhase === 'METHOD_SELECT') {
    panel.innerHTML = `
      <div class="rt-section ref-phase-section">
        <div class="rt-section-header">
          <span class="rt-section-title">Phase 2 — Torische Methode wählen</span>
        </div>
        <div class="rt-section-body">
          <div class="ref-phase-hint">BSG bestätigt. Welche Methode zur Zylinderkorrektur?</div>
          <div class="ref-method-select-grid">
            <button class="ref-method-select-btn" data-method="ZNM">
              <strong>ZNM</strong><br><small>Zylindernebelmethode</small>
            </button>
            <button class="ref-method-select-btn" data-method="ZNM_V">
              <strong>ZNM-Variante</strong><br><small>Stenopäisch / KZM grob</small>
            </button>
            <button class="ref-method-select-btn" data-method="KZM">
              <strong>KZM</strong><br><small>Kreuzzylindermethode</small>
            </button>
            <button class="ref-method-select-btn" data-method="KZM_V">
              <strong>KZM-Variante</strong><br><small>JCC ±0,50 dpt (grob)</small>
            </button>
          </div>
        </div>
      </div>`;
    panel.querySelectorAll('.ref-method-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        refMethod = btn.dataset.method;
        refPhase  = refMethod;
        refRenderPhasePanel();
      });
    });

  // ── Phase: ZNM / ZNM-Variante ───────────────────────────────────────────────
  } else if (refPhase === 'ZNM' || refPhase === 'ZNM_V') {
    const isV = refPhase === 'ZNM_V';
    panel.innerHTML = `
      <div class="rt-section ref-phase-section">
        <div class="rt-section-header">
          <span class="rt-section-title">${isV ? 'ZNM-Variante' : 'ZNM'} — Zylinderbestimmung</span>
          <button class="rt-add-btn" id="ref-back-method">← Methode</button>
        </div>
        <div class="rt-section-body">
          <div class="ref-phase-hint">
            ${isV
              ? '<strong>Achse (Grob):</strong> Stenopäischer Spalt oder KZM-Grobbestimmung, dann wie ZNM.<br>'
              : '<strong>1. Zylindernebel:</strong> Cyl/2 + 0,50 dpt Sph-Nebel über BSG.<br>'
            }
            <strong>Achsbestimmung:</strong> Querstrichschema → schärfste Richtung (BSL) → Minus-Cyl-Achse ⊥ BSL.<br>
            <strong>Stärke:</strong> −0,25 dpt Cyl-Schritte bis alle Striche gleich scharf.<br>
            <strong>Entnebeln:</strong> Sph −0,25-weise; SE-Regel: je −0,25 Cyl → +0,125 Sph.
          </div>
          <div class="ref-phase-actions">
            ${!isV ? '<button class="ref-phase-btn" id="ref-btn-cylnebel">Zylindernebel</button>' : ''}
            <button class="ref-phase-btn ref-phase-btn-confirm" id="ref-znm-done">Abschluss →</button>
          </div>
        </div>
      </div>`;
    document.getElementById('ref-back-method')?.addEventListener('click', () => {
      refPhase = 'METHOD_SELECT'; refRenderPhasePanel();
    });
    if (!isV) {
      document.getElementById('ref-btn-cylnebel')?.addEventListener('click', () => {
        const rx    = refReadInputs();
        const extra = Math.abs(rx.C) / 2 + 0.5;
        refSetInputs(rx.S + extra, rx.C, rx.ax);
        refTestLens();
      });
    }
    document.getElementById('ref-znm-done')?.addEventListener('click', () => {
      refPhase = 'DONE'; refRenderPhasePanel();
    });

  // ── Phase: KZM / KZM-Variante ───────────────────────────────────────────────
  } else if (refPhase === 'KZM' || refPhase === 'KZM_V') {
    const isV = refPhase === 'KZM_V';
    panel.innerHTML = `
      <div class="rt-section ref-phase-section">
        <div class="rt-section-header">
          <span class="rt-section-title">${isV ? 'KZM-Variante' : 'KZM'} — Kreuzzylindermethode</span>
          <button class="rt-add-btn" id="ref-back-method">← Methode</button>
        </div>
        <div class="rt-section-body">
          <div class="ref-phase-hint">
            <strong>1. Achsabgleich (1. Art):</strong> KZM-Griffachse auf Cyl-Achse. "Stellung 1 oder 2 klarer?" → Achse in 5–10°-Schritten bis Gleichstand.<br>
            <strong>2. Stärkenabgleich (2. Art):</strong> KZM-Griffachse 45° zur Achse. "1 oder 2 klarer?" → Cyl anpassen. SE-Regel: −0,25 Cyl → +0,125 Sph.<br>
            ${isV ? '<strong>Variante:</strong> Grobanpassung JCC ±0,50 dpt, dann Feinabstimmung ±0,25 dpt.<br>' : ''}
            <strong>KRZ-Stufung:</strong> Vis ≥ 0,6 → JCC ±0,25 dpt; Vis &lt; 0,6 → JCC ±0,50 dpt.
          </div>
          <div class="ref-phase-actions">
            <button class="ref-phase-btn ref-phase-btn-confirm" id="ref-kzm-done">Abschluss →</button>
          </div>
        </div>
      </div>`;
    document.getElementById('ref-back-method')?.addEventListener('click', () => {
      refPhase = 'METHOD_SELECT'; refRenderPhasePanel();
    });
    document.getElementById('ref-kzm-done')?.addEventListener('click', () => {
      refPhase = 'DONE'; refRenderPhasePanel();
    });

  // ── Phase: Abschluss ────────────────────────────────────────────────────────
  } else if (refPhase === 'DONE') {
    panel.innerHTML = `
      <div class="rt-section ref-phase-section">
        <div class="rt-section-header">
          <span class="rt-section-title">Abschluss — Finale Prüfung</span>
        </div>
        <div class="rt-section-body">
          <div class="ref-phase-hint">
            <strong>Finale BSG-Probe:</strong> +0,25 dpt Sph vorhalten → "schlechter" → Korrektion gesichert ✓<br>
            Lösung anzeigen für Vergleich mit der wahren Korrektion.
          </div>
          <div class="ref-phase-actions">
            <button class="ref-phase-btn" id="ref-done-probe">+0,25 Probe</button>
            <button class="ref-phase-btn ref-phase-btn-confirm" id="ref-new-from-done">Neuer Fall 🎲</button>
          </div>
        </div>
      </div>`;
    document.getElementById('ref-done-probe')?.addEventListener('click', () => {
      const rx = refReadInputs(); refSetInputs(rx.S + 0.25, rx.C, rx.ax); refTestLens();
    });
    document.getElementById('ref-new-from-done')?.addEventListener('click', refStartCase);
  }
}

function refSetInputs(s, c, ax) {
  const sEl  = document.getElementById('ref-s');
  const cEl  = document.getElementById('ref-c');
  const axEl = document.getElementById('ref-ax');
  if (sEl)  sEl.value  = (Math.round(s * 4) / 4).toFixed(2);
  if (cEl)  cEl.value  = (Math.round(c * 4) / 4).toFixed(2);
  if (axEl) axEl.value = wrapAxis(ax).toString();   // korrekte Periode 180°
}

function refReadInputs() {
  return {
    S:  Math.round((parseFloat(document.getElementById('ref-s')?.value)  || 0) * 4) / 4,
    C:  Math.round((parseFloat(document.getElementById('ref-c')?.value)  || 0) * 4) / 4,
    ax: wrapAxis(parseFloat(document.getElementById('ref-ax')?.value) || 0),
  };
}

function refTestLens() {
  if (!refPatient) return;
  const rx = refReadInputs();
  const a  = refPatient.getFullAssessment(rx);
  refShowAssessment(rx, a);
}

function refShowAssessment(rx, a) {
  const sec = document.getElementById('ref-assessment');
  if (!sec) return;
  sec.style.display = '';

  const vaPercent = Math.min(100, a.va * 100).toFixed(0);
  const vaColor   = a.va >= 0.8 ? '#34d399' : a.va >= 0.4 ? '#fbbf24' : '#f87171';

  const badge = (result) => {
    const map = {
      'besser':     ['ref-resp-besser',     '↑ besser'],
      'gleich':     ['ref-resp-gleich',     '= gleich'],
      'schlechter': ['ref-resp-schlechter', '↓ schlechter'],
      '1':          ['ref-resp-1',          '① klarer'],
      '2':          ['ref-resp-2',          '② klarer'],
    };
    const [cls, txt] = map[result] || ['ref-resp-gleich', result];
    return `<span class="ref-assess-badge ${cls}">${txt}</span>`;
  };

  // Phasenabhängige Hervorhebung der relevanten Antworten
  const phaseHl = {
    BSG: new Set(['sphMinus','sphPlus']),
    ZNM: new Set(['cylMinus','axisLeft10','axisRight10']),
    ZNM_V: new Set(['cylMinus','axisLeft10','axisRight10']),
    KZM: new Set(['jccAxis','jccPower']),
    KZM_V: new Set(['jccAxis','jccPower']),
    DONE: new Set(['sphMinus','sphPlus']),
  };
  const hl = phaseHl[refPhase] || new Set();

  const row = (key, label) => {
    const extra = hl.has(key) ? ' ref-assess-row-hl' : '';
    return `<div class="ref-assess-row${extra}">
      <span class="ref-assess-label">${label}</span>${badge(a[key])}
    </div>`;
  };

  sec.innerHTML = `
    <div class="rt-section">
      <div class="rt-section-header">
        <span class="rt-section-title">Patientenantworten</span>
        <span style="font-family:monospace;color:${vaColor};font-weight:700;font-size:0.85rem">Vis ${fmtVA(a.va)}</span>
      </div>
      <div class="rt-section-body">
        <div class="ref-va-bar" style="margin-bottom:14px">
          <span class="ref-va-label">Visus:</span>
          <span class="ref-va-value" style="color:${vaColor}">${fmtVA(a.va)}</span>
          <div class="ref-va-track"><div class="ref-va-fill" style="width:${vaPercent}%;background:${vaColor}"></div></div>
        </div>
        <div class="ref-assess-group">
          <div class="ref-assess-title">Sphärischer Abgleich</div>
          ${row('sphMinus','−0,25 dpt Sph')}
          ${row('sphPlus', '+0,25 dpt Sph')}
        </div>
        <div class="ref-assess-group">
          <div class="ref-assess-title">Zylinderabgleich</div>
          ${row('cylMinus','−0,25 dpt Cyl')}
          ${row('cylPlus', '+0,25 dpt Cyl')}
        </div>
        <div class="ref-assess-group">
          <div class="ref-assess-title">Achsenabgleich (±10°)</div>
          ${row('axisLeft10', 'Achse −10°')}
          ${row('axisRight10','Achse +10°')}
        </div>
        <div class="ref-assess-group">
          <div class="ref-assess-title">KZM — Kreuzzylinder (1./2. Art)</div>
          ${row('jccAxis', 'Achse: Stellung 1 / 2')}
          ${row('jccPower','Stärke: Stellung 1 / 2')}
        </div>
      </div>
    </div>`;
}

function refReveal() {
  if (!refTrueRx) return;
  const rx     = refReadInputs();
  const va     = refPatient ? refPatient.getVA(rx) : 0;
  const bva    = refPatient ? refPatient.bestVA : 1;
  const t      = refTrueRx;
  const diff   = Math.abs(rx.S - t.S) + Math.abs(rx.C - t.C);
  const axRaw  = Math.abs(rx.ax - t.ax);
  const axDiff = Math.min(axRaw, 180 - axRaw);
  const quality = diff < 0.25 && axDiff <= 10 ? '✓ Ausgezeichnet'
                : diff < 0.75                  ? '~ Akzeptabel'
                : '✗ Verbesserungswürdig';

  const btn = document.getElementById('ref-reveal-btn');
  if (btn) {
    btn.innerHTML = `
      <div style="text-align:left">
        <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.07em;color:var(--accent);margin-bottom:3px">Wahre Korrektion</div>
        <div style="font-family:monospace;font-size:1rem;font-weight:700;color:var(--text-primary)">${fmtRx(t.S, t.C, t.ax)}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:3px">Ihr Ergebnis: ${fmtRx(rx.S, rx.C, rx.ax)}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">VA: ${fmtVA(va)} / best: ${fmtVA(bva)} — ${quality}</div>
      </div>`;
    btn.style.cssText = 'width:100%;border-color:rgba(56,189,248,0.35);text-align:left;padding:10px';
  }
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
  });
}
