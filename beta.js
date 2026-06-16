// ─── Beta-Module: zusätzliche Werkzeuge ──────────────────────────────────────
// Eigenständiges Mini-Framework: ein Raster von Tool-Karten; ein Klick öffnet das
// jeweilige Werkzeug in einem Host-Bereich. Neue Module einfach in BETA_TOOLS
// ergänzen ({ id, title, cat, desc, build(host) }).

let betaInitDone = false;

function initBeta() {
  const grid = document.getElementById('beta-grid');
  const tool = document.getElementById('beta-tool');
  if (!grid) return;
  if (!betaInitDone) {
    betaInitDone = true;
    grid.innerHTML = BETA_TOOLS.map(t => `
      <button class="beta-card" data-tool="${t.id}">
        <div class="beta-card-cat">${t.cat}</div>
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
      </button>`).join('');
    grid.querySelectorAll('.beta-card').forEach(btn => {
      btn.addEventListener('click', () => openBetaTool(btn.dataset.tool));
    });
  }
  // Zurück zur Übersicht, wenn der Tab erneut geöffnet wird
  grid.style.display = '';
  if (tool) { tool.style.display = 'none'; tool.innerHTML = ''; }
}

function openBetaTool(id) {
  const t = BETA_TOOLS.find(x => x.id === id);
  const grid = document.getElementById('beta-grid');
  const host = document.getElementById('beta-tool');
  if (!t || !host) return;
  grid.style.display = 'none';
  host.style.display = '';
  host.innerHTML = `
    <button class="beta-back" id="beta-back">← Übersicht</button>
    <div class="beta-tool-head"><span class="beta-card-cat">${t.cat}</span><h2>${t.title}</h2></div>
    <div id="beta-tool-body"></div>`;
  document.getElementById('beta-back').addEventListener('click', initBeta);
  try { t.build(document.getElementById('beta-tool-body')); }
  catch (e) { document.getElementById('beta-tool-body').innerHTML = `<p class="beta-text beta-muted">Fehler beim Laden: ${e.message}</p>`; }
}

// ── Hilfen ────────────────────────────────────────────────────────────────────
const _bnum = (id) => parseFloat(document.getElementById(id)?.value) || 0;
function _roundTo(v, step) { return step > 0 ? Math.round(v / step) * step : v; }
function _fmtDE(v, dec) { return v.toFixed(dec).replace('.', ','); }

// ─── Tool: Prismatische Nebenwirkung bei Dezentration ────────────────────────
function buildPNWTool(host) {
  host.innerHTML = `
    <div class="beta-layout">
      <div class="beta-controls">
        <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Glas</span></div>
          <div class="rt-section-body beta-form">
            <label>Sphäre (dpt)<input type="number" id="bpnw-sph" value="0" step="0.25"></label>
            <label>Zylinder (dpt)<input type="number" id="bpnw-cyl" value="0" step="0.25"></label>
            <label>Achse (°)<input type="number" id="bpnw-ax" value="0" step="1"></label>
            <label>Rezeptprisma (cm/m)<input type="number" id="bpnw-pr" value="0" step="0.25"></label>
            <label>Prismenbasis (° TABO)<input type="number" id="bpnw-pax" value="0" step="1"></label>
          </div>
        </div>
        <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Dezentration</span></div>
          <div class="rt-section-body beta-form">
            <label>x (mm)<input type="number" id="bpnw-dx" value="0" step="0.5"></label>
            <label>y (mm)<input type="number" id="bpnw-dy" value="0" step="0.5"></label>
            <label>Genauigkeit<select id="bpnw-prec"><option value="0.001">0,001</option><option value="0.125">0,125</option><option value="0.25">0,25</option></select></label>
          </div>
        </div>
        <div class="beta-results" id="bpnw-out"></div>
        <p class="beta-note">x &gt; 0 = optisches Zentrum nach rechts, y &gt; 0 = nach oben. Der Durchblickpunkt liegt im Ursprung. Px/Py nach Prentice (torisch über die Brechkraftmatrix) plus Rezeptprisma.</p>
      </div>
      <div class="beta-canvas-wrap"><canvas id="bpnw-canvas"></canvas></div>
    </div>`;

  const canvas = document.getElementById('bpnw-canvas');
  const recalc = () => {
    const sph = _bnum('bpnw-sph'), cyl = _bnum('bpnw-cyl'), ax = _bnum('bpnw-ax');
    const pr = _bnum('bpnw-pr'), pax = _bnum('bpnw-pax');
    const dx = _bnum('bpnw-dx'), dy = _bnum('bpnw-dy');
    const step = parseFloat(document.getElementById('bpnw-prec').value) || 0.001;

    const pnw   = calcPNW(sph, cyl, ax, dx, dy);          // {Px,Py}  (+x rechts, +y oben)
    const presc = prismFromPolar(pr, pax);
    const tot   = addPrisms(pnw, presc);
    const pol   = prismToPolar(tot);                       // mag, angle 0..360

    const Px = _roundTo(tot.Px, step), Py = _roundTo(tot.Py, step);
    const Pg = _roundTo(pol.mag, step), AP = pol.mag < 1e-6 ? 0 : pol.angle;

    document.getElementById('bpnw-out').innerHTML = `
      <div class="beta-res-row"><span>Pₓ</span><b>${_fmtDE(Px, 3)} cm/m</b></div>
      <div class="beta-res-row"><span>P_y</span><b>${_fmtDE(Py, 3)} cm/m</b></div>
      <div class="beta-res-row"><span>P_ges</span><b class="beta-green">${_fmtDE(Pg, 3)} cm/m</b></div>
      <div class="beta-res-row"><span>Basislage</span><b>${_fmtDE(((AP % 360) + 360) % 360, 1)}° TABO</b></div>`;

    drawPNW(canvas, dx, dy, tot, pol);
  };

  host.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalc));
  // Größe setzen & zeichnen
  const sizeAndDraw = () => {
    const wrap = canvas.parentElement;
    canvas.width  = Math.max(320, wrap.clientWidth - 2);
    canvas.height = 340;
    recalc();
  };
  sizeAndDraw();
  window.addEventListener('resize', sizeAndDraw);
}

