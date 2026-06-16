// ─── Subjektive Refraktion — Patientensimulator ──────────────────────────────
// Enthält: PatientSimulator (Visus-Simulation, Doppelwinkel-Zylindermodell)

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

/** Rundet auf 0,25-dpt-Schritte */
function roundQ(v) { return Math.round(v * 4) / 4; }

/** Logarthimisches Visusmodell aus Restrefraktion
 *  blur = |resS| + 0,4 · |resC|  (SE-gewichtet)
 *  logMAR = blur · 0.35  → VA = 10^(-logMAR)
 */
function blurToVA(residualS, residualC) {
  const blur = Math.abs(residualS) + 0.4 * Math.abs(residualC);
  return Math.max(0.02, Math.pow(10, -blur * 0.35));
}

/** Formatiert Visus für Anzeige (dt. Komma, z.B. 1,0 / 0,50) */
function fmtVA(va) {
  if (va >= 1.0) return va.toFixed(1).replace('.', ',');
  return va.toFixed(2).replace('.', ',');
}

/** Normalisiert Zylinderachse auf [0, 179]° (Periode 180°) */
function wrapAxis(deg) { return ((Math.round(deg) % 180) + 180) % 180; }

/** Formatiert Sph/Cyl/Achse als Rx-String */
function fmtRx(s, c, ax) {
  const sp = (s >= 0 ? '+' : '') + s.toFixed(2).replace('.', ',');
  const cp = (c >= 0 ? '+' : '') + c.toFixed(2).replace('.', ',');
  return `${sp} / ${cp} × ${Math.round(ax)}°`;
}

/** Generiert realistische Zufalls-Refraktion */
function generateRandomRx() {
  const sph = roundQ(Math.random() * 10 - 5);            // −5,00 … +5,00
  const cyl = roundQ(-(Math.random() * 2.75));            //  0,00 … −2,75
  const ax  = Math.round(Math.random() * 36) * 5;        // 0–180°, 5°-Schritte
  return { S: sph, C: cyl, ax: ax % 181 };
}

// ── Patient-Simulator ─────────────────────────────────────────────────────────
class PatientSimulator {
  /**
   * @param {object} trueRx  { S, C, ax } — wahre Korrektion
   * @param {number} bestVA  Bestkorrigierter Visus (default: 1.0)
   */
  constructor(trueRx, bestVA = 1.0) {
    this.trueRx = trueRx;
    this.bestVA = bestVA;
  }

  /**
   * Simulierter Visus für ein Probeglas.
   * Zylinderresidual: Vektormodell (Doppelwinkel-Methode).
   * Z_res = √( (C·cos2α − C_t·cos2α_t)² + (C·sin2α − C_t·sin2α_t)² )
   */
  getVA(rx) {
    const resS  = rx.S - this.trueRx.S;
    // Vektorielle Zylinderrestfehler im Doppelwinkelraum
    const a_rx  = (rx.ax         ?? 0) * Math.PI / 180;
    const a_tr  = (this.trueRx.ax ?? 0) * Math.PI / 180;
    const Zx    = (rx.C ?? 0) * Math.cos(2 * a_rx) - this.trueRx.C * Math.cos(2 * a_tr);
    const Zy    = (rx.C ?? 0) * Math.sin(2 * a_rx) - this.trueRx.C * Math.sin(2 * a_tr);
    const resCyl = Math.sqrt(Zx * Zx + Zy * Zy);
    const va = this.bestVA * blurToVA(resS, resCyl);
    return Math.max(0.02, Math.min(this.bestVA, va));
  }

  /**
   * Vergleich zweier Probiergläser.
   * @returns {'besser'|'gleich'|'schlechter'}
   */
  compare(rxCurrent, rxTest, threshold = 0.025) {
    const va1 = this.getVA(rxCurrent);
    const va2 = this.getVA(rxTest);
    const diff = va2 - va1;
    if (Math.abs(diff) <= threshold) return 'gleich';
    return diff > 0 ? 'besser' : 'schlechter';
  }

  /**
   * Vollständige Patientenbefragung für ein Probeglas.
   * Gibt VA + alle relevanten Vergleiche auf einmal zurück.
   */
  getFullAssessment(rx) {
    const va  = this.getVA(rx);
    const ax  = rx.ax ?? 0;
    const step = va >= 0.6 ? 0.25 : 0.50; // KRZ-Stufung
    return {
      va,
      sphMinus:    this.compare(rx, { ...rx, S: rx.S - 0.25 }),
      sphPlus:     this.compare(rx, { ...rx, S: rx.S + 0.25 }),
      cylMinus:    this.compare(rx, { ...rx, C: rx.C - 0.25 }),
      cylPlus:     this.compare(rx, { ...rx, C: rx.C + 0.25 }),
      axisLeft10:  this.compare(rx, { ...rx, ax: ax - 10 }),
      axisRight10: this.compare(rx, { ...rx, ax: ax + 10 }),
      // KZM: Achsabgleich (Stellung 1/2) — Achse in [0,179]° wrappen (Periode 180°)
      jccAxis:  this.compareJCC(
        { ...rx, C: rx.C - step, ax: wrapAxis(ax - 45) },
        { ...rx, C: rx.C + step, ax: wrapAxis(ax + 45) }
      ),
      // KZM: Stärkenabgleich (Stellung 1/2)
      jccPower: this.compareJCC(
        { ...rx, C: rx.C - step },
        { ...rx, C: rx.C + step }
      ),
    };
  }

  /**
   * Kreuzzylinder-Vergleich: '1' (Stellung 1 klarer) / '2' / 'gleich'
   * Stellung 1 = rx1, Stellung 2 = rx2
   */
  compareJCC(rx1, rx2, threshold = 0.015) {
    const va1 = this.getVA(rx1);
    const va2 = this.getVA(rx2);
    if (Math.abs(va1 - va2) <= threshold) return 'gleich';
    return va1 >= va2 ? '1' : '2';
  }
}

