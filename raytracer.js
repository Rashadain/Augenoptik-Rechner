// ─── Paraxialer Strahlengang-Tracer ─────────────────────────────────────────
// Koordinatensystem: x = optische Achse (m), y = Höhe (m)
// Paraxial-Näherung: Steigung slope = dy/dx (kleiner Winkel)
// Brechkraft D in Dioptrien: f' = 1/D [m], Abbildungsgleichung: 1/a' − 1/a = D

class RayTracer {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');

    // ── Optisches System ────────────────────────────────────────────────────
    this.lenses   = [];   // [{x (m), power (dpt), aperture (m)}]
    this.stops    = [];   // [{x (m), radius (m)}]
    this.nMedium  = 1.0;  // Brechzahl Umgebungsmedium

    // ── Objekt ──────────────────────────────────────────────────────────────
    this.objX = -0.15;   // m
    this.objH =  0.025;  // m

    // ── Sichtbereich ────────────────────────────────────────────────────────
    // yCenter: optische Koordinate, die in der Mitte des Canvas erscheint (0 = opt. Achse)
    this.vp = { xMin: -0.22, xMax: 0.28, yHalf: 0.07, yCenter: 0 };

    // ── Strahlen-Konfiguration ───────────────────────────────────────────────
    this.rays = {
      parallel : true,   // Achsenparallelstrahl (rot)
      focal    : true,   // Brennpunktstrahl (blau)
      central  : true,   // Zentralstrahl durch opt. Zentrum (violett)
      marginal : false,  // Axialer Randstrahl / axialer Öffnungsstrahl (orange)
      chief    : false,  // Hauptstrahl durch Blende (orange, gestrichelt)
      oblique  : false,  // Schiefer Öffnungsstrahl (grün)
      virtual  : true,   // Virtuelle Strahlen (Rückwärtsverlängerungen, gestrichelt)
    };

    // ── DPR (HiDPI/Retina-Unterstützung) ────────────────────────────────────
    this.dpr = 1;

    // ── Systemkardinalpunkte (Hauptebenen H/H', Systembrennpunkte F/F') ──────
    // Nur für Mehrlinsensysteme (≥2 Linsen) sinnvoll; per Checkbox schaltbar.
    this.showCardinals = true;