function drawPNW(canvas, dx, dy, tot, pol) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);

  const mmMax = Math.max(12, Math.abs(dx), Math.abs(dy)) * 1.25;
  const sc = (Math.min(W, H) / 2 - 28) / mmMax;   // px pro mm

  // Gitter
  ctx.strokeStyle = 'rgba(148,163,184,0.10)'; ctx.lineWidth = 1;
  for (let mm = -Math.ceil(mmMax); mm <= mmMax; mm += 5) {
    const x = cx + mm * sc, y = cy - mm * sc;
    ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, H - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(W - 8, y); ctx.stroke();
  }
  // Achsen
  ctx.strokeStyle = 'rgba(148,163,184,0.45)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(W - 8, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 8); ctx.lineTo(cx, H - 8); ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
  ctx.fillText('x (mm)', W - 50, cy - 6);
  ctx.fillText('y (mm)', cx + 6, 16);

  // Durchblickpunkt (Ursprung)
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'left';
  ctx.fillText('Durchblickpunkt', cx + 7, cy + 14);

  // Optisches Zentrum (rotes Kreuz) bei (dx, dy)
  const ox = cx + dx * sc, oy = cy - dy * sc;
  ctx.strokeStyle = 'rgba(148,163,184,0.5)'; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ox, oy); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox - 7, oy - 7); ctx.lineTo(ox + 7, oy + 7); ctx.moveTo(ox + 7, oy - 7); ctx.lineTo(ox - 7, oy + 7); ctx.stroke();
  ctx.fillStyle = '#f87171'; ctx.fillText('OZ', ox + 9, oy - 9);

  // Prismenvektor (grün) vom Ursprung in Basisrichtung
  if (pol.mag > 1e-6) {
    const vmax = Math.min(W, H) / 2 - 30;
    const vlen = Math.min(vmax, pol.mag * sc * 4);       // Skalierung gut sichtbar
    const ex = cx + Math.cos(pol.angle * Math.PI/180) * vlen;
    const ey = cy - Math.sin(pol.angle * Math.PI/180) * vlen;
    ctx.strokeStyle = '#34d399'; ctx.fillStyle = '#34d399'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
    const a = Math.atan2(ey - cy, ex - cx);
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 10 * Math.cos(a - 0.4), ey - 10 * Math.sin(a - 0.4));
    ctx.lineTo(ex - 10 * Math.cos(a + 0.4), ey - 10 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${pol.mag.toFixed(2).replace('.', ',')} cm/m`, ex + 6, ey - 4);
  }
}

// ─── Tool: Addition schiefgekreuzter Zylinder ───────────────────────────────
// Methode: dioptrische Leistungsvektoren (M / J0 / J45). Ergebnis in Minus-Zyl.
function buildCrossCylTool(host) {
  const lensInputs = (p, l) => `
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">${l}</span></div>
      <div class="rt-section-body beta-form">
        <label>Sphäre (dpt)<input type="number" id="${p}-sph" value="0" step="0.25"></label>
        <label>Zylinder (dpt)<input type="number" id="${p}-cyl" value="0" step="0.25"></label>
        <label>Achse (°)<input type="number" id="${p}-ax" value="0" step="1"></label>
      </div></div>`;
  host.innerHTML = `
    <div class="beta-controls" style="width:100%;max-width:560px">
      ${lensInputs('bcc1', 'Glas 1')}
      ${lensInputs('bcc2', 'Glas 2')}
      <div class="beta-results" id="bcc-out"></div>
      <p class="beta-note">Addition zweier sphäro-zylindrischer Wirkungen über Leistungsvektoren (M, J₀, J₄₅). Ergebnis in Minus-Zylinder-Schreibweise, Achse 0–180°. Für reine Umrechnung +/− nur Glas 1 eingeben, Glas 2 auf 0 lassen.</p>
    </div>`;

  const recalc = () => {
    const toVec = (S, C, aDeg) => {
      const a = aDeg * Math.PI / 180;
      return { M: S + C/2, J0: -(C/2)*Math.cos(2*a), J45: -(C/2)*Math.sin(2*a) };
    };
    const v1 = toVec(_bnum('bcc1-sph'), _bnum('bcc1-cyl'), _bnum('bcc1-ax'));
    const v2 = toVec(_bnum('bcc2-sph'), _bnum('bcc2-cyl'), _bnum('bcc2-ax'));
    const M = v1.M + v2.M, J0 = v1.J0 + v2.J0, J45 = v1.J45 + v2.J45;
    const C = -2 * Math.sqrt(J0*J0 + J45*J45);             // Minus-Zylinder
    const S = M - C/2;
    let ax = 0.5 * Math.atan2(J45, J0) * 180/Math.PI;
    ax = ((ax % 180) + 180) % 180;                          // 0..180
    if (Math.abs(C) < 1e-9) ax = 0;
    // geschätzter Visus V/Vcc aus Restzylinder (0,50 dpt → Halbierung)
    const vRatio = 100 / Math.pow(2, 2 * Math.abs(C));

    document.getElementById('bcc-out').innerHTML = `
      <div class="beta-res-row"><span>Sphäre</span><b class="beta-green">${_fmtDE(S, 2)} dpt</b></div>
      <div class="beta-res-row"><span>Zylinder</span><b class="beta-green">${_fmtDE(C, 2)} dpt</b></div>
      <div class="beta-res-row"><span>Achse</span><b class="beta-green">${_fmtDE(ax, 1)}°</b></div>
      <div class="beta-res-row"><span>V/V_cc (Schätzung)</span><b>${_fmtDE(vRatio, 1)} %</b></div>`;
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  recalc();
}

// ─── Tool: Aniseikonierechner (Brillenglas-Vergrößerung) ─────────────────────
function buildAniseikonieTool(host) {
  host.innerHTML = `
    <div class="beta-controls" style="width:100%;max-width:560px">
      <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Brillenglas</span></div>
        <div class="rt-section-body beta-form">
          <label>Sphäre (dpt)<input type="number" id="bani-sph" value="0" step="0.25"></label>
          <label>Zylinder (dpt)<input type="number" id="bani-cyl" value="0" step="0.25"></label>
          <label>HSA (mm)<input type="number" id="bani-hsa" value="13.5" step="0.5"></label>
          <label>Vorderflächenbrechwert D₁ (dpt)<input type="number" id="bani-d1" value="6" step="0.25"></label>
          <label>Brechzahl n<input type="number" id="bani-n" value="1.5" step="0.01"></label>
          <label>Mittendicke d (mm)<input type="number" id="bani-d" value="2" step="0.1"></label>
          <label>neue HSA (mm)<input type="number" id="bani-hsan" value="13.5" step="0.5"></label>
        </div></div>
      <div class="beta-results" id="bani-out"></div>
      <p class="beta-note">Eigenvergrößerung Nₑ = 1/(1 − (d/n)·D₁) (Formfaktor). Gesamtvergrößerung je Hauptschnitt Nₘ = Nₑ · 1/(1 − e·Sᴴˢ) mit e = HSA. γ = Vergrößerung in % gegenüber 1. Scheitelbrechwert-Umrechnung auf neue HSA über S' = S/(1 + Δe·S).</p>
    </div>`;

  const recalc = () => {
    const S = _bnum('bani-sph'), C = _bnum('bani-cyl');
    const hsa = _bnum('bani-hsa')/1000, D1 = _bnum('bani-d1'), n = _bnum('bani-n') || 1.5;
    const d = _bnum('bani-d')/1000, hsan = _bnum('bani-hsan')/1000;
    const Ne = 1 / (1 - (d/n) * D1);                 // Formfaktor / Eigenvergrößerung
    const HS1 = S, HS2 = S + C;
    const Mp = (P) => 1 / (1 - hsa * P);             // Leistungsfaktor je Hauptschnitt
    const Ng1 = Ne * Mp(HS1), Ng2 = Ne * Mp(HS2);
    // Scheitelbrechwert-Umrechnung auf neue HSA (Δe in m, voll-Scheitelbrechwert-Form)
    const de = hsan - hsa;
    const conv = (P) => P / (1 + de * P);
    const Sn = conv(HS1), HS2n = conv(HS2), Cn = HS2n - Sn;

    document.getElementById('bani-out').innerHTML = `
      <div class="beta-res-row"><span>Eigenvergrößerung Nₑ</span><b>${_fmtDE(Ne, 4)}×</b></div>
      <div class="beta-res-row"><span>Gesamtvergr. HS1</span><b>${_fmtDE(Ng1, 4)}×</b></div>
      <div class="beta-res-row"><span>Gesamtvergr. HS2</span><b>${_fmtDE(Ng2, 4)}×</b></div>
      <div class="beta-res-row"><span>γ (HS1 / HS2)</span><b class="beta-green">${_fmtDE((Ng1-1)*100, 2)} % / ${_fmtDE((Ng2-1)*100, 2)} %</b></div>
      <div class="beta-res-row"><span>neue HSA</span><b>${_fmtDE(hsan*1000, 1)} mm</b></div>
      <div class="beta-res-row"><span>sph (neue HSA)</span><b>${_fmtDE(Sn, 2)} dpt</b></div>
      <div class="beta-res-row"><span>cyl (neue HSA)</span><b>${_fmtDE(Cn, 2)} dpt</b></div>`;
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  recalc();
}

// ─── 2D-Strahloptik: gemeinsame Helfer ──────────────────────────────────────
const _RAD = Math.PI / 180, _DEG = 180 / Math.PI;
function _ray(ctx, x1, y1, x2, y2, color, w = 2, dash = []) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
}
function _arrowHead(ctx, x, y, ang, color, L = 9) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x - L*Math.cos(ang - 0.4), y - L*Math.sin(ang - 0.4));
  ctx.lineTo(x - L*Math.cos(ang + 0.4), y - L*Math.sin(ang + 0.4));
  ctx.closePath(); ctx.fill();
}
function _refractV(d, n, eta) {           // d,n unit-Vektoren; eta = n_von/n_nach
  let cosi = -(d.x*n.x + d.y*n.y), nx = n.x, ny = n.y;
  if (cosi < 0) { cosi = -cosi; nx = -nx; ny = -ny; }
  const k = 1 - eta*eta*(1 - cosi*cosi);
  if (k < 0) return null;                 // Totalreflexion
  const c2 = Math.sqrt(k);
  return { x: eta*d.x + (eta*cosi - c2)*nx, y: eta*d.y + (eta*cosi - c2)*ny };
}
function _reflectV(d, n) { const dn = d.x*n.x + d.y*n.y; return { x: d.x - 2*dn*n.x, y: d.y - 2*dn*n.y }; }
function _segHit(px, py, dx, dy, ax, ay, bx, by) {  // Strahl (p,d) ∩ Strecke a-b
  const ex = bx - ax, ey = by - ay, den = dx*ey - dy*ex;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((ax - px)*ey - (ay - py)*ex) / den;
  const s = ((ax - px)*dy - (ay - py)*dx) / den;
  if (t > 1e-6 && s >= -1e-6 && s <= 1+1e-6) return { t, x: px + dx*t, y: py + dy*t };
  return null;
}
function _betaCanvas(host, controlsHTML, canvasId) {
  host.innerHTML = `<div class="beta-layout">
    <div class="beta-controls">${controlsHTML}</div>
    <div class="beta-canvas-wrap"><canvas id="${canvasId}"></canvas></div></div>`;
  return document.getElementById(canvasId);
}
function _bg(ctx, W, H) { ctx.clearRect(0,0,W,H); ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,W,H); }

// ─── Tool: Grenzfläche (Brechung & Reflexion an ebener Fläche) ───────────────
function buildInterfaceTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-body beta-form">
      <label>Einfallswinkel α (°)<input type="number" id="bif-a" value="40" min="0" max="89.9" step="1"></label>
      <label>Brechzahl n₁<input type="number" id="bif-n1" value="1.0" step="0.01"></label>
      <label>Brechzahl n₂<input type="number" id="bif-n2" value="1.5" step="0.01"></label>
    </div></div>
    <div class="beta-results" id="bif-out"></div>
    <p class="beta-note">α gemessen zur Flächennormalen. Rot = einfallend, Grün = gebrochen (Snellius), Orange = reflektiert. Bei n₁&gt;n₂ und α≥Grenzwinkel tritt Totalreflexion auf.</p>`, 'bif-canvas');

  const recalc = () => {
    const a = _bnum('bif-a'), n1 = _bnum('bif-n1') || 1, n2 = _bnum('bif-n2') || 1;
    const ar = a * _RAD;
    const sinB = n1 * Math.sin(ar) / n2;
    const tir = sinB > 1;
    const b = tir ? null : Math.asin(sinB);
    const crit = n1 > n2 ? Math.asin(n2/n1) * _DEG : null;
    const brew = Math.atan(n2/n1) * _DEG;
    const delta = tir ? null : (a - b*_DEG);   // Ablenkung einfallend↔gebrochen
    document.getElementById('bif-out').innerHTML = `
      <div class="beta-res-row"><span>Brechungswinkel β</span><b class="beta-green">${tir ? '— (Totalreflexion)' : _fmtDE(b*_DEG,2)+'°'}</b></div>
      <div class="beta-res-row"><span>Ablenkung δ = α − β</span><b class="beta-green">${tir ? '— (Totalreflexion)' : _fmtDE(delta,2)+'°'}</b></div>
      <div class="beta-res-row"><span>Grenzwinkel</span><b>${crit!=null ? _fmtDE(crit,2)+'°' : '– (n₁≤n₂)'}</b></div>
      <div class="beta-res-row"><span>Brewster-Winkel</span><b>${_fmtDE(brew,2)}°</b></div>`;
    drawIF(canvas, ar, b, tir);
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(320, w.clientWidth-2); canvas.height = 360; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawIF(canvas, ar, b, tir) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, cx = W/2, cy = H/2, L = Math.min(W,H)*0.42;
  _bg(ctx, W, H);
  // Medien
  ctx.fillStyle = 'rgba(56,189,248,0.05)'; ctx.fillRect(0,0,W,cy);
  ctx.fillStyle = 'rgba(56,189,248,0.12)'; ctx.fillRect(0,cy,W,H-cy);
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke();
  _ray(ctx, cx, 0, cx, H, 'rgba(148,163,184,0.5)', 1, [5,5]);  // Normale
  ctx.fillStyle = '#64748b'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
  ctx.fillText('n₁', 8, cy-8); ctx.fillText('n₂', 8, cy+16);
  // Einfallend (rot): von oben-links zur Mitte
  const ix = cx - L*Math.sin(ar), iy = cy - L*Math.cos(ar);
  _ray(ctx, ix, iy, cx, cy, '#f87171', 2.4); _arrowHead(ctx, (ix+cx)/2, (iy+cy)/2, Math.atan2(cy-iy, cx-ix), '#f87171');
  // Reflektiert (orange)
  const rx = cx + L*Math.sin(ar), ry = cy - L*Math.cos(ar);
  _ray(ctx, cx, cy, rx, ry, '#fb923c', tir?2.4:1.8); _arrowHead(ctx, rx, ry, Math.atan2(ry-cy, rx-cx), '#fb923c');
  // Gebrochen (grün)
  if (!tir) { const tx = cx + L*Math.sin(b), ty = cy + L*Math.cos(b);
    _ray(ctx, cx, cy, tx, ty, '#34d399', 2.4); _arrowHead(ctx, tx, ty, Math.atan2(ty-cy, tx-cx), '#34d399'); }
  ctx.fillStyle = '#e2e8f0'; ctx.font = '11px monospace';
  ctx.fillText('α='+_fmtDE(ar*_DEG,1)+'°', ix+6, iy+14);
  if (!tir) ctx.fillText('β='+_fmtDE(b*_DEG,1)+'°', cx+10, cy+L*0.5);
  else { ctx.fillStyle = '#fb923c'; ctx.fillText('Totalreflexion', cx+10, cy+24); }
}

