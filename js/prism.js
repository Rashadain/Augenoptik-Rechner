// ─── Prisma-Rechner ───────────────────────────────────────────────────────────
// Enthält: PNW, resultierende Prismen, Zerlegung, Visualisierung

// ── Berechnungsfunktionen ─────────────────────────────────────────────────────

/**
 * Prismatische Nebenwirkung (PNW) eines torischen/sphärischen Glases.
 * Brechkraft-Matrix-Methode (exakt für torische Gläser).
 *
 * @param {number} S      Sphäre [dpt]
 * @param {number} C      Zylinder [dpt]  (neg = Minusform)
 * @param {number} ax     Zylinderachse [Grad, TABO 0–180]
 * @param {number} dx_mm  Fehlzentrierung x [mm]  (+: OZ rechts von Pupille)
 * @param {number} dy_mm  Fehlzentrierung y [mm]  (+: OZ über Pupille)
 * @returns {{ Px:number, Py:number }}  Prismavektoren [pdpt]
 */
function calcPNW(S, C, ax, dx_mm, dy_mm) {
  const r  = ax * Math.PI / 180;
  const s2 = Math.sin(r) ** 2;
  const c2 = Math.cos(r) ** 2;
  const sc = Math.sin(r) * Math.cos(r);
  // Brechkraft-Matrix
  const Dxx =  S + C * s2;   // horizontale Brechkraft
  const Dyy =  S + C * c2;   // vertikale Brechkraft
  const Dxy = -C * sc;       // Kreuzkopplung
  const cx  = dx_mm / 10;    // mm → cm  (Prentice: P[pdpt] = c[cm] × D[dpt])
  const cy  = dy_mm / 10;
  return { Px: cx * Dxx + cy * Dxy, Py: cx * Dxy + cy * Dyy };
}

/** Vektoraddition zweier Prismavektoren */
function addPrisms(p1, p2) {
  return { Px: (p1.Px||0) + (p2.Px||0), Py: (p1.Py||0) + (p2.Py||0) };
}

/** Kartesisch → Polar   { mag [pdpt], angle [°, 0–360], Px, Py } */
function prismToPolar(p) {
  const Px = p.Px || 0, Py = p.Py || 0;
  const mag = Math.sqrt(Px ** 2 + Py ** 2);
  let ang   = Math.atan2(Py, Px) * 180 / Math.PI;
  if (ang < 0) ang += 360;
  return { mag, angle: ang, Px, Py };
}

/** Polar → Kartesisch */
function prismFromPolar(mag, angleDeg) {
  const r = angleDeg * Math.PI / 180;
  return { Px: mag * Math.cos(r), Py: mag * Math.sin(r) };
}

/**
 * Beschreibt die Basislage in TABO-Konvention.
 * 0° = rechts extern (= temporal RA / nasal LA)
 * 90° = oben, 180° = links extern, 270° = unten
 */
function baseName(angle, eye) {
  const a = ((Math.round(angle) % 360) + 360) % 360;
  const rightward = (a <= 22 || a >= 338);
  const leftward  = (a >= 158 && a <= 202);
  const upward    = (a >= 68  && a <= 112);
  const downward  = (a >= 248 && a <= 292);

  // TABO-Konvention (Nutzervorgabe): RA 0° = nasal/innen = B in, 180° = temporal = B out.
  // LA spiegelbildlich: 0° = temporal = B out, 180° = nasal/innen = B in.
  function hDir(rw) {
    if (eye === 'R') return rw ? 'B in (nasal)'    : 'B out (temporal)';
    if (eye === 'L') return rw ? 'B out (temporal)' : 'B in (nasal)';
    return rw ? '0°-Richtung' : '180°-Richtung';
  }

  if (rightward) return hDir(true);
  if (leftward)  return hDir(false);
  if (upward)    return 'B oben';
  if (downward)  return 'B unten';

  // Diagonale
  const isUp  = a > 0   && a < 180;
  const isRtw = a < 90  || a > 270;
  const vPart = isUp ? 'B oben' : 'B unten';
  const hPart = hDir(isRtw).split(' (')[0];
  return `${vPart} · ${hPart}`;
}

/** H-Komponenten-Beschriftung */
function hCompLabel(Px, eye) {
  if (Math.abs(Px) < 0.005) return '0,00 pdpt';
  // Px > 0 = Basis zeigt nach +x (TABO 0°): RA = nasal (B in), LA = temporal (B out)
  const dir = Px > 0
    ? (eye === 'R' ? 'B in'  : 'B out')
    : (eye === 'R' ? 'B out' : 'B in');
  return `${Math.abs(Px).toFixed(2)} pdpt ${dir}`;
}

/** V-Komponenten-Beschriftung */
function vCompLabel(Py) {
  if (Math.abs(Py) < 0.005) return '0,00 pdpt';
  return `${Math.abs(Py).toFixed(2)} pdpt ${Py > 0 ? 'B oben' : 'B unten'}`;
}


// ── Visuelle Darstellung ──────────────────────────────────────────────────────

class PrismVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.C = {
      bg:     '#1e293b',
      grid:   'rgba(255,255,255,0.04)',
      axis:   'rgba(255,255,255,0.18)',
      lens:   'rgba(56,189,248,0.10)',
      lensB:  '#38bdf8',
      total:  '#f87171',
      Hcomp:  '#60a5fa',
      Vcomp:  '#c084fc',
      result: '#34d399',
      text:   '#e2e8f0',
      muted:  '#64748b',
      label:  '#94a3b8',
    };
  }

  resize() {
    const wrap         = this.canvas.parentElement;
    this.canvas.width  = Math.max(360, wrap.clientWidth - 2);
    this.canvas.height = 280;
  }

  /* Pfeil zeichnen (strokeStyle + fillStyle vorab setzen) */
  _arrow(x1, y1, x2, y2, hw = 7) {
    const ctx = this.ctx;
    const dx  = x2 - x1, dy = y2 - y1;
    const L   = Math.sqrt(dx * dx + dy * dy);
    if (L < 2) return;
    const ux = dx / L, uy = dy / L, hx = hw * 0.45;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hw * ux + hx * uy, y2 - hw * uy - hx * ux);
    ctx.lineTo(x2 - hw * ux - hx * uy, y2 - hw * uy + hx * ux);
    ctx.closePath(); ctx.fill();
  }

  /* Ein Linsen-Panel zeichnen (cx/cy = Mittelpunkt, R = Linsenradius px) */
  _drawPanel(cx, cy, R, pol, eye, title) {
    const ctx = this.ctx;
    const C   = this.C;

    // Titel
    ctx.fillStyle = C.label; ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center'; ctx.fillText(title, cx, cy - R - 14);

    // Linsenkreis
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.fillStyle   = C.lens;  ctx.fill();
    ctx.strokeStyle = C.lensB; ctx.lineWidth = 1.5; ctx.stroke();

    // Fadenkreuz
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    ctx.setLineDash([]);

    // Anatomische Richtungsbeschriftung (nasal/temporal & oben/unten)
    // Konvention: RA nasal = rechts (TABO 0°), LA nasal = links (TABO 180°).
    if (eye === 'R' || eye === 'L') {
      const nasalRight = (eye === 'R');
      ctx.fillStyle = C.muted; ctx.font = '8px system-ui';
      ctx.textAlign = 'right'; ctx.fillText(nasalRight ? 'nasal' : 'temp.', cx + R - 2, cy - 4);
      ctx.textAlign = 'left';  ctx.fillText(nasalRight ? 'temp.' : 'nasal', cx - R + 2, cy - 4);
      ctx.textAlign = 'center';
      ctx.fillText('oben',  cx, cy - R + 9);
      ctx.fillText('unten', cx, cy + R - 3);
    }

    if (!pol || pol.mag < 0.005) {
      ctx.fillStyle = C.muted; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('0 pdpt', cx, cy + 4);
      ctx.fillText('kein Prisma', cx, cy + R + 16);
      return;
    }

    // Skalierung: R*0.82 px = Maximalwert
    const scale = (R * 0.82) / Math.max(pol.mag, 0.5);
    const ex    = cx + pol.Px * scale;
    const ey    = cy - pol.Py * scale;   // Y-Achse invertiert

    // H-Komponente (gestrichelt blau)
    if (Math.abs(pol.Px) > 0.005) {
      ctx.strokeStyle = C.Hcomp; ctx.fillStyle = C.Hcomp;
      ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      this._arrow(cx, cy, cx + pol.Px * scale, cy, 5);
      ctx.setLineDash([]);
    }
    // V-Komponente (gestrichelt lila)
    if (Math.abs(pol.Py) > 0.005) {
      ctx.strokeStyle = C.Vcomp; ctx.fillStyle = C.Vcomp;
      ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      this._arrow(cx, cy, cx, cy - pol.Py * scale, 5);
      ctx.setLineDash([]);
    }
    // Gesamtvektor
    const col = eye === 'result' ? C.result : C.total;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5;
    this._arrow(cx, cy, ex, ey, 8);

    // Numerische Labels
    ctx.fillStyle = C.text; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${pol.mag.toFixed(2)} pdpt`, cx, cy + R + 16);
    ctx.fillStyle = C.muted; ctx.font = '10px monospace';
    ctx.fillText(`${((pol.angle % 360 + 360) % 360).toFixed(0)}° TABO`, cx, cy + R + 29);
  }

  /**
   * Canvas neu zeichnen.
   * @param {object|null} polR   Polar-Ergebnis rechtes Auge
   * @param {object|null} polL   Polar-Ergebnis linkes Auge
   * @param {object|null} polRes Resultante (optional, null = nicht anzeigen)
   */
  draw(polR, polL, polRes) {
    const canvas = this.canvas;
    const ctx    = this.ctx;
    const C      = this.C;
    const W      = canvas.width, H = canvas.height;

    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    // Gitter
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    if (!polR && !polL) {
      ctx.fillStyle = C.muted; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('Werte eingeben → Prisma wird automatisch berechnet', W/2, H/2);
      return;
    }

    const hasRes = polRes && polRes.mag > 0.005;
    const nCols  = hasRes ? 3 : 2;
    const colW   = W / nCols;
    const lensR  = Math.min(72, colW * 0.36, H * 0.30);
    const cy     = H / 2 - 10;

    this._drawPanel(colW * 0.5,             cy, lensR, polR,  'R',      'Rechtes Auge (R)');
    if (hasRes)
      this._drawPanel(colW * 1.5,           cy, lensR, polRes, 'result', 'Resultante');
    this._drawPanel(colW * (nCols - 0.5),   cy, lensR, polL,  'L',      'Linkes Auge (L)');

    // Legende unten links
    const ly  = H - 12;
    const leg = [[C.total, 'Gesamt'], [C.Hcomp, 'Horizontal'], [C.Vcomp, 'Vertikal']];
    let lx = 8;
    leg.forEach(([col, lab]) => {
      ctx.beginPath(); ctx.arc(lx+4, ly-3, 4, 0, 2*Math.PI);
      ctx.fillStyle = col; ctx.fill();
      ctx.fillStyle = C.label; ctx.font = '9px system-ui'; ctx.textAlign = 'left';
      ctx.fillText(lab, lx+12, ly);
      lx += 90;
    });
  }
}