    // ── Farben ───────────────────────────────────────────────────────────────
    this.C = {
      bg         : '#0f172a',
      axisBright : '#64748b',
      axisArrow  : '#94a3b8',
      grid       : 'rgba(51,65,85,0.4)',
      gridLabel  : '#475569',
      lens       : '#38bdf8',
      lensLabel  : '#7dd3fc',   // hellere Variante für die f'-Zeile am Linsen-Label
      lensGlow   : 'rgba(56,189,248,0.15)',
      aperture   : '#f59e0b',
      fPoint     : '#d946ef',
      sysPlane   : '#5eead4',   // Systemhauptebenen H / H'
      sysFocal   : '#5eead4',   // Systembrennpunkte F / F' (Mehrlinsensystem)
      obj        : '#fbbf24',
      img        : '#4ade80',
      imgVirt    : '#6ee7b7',
      parallel   : '#f87171',
      focal      : '#60a5fa',
      central    : '#c084fc',
      marginal   : '#fb923c',
      chief      : '#fb923c',
      oblique    : '#34d399',
    };
  }

  // ── Koordinatentransformation ─────────────────────────────────────────────
  // Gibt immer logische Pixel zurück (DPR-unabhängig), weil draw() ctx.scale(dpr) setzt.
  cx(wx) {
    const W = this.canvas.width / (this.dpr || 1);
    return (wx - this.vp.xMin) / (this.vp.xMax - this.vp.xMin) * W;
  }
  cy(wy) {
    const H = this.canvas.height / (this.dpr || 1);
    // yCenter: optische Y-Koordinate, die vertikal zentriert wird (Standard = 0 = opt. Achse)
    return H / 2 - (wy - (this.vp.yCenter || 0)) * (H / 2) / this.vp.yHalf;
  }
  cxy(wx, wy) { return { x: this.cx(wx), y: this.cy(wy) }; }

  // ── Paraxiales Strahlverfolgung ───────────────────────────────────────────
  // Gibt Array von Segmenten zurück; jedes Segment = {x1,y1,x2,y2}
  traceRay(x0, y0, slope0) {
    const segs = [];
    let x = x0, y = y0, slope = slope0;

    const sortedLenses = [...this.lenses].sort((a, b) => a.x - b.x);

    for (const lens of sortedLenses) {
      if (lens.x <= x + 0.001) continue;
      const dx = lens.x - x;
      const yL = y + slope * dx;
      segs.push({ x1: x, y1: y, x2: lens.x, y2: yL });
      x = lens.x;
      y = yL;
      // Dünne Linse: slope_neu = slope_alt − y·D (y in m, D in dpt = 1/m)
      const f_m = lens.power !== 0 ? 1.0 / lens.power : Infinity;
      slope = slope - y / f_m;
    }

    // Reststrahl bis zum Bildrand (+ etwas Puffer)
    const xEnd = this.vp.xMax + 100;
    segs.push({ x1: x, y1: y, x2: xEnd, y2: y + slope * (xEnd - x) });
    return { segs, exitX: x, exitY: y, exitSlope: slope };
  }

  // ── Bildpunkt per Strahlschnitt ───────────────────────────────────────────
  findImage() {
    if (this.lenses.length === 0) return null;
    const sorted = [...this.lenses].sort((a, b) => a.x - b.x);
    const L0 = sorted[0];

    // Strahl 1: parallel zur Achse
    const r1 = this.traceRay(this.objX, this.objH, 0);
    const s1 = r1.segs[r1.segs.length - 1];
    const slope1 = (s1.y2 - s1.y1) / (s1.x2 - s1.x1);

    // Strahl 2: durch Linsenmittelpunkt (unabgelenkt für dünne Linse)
    const slopeC = (0 - this.objH) / (L0.x - this.objX);
    const r2 = this.traceRay(this.objX, this.objH, slopeC);
    const s2 = r2.segs[r2.segs.length - 1];
    const slope2 = (s2.y2 - s2.y1) / (s2.x2 - s2.x1);

    // Schnittpunkt der zwei Endstrahlen
    // s1: y = s1.y1 + slope1*(x - s1.x1)
    // s2: y = s2.y1 + slope2*(x - s2.x1)
    const dSlope = slope1 - slope2;
    // Afokales System (z. B. Fernrohr): austretendes Bündel ~parallel →
    // kein endliches Bild. Bei Objekt im Unendlichen großzügige Schwelle.
    const isInf = this.objX < -600;
    if (isInf && Math.abs(dSlope) < 1e-3) return { afocal: true };
    // Auch bei ENDLICHEM Objekt afokal, wenn das austretende Bündel (nahezu)
    // parallel ist – z. B. Mikroskop mit Zwischenbild in der Okular-Brennebene
    // (entspanntes Auge → Bild im Unendlichen). Sonst entstünde fälschlich „kein Bild".
    const slopeScale = Math.abs(slope1) + Math.abs(slope2) + 1e-9;
    if (Math.abs(dSlope) < 1e-5 * slopeScale || Math.abs(dSlope) < 1e-9) {
      return { afocal: true };
    }
    const imgX = (s2.y1 - s1.y1 + slope1 * s1.x1 - slope2 * s2.x1) / dSlope;
    const imgY = s1.y1 + slope1 * (imgX - s1.x1);

    // Bildweite vom Linsenmittelpunkt
    const lastLens = sorted[sorted.length - 1];
    const b   = imgX - lastLens.x;
    const g   = lastLens.x - this.objX;
    // β' = y'/y  — korrekt für Mehrlinsensysteme (nicht -b/g!)
    const beta = Math.abs(this.objH) > 0.001 ? imgY / this.objH : NaN;
    const real = imgX > lastLens.x && Math.abs(beta) < 50;

    return { x: imgX, y: imgY, b, g, beta, real };
  }

  // ── Alle Strahlen aufbauen ────────────────────────────────────────────────
  // Terminologie (DIN/deutsche Augenoptik-Lehre):
  //   Achsenparallelstrahl : Konstruktionsstrahl parallel zur opt. Achse → durch F'
  //   Brennpunktstrahl     : durch vorderen Brennpunkt F → nach Linse achsenparallel
  //   Hauptstrahl          : durch opt. Zentrum der (ersten) Linse (Bildkonstruktion)
  //   Axialer Öffnungsstrahl (Randstrahl): vom achsnahen Objektpunkt (y=0)
  //                          durch den Rand der EINTRITTSPUPILLE
  //   Blendenhauptstrahl   : vom außeraxialen Objektpunkt durch das Zentrum
  //                          der EINTRITTSPUPILLE (= Bild der Aperturblende)
  //   Schiefer Öffnungsstrahl: vom außeraxialen Objektpunkt zum Rand der
  //                          EINTRITTSPUPILLE (oberer + unterer Rand)
  //
  // Unendlich-Modus (objX < −600):
  //   Alle Strahlen von einem Objekt im Unendlichen sind parallel (gleiche Steigung).
  //   Strahlen 1–3 zeigen das AXIALE Strahlbündel (slope=0) an den Rändern und
  //   im Zentrum der Eintrittspupille.
  //   Strahlen 5–6 zeigen das AUSSERAXIALE Bündel mit Feldwinkel ω = objH · D_Obj.
  buildRayList() {
    if (this.lenses.length === 0) return [];
    const sorted = [...this.lenses].sort((a, b) => a.x - b.x);
    const L0     = sorted[0];
    const f_m    = L0.power !== 0 ? 1.0 / L0.power : Infinity;
    const fFront = L0.x - f_m;          // vorderer Brennpunkt F (Objektseite)
    const list   = [];
    const xVirt  = this.vp.xMin - 30;   // weit links für virtuelle Verlängerungen

    // ── Objekt im Unendlichen? ─────────────────────────────────────────────
    // Bei objX < −600 m behandeln wir das Objekt als im Unendlichen.
    // Strahlen starten dann vom linken Viewport-Rand (xStart), nicht von objX.
    const isInfinity = this.objX < -600;
    // Startpunkt für Unendlich-Strahlen: 20 mm links vom Viewport-Rand
    const xStart = isInfinity
      ? Math.min(this.vp.xMin - 0.02, L0.x - 0.12)
      : this.objX;

    // ── Hilfsfunktionen ────────────────────────────────────────────────────
    const addVirtual = (r, color) => {
      if (!this.rays.virtual) return;
      const { exitX, exitY, exitSlope } = r;
      const yVirtEnd = exitY - exitSlope * (exitX - xVirt);
      list.push({
        segs: [{ x1: exitX, y1: exitY, x2: xVirt, y2: yVirtEnd }],
        color, label: null, lw: 1.2, dash: [5, 5], alpha: 0.45
      });
    };

    // Apertur der Blende / der ersten Linse (als Fallback-Blende)
    // Blende hat Vorrang; sonst wird die erste Linse als Aperturblende verwendet.
    const hasSortedStops = this.stops.length > 0;
    const sortedStops    = [...this.stops].sort((a, b) => a.x - b.x);
    const aperStop       = hasSortedStops ? sortedStops[0] : { x: L0.x, radius: L0.aperture || 0.035 };

    // ── Eintrittspupille für Strahlrichtungen ──────────────────────────────
    // Axialer Öffnungsstrahl, Blendenhauptstrahl und schiefer Öffnungsstrahl
    // richten sich nach der EINTRITTSPUPILLE (EP = Bild der Aperturblende durch
    // alle vorgelagerten Linsen). Bei Blende = erste Linse gilt EP = Blende.
    const _ep = this.findEntrancePupil();
    const epX = (_ep && isFinite(_ep.x))      ? _ep.x      : aperStop.x;
    const epR = (_ep && isFinite(_ep.radius) && _ep.radius > 0)
                  ? _ep.radius : (aperStop.radius || 0.035);

    // ── Austrittspupille (für Verlängerung schiefer Bündel zur AP) ─────────
    const _ap = this.findExitPupil();
    const apX = (_ap && isFinite(_ap.x))      ? _ap.x      : null;
    const apR = (_ap && isFinite(_ap.radius) && _ap.radius > 0) ? _ap.radius : null;

    // Zeichnet die (gestrichelte) Verlängerung eines austretenden Strahls bis
    // zur Austrittspupille – nur sinnvoll, wenn die AP VIRTUELL links vom
    // letzten Glas liegt (z. B. Galilei-Fernrohr); dann konvergieren die
    // Rückwärts-Verlängerungen im AP-Zentrum.
    const addApExt = (r, color) => {
      if (apX == null) return;
      const { exitX, exitY, exitSlope } = r;
      if (apX >= exitX - 1e-9) return;          // reale AP rechts → realer Strahl zeigt sie bereits
      const yAtAp = exitY + exitSlope * (apX - exitX);
      if (!isFinite(yAtAp)) return;
      list.push({
        segs: [{ x1: exitX, y1: exitY, x2: apX, y2: yAtAp }],
        color, label: null, lw: 1.0, dash: [2, 3], alpha: 0.5
      });
    };

    // ── Feldwinkel für Unendlich-Strahlen (vignettierungsbegrenzt) ─────────
    // ω wird so gewählt, dass das außeraxiale Bündel (Hauptstrahl ± Öffnung)
    // durch ALLE Aperturen des Systems passt (kein „Vorbeilaufen" an Blenden).
    // Vorzeichen negativ: Objekt oberhalb der Achse → Strahlen fallen nach unten.
    const omegaDir = (this.objH >= 0) ? -1 : 1;
    const infOmega = isInfinity
      ? omegaDir * this._infinityFieldAngle(xStart, epX, epR)
      : 0;

    // ── 1. Achsenparallelstrahl / Oberer Randstrahl (∞) ───────────────────
    if (this.rays.parallel) {
      if (isInfinity) {
        // Oberer Randstrahl: Parallellicht (slope=0) am oberen Rand der EP
        const r = this.traceRay(xStart, epR, 0);
        list.push({ segs: r.segs, color: this.C.parallel, label: 'Oberer Randstrahl (∞)', lw: 2.0, dash: [], alpha: 0.90 });
      } else {
        // Von Objektpunkt (x₀, y₀) mit Steigung 0 → Linse biegt zu F'.
        const r = this.traceRay(this.objX, this.objH, 0);
        list.push({ segs: r.segs, color: this.C.parallel, label: 'Achsenparallelstrahl', lw: 2.0, dash: [], alpha: 0.90 });
        addVirtual(r, this.C.parallel);
      }
    }

    // ── 2. Brennpunktstrahl / Achsenstrahl (∞) ────────────────────────────
    if (this.rays.focal) {
      if (isInfinity) {
        // Achsenstrahl: Parallellicht (slope=0) durch das Linsenzentrum (y=0)
        const r = this.traceRay(xStart, 0, 0);
        list.push({ segs: r.segs, color: this.C.focal, label: 'Achsenstrahl (∞)', lw: 2.0, dash: [], alpha: 0.90 });
      } else {
        // Vom Objektpunkt durch vorderen Brennpunkt F → nach Linse achsenparallel.
        const dx    = fFront - this.objX;
        const slope = dx !== 0 ? (0 - this.objH) / dx : 0;
        const r     = this.traceRay(this.objX, this.objH, slope);
        list.push({ segs: r.segs, color: this.C.focal, label: 'Brennpunktstrahl', lw: 2.0, dash: [], alpha: 0.90 });
        addVirtual(r, this.C.focal);
      }
    }

    // ── 3. Hauptstrahl / Unterer Randstrahl (∞) ───────────────────────────
    if (this.rays.central) {
      if (isInfinity) {
        // Unterer Randstrahl: Parallellicht (slope=0) am unteren Rand der EP
        const r = this.traceRay(xStart, -epR, 0);
        list.push({ segs: r.segs, color: this.C.central, label: 'Unterer Randstrahl (∞)', lw: 2.0, dash: [], alpha: 0.90 });
      } else {
        // Für dünne Linse unabgelenkt → klassischer Bildkonstruktionsstrahl.
        const dx    = L0.x - this.objX;
        const slope = dx !== 0 ? (0 - this.objH) / dx : 0;
        const r     = this.traceRay(this.objX, this.objH, slope);
        list.push({ segs: r.segs, color: this.C.central, label: 'Hauptstrahl (opt. Zentrum)', lw: 2.0, dash: [], alpha: 0.90 });
        addVirtual(r, this.C.central);
      }
    }

    // ── 4. Axialer Öffnungsstrahl (Randstrahl) ────────────────────────────
    // Endlicher Abstand: vom achsnahen Objektpunkt (y=0) durch ±Rand der EP.
    // Unendlich: axiale Randstrahlen slope=0 bei ±epR (identisch zu Strahlen 1+3,
    //            aber als separate Strahlgruppe für die EP-Öffnungsdiagnose nutzbar).
    if (this.rays.marginal) {
      if (isInfinity) {
        const rP = this.traceRay(xStart,  epR, 0);
        const rM = this.traceRay(xStart, -epR, 0);
        list.push({ segs: rP.segs, color: this.C.marginal, label: 'Axial-Randstrahl oben (∞)', lw: 1.8, dash: [],    alpha: 0.90 });
        list.push({ segs: rM.segs, color: this.C.marginal, label: 'Axial-Randstrahl unten (∞)', lw: 1.8, dash: [4,3], alpha: 0.80 });
      } else {
        // Strahlen vom achsnahen Objektpunkt durch den Rand der EINTRITTSPUPILLE.
        const dx     = epX - this.objX;
        const slopeP = dx !== 0 ?  epR / dx : 0;
        const slopeM = dx !== 0 ? -epR / dx : 0;
        const rP = this.traceRay(this.objX, 0, slopeP);
        const rM = this.traceRay(this.objX, 0, slopeM);
        list.push({ segs: rP.segs, color: this.C.marginal, label: 'Axialer Öffnungsstrahl (+)', lw: 1.8, dash: [],    alpha: 0.90 });
        list.push({ segs: rM.segs, color: this.C.marginal, label: 'Axialer Öffnungsstrahl (−)', lw: 1.8, dash: [4,3], alpha: 0.80 });
      }
    }

    // ── 5. Blendenhauptstrahl ─────────────────────────────────────────────
    // Endlicher Abstand: vom außeraxialen Objektpunkt durch Zentrum der EP.
    // Unendlich: Strahl mit Feldwinkel ω, der durch das EP-Zentrum (y=0 bei epX) geht.
    //   ω = −objH · D_Obj (objH dient als Feldmaß: Bildhöhe bei f'_Obj).
    //   Geht von links durch EP-Zentrum → definiert den außeraxialen Bildwinkel.
    if (this.rays.chief) {
      if (isInfinity) {
        // y am Startpunkt so wählen, dass der Strahl bei epX durch y=0 geht:
        // 0 = yAtStart + infOmega*(epX - xStart)  →  yAtStart = infOmega*(xStart - epX)
        // Bei infOmega<0 und xStart<epX: yAtStart = (−)*(−) = positiv  → Strahl von oben-links
        const yAtStart = infOmega * (xStart - epX);
        const r = this.traceRay(xStart, yAtStart, infOmega);
        list.push({ segs: r.segs, color: this.C.chief, label: 'Blendenhauptstrahl (∞)', lw: 2.0, dash: [6,4], alpha: 0.90 });
        addApExt(r, this.C.chief);
      } else {
        // Vom außeraxialen Objektpunkt durch das Zentrum der EINTRITTSPUPILLE.
        const dx    = epX - this.objX;
        const slope = dx !== 0 ? (0 - this.objH) / dx : 0;
        const r     = this.traceRay(this.objX, this.objH, slope);
        list.push({ segs: r.segs, color: this.C.chief, label: 'Blendenhauptstrahl', lw: 2.0, dash: [6,4], alpha: 0.90 });
      }
    }

    // ── 6. Schiefer Öffnungsstrahl ────────────────────────────────────────
    // Endlicher Abstand: vom außeraxialen Objektpunkt durch den ±Rand der EP.
    // Unendlich: Parallelbündel mit Feldwinkel ω, begrenzt durch ±epR an der EP.
    //   Zeigt den außeraxialen Kegel, der durch die Aperturblende begrenzt wird.
    if (this.rays.oblique) {
      if (isInfinity) {
        // Hauptstrahlhöhe bei xStart: gleiche Herleitung wie beim Blendenhauptstrahl
        const yChief   = infOmega * (xStart - epX);
        const rU = this.traceRay(xStart, yChief + epR, infOmega);
        const rD = this.traceRay(xStart, yChief - epR, infOmega);
        list.push({ segs: rU.segs, color: this.C.oblique, label: 'Schiefer Öffnungsstrahl oben (∞)', lw: 1.8, dash: [],    alpha: 0.90 });
        list.push({ segs: rD.segs, color: this.C.oblique, label: 'Schiefer Öffnungsstrahl unten (∞)', lw: 1.8, dash: [4,3], alpha: 0.80 });
        addApExt(rU, this.C.oblique);
        addApExt(rD, this.C.oblique);
      } else {
        // Vom außeraxialen Objektpunkt durch den oberen/unteren Rand der EP.
        const dx     = epX - this.objX;
        const slopeU = dx !== 0 ? ( epR - this.objH) / dx : 0;
        const slopeD = dx !== 0 ? (-epR - this.objH) / dx : 0;
        const rU = this.traceRay(this.objX, this.objH, slopeU);
        const rD = this.traceRay(this.objX, this.objH, slopeD);
        list.push({ segs: rU.segs, color: this.C.oblique, label: 'Schiefer Öffnungsstrahl (oben)', lw: 1.8, dash: [],    alpha: 0.90 });
        list.push({ segs: rD.segs, color: this.C.oblique, label: 'Schiefer Öffnungsstrahl (unten)', lw: 1.8, dash: [4,3], alpha: 0.80 });
      }
    }

    return list;
  }

  // ── Eintrittspupille bestimmen ─────────────────────────────────────────────
  // Gibt { x, radius } der Eintrittspupille zurück (Bild der Aperturblende
  // durch alle Linsen, die sich vor der Blende befinden).
  // Bei Blende = Linse (kein separater Stop) → Eintrittspupille = Linse selbst.
  findEntrancePupil() {
    const sortedStops  = [...this.stops].sort((a, b) => a.x - b.x);
    const sortedLenses = [...this.lenses].sort((a, b) => a.x - b.x);
    if (sortedStops.length === 0) {
      // Keine Blende → Eintrittspupille = erste Linse
      const L = sortedLenses[0];
      return L ? { x: L.x, radius: L.aperture || 0.035 } : null;
    }
    const stop = sortedStops[0];
    // Linsen VOR der Blende (in umgekehrter Reihenfolge für Rückwärts-Abbildung)
    const lensesBefore = sortedLenses.filter(l => l.x < stop.x).reverse();
    if (lensesBefore.length === 0) {
      // Keine Linse vor der Blende → EP = Blende selbst
      return { x: stop.x, radius: stop.radius };
    }
    // Bild des Blendenzentrums RÜCKWÄRTS durch die vorangehenden Linsen.
    // Die Aperturblende ist hier das (vorhandene) BILD; gesucht ist der zugehörige
    // Gegenstand im Objektraum. Umstellung von 1/a' − 1/a = D ergibt 1/a = 1/a' − D.
    let imgX = stop.x, imgR = stop.radius;
    for (const lens of lensesBefore) {
      const d = imgX - lens.x;            // aktuelle Bildweite (Bild rechts der Linse, d>0)
      const D = lens.power;
      if (D === 0 || d === 0) continue;
      const denom = (1 / d) - D;          // 1/a = 1/a' − D
      if (Math.abs(denom) < 1e-9) {       // Blende in Brennebene → EP im Unendlichen
        imgX = lens.x - 1e6; imgR = Infinity; break;
      }
      const a = 1 / denom;                // Gegenstandsweite (kann virtuell, a<0 sein)
      imgX = lens.x + a;
      imgR = Math.abs(imgR * (a / d));    // Rückwärts-Vergrößerung β = a/a'
    }
    return { x: imgX, radius: imgR };
  }

  // ── Austrittspupille bestimmen ─────────────────────────────────────────────
  findExitPupil() {
    const sortedStops  = [...this.stops].sort((a, b) => a.x - b.x);
    const sortedLenses = [...this.lenses].sort((a, b) => a.x - b.x);
    if (sortedStops.length === 0) {
      const L = sortedLenses[0];
      return L ? { x: L.x, radius: L.aperture || 0.035 } : null;
    }
    const stop = sortedStops[0];
    const lensesAfter = sortedLenses.filter(l => l.x > stop.x);
    if (lensesAfter.length === 0) {
      return { x: stop.x, radius: stop.radius };
    }
    let imgX = stop.x, imgR = stop.radius;
    for (const lens of lensesAfter) {
      const a  = imgX - lens.x;
      const D  = lens.power;
      if (D === 0 || a === 0) continue;
      const ap = 1 / (D + 1/a);
      const m  = ap / a;
      imgX = lens.x + ap;
      imgR = Math.abs(imgR * m);
    }
    return { x: imgX, radius: imgR };
  }

  // ── Systemkardinalpunkte (Hauptebenen & Brennpunkte des Gesamtsystems) ─────
  // Paraxiale Bestimmung über einen achsenparallelen Eintrittsstrahl (y=1, u=0):
  //   bildseitig (F', H')  aus Vorwärtsdurchlauf,
  //   objektseitig (F, H)  aus Durchlauf des gespiegelten Systems.
  // Gibt null zurück bei < 2 Linsen oder afokalem System (austretendes Bündel parallel).
  _cardinalImageSide(lensesAsc) {
    let y = 1, u = 0, prevX = lensesAsc[0].x;
    for (const L of lensesAsc) {
      y += u * (L.x - prevX);
      prevX = L.x;
      const f_m = L.power !== 0 ? 1 / L.power : Infinity;
      u -= y / f_m;
    }
    const xL = prevX;
    if (Math.abs(u) < 1e-12) return null;        // afokal → kein endlicher Brennpunkt
    return { xF: xL - y / u, xH: xL + (1 - y) / u, f: -1 / u };
  }

  // Marschiert einen paraxialen Strahl (y0, u0) ab der ersten Linsenebene durch
  // alle Linsen und gibt den Austrittszustand {y, u} zurück.
  _marchParaxial(lensesAsc, y0, u0) {
    let y = y0, u = u0, prevX = lensesAsc[0].x;
    for (const L of lensesAsc) {
      y += u * (L.x - prevX);
      prevX = L.x;
      const f_m = L.power !== 0 ? 1 / L.power : Infinity;
      u -= y / f_m;
    }
    return { y, u };
  }

  // Winkelvergrößerung Γ' eines afokalen Systems (Fernrohr): Verhältnis von
  // Austritts- zu Eintrittswinkel. Für nicht-afokale Systeme nicht definiert → null.
  systemAngularMag() {
    const asc = [...this.lenses].sort((a, b) => a.x - b.x);
    if (asc.length < 2) return null;
    const img = this._cardinalImageSide(asc);
    if (img) return null;                       // nicht afokal → keine reine Winkelvergrößerung
    const out = this._marchParaxial(asc, 0, 1); // achsdurchstoßender Strahl, Einheitssteigung
    return Math.abs(out.u) > 1e-9 ? out.u : null;
  }

  systemCardinalPoints() {
    const asc = [...this.lenses].sort((a, b) => a.x - b.x);
    if (asc.length < 2) return null;
    const img = this._cardinalImageSide(asc);
    if (!img) return { afocal: true };
    // Objektseite: System spiegeln (x → −x), erneut bildseitig auswerten, zurückmappen.
    const mir = asc.map(L => ({ x: -L.x, power: L.power })).sort((a, b) => a.x - b.x);
    const obj = this._cardinalImageSide(mir);
    return {
      Fp:  img.xF,  Hp: img.xH,  fEff: img.f,
      F:   obj ? -obj.xF : null,
      H:   obj ? -obj.xH : null,
      afocal: false,
    };
  }

  // ── Feldwinkel für Unendlich-Strahlen (vignettierungsbegrenzt) ─────────────
  // Liefert den BETRAG des Feldwinkels ω so, dass das außeraxiale Bündel
  // (Hauptstrahl durch EP-Zentrum ± Öffnungsstrahlen am EP-Rand) durch ALLE
  // Linsen-/Blendenaperturen des Systems passt. Greift keine Apertur, wird ein
  // moderater, gut sichtbarer Standardwinkel zurückgegeben.
  _infinityFieldAngle(xStart, epX, epR) {
    const sorted = [...this.lenses].sort((a, b) => a.x - b.x);
    if (sorted.length === 0) return 0.05;

    // Paraxialer Marsch eines Strahls (y0, slope0) ab xStart;
    // liefert die Strahlhöhe an jeder Linsenebene.
    const march = (y0, slope0) => {
      let x = xStart, y = y0, slope = slope0;
      const hgt = [];
      for (const lens of sorted) {
        if (lens.x > x + 1e-9) { y += slope * (lens.x - x); x = lens.x; }
        hgt.push(y);
        const f_m = lens.power !== 0 ? 1.0 / lens.power : Infinity;
        slope -= y / f_m;
      }
      return hgt;
    };

    // Axialer Randstrahl (slope 0 am EP-Rand) → Höhen-Einhüllende |m| je Ebene.
    const mHt = march(epR, 0);
    // Einheits-Hauptstrahl (ω = 1) durch das EP-Zentrum → Hebel c je Ebene.
    const cHt = march(xStart - epX, 1);

    // Aperturradius je Linsenebene (Linsenapertur ∧ ggf. deckungsgleiche Blende).
    const stopRadiusAt = (x) => {
      let r = Infinity;
      for (const s of this.stops) if (Math.abs(s.x - x) < 1e-6) r = Math.min(r, s.radius);
      return r;
    };

    let omegaMax = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      const lensAper = (sorted[i].aperture > 0) ? sorted[i].aperture : Infinity;
      const aper = Math.min(lensAper, stopRadiusAt(sorted[i].x));
      if (!isFinite(aper)) continue;
      const c = Math.abs(cHt[i]);
      if (c < 1e-6) continue;                       // Hauptstrahl ohne Hebel (z. B. Blendenebene)
      const margin = aper - Math.abs(mHt[i]);       // Restöffnung nach Abzug des axialen Bündels
      if (margin <= 0) continue;                    // axiales Bündel füllt Apertur bereits
      omegaMax = Math.min(omegaMax, margin / c);
    }

    if (!isFinite(omegaMax)) {
      // Kein Aperturlimit → moderater Standardwinkel, an Systemgröße orientiert.
      const f0 = sorted[0].power !== 0 ? Math.abs(1 / sorted[0].power) : 0.1;
      return Math.max(0.02, Math.min(0.08, epR / Math.max(f0, 0.02)));
    }
    // 80 % der Vignettierungsgrenze, auf einen gut sichtbaren Bereich geklemmt.
    return Math.max(0.006, Math.min(0.12, 0.80 * omegaMax));
  }

  // ── Haupt-Draw-Methode ────────────────────────────────────────────────────
  draw() {
    const dpr = window.devicePixelRatio || 1;
    this.dpr  = dpr;

    // Canvas-Puffer auf physische Pixelgröße bringen (nur wenn nötig).
    // Fallback 800/400 verhindert, dass der Canvas auf 0 kollabiert (z.B. bei Tab-Wechsel).
    const cssW = this.canvas.offsetWidth  || (this.canvas.width  / dpr) || 800;
    const cssH = this.canvas.offsetHeight || (this.canvas.height / dpr) || 400;
    if (cssW > 10 && cssH > 10 &&
        (this.canvas.width  !== Math.round(cssW * dpr) ||
         this.canvas.height !== Math.round(cssH * dpr))) {
      this.canvas.width  = Math.round(cssW * dpr);
      this.canvas.height = Math.round(cssH * dpr);
    }

    const ctx = this.ctx;
    const W   = this.canvas.width  / dpr;  // logische Breite  (CSS-Pixel)
    const H   = this.canvas.height / dpr;  // logische Höhe    (CSS-Pixel)

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.C.bg;
    ctx.fillRect(0, 0, W, H);

    this._drawGrid(W, H);
    this._drawAxis(W, H);
    this._drawLenses(W, H);
    this._drawStops(H);
    this._drawPupils(W, H);   // Eintrittspupille / Austrittspupille (Blendenbilder)
    this._drawFocalPoints(W);
    this._drawSystemCardinals(W, H);   // Systemhauptebenen H/H' & Systembrennpunkte F/F'
    this._drawObject(W, H);
    this._drawRays();
    this._drawImage(W, H);
    this._drawLegend(W, H);

    ctx.restore();
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  _drawGrid(W, H) {
    const ctx = this.ctx;
    ctx.strokeStyle = this.C.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);

    const step = 0.05; // 0,05 m = 50 mm Gitterabstand
    const x0 = Math.ceil(this.vp.xMin / step) * step;
    for (let wx = x0; wx <= this.vp.xMax; wx += step) {
      const wxR = Math.round(wx * 1000) / 1000; // Floating-Point-Fehler vermeiden
      const px = this.cx(wxR);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
      // Label
      if (Math.abs(wxR) > 0.001) {
        ctx.fillStyle = this.C.gridLabel;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(wxR.toFixed(2).replace('.', ',') + ' m', px, H - 4);
      }
    }

    const yStep = 0.02; // 0,02 m = 20 mm
    const y0 = Math.ceil(-this.vp.yHalf / yStep) * yStep;
    for (let wy = y0; wy <= this.vp.yHalf; wy += yStep) {
      if (Math.abs(wy) < 1) continue;
      const py = this.cy(wy);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }
  }

  // ── Optische Achse ────────────────────────────────────────────────────────
  _drawAxis(W, H) {
    const ctx = this.ctx;
    const py  = this.cy(0);

    // Dicke Achslinie
    ctx.strokeStyle = this.C.axisBright;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W - 20, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pfeil am Ende
    ctx.fillStyle = this.C.axisArrow;
    ctx.beginPath();
    ctx.moveTo(W - 10, py);
    ctx.lineTo(W - 22, py - 5);
    ctx.lineTo(W - 22, py + 5);
    ctx.closePath();
    ctx.fill();

    // Achsen-Label
    ctx.fillStyle = this.C.axisArrow;
    ctx.font = 'italic 13px serif';
    ctx.textAlign = 'left';
    ctx.fillText('z', W - 8, py - 6);

    // Null-Markierung
    ctx.fillStyle = this.C.gridLabel;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', this.cx(0), H - 4);
  }

  // ── Linsen ────────────────────────────────────────────────────────────────
  _drawLenses(W, H) {
    const ctx = this.ctx;
    for (const lens of this.lenses) {
      const px  = this.cx(lens.x);
      const ap  = lens.aperture || 0.035;   // Apertur in Metern
      const pyT = this.cy( ap);
      const pyB = this.cy(-ap);
      const pyC = this.cy(0);

      // Glow
      ctx.save();
      ctx.strokeStyle = this.C.lensGlow;
      ctx.lineWidth   = 8;
      ctx.beginPath(); ctx.moveTo(px, pyT); ctx.lineTo(px, pyB); ctx.stroke();
      ctx.restore();

      // Hauptlinie
      ctx.strokeStyle = this.C.lens;
      ctx.lineWidth   = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(px, pyT); ctx.lineTo(px, pyB); ctx.stroke();

      // Pfeile — Sammellinse: auswärts; Zerstreuungslinse: einwärts
      const dir = lens.power >= 0 ? 1 : -1;
      this._arrowHead(px, pyT,  0, -dir * 12, this.C.lens);
      this._arrowHead(px, pyB,  0,  dir * 12, this.C.lens);

      // Label Box
      const f_m  = lens.power !== 0 ? (1 / lens.power).toFixed(3).replace('.', ',') : '∞';
      const sign  = lens.power >= 0 ? '+' : '';
      const label1 = `${sign}${lens.power.toFixed(2)} dpt`;
      const label2 = `f' = ${f_m} m`;
      ctx.fillStyle = 'rgba(15,23,42,0.82)';
      ctx.beginPath();
      const bw = 96, bh = 34, bx = px - bw/2, by = pyT - bh - 8;
      if (by > 2) {
        ctx.roundRect(bx, by, bw, bh, 5);
        ctx.fill();
        ctx.fillStyle = this.C.lens;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label1, px, by + 14);
        ctx.fillStyle = this.C.lensLabel;
        ctx.font = '10px monospace';
        ctx.fillText(label2, px, by + 28);
      } else {
        // Label unten wenn kein Platz oben
        ctx.roundRect(bx, pyB + 8, bw, bh, 5);
        ctx.fill();
        ctx.fillStyle = this.C.lens;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label1, px, pyB + 22);
        ctx.fillStyle = this.C.lensLabel;
        ctx.font = '10px monospace';
        ctx.fillText(label2, px, pyB + 36);
      }
    }
  }

  // ── Blenden ───────────────────────────────────────────────────────────────
  _drawStops(H) {
    const ctx = this.ctx;
    for (const stop of this.stops) {
      const px  = this.cx(stop.x);
      const pyT = this.cy( stop.radius);
      const pyB = this.cy(-stop.radius);

      // Opake Blendenbacken (vom Rahmen bis zur Öffnung), runde Kappen
      ctx.strokeStyle = this.C.aperture;
      ctx.lineWidth   = 4;
      ctx.lineCap     = 'round';
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(px, 0);   ctx.lineTo(px, pyT); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, pyB); ctx.lineTo(px, H);   ctx.stroke();
      ctx.lineCap     = 'butt';

      // Korrektes Aperturblenden-Symbol: nach innen weisende Spitzen an der Öffnung
      this._apertureMarks(px, pyT, pyB, this.C.aperture, true);

      // Maß-Label oberhalb der oberen Backe
      ctx.fillStyle = this.C.aperture;
      ctx.font      = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Ø ${(stop.radius*2*1000).toFixed(1).replace('.', ',')} mm`, px, pyT - 10);
    }
  }

  // ── Aperturblenden-Symbol: nach innen (zur Achse) weisende Markierungen ─────
  // Wird von Aperturblenden UND von den Blendenbildern (EP/AP) genutzt, damit
  // die Pupillen klar als „Bilder der Blende" lesbar sind.
  // filled=true → ausgefüllte Dreiecke (reale Blende); false → offene Häkchen (Pupille).
  _apertureMarks(px, pyT, pyB, color, filled) {
    const ctx = this.ctx;
    const s   = 6;   // Größe der Marke
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = 1.6;
    ctx.setLineDash([]);
    // obere Marke zeigt nach unten (zur Achse), untere nach oben
    for (const [py, dir] of [[pyT, 1], [pyB, -1]]) {
      ctx.beginPath();
      ctx.moveTo(px - s, py - dir * s);
      ctx.lineTo(px,      py);
      ctx.lineTo(px + s, py - dir * s);
      if (filled) { ctx.closePath(); ctx.fill(); }
      else        { ctx.stroke(); }
    }
    ctx.restore();
  }

  // ── Eintrittspupille & Austrittspupille (Blendenbilder) ──────────────────
  // Werden nur gezeichnet, wenn eine explizite Aperturblende vorhanden ist
  // (sonst fällt die Pupille mit der Linse zusammen und wäre ein Duplikat).
  _drawPupils(W, H) {
    if (this.stops.length === 0) return;   // keine separate Blende → kein Blendenbild nötig
    const ctx = this.ctx;

    const ep = this.findEntrancePupil();
    const xp = this.findExitPupil();

    const drawPupil = (pupil, label, color) => {
      if (!pupil || !isFinite(pupil.x) || !isFinite(pupil.radius)) return;
      const px  = this.cx(pupil.x);
      const logW = W ?? (this.canvas.width / (this.dpr || 1));
      if (px < -20 || px > logW + 20) return;
      const pyT = this.cy( pupil.radius);
      const pyB = this.cy(-pupil.radius);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(px, pyT); ctx.lineTo(px, pyB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.95;

      // Blenden-Symbol (offene Häkchen) → Pupille = Bild der Aperturblende
      this._apertureMarks(px, pyT, pyB, color, false);

      // Label UNTERHALB der Pupille (vermeidet Überlappung mit Linsen-Labels oben)
      ctx.font        = '10px sans-serif';
      ctx.textAlign   = 'center';
      ctx.fillStyle   = color;
      ctx.globalAlpha = 0.9;
      ctx.fillText(label, px, pyB + 16);
      ctx.restore();
    };

    // Eintrittspupille (EP): lila-blau, gestrichelt
    drawPupil(ep, 'EP', '#a78bfa');
    // Austrittspupille (AP): orange-gelb, gestrichelt
    drawPupil(xp, 'AP', '#fbbf24');
  }

  // ── Brennpunkte ──────────────────────────────────────────────────────────
  _drawFocalPoints(W) {
    const ctx = this.ctx;
    const logW = W ?? (this.canvas.width / (this.dpr || 1));
    for (const lens of this.lenses) {
      if (lens.power === 0) continue;
      const f_m  = 1.0 / lens.power;
      const fF  = lens.x - f_m; // vorderer Brennpunkt F
      const fFp = lens.x + f_m; // hinterer Brennpunkt F'

      for (const [fx, label] of [[fF, 'F'], [fFp, "F′"]]) {
        const px = this.cx(fx);
        const py = this.cy(0);
        if (px < -20 || px > logW + 20) continue;

        // Kreuz-Symbol
        ctx.strokeStyle = this.C.fPoint;
        ctx.lineWidth   = 1.8;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5);
        ctx.moveTo(px + 5, py - 5); ctx.lineTo(px - 5, py + 5);
        ctx.stroke();

        // Dot
        ctx.fillStyle = this.C.fPoint;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2); ctx.fill();

        // Label
        ctx.font = 'italic bold 13px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.C.fPoint;
        ctx.fillText(label, px, py + 18);
      }
    }
  }

  // ── Systemhauptebenen (H, H') & Systembrennpunkte (F, F') ──────────────────
  // Nur für Mehrlinsensysteme. Hauptebenen als senkrechte Strichlinien,
  // Systembrennpunkte als Rauten auf der optischen Achse (Teal, klar abgesetzt
  // von den magentafarbenen Einzellinsen-Brennpunkten).
  _drawSystemCardinals(W, Hpx) {
    if (!this.showCardinals || this.lenses.length < 2) return;
    const sc = this.systemCardinalPoints();
    if (!sc || sc.afocal) return;

    const ctx  = this.ctx;
    const logW = W ?? (this.canvas.width / (this.dpr || 1));
    const col  = this.C.sysPlane;
    const yTop = this.cy(this.vp.yHalf * 0.82);
    const yBot = this.cy(-this.vp.yHalf * 0.82);
    const yAx  = this.cy(0);

    // ── Hauptebenen H (objektseitig) und H' (bildseitig) ───────────────────
    for (const [x, label] of [[sc.H, 'H'], [sc.Hp, "H′"]]) {
      if (x == null || !isFinite(x)) continue;
      const px = this.cx(x);
      if (px < -40 || px > logW + 40) continue;

      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth   = 1.4;
      ctx.globalAlpha = 0.85;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(px, yTop); ctx.lineTo(px, yBot); ctx.stroke();
      ctx.setLineDash([]);

      // Label-Badge oben
      ctx.globalAlpha = 1;
      ctx.font        = 'italic bold 13px serif';
      ctx.textAlign   = 'center';
      ctx.fillStyle   = 'rgba(15,23,42,0.85)';
      const lw = 20;
      ctx.beginPath(); ctx.roundRect(px - lw/2, yTop - 18, lw, 16, 4); ctx.fill();
      ctx.fillStyle   = col;
      ctx.fillText(label, px, yTop - 5);
      ctx.restore();
    }

    // ── Systembrennpunkte F und F' (Rauten auf der Achse) ──────────────────
    for (const [x, label] of [[sc.F, 'F'], [sc.Fp, "F′"]]) {
      if (x == null || !isFinite(x)) continue;
      const px = this.cx(x);
      if (px < -40 || px > logW + 40) continue;

      ctx.save();
      ctx.fillStyle   = col;
      ctx.strokeStyle = col;
      // Raute
      ctx.beginPath();
      ctx.moveTo(px, yAx - 6); ctx.lineTo(px + 6, yAx);
      ctx.lineTo(px, yAx + 6); ctx.lineTo(px - 6, yAx);
      ctx.closePath(); ctx.fill();

      ctx.font      = 'italic bold 13px serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, px, yAx - 12);
      ctx.font      = '9px sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText('System', px, yAx + 22);
      ctx.restore();
    }

    // ── f'-Hinweis (Systembrennweite) ──────────────────────────────────────
    if (isFinite(sc.fEff) && sc.Hp != null) {
      ctx.save();
      ctx.fillStyle = col;
      ctx.font      = '10px monospace';
      ctx.textAlign = 'left';
      ctx.globalAlpha = 0.9;
      ctx.fillText(`f'_sys = ${sc.fEff.toFixed(3).replace('.', ',')} m`, 10, 16);
      ctx.restore();
    }
  }

  // ── Objekt ────────────────────────────────────────────────────────────────
  _drawObject(W, H) {
    const ctx = this.ctx;

    // Objekt im Unendlichen → Symbol am linken Rand
    if (this.objX < -600) {
      const py = this.cy(this.objH);
      ctx.fillStyle   = this.C.obj;
      ctx.font        = 'bold 15px sans-serif';
      ctx.textAlign   = 'left';
      ctx.fillText('∞', 8, py - 2);
      ctx.font = '10px monospace';
      ctx.fillText('G (∞)', 8, py + 14);
      // Horizontaler Pfeil auf Objekthöhe
      ctx.strokeStyle = this.C.obj;
      ctx.lineWidth   = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(8, py); ctx.lineTo(50, py); ctx.stroke();
      ctx.setLineDash([]);
      this._arrowHead(8, py, 42, 0, this.C.obj);
      return;
    }

    const px     = this.cx(this.objX);
    const pyBase = this.cy(0);
    const pyTip  = this.cy(this.objH);

    ctx.strokeStyle = this.C.obj;
    ctx.lineWidth   = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(px, pyBase);
    ctx.lineTo(px, pyTip);
    ctx.stroke();
    this._arrowHead(px, pyBase, 0, pyTip - pyBase, this.C.obj);

    ctx.fillStyle = this.C.obj;
    ctx.font      = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G', px, pyTip - 10);
    ctx.font = '10px monospace';
    ctx.fillText(`a = ${this.objX.toFixed(3).replace('.', ',')} m`, px, pyBase + 16);
  }

  // ── Strahlen zeichnen ─────────────────────────────────────────────────────
  _drawRays() {
    const ctx  = this.ctx;
    const list = this.buildRayList();

    for (const ray of list) {
      ctx.strokeStyle = ray.color;
      ctx.lineWidth   = ray.lw;
      ctx.setLineDash(ray.dash ?? []);
      ctx.globalAlpha = ray.alpha ?? 0.90;

      for (const seg of ray.segs) {
        const x1c = this.cx(seg.x1), y1c = this.cy(seg.y1);
        const x2c = this.cx(seg.x2), y2c = this.cy(seg.y2);
        ctx.beginPath();
        ctx.moveTo(x1c, y1c);
        ctx.lineTo(x2c, y2c);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }

  // ── Bild ─────────────────────────────────────────────────────────────────
  _drawImage(W, H) {
    const ctx  = this.ctx;
    const logW = W ?? (this.canvas.width / (this.dpr || 1));
    const img  = this.findImage();
    if (!img) return;
    // Afokales System (Fernrohr): Bild im Unendlichen, keine Bildebene.
    if (img.afocal) {
      ctx.save();
      ctx.fillStyle = this.C.img || '#22d3ee';
      ctx.font      = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('B′ → ∞  (afokal)', logW - 10, 18);
      ctx.restore();
      return;
    }
    if (!isFinite(img.x) || !isFinite(img.y)) return;
    if (Math.abs(img.y) > this.vp.yHalf * 2.5) return;

    const px    = this.cx(img.x);
    const pyB   = this.cy(0);
    const pyT   = this.cy(img.y);
    const color = img.real ? this.C.img : this.C.imgVirt;

    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.setLineDash(img.real ? [] : [5, 4]);
    ctx.beginPath();
    ctx.moveTo(px, pyB);
    ctx.lineTo(px, pyT);
    ctx.stroke();
    ctx.setLineDash([]);
    this._arrowHead(px, pyB, 0, pyT - pyB, color);

    ctx.fillStyle = color;
    ctx.font      = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B', px, Math.min(pyT, pyB) - 10);

    // Info-Box (korrekte optische Bezeichnungen, vorzeichenrichtig, in Metern)
    const lastLensX = [...this.lenses].sort((a,b)=>a.x-b.x).slice(-1)[0]?.x ?? 0;
    const aObj    = this.objX < -6 ? '∞' : (this.objX - lastLensX).toFixed(3).replace('.', ',') + ' m';
    const apStr   = `a' = ${img.b.toFixed(3).replace('.', ',')} m${!img.real ? ' (virt.)' : ''}`;
    const aStr    = `a  = ${aObj}`;
    const ypStr   = `y' = ${img.y.toFixed(4).replace('.', ',')} m`;
    const betaStr = `β' = ${isFinite(img.beta) ? img.beta.toFixed(3) : '∞'}`;
    const bx2 = Math.min(px + 8, logW - 152);
    const by2 = Math.max(4, pyB - 72);
    ctx.fillStyle = 'rgba(15,23,42,0.88)';
    ctx.beginPath();
    ctx.roundRect(bx2, by2, 144, 68, 5);
    ctx.fill();
    ctx.fillStyle  = color;
    ctx.font       = '11px monospace';
    ctx.textAlign  = 'left';
    ctx.fillText(apStr,   bx2 + 8, by2 + 17);
    ctx.fillText(aStr,    bx2 + 8, by2 + 31);
    ctx.fillText(ypStr,   bx2 + 8, by2 + 45);
    ctx.fillText(betaStr, bx2 + 8, by2 + 59);
  }

  // ── Legende ───────────────────────────────────────────────────────────────
  _drawLegend(W, H) {
    const ctx   = this.ctx;
    const items = [];
    const rl    = this.rays;
    const inf   = this.objX < -600;   // Objekt im Unendlichen?
    if (rl.parallel) items.push({ c: this.C.parallel, t: inf ? 'Oberer Randstrahl (∞)'      : 'Achsenparallelstrahl',      d: [] });
    if (rl.focal)    items.push({ c: this.C.focal,    t: inf ? 'Achsenstrahl (∞)'            : 'Brennpunktstrahl',          d: [] });
    if (rl.central)  items.push({ c: this.C.central,  t: inf ? 'Unterer Randstrahl (∞)'     : 'Hauptstrahl (opt. Zentrum)', d: [] });
    if (rl.marginal) items.push({ c: this.C.marginal, t: inf ? 'Axiale Randstrahlen (∞)'    : 'Axialer Öffnungsstrahl',    d: [] });
    if (rl.chief)    items.push({ c: this.C.chief,    t: inf ? 'Blendenhauptstrahl (∞, ω)'  : 'Blendenhauptstrahl',        d: [6,4] });
    if (rl.oblique)  items.push({ c: this.C.oblique,  t: inf ? 'Schiefer Öffnungsstrahl (∞)': 'Schiefer Öffnungsstrahl',  d: [] });
    if (rl.virtual && !inf) items.push({ c: '#94a3b8', t: 'Virtuelle Verlängerung',          d: [5,5] });
    if (this.stops.length > 0) {
      items.push({ c: '#a78bfa', t: 'EP Eintrittspupille', d: [4,4] });
      items.push({ c: '#fbbf24', t: 'AP Austrittspupille', d: [4,4] });
    }
    if (this.showCardinals && this.lenses.length >= 2) {
      const sc = this.systemCardinalPoints();
      if (sc && !sc.afocal) items.push({ c: this.C.sysPlane, t: 'System H/H′ · F/F′', d: [6,4] });
    }
    if (!items.length) return;

    const pad = 10, lH = 18;
    const bW  = 185, bH = items.length * lH + pad * 2;
    const bX  = pad, bY = H - bH - pad;

    ctx.fillStyle = 'rgba(15,23,42,0.88)';
    ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 6); ctx.fill();

    items.forEach((it, i) => {
      const ly = bY + pad + i * lH + lH * 0.55;
      ctx.strokeStyle = it.c;
      ctx.lineWidth   = 2;
      ctx.setLineDash(it.d);
      ctx.beginPath(); ctx.moveTo(bX + 8, ly); ctx.lineTo(bX + 28, ly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle   = it.c;
      ctx.font        = '11px sans-serif';
      ctx.textAlign   = 'left';
      ctx.fillText(it.t, bX + 34, ly + 4);
    });
  }

  // ── Hilfsmethode: Pfeilspitze ─────────────────────────────────────────────
  _arrowHead(x, y, dx, dy, color) {
    const ctx = this.ctx;
    const L   = 10;
    const ang = Math.atan2(dy, dx);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - L * Math.cos(ang - 0.38), y + dy - L * Math.sin(ang - 0.38));
    ctx.lineTo(x + dx - L * Math.cos(ang + 0.38), y + dy - L * Math.sin(ang + 0.38));
    ctx.closePath();
    ctx.fill();
  }

  // ── Öffentliche API ───────────────────────────────────────────────────────
  addLens(x, powerDpt, aperture = 0.035) {   // x, aperture in m; powerDpt in dpt
    this.lenses.push({ x, power: powerDpt, aperture });
    this.lenses.sort((a, b) => a.x - b.x);
  }
  removeLens(i)      { this.lenses.splice(i, 1); }
  updateLens(i, obj) { Object.assign(this.lenses[i], obj); }

  addStop(x, radius = 0.025) {   // x, radius in m
    this.stops.push({ x, radius });
    this.stops.sort((a, b) => a.x - b.x);
  }
  removeStop(i) { this.stops.splice(i, 1); }

  setObject(x, h) { this.objX = x; this.objH = h; }

  setRays(cfg) { Object.assign(this.rays, cfg); }

  autoViewport() {
    const img = this.findImage();
    // Objekt im Unendlichen: Viewport beginnt links vom ersten Glas
    const objInf = this.objX < -6;
    const sortedL = [...this.lenses].sort((a, b) => a.x - b.x);
    let xMin  = objInf
      ? (sortedL.length > 0 ? sortedL[0].x - 0.18 : -0.20)
      : this.objX - 0.06;
    // Nur reelles Bild mit sinnvoller Bildweite (≤ 2 m) einbeziehen,
    // um Abflachen bei weit entfernten Bildern zu verhindern.
    const imgUsable = img && isFinite(img.x) && img.real && img.x < 2.0;
    let xMax = imgUsable ? img.x + 0.08 : 0.28;
    xMin = Math.min(xMin, -0.20);
    xMax = Math.max(xMax, 0.20);

    // Alle Linsen und Blenden müssen sichtbar sein
    if (sortedL.length > 0) {
      xMin = Math.min(xMin, sortedL[0].x - 0.12);
      xMax = Math.max(xMax, sortedL[sortedL.length - 1].x + 0.10);
    }
    for (const s of this.stops) {
      xMin = Math.min(xMin, s.x - 0.08);
      xMax = Math.max(xMax, s.x + 0.08);
    }

    // yHalf: Maßstab NUR aus optischen Elementen ableiten (nicht aus x-Spanne!),
    // damit die Zeichnung auch bei großen Bildweiten nicht flach wird.
    let yHalf = Math.max(0.055, Math.abs(this.objH) * 2.8);
    for (const l of this.lenses) if (l.aperture > yHalf) yHalf = l.aperture * 1.3;
    for (const s of this.stops)  if (s.radius   > yHalf) yHalf = s.radius   * 1.5;
    yHalf = Math.max(yHalf, 0.05);  // Mindest-Halb­höhe 50 mm

    // yCenter zurücksetzen: optische Achse wieder in Mitte
    this.vp = { xMin, xMax, yHalf, yCenter: 0 };
  }

  // ── Zoom (Mausrad oder Buttons) ────────────────────────────────────────────
  // canvasPx: x-Position im Canvas in CSS-Pixeln (Zoom-Zentrum)
  zoomAt(factor, canvasPx) {
    const W  = this.canvas.width / (this.dpr || 1);  // logische Breite
    const wx = this.vp.xMin + (canvasPx / W) * (this.vp.xMax - this.vp.xMin);
    const span = (this.vp.xMax - this.vp.xMin) * factor;
    const frac = canvasPx / W;
    this.vp.xMin  = wx - frac * span;
    this.vp.xMax  = wx + (1 - frac) * span;
    this.vp.yHalf = this.vp.yHalf * factor;
  }

  // ── Pan (Maus-Drag) ──────────────────────────────────────────────────────
  // dxPx / dyPx in CSS-Pixeln.
  // Horizontal: verschiebt xMin/xMax.
  // Vertikal:  verschiebt yCenter (optische Y-Koordinate in der Canvas-Mitte) —
  //            yHalf bleibt unverändert, d.h. der Maßstab bleibt erhalten.
  panBy(dxPx, dyPx) {
    const W      = this.canvas.width  / (this.dpr || 1);
    const H      = this.canvas.height / (this.dpr || 1);
    const scaleX = (this.vp.xMax - this.vp.xMin) / W;
    const scaleY = (2 * this.vp.yHalf) / H;
    this.vp.xMin    += -dxPx * scaleX;
    this.vp.xMax    += -dxPx * scaleX;
    this.vp.yCenter  = (this.vp.yCenter || 0) + dyPx * scaleY; // ↑ Drag → yCenter ↑
  }
}