// ─── Tool: Planparallele Platte ───────────────────────────────────────────────
function buildPlateTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-body beta-form">
      <label>Einfallswinkel α (°)<input type="number" id="bpp-a" value="45" min="0" max="89" step="1"></label>
      <label>Brechzahl n<input type="number" id="bpp-n" value="1.5" step="0.01"></label>
      <label>Dicke d (mm)<input type="number" id="bpp-d" value="10" step="1"></label>
    </div></div>
    <div class="beta-results" id="bpp-out"></div>
    <p class="beta-note">Planparallele Platte (außen Luft), ε₁ = Einfalls-, ε₂ = Brechungswinkel.<br>
      Parallelverschiebung e_P = d·sin(ε₁−ε₂)/cos ε₂<br>
      Längsverschiebung e_L = d·(1 − tan ε₂/tan ε₁)<br>
      Höhenverschiebung e_H = d·(tan ε₁ − tan ε₂)<br>
      Gestrichelt = unverschobener (gedachter) Strahl.</p>`, 'bpp-canvas');
  const recalc = () => {
    const a = _bnum('bpp-a'), n = _bnum('bpp-n')||1.5, d = _bnum('bpp-d');
    const ar = a*_RAD, br = Math.asin(Math.sin(ar)/n);
    const eP = d * Math.sin(ar - br) / Math.cos(br);
    const eL = ar < 1e-6 ? d * (1 - 1/n) : d * (1 - Math.tan(br)/Math.tan(ar));
    const eH = d * (Math.tan(ar) - Math.tan(br));
    document.getElementById('bpp-out').innerHTML = `
      <div class="beta-res-row"><span>Brechungswinkel ε₂</span><b>${_fmtDE(br*_DEG,2)}°</b></div>
      <div class="beta-res-row"><span>Parallelversatz e_P</span><b class="beta-green">${_fmtDE(eP,3)} mm</b></div>
      <div class="beta-res-row"><span>Längsverschiebung e_L</span><b>${_fmtDE(eL,3)} mm</b></div>
      <div class="beta-res-row"><span>Höhenverschiebung e_H</span><b>${_fmtDE(eH,3)} mm</b></div>`;
    drawPlate(canvas, ar, br, d);
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(320, w.clientWidth-2); canvas.height = 360; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawPlate(canvas, ar, br, dmm) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
  _bg(ctx, W, H);
  const dpx = Math.max(30, Math.min(160, dmm*8));
  const top = cy - dpx/2, bot = cy + dpx/2;
  ctx.fillStyle = 'rgba(56,189,248,0.12)'; ctx.fillRect(0, top, W, dpx);
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0,top); ctx.lineTo(W,top); ctx.moveTo(0,bot); ctx.lineTo(W,bot); ctx.stroke();
  // Eintrittspunkt P1
  const P1x = cx - 70, P1y = top;
  const Lin = 150;
  const inx = P1x - Lin*Math.sin(ar), iny = P1y - Lin*Math.cos(ar);
  _ray(ctx, inx, iny, P1x, P1y, '#f87171', 2.4);             // einfallend
  _ray(ctx, P1x, P1y, P1x, P1y, '#fff', 0);
  // Normalen
  _ray(ctx, P1x, top-26, P1x, top+26, 'rgba(148,163,184,0.5)',1,[4,4]);
  // Intern
  const P2x = P1x + dpx*Math.tan(br), P2y = bot;
  _ray(ctx, P1x, P1y, P2x, P2y, '#60a5fa', 2.2);             // im Glas
  _ray(ctx, P2x, bot-26, P2x, bot+26, 'rgba(148,163,184,0.5)',1,[4,4]);
  // Austritt (parallel zu einfallend)
  const Lout = 150, ex = P2x + Lout*Math.sin(ar), ey = P2y + Lout*Math.cos(ar);
  _ray(ctx, P2x, P2y, ex, ey, '#34d399', 2.4); _arrowHead(ctx, ex, ey, Math.atan2(ey-P2y, ex-P2x), '#34d399');
  // unverschobener (gedachter) Strahl (gestrichelt) – gleiche Länge wie Austritt
  const ux = P1x + (Lout+dpx)*Math.sin(ar), uy = P1y + (Lout+dpx)*Math.cos(ar);
  _ray(ctx, P1x, P1y, ux, uy, 'rgba(248,113,113,0.5)', 1.4, [6,5]);
  // e_H: vertikaler Versatz zwischen Austritt und gedachtem Strahl (am Austrittspunkt P2)
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(P2x, P2y); ctx.lineTo(P2x, uy0(P1x,P1y,ux,uy,P2x)); ctx.stroke();
  ctx.fillStyle = '#fbbf24'; ctx.font = '10px monospace'; ctx.textAlign='left';
  ctx.fillText('e_H', P2x+4, (P2y+uy0(P1x,P1y,ux,uy,P2x))/2);
  // d-Maß
  ctx.strokeStyle = 'rgba(226,232,240,0.6)'; ctx.beginPath(); ctx.moveTo(P1x-2, top); ctx.lineTo(P1x-2, bot); ctx.stroke();
  ctx.fillStyle = '#e2e8f0'; ctx.font = '11px monospace'; ctx.textAlign='left';
  ctx.fillText('d', P1x-16, cy+4);
  ctx.fillText('ε₁', inx+6, iny+14); ctx.fillText('ε₂', P1x+6, (top+bot)/2);
  ctx.fillText('n (Glas)', W-70, top-6);
}
// Hilfs: y des gedachten Strahls an x
function uy0(x1,y1,x2,y2,x){ return y1 + (y2-y1)*(x-x1)/((x2-x1)||1); }

// ─── Tool: Prisma (Brechung, Ablenkung) ──────────────────────────────────────
// Prisma-Geometrie aus Winkeln α (Apex A), β (Ecke B), Rotation γ → Canvas-Punkte
function _prismVerts(aDeg, bDeg, gDeg, W, H) {
  const A = aDeg*_RAD, B = bDeg*_RAD, C = Math.PI - A - B;
  if (C <= 0.01) return null;
  const BA = Math.sin(C)/Math.sin(A);
  let v = [ { x: BA*Math.cos(B), y: BA*Math.sin(B) }, { x: 0, y: 0 }, { x: 1, y: 0 } ]; // A,B,C (y up)
  const G = { x: (v[0].x+v[1].x+v[2].x)/3, y: (v[0].y+v[1].y+v[2].y)/3 };
  const g = gDeg*_RAD, cs = Math.cos(g), sn = Math.sin(g);
  v = v.map(p => { const dx = p.x-G.x, dy = p.y-G.y; return { x: G.x+dx*cs-dy*sn, y: G.y+dx*sn+dy*cs }; });
  const xs = v.map(p=>p.x), ys = v.map(p=>p.y);
  const sc = Math.min((W*0.34)/((Math.max(...xs)-Math.min(...xs))||1), (H*0.6)/((Math.max(...ys)-Math.min(...ys))||1));
  const cx = W*0.38, cy = H/2;
  return v.map(p => ({ x: cx + (p.x-G.x)*sc, y: cy - (p.y-G.y)*sc }));
}
function _faceOutN(v, i) {
  const a = v[i], b = v[(i+1)%3]; let nx = b.y-a.y, ny = -(b.x-a.x); const l = Math.hypot(nx,ny)||1; nx/=l; ny/=l;
  const G = { x:(v[0].x+v[1].x+v[2].x)/3, y:(v[0].y+v[1].y+v[2].y)/3 }, mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
  if ((mx-G.x)*nx + (my-G.y)*ny < 0) { nx=-nx; ny=-ny; }
  return { x: nx, y: ny };
}
function _nearestFace(v, P, d, excl) {
  let best = null;
  for (let i = 0; i < 3; i++) { if (i === excl) continue; const a = v[i], b = v[(i+1)%3];
    const h = _segHit(P.x,P.y,d.x,d.y,a.x,a.y,b.x,b.y); if (h && (!best || h.t < best.t)) best = { ...h, i }; }
  return best;
}
function _tracePrism(v, P, d, n) {
  const pts = [{ x:P.x, y:P.y }];
  let hit = _nearestFace(v, P, d, -1); if (!hit) return { pts, exit:null };
  pts.push({ x:hit.x, y:hit.y });
  let dir = _refractV(d, _faceOutN(v,hit.i), 1/n); if (!dir) return { pts, exit:null };
  let cur = { x:hit.x, y:hit.y }, last = hit.i, exit = null;
  for (let k = 0; k < 12; k++) {
    const h = _nearestFace(v, cur, dir, last);
    if (!h) { pts.push({ x:cur.x+dir.x*320, y:cur.y+dir.y*320 }); exit = dir; break; }
    pts.push({ x:h.x, y:h.y });
    const out = _refractV(dir, _faceOutN(v,h.i), n/1);
    if (out) { pts.push({ x:h.x+out.x*320, y:h.y+out.y*320 }); exit = out; break; }
    dir = _reflectV(dir, _faceOutN(v,h.i)); cur = { x:h.x, y:h.y }; last = h.i;
  }
  return { pts, exit };
}

function buildPrismTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Prisma</span></div>
      <div class="rt-section-body beta-form">
        <label>Prismenwinkel α (°)<input type="number" id="bpr-a" value="30" min="5" max="120" step="1"></label>
        <label>Prismenwinkel β (°)<input type="number" id="bpr-b" value="90" min="5" max="120" step="1"></label>
        <label>Rotation γ (°)<input type="number" id="bpr-g" value="0" step="5"></label>
        <label>Reflexion ρ<input type="number" id="bpr-rho" value="0" min="0" max="1" step="0.1"></label>
        <label style="grid-column:1/-1">Strahlhöhe<input type="range" id="bpr-h" value="0" min="-1" max="1" step="0.02"></label>
      </div>
      <div class="rt-section-body" style="padding-top:0">
        <div class="beta-modes">
          <label><input type="radio" name="bpr-mode" value="defl" checked> deflecting 30°</label>
          <label><input type="radio" name="bpr-mode" value="r90"> reflecting 90°</label>
          <label><input type="radio" name="bpr-mode" value="r180"> reflecting 180°</label>
        </div>
      </div>
    </div>
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Brechzahlen</span></div>
      <div class="rt-section-body beta-form beta-form-1">
        <label>n_F′ (blau, 486 nm)<input type="number" id="bpr-nf" value="1.55" step="0.001"></label>
        <label>n_e (grün, 546 nm)<input type="number" id="bpr-ne" value="1.50" step="0.001"></label>
        <label>n_C′ (rot, 644 nm)<input type="number" id="bpr-nc" value="1.45" step="0.001"></label>
      </div>
    </div>
    <div class="beta-results" id="bpr-out"></div>
    <p class="beta-note">Allgemeines Prisma mit Winkeln α, β. Modi setzen Winkel/Rotation als Vorlage (deflecting = Brechung, reflecting = Totalreflexion). ρ = Reflexionsgrad (zeigt Teilreflexion am Eintritt). δ = Gesamtablenkung; „δ vs. mittlere Dispersion" = Abweichung von blau/rot gegenüber grün (n_e).</p>`, 'bpr-canvas');

  const MODES = { defl: { a:30, b:90, g:0, h:0.35 }, r90: { a:45, b:90, g:0, h:0.4 }, r180: { a:45, b:90, g:135, h:0.15 } };
  host.querySelectorAll('input[name="bpr-mode"]').forEach(r => r.addEventListener('change', () => {
    const m = MODES[r.value]; if (!m) return;
    document.getElementById('bpr-a').value = m.a; document.getElementById('bpr-b').value = m.b;
    document.getElementById('bpr-g').value = m.g; document.getElementById('bpr-h').value = m.h;
    recalc();
  }));

  const recalc = () => {
    const a = _bnum('bpr-a'), b = _bnum('bpr-b'), g = _bnum('bpr-g'), rho = _bnum('bpr-rho');
    const h = parseFloat(document.getElementById('bpr-h').value) || 0;
    const nF = _bnum('bpr-nf')||1.55, ne = _bnum('bpr-ne')||1.5, nC = _bnum('bpr-nc')||1.45;
    const W = canvas.width, H = canvas.height;
    const verts = _prismVerts(a, b, g, W, H);
    if (!verts) { document.getElementById('bpr-out').innerHTML = '<div class="beta-res-row"><span>Ungültige Winkel (α+β ≥ 180°)</span><b></b></div>'; _bg(canvas.getContext('2d'),W,H); return; }
    const ys = verts.map(p=>p.y), beamY = (Math.min(...ys)+Math.max(...ys))/2 + h*(Math.max(...ys)-Math.min(...ys))/2*0.9;
    const start = { x: 8, y: beamY }, d0 = { x: 1, y: 0 };
    const devOf = (n) => { const tr = _tracePrism(verts, start, d0, n); if (!tr.exit) return { tr, d:null };
      const dot = Math.max(-1, Math.min(1, d0.x*tr.exit.x + d0.y*tr.exit.y)); return { tr, d: Math.acos(dot)*_DEG }; };
    const rF = devOf(nF), re = devOf(ne), rC = devOf(nC);
    const fmtδ = (x) => x==null ? '— (kein Austritt)' : _fmtDE(x,2)+'°';
    const disp = (rF.d!=null && rC.d!=null) ? rF.d - rC.d : null;
    const ve = (nF-nC)!==0 ? (ne-1)/(nF-nC) : Infinity;
    document.getElementById('bpr-out').innerHTML = `
      <div class="beta-res-row"><span>Ablenkung δ (n_e)</span><b class="beta-green">${fmtδ(re.d)}</b></div>
      <div class="beta-res-row"><span>δ blau / rot</span><b>${fmtδ(rF.d)} / ${fmtδ(rC.d)}</b></div>
      <div class="beta-res-row"><span>δ vs. mittl. (blau−n_e)</span><b>${(rF.d!=null&&re.d!=null)?_fmtDE(rF.d-re.d,3)+'°':'–'}</b></div>
      <div class="beta-res-row"><span>δ vs. mittl. (rot−n_e)</span><b>${(rC.d!=null&&re.d!=null)?_fmtDE(rC.d-re.d,3)+'°':'–'}</b></div>
      <div class="beta-res-row"><span>Dispersion (δ_F − δ_C)</span><b class="beta-green">${disp!=null?_fmtDE(disp,3)+'°':'–'}</b></div>
      <div class="beta-res-row"><span>Abbe-Zahl ν_e</span><b>${isFinite(ve)?_fmtDE(ve,2):'∞'}</b></div>`;
    drawPrism(canvas, verts, [{tr:rF.tr,c:'#3b82f6'},{tr:re.tr,c:'#22c55e'},{tr:rC.tr,c:'#ef4444'}], start, rho);
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(320, w.clientWidth-2); canvas.height = 380; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawPrism(canvas, v, traces, start, rho) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  _bg(ctx, W, H);
  ctx.fillStyle = 'rgba(56,189,248,0.12)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(v[0].x,v[0].y); ctx.lineTo(v[1].x,v[1].y); ctx.lineTo(v[2].x,v[2].y); ctx.closePath(); ctx.fill(); ctx.stroke();
  // einfallender Strahl (weiß) bis zum ersten Treffer
  const e = traces[1].tr.pts;
  if (e.length >= 2) { _ray(ctx, start.x, start.y, e[1].x, e[1].y, '#f8fafc', 2.2); _arrowHead(ctx, e[1].x, e[1].y, Math.atan2(e[1].y-start.y, e[1].x-start.x), '#f8fafc'); }
  // Teilreflexion am Eintritt (ρ)
  if (rho > 0 && e.length >= 2) {
    const nrm = _faceOutN(v, 0); // grobe Anzeige
    const d0 = { x: e[1].x-start.x, y: e[1].y-start.y }, dl = Math.hypot(d0.x,d0.y)||1;
    const rf = _reflectV({x:d0.x/dl,y:d0.y/dl}, _faceOutN(v, _nearestFace(v,start,{x:1,y:0},-1)?.i ?? 0));
    _ray(ctx, e[1].x, e[1].y, e[1].x+50*rf.x, e[1].y+50*rf.y, `rgba(251,191,36,${Math.min(0.9,rho)})`, 1.4, [4,3]);
  }
  // je Wellenlänge die Strahl-Polylinie ab Eintritt
  for (const { tr, c } of traces) {
    const p = tr.pts; if (p.length < 2) continue;
    ctx.strokeStyle = c; ctx.lineWidth = 2.0; ctx.beginPath(); ctx.moveTo(p[1].x, p[1].y);
    for (let i = 2; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.stroke();
  }
}

// Kreis-Schnitt: nächster Strahl-Treffer (t>eps)
function _circHit(px, py, dx, dy, ox, oy, R) {
  const fx = px - ox, fy = py - oy;
  const b = 2*(dx*fx + dy*fy), c = fx*fx + fy*fy - R*R, disc = b*b - 4*c;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  let t = (-b - s)/2; if (t < 1e-6) t = (-b + s)/2;
  if (t < 1e-6) return null;
  return { x: px + dx*t, y: py + dy*t, t };
}

// ─── Tool: Tropfen (Regenbogen-Strahlengang) ─────────────────────────────────
function buildDropTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-body beta-form">
      <label>Stoßparameter b (0–0,99)<input type="number" id="bdr-b" value="0.85" min="0" max="0.99" step="0.01"></label>
      <label>Brechzahl n<input type="number" id="bdr-n" value="1.333" step="0.001"></label>
      <label>Interne Reflexionen k<input type="number" id="bdr-k" value="1" min="1" max="2" step="1"></label>
    </div></div>
    <div class="beta-results" id="bdr-out"></div>
    <p class="beta-note">Lichtstrahl in einen kugelförmigen Tropfen (b = Auftreffhöhe / Radius). k=1 → Hauptregenbogen (~42° bei Wasser), k=2 → Nebenregenbogen (~51°). Rot = einfallend, Blau = intern, Grün = austretend.</p>`, 'bdr-canvas');
  const recalc = () => {
    const b = Math.min(0.99, Math.max(0, _bnum('bdr-b'))), n = _bnum('bdr-n')||1.333, k = Math.round(_bnum('bdr-k'))||1;
    const ti = Math.asin(b), tr = Math.asin(b/n);
    const D = (2*(ti - tr) + k*(Math.PI - 2*tr)) * _DEG;
    // Regenbogenwinkel = |180° − Minimum der Ablenkung| (über alle Stoßparameter)
    let Dmin = Infinity;
    for (let bb = 0.001; bb < 1; bb += 0.0005) {
      const dd = (2*(Math.asin(bb) - Math.asin(bb/n)) + k*(Math.PI - 2*Math.asin(bb/n))) * _DEG;
      if (dd < Dmin) Dmin = dd;
    }
    const rainbow = Math.abs(180 - Dmin);
    document.getElementById('bdr-out').innerHTML = `
      <div class="beta-res-row"><span>Einfallswinkel θ_i</span><b>${_fmtDE(ti*_DEG,2)}°</b></div>
      <div class="beta-res-row"><span>Brechungswinkel θ_r</span><b>${_fmtDE(tr*_DEG,2)}°</b></div>
      <div class="beta-res-row"><span>Gesamtablenkung D (bei b)</span><b>${_fmtDE(D,2)}°</b></div>
      <div class="beta-res-row"><span>Regenbogenwinkel (Min.)</span><b class="beta-green">${_fmtDE(rainbow,2)}°</b></div>`;
    drawDrop(canvas, b, n, k);
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(320, w.clientWidth-2); canvas.height = 360; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawDrop(canvas, b, n, k) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  _bg(ctx, W, H);
  const O = { x: W/2, y: H/2 }, R = Math.min(W,H)*0.36;
  ctx.fillStyle = 'rgba(56,189,248,0.12)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(O.x, O.y, R, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
  // einfallender Strahl horizontal, Höhe b*R über Mitte
  let P = { x: O.x - 2*R, y: O.y - b*R }, d = { x: 1, y: 0 };
  let hit = _circHit(P.x, P.y, d.x, d.y, O.x, O.y, R);
  if (!hit) return;
  _ray(ctx, P.x, P.y, hit.x, hit.y, '#f87171', 2.2);
  let nrm = { x: (hit.x-O.x)/R, y: (hit.y-O.y)/R };
  d = _refractV(d, nrm, 1/n); if (!d) return;
  P = hit;
  for (let i = 0; i < k; i++) {                 // k interne Reflexionen
    hit = _circHit(P.x, P.y, d.x, d.y, O.x, O.y, R); if (!hit) return;
    _ray(ctx, P.x, P.y, hit.x, hit.y, '#60a5fa', 2.0);
    nrm = { x: (hit.x-O.x)/R, y: (hit.y-O.y)/R };
    d = _reflectV(d, nrm); P = hit;
  }
  hit = _circHit(P.x, P.y, d.x, d.y, O.x, O.y, R); if (!hit) return;
  _ray(ctx, P.x, P.y, hit.x, hit.y, '#60a5fa', 2.0);
  nrm = { x: (hit.x-O.x)/R, y: (hit.y-O.y)/R };
  const out = _refractV(d, nrm, n/1);
  if (out) { const ex = hit.x + 2*R*out.x, ey = hit.y + 2*R*out.y;
    _ray(ctx, hit.x, hit.y, ex, ey, '#34d399', 2.4); _arrowHead(ctx, ex, ey, Math.atan2(out.y,out.x), '#34d399'); }
}

// ─── Tool: Lichtwellenleiter (Stufenindexfaser, TIR) ─────────────────────────
function buildFiberTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-body beta-form">
      <label>Einfallswinkel θ (° zur Achse)<input type="number" id="bfo-t" value="10" min="0" max="89" step="1"></label>
      <label>Kern n₁<input type="number" id="bfo-n1" value="1.50" step="0.01"></label>
      <label>Mantel n₂<input type="number" id="bfo-n2" value="1.48" step="0.01"></label>
    </div></div>
    <div class="beta-results" id="bfo-out"></div>
    <p class="beta-note">Stufenindexfaser. NA = √(n₁²−n₂²), Akzeptanzwinkel θ_max = arcsin(NA). Wird der Grenzwinkel der Totalreflexion am Mantel erreicht, wird das Licht geführt (Zickzack), sonst tritt es aus.</p>`, 'bfo-canvas');
  const recalc = () => {
    const t = _bnum('bfo-t'), n1 = _bnum('bfo-n1')||1.5, n2 = _bnum('bfo-n2')||1.48;
    const NA = Math.sqrt(Math.max(0, n1*n1 - n2*n2));
    const tmax = Math.asin(Math.min(1, NA)) * _DEG;
    const crit = Math.asin(Math.min(1, n2/n1)) * _DEG;
    const t1 = Math.asin(Math.sin(t*_RAD)/n1) * _DEG;       // Brechung am Stirnende
    const wall = 90 - t1;                                    // Einfallswinkel an Mantelwand
    const guided = wall >= crit - 1e-9;
    document.getElementById('bfo-out').innerHTML = `
      <div class="beta-res-row"><span>NA</span><b class="beta-green">${_fmtDE(NA,4)}</b></div>
      <div class="beta-res-row"><span>Akzeptanzwinkel θ_max</span><b>${_fmtDE(tmax,2)}°</b></div>
      <div class="beta-res-row"><span>Grenzwinkel (Kern/Mantel)</span><b>${_fmtDE(crit,2)}°</b></div>
      <div class="beta-res-row"><span>Wandeinfallswinkel</span><b>${_fmtDE(wall,2)}°</b></div>
      <div class="beta-res-row"><span>Status</span><b class="${guided?'beta-green':''}" style="${guided?'':'color:#fb923c'}">${guided?'geführt (TIR)':'tritt aus'}</b></div>`;
    drawFiber(canvas, t1*_RAD, guided);
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(320, w.clientWidth-2); canvas.height = 360; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawFiber(canvas, t1, guided) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  _bg(ctx, W, H);
  const Hh = Math.min(H*0.28, 90), top = H/2 - Hh, bot = H/2 + Hh, x0 = 60, x1 = W - 20;
  // Mantel/Kern
  ctx.fillStyle = 'rgba(129,140,248,0.10)'; ctx.fillRect(x0, top-22, x1-x0, 22); ctx.fillRect(x0, bot, x1-x0, 22);
  ctx.fillStyle = 'rgba(56,189,248,0.12)'; ctx.fillRect(x0, top, x1-x0, bot-top);
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x0,top); ctx.lineTo(x1,top); ctx.moveTo(x0,bot); ctx.lineTo(x1,bot); ctx.stroke();
  ctx.strokeStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(x0,top-22); ctx.lineTo(x0,bot+22); ctx.stroke(); // Stirnfläche
  ctx.fillStyle = '#64748b'; ctx.font = '11px monospace'; ctx.textAlign='left';
  ctx.fillText('Kern n₁', x0+6, H/2-Hh+14); ctx.fillText('Mantel n₂', x0+6, top-6);
  // einfallender Strahl auf Stirnfläche (Mitte)
  const P0 = { x: x0, y: H/2 };
  const inDir = { x: Math.cos(t1), y: Math.sin(t1) };
  const sIn = { x: P0.x - 120*Math.cos(t1*1.5), y: P0.y - 120*Math.sin(t1*1.5) };
  _ray(ctx, sIn.x, sIn.y, P0.x, P0.y, '#f87171', 2.2);
  // Zickzack im Kern
  let P = P0, d = { ...inDir };
  for (let i = 0; i < 40; i++) {
    // Treffer mit oberer/unterer Wand oder rechtem Ende
    const tTop = d.y < 0 ? (top - P.y)/d.y : Infinity;
    const tBot = d.y > 0 ? (bot - P.y)/d.y : Infinity;
    const tEnd = d.x > 0 ? (x1 - P.x)/d.x : Infinity;
    const tw = Math.min(tTop, tBot), tm = Math.min(tw, tEnd);
    const Q = { x: P.x + d.x*tm, y: P.y + d.y*tm };
    _ray(ctx, P.x, P.y, Q.x, Q.y, '#34d399', 2.2);
    if (tm === tEnd) { _arrowHead(ctx, Q.x, Q.y, Math.atan2(d.y,d.x), '#34d399'); break; }
    if (!guided) {  // tritt in den Mantel aus
      const out = { x: d.x, y: d.y };
      _ray(ctx, Q.x, Q.y, Q.x + 40*out.x, Q.y + 40*out.y, '#fb923c', 1.8, [5,4]);
      ctx.fillStyle = '#fb923c'; ctx.fillText('tritt aus', Q.x+6, Q.y+(d.y>0?16:-8)); break;
    }
    d = { x: d.x, y: -d.y };  // Totalreflexion an der Wand
    P = Q;
  }
}

// Power-Vektor-Helfer
function _toVec(S, C, aDeg) { const a = aDeg*_RAD; return { M: S + C/2, J0: -(C/2)*Math.cos(2*a), J45: -(C/2)*Math.sin(2*a) }; }
function _fromVec(M, J0, J45) {
  const C = -2*Math.sqrt(J0*J0 + J45*J45), S = M - C/2;
  let ax = 0.5*Math.atan2(J45, J0)*_DEG; ax = ((ax % 180) + 180) % 180; if (Math.abs(C) < 1e-9) ax = 0;
  return { S, C, ax };
}

// ─── Tool: Astigmatismus schiefer Bündel (Brillenglas) ───────────────────────
// ─── Coddington-Engine: schiefer Bündel durch Dickglas ───────────────────────
function _circHits(P, dir, C, R) {
  const fx = P.x-C.x, fy = P.y-C.y;
  const b = 2*(dir.x*fx + dir.y*fy), c = fx*fx + fy*fy - R*R, disc = b*b - 4*c;
  if (disc < 0) return [];
  const s = Math.sqrt(disc);
  return [(-b-s)/2, (-b+s)/2].filter(t => Math.abs(t) > 1e-6).map(t => ({ x:P.x+dir.x*t, y:P.y+dir.y*t, t }));
}
// r1,r2,d in mm; e = Rückscheitel→Augendrehpunkt (mm); aDeg Blickwinkel; s0mm Objektweite (mm, neg. od. Infinity)
function _coddLens(r1, r2, d, n, e, aDeg, s0mm) {
  const a = aDeg*_RAD;
  const Zp = { x: d+e, y: 0 }, C2 = { x: d+r2, y: 0 }, C1 = { x: r1, y: 0 };
  const u0 = { x: -Math.cos(a), y: Math.sin(a) };
  let H = _circHits(Zp, u0, C2, Math.abs(r2)); if (!H.length) return null;
  let P2 = H.reduce((b,h)=> Math.abs(h.x-d) < Math.abs(b.x-d) ? h : b);
  const N2 = { x:(P2.x-C2.x)/Math.abs(r2), y:(P2.y-C2.y)/Math.abs(r2) };
  const i2p = Math.acos(Math.min(1, Math.abs(u0.x*N2.x+u0.y*N2.y)));
  const dG = _refractV(u0, N2, 1/n); if (!dG) return null;
  const i2 = Math.acos(Math.min(1, Math.abs(dG.x*N2.x+dG.y*N2.y)));
  H = _circHits(P2, dG, C1, Math.abs(r1)); if (!H.length) return null;
  let P1 = H.reduce((b,h)=> Math.abs(h.x-0) < Math.abs(b.x-0) ? h : b);
  const N1 = { x:(P1.x-C1.x)/Math.abs(r1), y:(P1.y-C1.y)/Math.abs(r1) };
  const i1 = Math.acos(Math.min(1, Math.abs(dG.x*N1.x+dG.y*N1.y)));
  const i1p = Math.asin(Math.min(1, n*Math.sin(i1)));
  const d12 = Math.hypot(P2.x-P1.x, P2.y-P1.y);
  const L0 = (s0mm===Infinity || !isFinite(s0mm)) ? 0 : 1/s0mm;
  const K1 = (n*Math.cos(i1p) - Math.cos(i1)) / r1;
  const s1p = n / (L0 + K1), t1p = (n*Math.cos(i1p)**2) / (Math.cos(i1)**2*L0 + K1);
  const s2 = s1p - d12, t2 = t1p - d12;
  const K2 = (Math.cos(i2p) - n*Math.cos(i2)) / r2;
  const s2p = 1 / (n/s2 + K2), t2p = (Math.cos(i2p)**2) / (n*Math.cos(i2)**2/t2 + K2);
  const Ss = 1000/s2p, St = 1000/t2p;
  const D1 = (n-1)/r1*1000, D2 = (1-n)/r2*1000;
  const BVP = D1/(1-(d/1000/n)*D1) + D2;
  return { St, Ss, dS: St-Ss, mean:(St+Ss)/2, BVP, D1, D2, i1:i1*_DEG, i1p:i1p*_DEG, i2:i2*_DEG, i2p:i2p*_DEG };
}

function buildASBTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Glas</span></div>
      <div class="rt-section-body beta-form">
        <label>r₁ (mm)<input type="number" id="basb-r1" value="103" step="1"></label>
        <label>r₂ (mm)<input type="number" id="basb-r2" value="309" step="1"></label>
        <label>Mittendicke d (mm)<input type="number" id="basb-d" value="2" step="0.1"></label>
        <label>Ø (mm)<input type="number" id="basb-dia" value="60" step="1"></label>
        <label>Brechzahl n<select id="basb-n"><option>1.5</option><option>1.525</option><option>1.6</option><option>1.67</option><option>1.74</option><option>1.8</option></select></label>
        <label>HSA (mm)<input type="number" id="basb-hsa" value="15" step="0.5"></label>
        <label>Objekt s₀<select id="basb-s0"><option value="inf">∞</option><option value="-380">−38 cm</option></select></label>
        <label>Blickwinkel α (°)<input type="number" id="basb-a" value="20" min="0" max="45" step="1"></label>
      </div>
      <div class="rt-section-body" style="padding-top:0"><div class="beta-presets" id="basb-pre"></div></div>
    </div>
    <div class="beta-results" id="basb-out"></div>
    <p class="beta-note">Astigmatismus schiefer Bündel (Coddington-Dickglas). Der Augendrehpunkt liegt e = HSA + 13,5 mm hinter dem Rückscheitel. S′_t (tangential/meridional) und S′_s (sagittal) je Blickwinkel; ΔS′ = S′_t − S′_s. Grafik: beide Wirkungen über den Blickwinkel.</p>`, 'basb-canvas');

  const getN = () => parseFloat(document.getElementById('basb-n').value)||1.5;
  const setGlass = (r1,r2,d) => {
    document.getElementById('basb-r1').value = Math.round(r1);
    document.getElementById('basb-r2').value = Math.round(r2);
    if (d!=null) document.getElementById('basb-d').value = d;
    recalc();
  };
  // Glas aus Ziel-Scheitelbrechwert + Basiskurve D1
  const glassFor = (BVP, D1, n, dmm) => {
    const d=dmm/1000, D1eff=D1/(1-(d/n)*D1), D2=BVP-D1eff;
    return [ (n-1)/D1*1000, (1-n)/D2*1000 ];
  };
  // Best-Form-Basiskurven (Nulldurchgänge von ΔS' bei refAngle) für Ziel-BVP
  const bestForms = (BVP, n, dmm, e, ref) => {
    const f = D1 => { const g=glassFor(BVP,D1,n,dmm); const R=_coddLens(g[0],g[1],dmm,n,e,ref,Infinity); return R?R.dS:null; };
    const roots=[]; let prev=f(0.5), pb=0.5;
    for (let b=0.7; b<=14; b+=0.2){ const v=f(b); if(v!=null&&prev!=null&&v*prev<0) roots.push(pb + 0.2*Math.abs(prev)/(Math.abs(prev)+Math.abs(v))); if(v!=null){prev=v;pb=b;} }
    return roots;
  };
  const PRESETS = [
    { k:'+5 asti.frei',  f:n=>{const r=bestForms(5,n,2,_bnum('basb-hsa')+13.5,30); return [...glassFor(5, r[0]||6, n,2),2];} },
    { k:'+5 refr.korr',  f:n=>{const r=bestForms(5,n,2,_bnum('basb-hsa')+13.5,30); return [...glassFor(5, r[1]||r[0]||9, n,2),2];} },
    { k:'+5 extra dünn', f:n=>[...glassFor(5,1.5,n,1.4),1.4] },
    { k:'−5 asti.frei',  f:n=>{const r=bestForms(-5,n,2,_bnum('basb-hsa')+13.5,30); return [...glassFor(-5, r[0]||3, n,2),2];} },
    { k:'−3 Ostwald',    f:n=>{const r=bestForms(-3,n,2,_bnum('basb-hsa')+13.5,30); return [...glassFor(-3, r[r.length-1]||8, n,2),2];} },
    { k:'−3 Wollaston',  f:n=>{const r=bestForms(-3,n,2,_bnum('basb-hsa')+13.5,30); return [...glassFor(-3, r[0]||4, n,2),2];} },
    { k:'VF 6 dpt',  f:n=>[(n-1)/6*1000, _bnum('basb-r2'), null] },
    { k:'VF 10 dpt', f:n=>[(n-1)/10*1000, _bnum('basb-r2'), null] },
    { k:'Bikonkav',  f:()=>[-100,100,2] }, { k:'Bikonvex', f:()=>[100,-100,4] },
    { k:'Plankonvex',f:()=>[100,1e6,3] },  { k:'Plankonkav',f:()=>[1e6,100,2] },
  ];
  const preWrap = document.getElementById('basb-pre');
  preWrap.innerHTML = PRESETS.map((p,i)=>`<button class="beta-preset" data-i="${i}">${p.k}</button>`).join('');
  preWrap.querySelectorAll('.beta-preset').forEach(b=>b.addEventListener('click',()=>{ const v=PRESETS[+b.dataset.i].f(getN()); setGlass(v[0],v[1],v[2]); }));

  const recalc = () => {
    const r1 = _bnum('basb-r1')||1e6, r2 = _bnum('basb-r2')||1e6, d = _bnum('basb-d'), dia = _bnum('basb-dia');
    const n = getN(), hsa = _bnum('basb-hsa'), e = hsa + 13.5, a = _bnum('basb-a');
    const s0v = document.getElementById('basb-s0').value, s0 = s0v==='inf'?Infinity:parseFloat(s0v);
    const R = _coddLens(r1, r2, d, n, e, a, s0);
    if (!R) { document.getElementById('basb-out').innerHTML = '<div class="beta-res-row"><span>Strahl trifft Glas nicht – Geometrie prüfen</span><b></b></div>'; return; }
    const dM = d/1000;
    const S_F = R.D2/(1-(dM/n)*R.D2) + R.D1;            // Vorderscheitelbrechwert
    const y = dia/2, sag = r => isFinite(r)&&r!==0 ? (y*y/(2*r)) : 0;
    const dEdge = d - sag(r1) + sag(r2);                // Randdicke (Näherung)
    const Ne = 1/(1-(dM/n)*R.D1);                        // Eigenvergrößerung (Formfaktor)
    const volMM3 = Math.PI*y*y*(d + Math.max(0.2,dEdge))/2;
    const mGlas = volMM3 * 2.54/1000;                    // g (Dichte Kron ~2,54 g/cm³)
    document.getElementById('basb-out').innerHTML = `
      <div class="beta-res-row"><span>Scheitelbrechwert S′_F′</span><b>${_fmtDE(R.BVP,3)} dpt</b></div>
      <div class="beta-res-row"><span>Vorderscheitel S_F</span><b>${_fmtDE(S_F,3)} dpt</b></div>
      <div class="beta-res-row"><span>D₁ / D₂</span><b>${_fmtDE(R.D1,2)} / ${_fmtDE(R.D2,2)} dpt</b></div>
      <div class="beta-res-row"><span>tangential / sagittal (α)</span><b>${_fmtDE(R.St,3)} / ${_fmtDE(R.Ss,3)} dpt</b></div>
      <div class="beta-res-row"><span>Astigmatismus ΔS′ (α)</span><b class="beta-green">${_fmtDE(R.dS,3)} dpt</b></div>
      <div class="beta-res-row"><span>ΔS′_t / ΔS′_s vs. Soll</span><b>${_fmtDE(R.St-R.BVP,3)} / ${_fmtDE(R.Ss-R.BVP,3)} dpt</b></div>
      <div class="beta-res-row"><span>Randdicke d_R / Ø</span><b>${_fmtDE(dEdge,2)} / ${_fmtDE(dia,0)} mm</b></div>
      <div class="beta-res-row"><span>Eigenvergr. N_e / Gewicht</span><b>${_fmtDE(Ne,3)} / ${_fmtDE(mGlas,0)} g</b></div>`;
    drawASBScene(canvas, { r1, r2, d, n, e, s0, a, dia });
  };
  host.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(340, w.clientWidth-2); canvas.height = 420; recalc(); };
  size(); window.addEventListener('resize', size);
}
// Szene: Symbolauge + Brillenglas + Hauptstrahlen durch Z' (links) und ΔS'-Kurven (rechts)
function drawASBScene(canvas, p) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  _bg(ctx, W, H);
  // ── ΔS'-Kurven rechts (view angle vertikal, ΔS' horizontal) ──────────────
  const aMax = p.signed ? 45 : 60, aMin = p.signed ? -aMax : 0, x0 = Math.round(W*0.70);
  const yTop = 24, yBot = H-26;
  const Yang = a => yBot - (yBot-yTop)*((a-aMin)/(aMax-aMin));
  const data = [];
  let dmax = 0.2;
  for (let a=aMin; a<=aMax; a+=2) { const eff=Math.abs(a+(p.fsw||0)); const R=_coddLens(p.r1,p.r2,p.d,p.n,p.e,eff,p.s0); if(!R)continue;
    const dT=R.St-R.BVP, dS=R.Ss-R.BVP, dA=R.mean-R.BVP;
    const prism = ((p.e*Math.tan(a*_RAD) + (p.y||0))/10) * R.BVP;   // Prentice-Prisma [cm/m] am Durchblickpunkt
    data.push([a,dT,dS,dA,prism]);
    dmax=Math.max(dmax,Math.abs(dT),Math.abs(dS)); }
  const rightHalf = (W-14)-x0, leftHalf = x0-(W*0.46);
  const sx = Math.min(rightHalf, leftHalf)/(dmax*1.1);
  const Xv = v => x0 + v*sx;
  // Raster + Achsen
  ctx.strokeStyle='rgba(148,163,184,0.18)'; ctx.lineWidth=1;
  for (let a=aMin;a<=aMax;a+=(p.signed?20:10)){ const yy=Yang(a); ctx.beginPath(); ctx.moveTo(W*0.46,yy); ctx.lineTo(W-14,yy); ctx.stroke();
    ctx.fillStyle='#64748b'; ctx.font='9px monospace'; ctx.textAlign='right'; ctx.fillText(a+'°', W-14, yy-2); }
  ctx.strokeStyle='rgba(148,163,184,0.5)'; ctx.beginPath(); ctx.moveTo(x0,yTop); ctx.lineTo(x0,yBot); ctx.stroke();
  ctx.fillStyle='#64748b'; ctx.font='9px monospace'; ctx.textAlign='center'; ctx.fillText('ΔS′ [dpt]', x0, H-8);
  const curve=(idx,color)=>{ ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath();
    data.forEach((d,i)=>{const X=Xv(d[idx]),Y=Yang(d[0]); i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}); ctx.stroke(); };
  curve(2,'#34d399'); curve(1,'#f87171'); curve(3,'#eab308'); curve(4,'#3b82f6');   // sagittal, tangential, average, prism
  ctx.strokeStyle='rgba(226,232,240,0.5)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(W*0.46,Yang(p.a)); ctx.lineTo(W-14,Yang(p.a)); ctx.stroke(); ctx.setLineDash([]);
  ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillStyle='#34d399'; ctx.fillText('sagittal', x0+6, yTop+2);
  ctx.fillStyle='#f87171'; ctx.fillText('tangential', x0+6, yTop+13);
  ctx.fillStyle='#eab308'; ctx.fillText('average', x0+6, yTop+24);
  ctx.fillStyle='#3b82f6'; ctx.fillText('prism (cm/m)', x0+6, yTop+35);

  // ── Symbolauge + Brillenglas + Hauptstrahlen (links) ─────────────────────
  const Ez = { x: W*0.26, y: H*0.5 }, eyeR = Math.min(H*0.12, 46);
  // optische Achse (kürzer: nur bis kurz hinter das Auge)
  _ray(ctx, 6, Ez.y, Ez.x + eyeR + 12, Ez.y, 'rgba(148,163,184,0.35)', 1, [7,5]);
  // Auge
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(Ez.x, Ez.y, eyeR, 0, 2*Math.PI); ctx.stroke();
  ctx.fillStyle='#64748b'; ctx.font='10px monospace'; ctx.textAlign='center'; ctx.fillText("Z′", Ez.x, Ez.y+3);
  // Brillenglas (Meniskus) links vom Auge
  const Lx = Ez.x - eyeR - 46, hh = Math.min(H*0.30, p.dia*1.6);
  const bulge = r => Math.max(-26, Math.min(26, 1200/ (r||1e6)));
  ctx.strokeStyle='#38bdf8'; ctx.lineWidth=1.8; ctx.fillStyle='rgba(56,189,248,0.10)';
  ctx.beginPath();
  ctx.moveTo(Lx - bulge(p.r1), Ez.y-hh);
  ctx.quadraticCurveTo(Lx - bulge(p.r1)*1.0 - (p.r1>0?6:-6), Ez.y, Lx - bulge(p.r1), Ez.y+hh);
  ctx.lineTo(Lx + p.d*1.2 - bulge(p.r2), Ez.y+hh);
  ctx.quadraticCurveTo(Lx + p.d*1.2 - bulge(p.r2) - (p.r2>0?6:-6), Ez.y, Lx + p.d*1.2 - bulge(p.r2), Ez.y-hh);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Hauptstrahlen durch Z' bei mehreren Blickwinkeln
  ctx.font='9px monospace'; ctx.textAlign='left';
  for (const ang of [10,20,30,40,50,60]) {
    const ar = ang*_RAD, t = tan_(ar);
    // Startpunkt links, aber so begrenzt, dass der Strahl oben im Bild bleibt
    const xL = Math.max(Lx - 30, Ez.x - (Ez.y - (yTop+6))/Math.max(t, 1e-3));
    const yL = Ez.y - t*(Ez.x - xL);                 // oberhalb der optischen Achse
    ctx.strokeStyle = ang===Math.round(p.a) ? '#f8fafc' : 'rgba(148,163,184,0.5)';
    ctx.lineWidth = ang===Math.round(p.a) ? 1.8 : 1;
    ctx.beginPath(); ctx.moveTo(xL, yL); ctx.lineTo(Ez.x, Ez.y); ctx.stroke();
    ctx.fillStyle = '#64748b'; ctx.fillText(ang+'°', xL+2, yL+(t>0?-2:10));
  }
}
function tan_(x){ return Math.tan(x); }
// Geteilte Glas-Helfer (auch für Presets in mehreren Tools)
function _glassFor(BVP, D1, n, dmm) { const d=dmm/1000, D1eff=D1/(1-(d/n)*D1), D2=BVP-D1eff; return [(n-1)/D1*1000, (1-n)/D2*1000]; }
function _bestForms(BVP, n, dmm, e, ref) {
  const f = D1 => { const g=_glassFor(BVP,D1,n,dmm); const R=_coddLens(g[0],g[1],dmm,n,e,ref,Infinity); return R?R.dS:null; };
  const roots=[]; let prev=f(0.5), pb=0.5;
  for (let b=0.7;b<=14;b+=0.2){ const v=f(b); if(v!=null&&prev!=null&&v*prev<0) roots.push(pb+0.2*Math.abs(prev)/(Math.abs(prev)+Math.abs(v))); if(v!=null){prev=v;pb=b;} }
  return roots;
}
// gemeinsame Spezial-Glastypen (gibt [r1,r2,d|null] zurück)
function _glassTypePresets(n, dmm, e, r2cur) {
  return {
    '6 dpt Vorderfl.':[(n-1)/6*1000, r2cur, null], '10 dpt Vorderfl.':[(n-1)/10*1000, r2cur, null],
    'Bikonkav':[-100,100,2], 'Bikonvex':[100,-100,4], 'Plankonvex':[100,1e6,3], 'Plankonkav':[1e6,100,2],
    'Nullmeniskus':[100,100,2], 'Afokal 6,6%':[100,100,2],
    'S′F=+5 asti.frei': [..._glassFor(5,(_bestForms(5,n,2,e,30)[0]||9),n,2),2],
    'S′F=+5 refr.korr': [..._glassFor(5,(_bestForms(5,n,2,e,30)[1]||_bestForms(5,n,2,e,30)[0]||10),n,2),2],
    'S′F=+5 extra dünn':[..._glassFor(5,1.5,n,1.4),1.4],
  };
}

// ─── Tool: Astigmatismus bei Sportverglasung ─────────────────────────────────
function buildASBSportTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Glas</span></div>
      <div class="rt-section-body beta-form">
        <label>r₁ (mm)<input type="number" id="bsv-r1" value="440" step="1"></label>
        <label>r₂ (mm)<input type="number" id="bsv-r2" value="-440" step="1"></label>
        <label>Mittendicke d (mm)<input type="number" id="bsv-d" value="5" step="0.1"></label>
        <label>Ø (mm)<input type="number" id="bsv-dia" value="60" step="1"></label>
        <label>Brechzahl n<select id="bsv-n"><option>1.5</option><option>1.525</option><option>1.67</option><option>1.74</option><option>1.8</option></select></label>
        <label>HSA (mm)<input type="number" id="bsv-hsa" value="15" step="0.5"></label>
        <label>Objekt s₀<select id="bsv-s0"><option value="inf">∞</option><option value="-380">−38 cm</option></select></label>
        <label>Dezentration y (mm)<input type="number" id="bsv-y" value="0" step="0.5"></label>
        <label>Scheibenwinkel FSW (°)<input type="number" id="bsv-fsw" value="0" min="-40" max="40" step="1"></label>
      </div>
      <div class="rt-section-body" style="padding-top:0"><div class="beta-presets" id="bsv-pre"></div></div>
    </div>
    <div class="beta-results" id="bsv-out"></div>
    <p class="beta-note">Sportverglasung (Coddington-Dickglas). FSW = Scheibenwinkel (Glasneigung) → asymmetrische schiefe Bündel; y = Dezentration → Prisma (Prentice). ΔS′_t/_s je Blickwinkel relativ zum Soll-Scheitelbrechwert. Grafik: Symbolauge mit Z′, Brillenglas, Hauptstrahlen und ΔS′-Kurven über den Blickwinkel.</p>`, 'bsv-canvas');

  const getN=()=>parseFloat(document.getElementById('bsv-n').value)||1.5;
  const pre=document.getElementById('bsv-pre');
  const keys=Object.keys(_glassTypePresets(1.5,2,28.5,309));
  pre.innerHTML=keys.map(k=>`<button class="beta-preset" data-k="${k}">${k}</button>`).join('');
  pre.querySelectorAll('.beta-preset').forEach(b=>b.addEventListener('click',()=>{
    const P=_glassTypePresets(getN(), _bnum('bsv-d'), _bnum('bsv-hsa')+13.5, _bnum('bsv-r2'));
    const v=P[b.dataset.k]; document.getElementById('bsv-r1').value=Math.round(v[0]); document.getElementById('bsv-r2').value=Math.round(v[1]); if(v[2]!=null)document.getElementById('bsv-d').value=v[2]; recalc();
  }));

  const recalc = () => {
    const r1=_bnum('bsv-r1')||1e6, r2=_bnum('bsv-r2')||1e6, d=_bnum('bsv-d'), dia=_bnum('bsv-dia');
    const n=getN(), e=_bnum('bsv-hsa')+13.5, fsw=_bnum('bsv-fsw'), y=_bnum('bsv-y');
    const s0v=document.getElementById('bsv-s0').value, s0=s0v==='inf'?Infinity:parseFloat(s0v);
    const R=_coddLens(r1,r2,d,n,e,Math.abs(fsw),s0);
    if(!R){document.getElementById('bsv-out').innerHTML='<div class="beta-res-row"><span>Geometrie prüfen</span><b></b></div>';return;}
    const dM=d/1000, BVP=R.BVP, Dg=R.D1+R.D2-(dM/n)*R.D1*R.D2, fp=1/Dg;
    const S_F=R.D2/(1-(dM/n)*R.D2)+R.D1;
    const h=fp*(dM/n)*R.D2*1000, hp=-fp*(dM/n)*R.D1*1000;
    const yh=dia/2, sag=r=>isFinite(r)&&r!==0?(yh*yh/(2*r)):0, dEdge=d-sag(r1)+sag(r2);
    const Ne=1/(1-(dM/n)*R.D1);
    const at=ang=>{ const Rr=_coddLens(r1,r2,d,n,e,Math.abs(ang+fsw),s0); return Rr?[Rr.St-Rr.BVP,Rr.Ss-Rr.BVP]:[0,0]; };
    const a0=at(0), am=at(-30), ap=at(30);
    const row=(l,r,cls='')=>`<div class="beta-res-row"><span>${l}</span><b class="${cls}">${r}</b></div>`;
    document.getElementById('bsv-out').innerHTML =
      row('D₁ / D₂', `${_fmtDE(R.D1,2)} / ${_fmtDE(R.D2,2)} dpt`) +
      row('D_g (Gesamtbrechwert)', `${_fmtDE(Dg,2)} dpt`) +
      row('S′_F′ / S_F (Vorderscheitel)', `${_fmtDE(BVP,2)} / ${_fmtDE(S_F,2)} dpt`) +
      row('h / h′ (Hauptebenen)', `${_fmtDE(h,2)} / ${_fmtDE(hp,2)} mm`) +
      row('Ø_eff / Randdicke', `${_fmtDE(dia,1)} / ${_fmtDE(dEdge,2)} mm`) +
      row('Eigenvergr. N_e', `${_fmtDE(Ne,3)}`) +
      row('pr (0°)', `${_fmtDE(Math.abs(y)/10*BVP,2)} cm/m`) +
      row('ΔS′_t / ΔS′_s (0°)', `${_fmtDE(a0[0],3)} / ${_fmtDE(a0[1],3)} dpt`) +
      row('ΔS′_t / ΔS′_s (−30°)', `${_fmtDE(am[0],3)} / ${_fmtDE(am[1],3)} dpt`, 'beta-green') +
      row('ΔS′_t / ΔS′_s (+30°)', `${_fmtDE(ap[0],3)} / ${_fmtDE(ap[1],3)} dpt`, 'beta-green');
    drawASBScene(canvas, { r1, r2, d, n, e, s0, a: 0, dia, signed: true, fsw });
  };
  host.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(340, w.clientWidth-2); canvas.height = 420; recalc(); };
  size(); window.addEventListener('resize', size);
}

// ─── Tool: Glasberechnung bei Sportverglasung (Dickglas) ─────────────────────
function buildCurvedGlassTool(host) {
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-body beta-form">
      <label>Ziel-Scheitelbrechwert S′ (dpt)<input type="number" id="bcg-sv" value="-4" step="0.25"></label>
      <label>Basiskurve D₁ (dpt)<input type="number" id="bcg-d1" value="8" step="0.25"></label>
      <label>Brechzahl n<input type="number" id="bcg-n" value="1.5" step="0.01"></label>
      <label>Mittendicke d (mm)<input type="number" id="bcg-d" value="2" step="0.1"></label>
      <label>HSA (mm)<input type="number" id="bcg-hsa" value="15" step="0.5"></label>
      <label>Scheibenwinkel FSW (°)<input type="number" id="bcg-fsw" value="15" min="0" max="40" step="1"></label>
    </div></div>
    <div class="beta-results" id="bcg-out"></div>
    <p class="beta-note">Wrap-Glas-Auslegung: aus Ziel-Scheitelbrechwert S′ und Basiskurve D₁ folgt die Rückfläche D₂ (Dickglas: S′ = D₁/(1−(d/n)D₁) + D₂). Für den Scheibenwinkel FSW wird der schiefe-Bündel-Astigmatismus ΔS′ (Coddington) berechnet. Grafik: ΔS′ über die Basiskurve – Nulldurchgang = Best-Form-Basiskurve.</p>`, 'bcg-canvas');

  const calc = (Sv, D1, n, dmm, e, fswDeg) => {
    const d = dmm/1000;
    const D1eff = D1/(1 - (d/n)*D1), D2 = Sv - D1eff;
    const r1 = D1!==0 ? (n-1)/D1*1000 : 1e6, r2 = D2!==0 ? (1-n)/D2*1000 : 1e6;
    const R = _coddLens(r1, r2, dmm, n, e, fswDeg, Infinity);
    return { D1eff, D2, r1, r2, dS: R ? R.dS : null };
  };
  const recalc = () => {
    const Sv=_bnum('bcg-sv'), D1=_bnum('bcg-d1'), n=_bnum('bcg-n')||1.5, dmm=_bnum('bcg-d'), e=_bnum('bcg-hsa')+13.5, fsw=_bnum('bcg-fsw');
    const c = calc(Sv, D1, n, dmm, e, fsw);
    // Best-Form: Basiskurve mit ΔS′≈0 suchen
    let best=null, bestAbs=Infinity;
    for (let b=0.5; b<=16; b+=0.1){ const cc=calc(Sv,b,n,dmm,e,fsw); if(cc.dS!=null && Math.abs(cc.dS)<bestAbs){bestAbs=Math.abs(cc.dS);best=b;} }
    const row=(l,r)=>`<div class="beta-res-row"><span>${l}</span><b>${r}</b></div>`;
    document.getElementById('bcg-out').innerHTML =
      row('Vorderfläche D₁', _fmtDE(D1,2)+' dpt') +
      row('Rückfläche D₂', `<span class="beta-green">${_fmtDE(c.D2,2)} dpt</span>`) +
      row('Radius r₁ / r₂', `${_fmtDE(c.r1,1)} / ${_fmtDE(c.r2,1)} mm`) +
      row('Kontrolle S′', _fmtDE(c.D1eff + c.D2,3)+' dpt') +
      row('ΔS′ bei FSW '+_fmtDE(fsw,0)+'°', `${c.dS!=null?_fmtDE(c.dS,3)+' dpt':'–'}`) +
      row('Best-Form Basiskurve', `<span class="beta-green">${best!=null?_fmtDE(best,2)+' dpt':'–'}</span>`);
    drawCurvedGlass(canvas, { Sv, n, dmm, e, fsw, D1, best }, calc);
  };
  host.querySelectorAll('input').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(320, w.clientWidth-2); canvas.height = 320; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawCurvedGlass(canvas, p, calc) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, m = { l:46, r:12, t:14, b:28 };
  _bg(ctx, W, H);
  const D1max = 16, pts = []; let lo=Infinity, hi=-Infinity;
  for (let b=0.5; b<=D1max; b+=0.25){ const c=calc(p.Sv,b,p.n,p.dmm,p.e,p.fsw); if(c.dS!=null){pts.push([b,c.dS]); lo=Math.min(lo,c.dS); hi=Math.max(hi,c.dS);} }
  if(!pts.length) return;
  lo=Math.min(lo,0); hi=Math.max(hi,0); const pad=(hi-lo)*0.15||0.5; lo-=pad; hi+=pad;
  const X=b=>m.l+(W-m.l-m.r)*(b/D1max), Y=v=>m.t+(H-m.t-m.b)*(1-(v-lo)/(hi-lo));
  ctx.strokeStyle='rgba(148,163,184,0.4)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(m.l,m.t); ctx.lineTo(m.l,H-m.b); ctx.lineTo(W-m.r,H-m.b); ctx.stroke();
  // Nulllinie
  ctx.strokeStyle='rgba(148,163,184,0.3)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(m.l,Y(0)); ctx.lineTo(W-m.r,Y(0)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#64748b'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('Basiskurve D₁ (dpt)', (m.l+W-m.r)/2, H-6);
  for(let b=0;b<=D1max;b+=4){ctx.fillText(b+'',X(b),H-m.b+14);}
  // Kurve ΔS′
  ctx.strokeStyle='#f87171'; ctx.lineWidth=2.2; ctx.beginPath();
  pts.forEach((pt,i)=> i?ctx.lineTo(X(pt[0]),Y(pt[1])):ctx.moveTo(X(pt[0]),Y(pt[1]))); ctx.stroke();
  // aktuelle Basiskurve & Best-Form
  ctx.strokeStyle='rgba(226,232,240,0.5)'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(X(p.D1),m.t); ctx.lineTo(X(p.D1),H-m.b); ctx.stroke(); ctx.setLineDash([]);
  if(p.best!=null){ ctx.fillStyle='#34d399'; ctx.beginPath(); ctx.arc(X(p.best),Y(0),4,0,2*Math.PI); ctx.fill();
    ctx.font='10px monospace'; ctx.textAlign='center'; ctx.fillText('Best-Form', X(p.best), Y(0)-8); }
  ctx.fillStyle='#f87171'; ctx.font='10px monospace'; ctx.textAlign='left'; ctx.fillText('ΔS′ (dpt)', m.l+8, m.t+10);
}

// ─── Tool: Scheiteltiefenvergleich (Mini-Sklerallinsen, 4 Radien) ────────────
function _sagProfile(L, y) {                 // kumulative Scheiteltiefe bei Halbmesser y
  const J = [[L.r0, L.O0/2], [L.r1, L.O1/2], [L.r2, L.O2/2], [L.r3, L.O3/2 - L.bb], [L.br, L.O3/2]];
  let acc = 0, yp = 0;
  for (const [r, yo] of J) {
    if (y <= yo + 1e-9) { acc += Math.sqrt(Math.max(0,r*r-yp*yp)) - Math.sqrt(Math.max(0,r*r-y*y)); return acc; }
    acc += Math.sqrt(Math.max(0,r*r-yp*yp)) - Math.sqrt(Math.max(0,r*r-yo*yo)); yp = yo;
  }
  return acc;
}
// 12 MSK-Auswahl-/Messlinsen (aus MSK-Messlinsen.docx)
const SAG_LENSES = [
  {n:'5,50 N (MSK KA4)',     r0:5.50,pwr:-14.50,r1:6.80,r2:8.60,r3:11.60,O0:9.00,O1:11.70,O2:13.70,O3:16.50,br:12.50,bb:0.40},
  {n:'5,80 N (MSK KA4)',     r0:5.80,pwr:-15.25,r1:7.00,r2:8.60,r3:11.60,O0:9.00,O1:11.70,O2:13.70,O3:16.50,br:12.50,bb:0.40},
  {n:'6,20 N (MSK KA4)',     r0:6.20,pwr:-5.00, r1:7.20,r2:8.60,r3:11.60,O0:9.00,O1:11.70,O2:13.70,O3:16.50,br:12.50,bb:0.40},
  {n:'6,60 N (MSK KA4)',     r0:6.60,pwr:-5.25, r1:7.20,r2:8.60,r3:11.60,O0:8.50,O1:11.50,O2:13.50,O3:16.50,br:12.50,bb:0.40},
  {n:'7,20 N (MSK KA4 Rev.)',r0:7.20,pwr:0.00,  r1:6.80,r2:8.60,r3:11.60,O0:9.50,O1:11.50,O2:13.50,O3:16.50,br:12.50,bb:0.40},
  {n:'7,20 F (MSK KA4 Rev.)',r0:7.20,pwr:0.00,  r1:6.80,r2:9.00,r3:12.20,O0:9.70,O1:11.70,O2:13.70,O3:16.50,br:13.00,bb:0.40},
  {n:'7,60 N (MSK KA4 Rev.)',r0:7.60,pwr:0.00,  r1:7.20,r2:8.60,r3:11.60,O0:9.50,O1:11.50,O2:13.50,O3:16.50,br:12.50,bb:0.40},
  {n:'7,60 F (MSK KA4 Rev.)',r0:7.60,pwr:0.00,  r1:7.20,r2:9.00,r3:12.20,O0:9.70,O1:11.70,O2:13.70,O3:16.50,br:13.00,bb:0.40},
  {n:'7,80 N (MSK KA4 Rev.)',r0:7.80,pwr:0.00,  r1:7.40,r2:8.60,r3:11.60,O0:9.50,O1:11.50,O2:13.50,O3:16.50,br:12.50,bb:0.40},
  {n:'7,80 F (MSK KA4 Rev.)',r0:7.80,pwr:0.00,  r1:7.40,r2:9.00,r3:12.20,O0:9.70,O1:11.70,O2:13.70,O3:16.50,br:13.00,bb:0.40},
  {n:'8,20 N (MSK KA4 Rev.)',r0:8.20,pwr:4.75,  r1:7.80,r2:8.60,r3:11.60,O0:9.50,O1:11.50,O2:13.50,O3:16.50,br:12.50,bb:0.40},
  {n:'8,20 F (MSK KA4 Rev.)',r0:8.20,pwr:4.75,  r1:7.80,r2:9.00,r3:12.20,O0:9.70,O1:11.70,O2:13.70,O3:16.50,br:13.00,bb:0.40},
];
const SAG_KEYS = ['r0','O0','r1','O1','r2','O2','r3','O3','br','bb'];
function buildSagTool(host) {
  const geom = (p,def) => `
    <label>r₀ (mm)<input type="number" id="${p}-r0" value="${def.r0}" step="0.05"></label>
    <label>Ø₀ (mm)<input type="number" id="${p}-O0" value="${def.O0}" step="0.5"></label>
    <label>r₁ (mm)<input type="number" id="${p}-r1" value="${def.r1}" step="0.05"></label>
    <label>Ø₁ (mm)<input type="number" id="${p}-O1" value="${def.O1}" step="0.5"></label>
    <label>r₂ (mm)<input type="number" id="${p}-r2" value="${def.r2}" step="0.05"></label>
    <label>Ø₂ (mm)<input type="number" id="${p}-O2" value="${def.O2}" step="0.5"></label>
    <label>r₃ (mm)<input type="number" id="${p}-r3" value="${def.r3}" step="0.05"></label>
    <label>Ø₃ (mm)<input type="number" id="${p}-O3" value="${def.O3}" step="0.5"></label>
    <label>Bevel r (mm)<input type="number" id="${p}-br" value="${def.br}" step="0.05"></label>
    <label>Exzentrizität (ε)<input type="number" id="${p}-bb" value="${def.bb}" step="0.05"></label>`;
  const mess = SAG_LENSES[6], neu = {r0:7.60,O0:10.00,r1:7.20,O1:12.00,r2:8.60,O2:14.00,r3:11.60,O3:16.50,br:12.50,bb:0.40};
  const opts = '<option value="">— eigene Linse —</option>' + SAG_LENSES.map((l,i)=>`<option value="${i}"${i===6?' selected':''}>${l.n} · ${_fmtDE(l.pwr,2)} dpt · r₁ ${_fmtDE(l.r1,2)} · r₂ ${_fmtDE(l.r2,2)} · r₃ ${_fmtDE(l.r3,2)}</option>`).join('');
  const canvas = _betaCanvas(host, `
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title" style="color:#2563eb">Messlinse</span></div>
      <div class="rt-section-body beta-form">
        <label style="grid-column:1/-1">Auswahllinse<select id="bsag-sel">${opts}</select></label>
        <label style="grid-column:1/-1">Wirkung Messlinse (dpt)<input type="number" id="bsag-m-pwr" value="${mess.pwr}" step="0.25"></label>
        ${geom('bsag-m', mess)}
      </div></div>
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title" style="color:#16a34a">Neue Linse</span></div>
      <div class="rt-section-body beta-form">${geom('bsag-n', neu)}</div>
      <div class="rt-section-body" style="padding-top:0"><div class="beta-presets" id="bsag-slots"></div></div>
    </div>
    <div class="rt-section"><div class="rt-section-header"><span class="rt-section-title">Überrefraktion</span></div>
      <div class="rt-section-body beta-form">
        <label>sph (dpt)<input type="number" id="bsag-u-sph" value="0" step="0.25"></label>
        <label>cyl (dpt)<input type="number" id="bsag-u-cyl" value="0" step="0.25"></label>
        <label>Achse (°)<input type="number" id="bsag-u-ax" value="0" step="1"></label>
      </div></div>
    <div class="beta-results" id="bsag-out"></div>
    <p class="beta-note">Mini-Sklerallinsen (4 Radien + Bevel). Wähle oben eine Messlinse oder gestalte eigene. Die finale Kontaktlinse berücksichtigt die Tränenlinse: r₀ um +0,05 mm flacher → Sphäre −0,25 dpt, r₀ um −0,05 mm steiler → +0,25 dpt.</p>`, 'bsag-canvas');

  // Dropdown füllt Messlinse-Geometrie + Wirkung
  document.getElementById('bsag-sel').addEventListener('change', e => {
    if (e.target.value === '') return; const L = SAG_LENSES[+e.target.value];
    SAG_KEYS.forEach(k => document.getElementById('bsag-m-'+k).value = L[k]);
    document.getElementById('bsag-m-pwr').value = L.pwr; recalc();
  });
  // Speicherplätze für die neue Linse
  const slots = document.getElementById('bsag-slots');
  slots.innerHTML = ['1','2'].map(s=>`<button class="beta-preset" data-a="s${s}">▾ Slot ${s} speichern</button><button class="beta-preset" data-a="l${s}">▴ Slot ${s} laden</button>`).join('');
  slots.querySelectorAll('.beta-preset').forEach(b => b.addEventListener('click', () => {
    const a=b.dataset.a, key='ao_sag_n'+a[1];
    if (a[0]==='s') { const o={}; SAG_KEYS.forEach(k=>o[k]=document.getElementById('bsag-n-'+k).value); try{localStorage.setItem(key,JSON.stringify(o));}catch{}
      const t=b.textContent; b.textContent='✓ gespeichert'; setTimeout(()=>b.textContent=t,900); }
    else { try{ const o=JSON.parse(localStorage.getItem(key)||'null'); if(o){ SAG_KEYS.forEach(k=>{if(o[k]!=null)document.getElementById('bsag-n-'+k).value=o[k];}); recalc(); } }catch{} }
  }));

  const readL = p => Object.fromEntries(SAG_KEYS.map(k => [k, _bnum(p+'-'+k)]));
  const junc = L => {
    const d=[_sagProfile(L,L.O0/2),_sagProfile(L,L.O1/2),_sagProfile(L,L.O2/2),_sagProfile(L,L.O3/2)];
    const angs=[[L.r0,L.O0/2],[L.r1,L.O1/2],[L.r2,L.O2/2],[L.r3,L.O3/2-L.bb],[L.br,L.O3/2]].map(([r,y])=>Math.asin(Math.min(1,y/r))*_DEG);
    return { d, dg:d[3], maxAng:Math.max(...angs) };
  };
  const recalc = () => {
    const M=readL('bsag-m'), N=readL('bsag-n'), jM=junc(M), jN=junc(N);
    const f=x=>_fmtDE(x,3);
    const row=(l,a,b,cls='')=>`<div class="beta-res-row"><span>${l}</span><b class="${cls}">${a}${b!==undefined?' / '+b:''}</b></div>`;
    // Finale Kontaktlinse: Messwirkung + Überrefraktion + Tränenlinsen-Korrektur (Δr₀)
    const r0comp = -((N.r0 - M.r0)/0.05)*0.25;
    const finSph = _bnum('bsag-m-pwr') + _bnum('bsag-u-sph') + r0comp;
    document.getElementById('bsag-out').innerHTML =
      `<div class="beta-res-row" style="opacity:.7"><span>SagH (mm)</span><b>Messlinse / Neu</b></div>` +
      row('d₀', f(jM.d[0]), f(jN.d[0])) + row('d₁', f(jM.d[1]), f(jN.d[1])) +
      row('d₂', f(jM.d[2]), f(jN.d[2])) + row('d_g', f(jM.dg), f(jN.dg)) +
      row('SagH Neu − Alt', f(jN.dg - jM.dg), undefined, 'beta-green') +
      row('max. Steigungswinkel', _fmtDE(jM.maxAng,1)+'°', _fmtDE(jN.maxAng,1)+'°') +
      row('Produzierbar?', jM.maxAng<=60?'✓ ja':'⚠ nein', jN.maxAng<=60?'✓ ja':'⚠ nein', (jM.maxAng<=60&&jN.maxAng<=60)?'beta-green':'') +
      `<div class="beta-res-row" style="opacity:.7;margin-top:4px"><span>Finale Kontaktlinse</span><b></b></div>` +
      row('Tränenlinse-Korr. (Δr₀ '+_fmtDE(N.r0-M.r0,2)+')', _fmtDE(r0comp,2)+' dpt') +
      row('sph / cyl / Achse', `${_fmtDE(finSph,2)} dpt / ${_fmtDE(_bnum('bsag-u-cyl'),2)} dpt / ${_fmtDE(_bnum('bsag-u-ax'),0)}°`, 'beta-green');
    drawSag(canvas, M, N, jM, jN);
  };
  host.querySelectorAll('input,select').forEach(el => el.addEventListener('input', recalc));
  const size = () => { const w = canvas.parentElement; canvas.width = Math.max(340, w.clientWidth-2); canvas.height = 400; recalc(); };
  size(); window.addEventListener('resize', size);
}
function drawSag(canvas, M, N, jM, jN) {
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, m = { l:46, r:14, t:30, b:30 };
  _bg(ctx, W, H);
  const dMax = Math.max(M.O3, N.O3, 16.5), sMax = Math.max(jM.dg, jN.dg)*1.08;
  const X = d => m.l + (W-m.l-m.r)*(d/dMax);
  const Y = s => m.t + (H-m.t-m.b)*(1 - s/sMax);     // Scheiteltiefe: groß oben
  // Raster
  ctx.strokeStyle='rgba(148,163,184,0.15)'; ctx.lineWidth=1; ctx.fillStyle='#64748b'; ctx.font='9px monospace';
  for(let d=0;d<=dMax;d+=2){ ctx.beginPath(); ctx.moveTo(X(d),m.t); ctx.lineTo(X(d),H-m.b); ctx.stroke(); ctx.textAlign='center'; ctx.fillText(_fmtDE(d,0),X(d),H-m.b+12); }
  for(let s=0;s<=sMax;s+=1){ ctx.beginPath(); ctx.moveTo(m.l,Y(s)); ctx.lineTo(W-m.r,Y(s)); ctx.stroke(); ctx.textAlign='right'; ctx.fillText(_fmtDE(s,0),m.l-4,Y(s)+3); }
  ctx.textAlign='center'; ctx.fillText('Durchmesser (mm)', (m.l+W-m.r)/2, H-4);
  ctx.save(); ctx.translate(12,(m.t+H-m.b)/2); ctx.rotate(-Math.PI/2); ctx.fillText('Scheiteltiefe (mm)',0,0); ctx.restore();
  // Kurve (Profil: dg − sag, also Vault über der Randebene)
  const drawLens=(L,j,col)=>{
    ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.beginPath();
    for(let d=0; d<=L.O3+1e-6; d+=0.2){ const yv=j.dg - _sagProfile(L,d/2); const xx=X(d),yy=Y(yv); d?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); }
    ctx.stroke();
    // Übergangspunkte an Ø0,Ø1,Ø2,Ø3
    [[L.O0,0],[L.O1,1],[L.O2,2],[L.O3,3]].forEach(([O,i])=>{ const yv=j.dg-j.d[i]; ctx.fillStyle=col;
      ctx.beginPath(); ctx.arc(X(O),Y(yv),3.5,0,2*Math.PI); ctx.fill();
      ctx.font='9px monospace'; ctx.textAlign='left'; ctx.fillText(_fmtDE(O,2), X(O)+5, Y(yv)+3); });
  };
  drawLens(M, jM, '#2563eb'); drawLens(N, jN, '#16a34a');
  // Legende
  ctx.font='10px monospace'; ctx.textAlign='left';
  ctx.fillStyle='#2563eb'; ctx.fillText('■ Messlinse', m.l+6, m.t-12);
  ctx.fillStyle='#16a34a'; ctx.fillText('■ Neue Linse', m.l+96, m.t-12);
}

// ─── Tool-Registry ────────────────────────────────────────────────────────────
const BETA_TOOLS = [
  { id: 'pnw', cat: 'Brillenoptik', title: 'Prismatische Nebenwirkung bei Dezentration',
    desc: 'Prismatische Wirkung am Durchblickpunkt bei dezentriertem optischem Zentrum – mit grafischer Darstellung.',
    build: buildPNWTool },
  { id: 'crosscyl', cat: 'Brillenoptik', title: 'Addition schiefgekreuzter Zylinder',
    desc: 'Kombiniert zwei sphäro-zylindrische Wirkungen (Leistungsvektoren) zu einer resultierenden Wirkung.',
    build: buildCrossCylTool },
  { id: 'aniseikonie', cat: 'Brillenoptik', title: 'Aniseikonierechner',
    desc: 'Eigen- und Gesamtvergrößerung eines Brillenglases (Form- und Leistungsfaktor) inkl. HSA-Umrechnung.',
    build: buildAniseikonieTool },
  { id: 'interface', cat: 'Strahlenoptik', title: 'Grenzfläche',
    desc: 'Brechung & Reflexion an einer ebenen Grenzfläche – mit Grenzwinkel, Brewster-Winkel und Totalreflexion.',
    build: buildInterfaceTool },
  { id: 'plate', cat: 'Strahlenoptik', title: 'Planparallele Platte',
    desc: 'Strahlversatz (Parallelversatz) beim Durchgang durch eine planparallele Platte – grafisch.',
    build: buildPlateTool },
  { id: 'prism', cat: 'Strahlenoptik', title: 'Prisma',
    desc: 'Strahlengang und Gesamtablenkung durch ein Prisma inkl. Minimum der Ablenkung und Totalreflexion.',
    build: buildPrismTool },
  { id: 'drop', cat: 'Strahlenoptik', title: 'Tropfen (Regenbogen)',
    desc: 'Strahlengang in einem kugelförmigen Tropfen mit interner Reflexion – Haupt- und Nebenregenbogen.',
    build: buildDropTool },
  { id: 'fiber', cat: 'Strahlenoptik', title: 'Lichtwellenleiter',
    desc: 'Lichtführung in einer Stufenindexfaser durch Totalreflexion – mit NA und Akzeptanzwinkel.',
    build: buildFiberTool },
  { id: 'asb', cat: 'Brillenoptik', title: 'Astigmatismus schiefer Bündel (Brillenglas)',
    desc: 'Coddington-Dickglas: tangentiale & sagittale Wirkung über den Blickwinkel, volle Glasgeometrie, Presets, Kurven.',
    build: buildASBTool },
  { id: 'asbsport', cat: 'Brillenoptik', title: 'Astigmatismus bei Sportverglasung',
    desc: 'Schiefe Bündel durch Scheibenwinkel & Vorneigung (Coddington), Glasgeometrie, Dezentrationsprisma.',
    build: buildASBSportTool },
  { id: 'curvedglass', cat: 'Brillenoptik', title: 'Glasberechnung bei Sportverglasung',
    desc: 'Best-Form-Auslegung: Rückfläche/Radien aus Ziel & Basiskurve + ΔS′-Kurve über die Basiskurve (Coddington).',
    build: buildCurvedGlassTool },
  { id: 'sag', cat: 'Kontaktlinse', title: 'Scheiteltiefenvergleich',
    desc: 'Sag-Vergleich zweier Mini-Sklerallinsen (4 Radien + Bevel) mit Zonenübergängen und Produzierbarkeits-Check.',
    build: buildSagTool },
];
