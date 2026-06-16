// Augenoptik Formel-Datenbank
const FORMULAS = [

  // ─── GRUNDFORMELN ─────────────────────────────────────────────────────────
  {
    id: 'thin_lens',
    name: 'Abbildungsgleichung auf Luft reduziert',
    category: 'Allgemeine Formeln',
    formula: "1/a' = 1/a + 1/f'",
    latex: "\\dfrac{1}{a'} = \\dfrac{1}{a} + \\dfrac{1}{f'}",
    description: "Grundlegende Abbildungsgleichung für dünne Linsen in Luft (auf Luft reduziert). a ist negativ bei reellen Objekten (links der Linse), a' positiv bei reellen Bildern (rechts). f' ist die bildseitige Brennweite.",
    variables: [
      { symbol: 'fprime', name: "bildseitige Brennweite f'", unit: 'm', description: "Brennweite der Linse in Metern (positiv = Sammellinse, negativ = Zerstreuungslinse)" },
      { symbol: 'a',      name: 'Gegenstandsweite a',      unit: 'm', description: 'Abstand Gegenstand – Hauptebene H in Metern; negativ für reelle Objekte links von H' },
      { symbol: 'aprime', name: "Bildweite a'",             unit: 'm', description: "Abstand Bild – Hauptebene H' in Metern; positiv = reelles Bild rechts von H'" },
    ],
    solveFor: {
      fprime: (v) => 1 / (1/v.aprime - 1/v.a),
      a:      (v) => 1 / (1/v.aprime - 1/v.fprime),
      aprime: (v) => 1 / (1/v.a + 1/v.fprime),
    },
    tags: ['linse', 'brennweite', 'abbildung', 'gegenstandsweite', 'bildweite', 'grundformel', 'auf luft reduziert'],
  },

  {
    id: 'lensmakers',
    name: 'Linsenschleiferformel',
    category: 'Allgemeine Formeln',
    formula: '1/f = (n_L/n_M − 1) · (1/r₁ − 1/r₂)',
    latex: '\\dfrac{1}{f} = \\left(\\dfrac{n_L}{n_M} - 1\\right)\\left(\\dfrac{1}{r_1} - \\dfrac{1}{r_2}\\right)',
    description: 'Berechnet die Brennweite einer Linse aus ihren Krümmungsradien und dem Brechungsindex. Berücksichtigt das umgebende Medium.',
    variables: [
      { symbol: 'f', name: 'Brennweite', unit: 'm', description: 'Brennweite der Linse in Metern (Ergebnis dann in dpt wenn r in m)' },
      { symbol: 'n_L', name: 'Brechzahl Linse', unit: '–', description: 'Brechungsindex des Linsenmaterials (z.B. 1.5 für Glas)' },
      { symbol: 'n_M', name: 'Brechzahl Medium', unit: '–', description: 'Brechungsindex des umgebenden Mediums (1.0 für Luft)' },
      { symbol: 'r1', name: 'Krümmungsradius r₁', unit: 'm', description: 'Radius der ersten Fläche in Metern (positiv = nach rechts gewölbt)' },
      { symbol: 'r2', name: 'Krümmungsradius r₂', unit: 'm', description: 'Radius der zweiten Fläche in Metern (negativ = nach links gewölbt)' },
    ],
    solveFor: {
      f: (v) => 1 / ((v.n_L/v.n_M - 1) * (1/v.r1 - 1/v.r2)),
      n_L: (v) => v.n_M * (1/(v.f * (1/v.r1 - 1/v.r2)) + 1),
      r1: (v) => 1 / (1/(v.f * (v.n_L/v.n_M - 1)) + 1/v.r2),
    },
    tags: ['linse', 'krümmungsradius', 'brechzahl', 'linsenmacher', 'grundformel'],
  },

  {
    id: 'snell',
    name: 'Brechungsgesetz (Snell)',
    category: 'Allgemeine Formeln',
    formula: 'n₁ · sin θ₁ = n₂ · sin θ₂',
    latex: 'n_1 \\cdot \\sin\\theta_1 = n_2 \\cdot \\sin\\theta_2',
    description: 'Beschreibt die Richtungsänderung eines Lichtstrahls beim Übergang zwischen zwei Medien unterschiedlicher optischer Dichte.',
    variables: [
      { symbol: 'n1', name: 'Brechzahl Medium 1', unit: '–', description: 'Brechungsindex des ersten Mediums' },
      { symbol: 'theta1', name: 'Einfallswinkel θ₁', unit: '°', description: 'Winkel des einfallenden Strahls zur Flächennormalen' },
      { symbol: 'n2', name: 'Brechzahl Medium 2', unit: '–', description: 'Brechungsindex des zweiten Mediums' },
      { symbol: 'theta2', name: 'Brechungswinkel θ₂', unit: '°', description: 'Winkel des gebrochenen Strahls zur Flächennormalen' },
    ],
    solveFor: {
      theta2: (v) => Math.asin(v.n1 * Math.sin(v.theta1 * Math.PI/180) / v.n2) * 180/Math.PI,
      theta1: (v) => Math.asin(v.n2 * Math.sin(v.theta2 * Math.PI/180) / v.n1) * 180/Math.PI,
      n2: (v) => v.n1 * Math.sin(v.theta1 * Math.PI/180) / Math.sin(v.theta2 * Math.PI/180),
      n1: (v) => v.n2 * Math.sin(v.theta2 * Math.PI/180) / Math.sin(v.theta1 * Math.PI/180),
    },
    tags: ['brechung', 'snell', 'winkel', 'medium', 'grundformel'],
  },

  {
    id: 'critical_angle',
    name: 'Grenzwinkel der Totalreflexion',
    category: 'Allgemeine Formeln',
    formula: 'sin θ_G = n₂ / n₁',
    latex: '\\sin\\theta_G = \\dfrac{n_2}{n_1}',
    description: 'Grenzwinkel, ab dem Totalreflexion auftritt. Gilt nur für n₁ > n₂ (optisch dichtes zu dünnerem Medium).',
    variables: [
      { symbol: 'thetaG', name: 'Grenzwinkel θ_G', unit: '°', description: 'Kritischer Winkel für Totalreflexion' },
      { symbol: 'n1', name: 'Brechzahl Medium 1', unit: '–', description: 'Brechungsindex des dichteren Mediums (n₁ > n₂)' },
      { symbol: 'n2', name: 'Brechzahl Medium 2', unit: '–', description: 'Brechungsindex des dünneren Mediums' },
    ],
    solveFor: {
      thetaG: (v) => Math.asin(v.n2 / v.n1) * 180/Math.PI,
      n1: (v) => v.n2 / Math.sin(v.thetaG * Math.PI/180),
      n2: (v) => v.n1 * Math.sin(v.thetaG * Math.PI/180),
    },
    tags: ['totalreflexion', 'grenzwinkel', 'brechzahl'],
  },

  // ─── VERGENZ & BRECHKRAFT ────────────────────────────────────────────────
  {
    id: 'power_dioptrie',
    name: 'Brechkraft (Dioptrien)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D = 1 / f',
    latex: 'D = \\dfrac{1}{f}',
    description: 'Brechkraft in Dioptrien (dpt). Die Brennweite muss in Metern angegeben werden.',
    variables: [
      { symbol: 'D', name: 'Brechkraft', unit: 'dpt', description: 'Optische Brechkraft in Dioptrien (1 dpt = 1/m)' },
      { symbol: 'f', name: 'Brennweite', unit: 'm', description: 'Brennweite in Metern' },
    ],
    solveFor: {
      D: (v) => 1 / v.f,
      f: (v) => 1 / v.D,
    },
    tags: ['dioptrien', 'brechkraft', 'brennweite', 'dpt'],
  },

  {
    id: 'vergence',
    name: 'Vergenz',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'V = n / s',
    latex: 'V = \\dfrac{n}{s}',
    description: 'Vergenz eines Strahlenbündels. Positiv = konvergent, Negativ = divergent. s in Metern.',
    variables: [
      { symbol: 'V', name: 'Vergenz', unit: 'dpt', description: 'Strahlenvergenz (positiv = konvergent)' },
      { symbol: 'n', name: 'Brechzahl', unit: '–', description: 'Brechungsindex des Mediums' },
      { symbol: 's', name: 'Abstand', unit: 'm', description: 'Abstand zum Brennpunkt/Fokus in Metern' },
    ],
    solveFor: {
      V: (v) => v.n / v.s,
      s: (v) => v.n / v.V,
      n: (v) => v.V * v.s,
    },
    tags: ['vergenz', 'strahlen', 'brechkraft'],
  },

  {
    id: 'vergence_refraction',
    name: 'Abbildungsgleichung mit Vergenz',
    category: 'Optik & Technik der Sehhilfen',
    formula: "V' = V + D",
    latex: "V' = V + D",
    description: "Vergenzform der Abbildungsgleichung. V = einfallende Vergenz, D = Brechkraft, V' = ausfallende Vergenz.",
    variables: [
      { symbol: 'Vprime', name: "Ausgangsvergenz V'", unit: 'dpt', description: 'Vergenz des ausfallenden Strahls' },
      { symbol: 'V', name: 'Eintrittsvergenz V', unit: 'dpt', description: 'Vergenz des einfallenden Strahls' },
      { symbol: 'D', name: 'Brechkraft D', unit: 'dpt', description: 'Brechkraft des optischen Elements' },
    ],
    solveFor: {
      Vprime: (v) => v.V + v.D,
      V: (v) => v.Vprime - v.D,
      D: (v) => v.Vprime - v.V,
    },
    tags: ['vergenz', 'brechkraft', 'abbildung'],
  },

  {
    id: 'surface_power',
    name: 'Brechkraft einer sphärischen Fläche',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D = (n₂ − n₁) / r',
    latex: 'D = \\dfrac{n_2 - n_1}{r}',
    description: 'Brechkraft einer einzelnen sphärischen Grenzfläche zwischen zwei Medien. r in Metern.',
    variables: [
      { symbol: 'D', name: 'Brechkraft', unit: 'dpt', description: 'Brechkraft der Fläche' },
      { symbol: 'n2', name: 'Brechzahl nach Fläche n₂', unit: '–', description: 'Brechungsindex des zweiten Mediums' },
      { symbol: 'n1', name: 'Brechzahl vor Fläche n₁', unit: '–', description: 'Brechungsindex des ersten Mediums' },
      { symbol: 'r', name: 'Krümmungsradius r', unit: 'm', description: 'Radius der Fläche (positiv = Mittelpunkt rechts)' },
    ],
    solveFor: {
      D: (v) => (v.n2 - v.n1) / v.r,
      r: (v) => (v.n2 - v.n1) / v.D,
      n2: (v) => v.D * v.r + v.n1,
      n1: (v) => v.n2 - v.D * v.r,
    },
    tags: ['brechkraft', 'fläche', 'sphärisch', 'brechzahl'],
  },

  // ─── LINSENSYSTEME ───────────────────────────────────────────────────────
  {
    id: 'combined_contact',
    name: 'Zwei dünne Linsen in Kontakt',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D_ges = D₁ + D₂',
    latex: 'D_{ges} = D_1 + D_2',
    description: 'Gesamtbrechkraft zweier dünner Linsen, die direkt hintereinander (in Kontakt) angeordnet sind.',
    variables: [
      { symbol: 'Dges', name: 'Gesamtbrechkraft', unit: 'dpt', description: 'Gesamte Brechkraft des Systems' },
      { symbol: 'D1', name: 'Brechkraft Linse 1', unit: 'dpt', description: 'Brechkraft der ersten Linse' },
      { symbol: 'D2', name: 'Brechkraft Linse 2', unit: 'dpt', description: 'Brechkraft der zweiten Linse' },
    ],
    solveFor: {
      Dges: (v) => v.D1 + v.D2,
      D1: (v) => v.Dges - v.D2,
      D2: (v) => v.Dges - v.D1,
    },
    tags: ['linsen', 'kombination', 'system', 'kontakt'],
  },

  {
    id: 'combined_separated',
    name: 'Zwei dünne Linsen mit Abstand',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D_ges = D₁ + D₂ − d · D₁ · D₂ / n',
    latex: 'D_{ges} = D_1 + D_2 - \\dfrac{d \\cdot D_1 \\cdot D_2}{n}',
    description: 'Gesamtbrechkraft zweier dünner Linsen mit Abstand d im Medium mit Brechzahl n. d in Metern.',
    variables: [
      { symbol: 'Dges', name: 'Gesamtbrechkraft', unit: 'dpt', description: 'Gesamte Brechkraft des Systems' },
      { symbol: 'D1', name: 'Brechkraft Linse 1', unit: 'dpt', description: 'Brechkraft der ersten Linse' },
      { symbol: 'D2', name: 'Brechkraft Linse 2', unit: 'dpt', description: 'Brechkraft der zweiten Linse' },
      { symbol: 'd', name: 'Abstand d', unit: 'm', description: 'Abstand zwischen den Linsen in Metern' },
      { symbol: 'n', name: 'Brechzahl Medium', unit: '–', description: 'Brechungsindex des Zwischenmediums (1.0 für Luft)' },
    ],
    solveFor: {
      Dges: (v) => v.D1 + v.D2 - (v.d * v.D1 * v.D2) / v.n,
      D2: (v) => (v.Dges - v.D1) / (1 - v.d * v.D1 / v.n),
      D1: (v) => (v.Dges - v.D2) / (1 - v.d * v.D2 / v.n),
    },
    tags: ['linsen', 'kombination', 'abstand', 'system'],
  },

  {
    id: 'back_vertex_power',
    name: 'Hinterscheitelbrechwert',
    category: 'Optik & Technik der Sehhilfen',
    formula: "D'_h = D₁ + D₂ / (1 − d · D₁/n)",
    latex: "D'_h = D_1 + \\dfrac{D_2}{1 - \\dfrac{d \\cdot D_1}{n}}",
    description: 'Hinterscheitelbrechwert eines dicken Linsensystems (gemessen vom hinteren Scheitel). Relevant für Brillengläser. d in Metern.',
    variables: [
      { symbol: 'Dh', name: "Hinterscheitelbrechwert D'_h", unit: 'dpt', description: 'Brechkraft am hinteren Scheitel' },
      { symbol: 'D1', name: 'Brechkraft Fläche 1', unit: 'dpt', description: 'Brechkraft der ersten Fläche' },
      { symbol: 'D2', name: 'Brechkraft Fläche 2', unit: 'dpt', description: 'Brechkraft der zweiten Fläche' },
      { symbol: 'd', name: 'Mittendicke d', unit: 'm', description: 'Mittendicke der Linse in Metern' },
      { symbol: 'n', name: 'Brechzahl Linse', unit: '–', description: 'Brechungsindex des Linsenmaterials' },
    ],
    solveFor: {
      Dh: (v) => v.D1 + v.D2 / (1 - (v.d * v.D1) / v.n),
      D2: (v) => (v.Dh - v.D1) * (1 - (v.d * v.D1) / v.n),
    },
    tags: ['scheitelbrechwert', 'dicke linse', 'brille', 'system'],
  },

  {
    id: 'front_vertex_power',
    name: 'Vorderscheitelbrechwert',
    category: 'Optik & Technik der Sehhilfen',
    formula: "D'_v = D₂ + D₁ / (1 − d · D₂/n)",
    latex: "D'_v = D_2 + \\dfrac{D_1}{1 - \\dfrac{d \\cdot D_2}{n}}",
    description: 'Vorderscheitelbrechwert eines dicken Linsensystems (gemessen vom vorderen Scheitel). d in Metern.',
    variables: [
      { symbol: 'Dv', name: "Vorderscheitelbrechwert D'_v", unit: 'dpt', description: 'Brechkraft am vorderen Scheitel' },
      { symbol: 'D1', name: 'Brechkraft Fläche 1', unit: 'dpt', description: 'Brechkraft der ersten Fläche' },
      { symbol: 'D2', name: 'Brechkraft Fläche 2', unit: 'dpt', description: 'Brechkraft der zweiten Fläche' },
      { symbol: 'd', name: 'Mittendicke d', unit: 'm', description: 'Mittendicke der Linse in Metern' },
      { symbol: 'n', name: 'Brechzahl Linse', unit: '–', description: 'Brechungsindex des Linsenmaterials' },
    ],
    solveFor: {
      Dv: (v) => v.D2 + v.D1 / (1 - (v.d * v.D2) / v.n),
    },
    tags: ['scheitelbrechwert', 'dicke linse', 'system'],
  },

  {
    id: 'gullstrandformel',
    name: 'Gullstrandformel',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D = D₁ + D₂ − (d/n) · D₁ · D₂',
    latex: 'D = D_1 + D_2 - \\dfrac{d}{n} \\cdot D_1 \\cdot D_2',
    description: 'Gesamtbrechkraft einer dicken Linse aus den Flächenbrechkräften und der reduzierten Dicke. d in Metern.',
    variables: [
      { symbol: 'D', name: 'Gesamtbrechkraft', unit: 'dpt', description: 'Gesamtbrechkraft der dicken Linse' },
      { symbol: 'D1', name: 'Brechkraft Fläche 1', unit: 'dpt', description: 'Brechkraft der ersten Fläche' },
      { symbol: 'D2', name: 'Brechkraft Fläche 2', unit: 'dpt', description: 'Brechkraft der zweiten Fläche' },
      { symbol: 'd', name: 'Mittendicke d', unit: 'm', description: 'Mittendicke der Linse in Metern' },
      { symbol: 'n', name: 'Brechzahl Linse', unit: '–', description: 'Brechungsindex des Linsenmaterials' },
    ],
    solveFor: {
      D: (v) => v.D1 + v.D2 - (v.d/v.n) * v.D1 * v.D2,
      D1: (v) => (v.D - v.D2) / (1 - (v.d/v.n) * v.D2),
      D2: (v) => (v.D - v.D1) / (1 - (v.d/v.n) * v.D1),
    },
    tags: ['gullstrand', 'gullstrandformel', 'dicke linse', 'brechkraft', 'fläche', '4.6.4.2'],
  },

  {
    id: 'principal_plane_H',
    name: 'Hauptebenenabstand H (vorne)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'δH = −(d/n) · D₂ / D',
    latex: '\\delta H = -\\dfrac{d}{n} \\cdot \\dfrac{D_2}{D}',
    description: 'Abstand der vorderen Hauptebene H vom vorderen Scheitelpunkt. d in Metern.',
    variables: [
      { symbol: 'deltaH', name: 'Abstand δH', unit: 'm', description: 'Lage der vorderen Hauptebene (positiv = nach rechts)' },
      { symbol: 'd', name: 'Mittendicke d', unit: 'm', description: 'Mittendicke der Linse' },
      { symbol: 'n', name: 'Brechzahl', unit: '–', description: 'Brechungsindex des Linsenmaterials' },
      { symbol: 'D2', name: 'Brechkraft D₂', unit: 'dpt', description: 'Brechkraft der hinteren Fläche' },
      { symbol: 'D', name: 'Gesamtbrechkraft D', unit: 'dpt', description: 'Gesamtbrechkraft der Linse' },
    ],
    solveFor: {
      deltaH: (v) => -(v.d/v.n) * v.D2 / v.D,
    },
    tags: ['hauptebene', 'kardinalpunkte', 'dicke linse'],
  },

  {
    id: 'principal_plane_H2',
    name: "Hauptebenenabstand H' (hinten)",
    category: 'Optik & Technik der Sehhilfen',
    formula: "δH' = −(d/n) · D₁ / D",
    latex: "\\delta H' = -\\dfrac{d}{n} \\cdot \\dfrac{D_1}{D}",
    description: "Abstand der hinteren Hauptebene H' vom hinteren Scheitelpunkt. d in Metern.",
    variables: [
      { symbol: 'deltaHp', name: "Abstand δH'", unit: 'm', description: "Lage der hinteren Hauptebene (positiv = nach rechts)" },
      { symbol: 'd', name: 'Mittendicke d', unit: 'm', description: 'Mittendicke der Linse' },
      { symbol: 'n', name: 'Brechzahl', unit: '–', description: 'Brechungsindex des Linsenmaterials' },
      { symbol: 'D1', name: 'Brechkraft D₁', unit: 'dpt', description: 'Brechkraft der vorderen Fläche' },
      { symbol: 'D', name: 'Gesamtbrechkraft D', unit: 'dpt', description: 'Gesamtbrechkraft der Linse' },
    ],
    solveFor: {
      deltaHp: (v) => -(v.d/v.n) * v.D1 / v.D,
    },
    tags: ['hauptebene', 'kardinalpunkte', 'dicke linse'],
  },

  // ─── VERGRÖSSERUNG ───────────────────────────────────────────────────────
  {
    id: 'lateral_magnification',
    name: "Abbildungsmaßstab β'",
    category: 'Optik & Technik der Sehhilfen',
    formula: "β' = y'/y = a'/a",
    latex: "\\beta' = \\dfrac{y'}{y} = \\dfrac{a'}{a}",
    description: "Verhältnis von Bildgröße y' zu Gegenstandsgröße y (Abbildungsmaßstab). Entspricht auch dem Quotienten der signierten Weiten a'/a. β' < 0 = umgekehrtes Bild, |β'| > 1 = vergrößert.",
    variables: [
      { symbol: 'betaprime', name: "Abbildungsmaßstab β'", unit: '×', description: "Abbildungsmaßstab (negativ = umgekehrtes Bild, |β'| > 1 = vergrößert)" },
      { symbol: 'yprime',    name: "Bildgröße y'",         unit: 'm', description: "Größe des Bildes in Metern (vorzeichenbehaftet)" },
      { symbol: 'y',         name: 'Gegenstandsgröße y',   unit: 'm', description: 'Größe des Gegenstands in Metern (vorzeichenbehaftet)' },
      { symbol: 'aprime',    name: "Bildweite a'",          unit: 'm', description: "Signierte Bildweite in Metern (positiv = reelles Bild)" },
      { symbol: 'a',         name: 'Gegenstandsweite a',   unit: 'm', description: 'Signierte Gegenstandsweite in Metern (negativ = reelles Objekt links der Linse)' },
    ],
    solveFor: {
      betaprime: (v) => v.yprime / v.y,
      yprime:    (v) => v.betaprime * v.y,
      y:         (v) => v.yprime / v.betaprime,
      aprime:    (v) => v.betaprime * v.a,
      a:         (v) => v.aprime / v.betaprime,
    },
    tags: ['vergrößerung', 'abbildung', 'maßstab', 'bild', 'abbildungsmaßstab'],
  },

  {
    id: 'angular_magnification',
    name: 'Winkelvergrößerung',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = tan ω' / tan ω",
    latex: "\\Gamma' = \\dfrac{\\tan\\omega'}{\\tan\\omega}",
    description: "Verhältnis der Winkel unter denen Bild und Gegenstand erscheinen. Allgemeine Definition der Winkelvergrößerung. Wichtig für Lupe und Fernrohr.",
    variables: [
      { symbol: 'Gamma', name: "Winkelvergrößerung Γ'", unit: '×', description: 'Vergrößerungsfaktor für Winkel' },
      { symbol: 'omegap', name: "Bildwinkel ω'", unit: '°', description: 'Winkel unter dem das Bild erscheint' },
      { symbol: 'omega', name: 'Gegenstandswinkel ω', unit: '°', description: 'Winkel unter dem der Gegenstand erscheint' },
    ],
    solveFor: {
      Gamma: (v) => Math.tan(v.omegap * Math.PI/180) / Math.tan(v.omega * Math.PI/180),
      omegap: (v) => Math.atan(v.Gamma * Math.tan(v.omega * Math.PI/180)) * 180/Math.PI,
    },
    tags: ['vergrößerung', 'winkel', 'lupe', 'fernrohr'],
  },

  {
    id: 'newton_imaging',
    name: 'Newtonsche Abbildungsgleichung',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'x · x\' = −f²',
    latex: 'x \\cdot x\' = -f^2',
    description: 'Abbildungsgleichung mit Abständen x und x\' gemessen von den Brennpunkten F und F\'.',
    variables: [
      { symbol: 'x', name: 'Gegenstandsabstand x', unit: 'mm', description: 'Abstand Gegenstand–Brennpunkt F (negativ wenn vor F)' },
      { symbol: 'xp', name: "Bildabstand x'", unit: 'mm', description: "Abstand Bild–Brennpunkt F'" },
      { symbol: 'f', name: 'Brennweite f', unit: 'mm', description: 'Brennweite der Linse' },
    ],
    solveFor: {
      xp: (v) => -v.f * v.f / v.x,
      x: (v) => -v.f * v.f / v.xp,
      f: (v) => Math.sqrt(-v.x * v.xp),
    },
    tags: ['newton', 'abbildung', 'brennpunkt'],
  },

  // ─── AUGENHEILKUNDE / AUGENOPTIK ─────────────────────────────────────────
  {
    id: 'accommodation',
    name: 'Akkommodationsbreite',
    category: 'Refraktion',
    formula: 'A = D_nah − D_fern',
    latex: 'A = D_{nah} - D_{fern}',
    description: 'Akkommodationsbreite des Auges: Differenz zwischen maximaler Nah- und Fernakkommodation in Dioptrien.',
    variables: [
      { symbol: 'A', name: 'Akkommodationsbreite A', unit: 'dpt', description: 'Akkommodationsamplitude des Auges' },
      { symbol: 'Dnah', name: 'Nahpunktbrechkraft D_nah', unit: 'dpt', description: 'Brechkraft bei maximaler Nahakkommodation = n/r (r = Nahpunktabstand in m)' },
      { symbol: 'Dfern', name: 'Fernpunktbrechkraft D_fern', unit: 'dpt', description: 'Brechkraft des entspannten Auges = n/r (r = Fernpunktabstand in m)' },
    ],
    solveFor: {
      A: (v) => v.Dnah - v.Dfern,
      Dnah: (v) => v.A + v.Dfern,
      Dfern: (v) => v.Dnah - v.A,
    },
    tags: ['akkommodation', 'auge', 'nahpunkt', 'fernpunkt'],
  },

  {
    id: 'near_far_point',
    name: 'Nahpunkt / Fernpunkt',
    category: 'Refraktion',
    formula: 'D_punkt = n / s_punkt',
    latex: 'D_{punkt} = \\dfrac{n}{s_{punkt}}',
    description: 'Brechkraft am Nah- oder Fernpunkt. s in Metern (positiv = reeller Punkt vor dem Auge).',
    variables: [
      { symbol: 'Dpunkt', name: 'Brechkraft am Punkt', unit: 'dpt', description: 'Vergenz am Nah- oder Fernpunkt' },
      { symbol: 'n', name: 'Brechzahl Medien', unit: '–', description: 'Brechungsindex vor dem Auge (1.0 für Luft)' },
      { symbol: 'spunkt', name: 'Punktabstand', unit: 'm', description: 'Abstand zum Nah-/Fernpunkt in Metern' },
    ],
    solveFor: {
      Dpunkt: (v) => v.n / v.spunkt,
      spunkt: (v) => v.n / v.Dpunkt,
    },
    tags: ['nahpunkt', 'fernpunkt', 'auge', 'akkommodation'],
  },

  {
    id: 'vertex_distance',
    name: 'Scheitelbrechungsabstand (Vertex)',
    category: 'Refraktion',
    formula: "D_s = D / (1 − d · D)",
    latex: "D_s = \\dfrac{D}{1 - d \\cdot D}",
    description: "Umrechnung der Brillenglasbrechkraft auf anderen Hornhautscheitelabstand. d = Abstandsänderung in Metern. Wichtig beim Wechsel Brille ↔ Kontaktlinse.",
    variables: [
      { symbol: 'Ds', name: 'Neue Brechkraft D_s', unit: 'dpt', description: 'Brechkraft am neuen Scheitelpunkt' },
      { symbol: 'D', name: 'Ursprüngliche Brechkraft', unit: 'dpt', description: 'Brechkraft am ursprünglichen Scheitelpunkt' },
      { symbol: 'd', name: 'Abstandsänderung d', unit: 'm', description: 'Änderung des Hornhautscheitelabstands in Metern' },
    ],
    solveFor: {
      Ds: (v) => v.D / (1 - v.d * v.D),
      D: (v) => v.Ds / (1 + v.d * v.Ds),
      d: (v) => (1 - v.D / v.Ds) / v.D,
    },
    tags: ['scheitelabstand', 'brille', 'kontaktlinse', 'hornhaut'],
  },

  {
    id: 'spectacle_correction',
    name: 'Brillenkorrektion',
    category: 'Refraktion',
    formula: 'D_Brille = D_Fern / (1 + d · D_Fern)',
    latex: 'D_{Brille} = \\dfrac{D_{Fern}}{1 + d \\cdot D_{Fern}}',
    description: 'Benötigte Brillenstärke zur Korrektion einer Ametropsie. D_Fern = Fernpunktvergenz in dpt, d = Hornhautscheitelabstand in Metern.',
    variables: [
      { symbol: 'DBrille', name: 'Brillenstärke', unit: 'dpt', description: 'Erforderliche Brechkraft des Brillenglases' },
      { symbol: 'DFern', name: 'Fernpunktvergenz', unit: 'dpt', description: 'Vergenz am Fernpunkt des Auges' },
      { symbol: 'd', name: 'Hornhautscheitelabstand', unit: 'm', description: 'Abstand Brillenglas–Hornhaut in Metern (ca. 0.012–0.015 m)' },
    ],
    solveFor: {
      DBrille: (v) => v.DFern / (1 + v.d * v.DFern),
      DFern: (v) => v.DBrille / (1 - v.d * v.DBrille),
    },
    tags: ['brille', 'korrektion', 'ametropsie', 'myopie', 'hyperopie'],
  },

  // ─── PRISMA ───────────────────────────────────────────────────────────────
  {
    id: 'prism_deviation',
    name: 'Prismaablenkung (dünn)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'δ ≈ (n − 1) · α',
    latex: '\\delta \\approx (n - 1) \\cdot \\alpha',
    description: 'Ablenkwinkel eines dünnen Prismas. Gilt näherungsweise für kleine Prismenwinkel.',
    variables: [
      { symbol: 'delta', name: 'Ablenkwinkel δ', unit: '°', description: 'Gesamtablenkung des Lichtstrahls' },
      { symbol: 'n', name: 'Brechzahl n', unit: '–', description: 'Brechungsindex des Prismenmaterials' },
      { symbol: 'alpha', name: 'Prismenwinkel α', unit: '°', description: 'Brechender Winkel des Prismas' },
    ],
    solveFor: {
      delta: (v) => (v.n - 1) * v.alpha,
      alpha: (v) => v.delta / (v.n - 1),
      n: (v) => v.delta / v.alpha + 1,
    },
    tags: ['prisma', 'ablenkung', 'brechung'],
  },

  {
    id: 'prism_diopter',
    name: 'Prismenwirkung in Prismendioptrien',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'Δ = 100 · tan δ',
    latex: '\\Delta = 100 \\cdot \\tan\\delta',
    description: 'Umrechnung der Prismenablenkung in Prismendioptrien (pdpt). 1 pdpt = 1 cm Versatz auf 1 m Entfernung.',
    variables: [
      { symbol: 'Delta', name: 'Prismenwirkung Δ', unit: 'pdpt', description: 'Prismenablenkung in Prismendioptrien' },
      { symbol: 'delta', name: 'Ablenkwinkel δ', unit: '°', description: 'Ablenkwinkel in Grad' },
    ],
    solveFor: {
      Delta: (v) => 100 * Math.tan(v.delta * Math.PI/180),
      delta: (v) => Math.atan(v.Delta / 100) * 180/Math.PI,
    },
    tags: ['prisma', 'prismendioptrie', 'ablenkung'],
  },

  {
    id: 'prism_min_deviation',
    name: 'Minimale Ablenkung am Prisma',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'n = sin((δ_min + α)/2) / sin(α/2)',
    latex: 'n = \\dfrac{\\sin\\left(\\dfrac{\\delta_{min} + \\alpha}{2}\\right)}{\\sin\\left(\\dfrac{\\alpha}{2}\\right)}',
    description: 'Brechzahlbestimmung aus dem Winkel minimaler Ablenkung (symmetrischer Durchgang). Präziseste Methode zur n-Messung.',
    variables: [
      { symbol: 'n', name: 'Brechzahl n', unit: '–', description: 'Brechungsindex des Prismenmaterials' },
      { symbol: 'delta_min', name: 'Min. Ablenkwinkel δ_min', unit: '°', description: 'Ablenkwinkel bei symmetrischem Durchgang' },
      { symbol: 'alpha', name: 'Prismenwinkel α', unit: '°', description: 'Brechender Winkel des Prismas' },
    ],
    solveFor: {
      n: (v) => Math.sin(((v.delta_min + v.alpha)/2) * Math.PI/180) / Math.sin((v.alpha/2) * Math.PI/180),
      delta_min: (v) => 2 * Math.asin(v.n * Math.sin((v.alpha/2) * Math.PI/180)) * 180/Math.PI - v.alpha,
    },
    tags: ['prisma', 'brechzahl', 'ablenkung', 'messung'],
  },

  // ─── VERGRÖSSERUNGSSYSTEME ────────────────────────────────────────────────
  {
    id: 'magnifier',
    name: "Vergrößerung Lupe (Γ')",
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = s₀ / f = 250 mm / f",
    latex: "\\Gamma' = \\dfrac{s_0}{f} = \\dfrac{250\\,\\text{mm}}{f}",
    description: "Vergrößerung einer Lupe (Normalvergrößerung). s₀ = 250 mm ist die konventionelle deutliche Sehweite. f in mm.",
    variables: [
      { symbol: 'Gamma', name: "Vergrößerung Γ'", unit: '×', description: 'Vergrößerungsfaktor der Lupe' },
      { symbol: 'f', name: 'Brennweite f', unit: 'mm', description: 'Brennweite der Lupe in mm' },
      { symbol: 's0', name: 'Bezugssehweite s₀', unit: 'mm', description: 'Konventionelle Bezugssehweite (Standard: 250 mm)' },
    ],
    solveFor: {
      Gamma: (v) => v.s0 / v.f,
      f: (v) => v.s0 / v.Gamma,
    },
    tags: ['lupe', 'vergrößerung', 'sehweite'],
  },

  {
    id: 'microscope',
    name: 'Vergrößerung Mikroskop',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = (Δ / f_Obj) · (s₀ / f_Ok)",
    latex: "\\Gamma' = \\dfrac{\\Delta}{f_{Obj}} \\cdot \\dfrac{s_0}{f_{Ok}}",
    description: "Gesamtvergrößerung eines Mikroskops aus Objektiv- und Okularvergrößerung. Δ = optische Tubuslänge (ca. 160 mm), s₀ = 250 mm.",
    variables: [
      { symbol: 'Gamma', name: "Gesamtvergrößerung Γ'", unit: '×', description: 'Gesamte Vergrößerung des Mikroskops' },
      { symbol: 'Delta', name: 'Tubuslänge Δ', unit: 'mm', description: 'Optische Tubuslänge (Standardwert 160 mm)' },
      { symbol: 'fObj', name: 'Brennweite Objektiv f_Obj', unit: 'mm', description: 'Brennweite des Objektivs' },
      { symbol: 's0', name: 'Bezugssehweite s₀', unit: 'mm', description: 'Konventionelle Bezugssehweite (250 mm)' },
      { symbol: 'fOk', name: 'Brennweite Okular f_Ok', unit: 'mm', description: 'Brennweite des Okulars' },
    ],
    solveFor: {
      Gamma: (v) => (v.Delta / v.fObj) * (v.s0 / v.fOk),
      fObj: (v) => (v.Delta * v.s0) / (v.Gamma * v.fOk),
      fOk: (v) => (v.Delta * v.s0) / (v.Gamma * v.fObj),
    },
    tags: ['mikroskop', 'vergrößerung', 'objektiv', 'okular'],
  },

  {
    id: 'telescope_kepler',
    name: 'Fernrohr (Kepler)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = −f'_Obj / f'_Ok",
    latex: "\\Gamma' = -\\dfrac{f'_{Obj}}{f'_{Ok}}",
    description: "Winkelvergrößerung des Keplerschen Fernrohrs (astronomisch). Negatives Vorzeichen = umgekehrtes Bild. Betrag |Γ'| ist die übliche Vergrößerungsangabe.",
    variables: [
      { symbol: 'Gamma', name: "Vergrößerung Γ'", unit: '×', description: "Winkelvergrößerung (negativ = umgekehrtes Bild; Betrag = Vergrößerungszahl)" },
      { symbol: 'fObj', name: 'Brennweite Objektiv', unit: 'mm', description: 'Brennweite des Objektivs (positiv)' },
      { symbol: 'fOk', name: 'Brennweite Okular', unit: 'mm', description: 'Brennweite des Okulars (positiv)' },
    ],
    solveFor: {
      Gamma: (v) => -v.fObj / v.fOk,
      fObj: (v) => -v.Gamma * v.fOk,
      fOk: (v) => -v.fObj / v.Gamma,
    },
    tags: ['fernrohr', 'kepler', 'teleskop', 'vergrößerung'],
  },

  {
    id: 'telescope_galilei',
    name: 'Fernrohr (Galilei)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = −f'_Obj / f'_Ok",
    latex: "\\Gamma' = -\\dfrac{f'_{Obj}}{f'_{Ok}}",
    description: "Winkelvergrößerung des Galileischen Fernrohrs (terrestrisch). f'_Ok ist negativ → Γ' positiv = aufrechtes Bild. Baulänge: L = f'_Obj + f'_Ok < f'_Obj.",
    variables: [
      { symbol: 'Gamma', name: "Vergrößerung Γ'", unit: '×', description: "Winkelvergrößerung (positiv = aufrechtes Bild bei Galilei)" },
      { symbol: 'fObj', name: 'Brennweite Objektiv', unit: 'mm', description: 'Brennweite des Objektivs (positiv)' },
      { symbol: 'fOk', name: 'Brennweite Okular', unit: 'mm', description: 'Brennweite des Okulars (negativ bei Galilei!)' },
    ],
    solveFor: {
      Gamma: (v) => -v.fObj / v.fOk,
      fOk: (v) => -v.fObj / v.Gamma,
      fObj: (v) => -v.Gamma * v.fOk,
    },
    tags: ['fernrohr', 'galilei', 'teleskop', 'vergrößerung', 'aufrecht'],
  },

  // ─── ABERRATIONEN ─────────────────────────────────────────────────────────
  {
    id: 'abbe_number',
    name: 'Abbe-Zahl',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'ν = (n_d − 1) / (n_F − n_C)',
    latex: '\\nu = \\dfrac{n_d - 1}{n_F - n_C}',
    description: 'Maß für die Dispersion eines optischen Materials. Hohe Abbe-Zahl = geringe Dispersion (z.B. Kron: ν≈64, Flint: ν≈36).',
    variables: [
      { symbol: 'nu', name: 'Abbe-Zahl ν', unit: '–', description: 'Dispersionskenngröße (höher = weniger Farbfehler)' },
      { symbol: 'nd', name: 'Brechzahl n_d (gelb)', unit: '–', description: 'Brechungsindex bei Fraunhofer-Linie d (587.6 nm)' },
      { symbol: 'nF', name: 'Brechzahl n_F (blau)', unit: '–', description: 'Brechungsindex bei Fraunhofer-Linie F (486.1 nm)' },
      { symbol: 'nC', name: 'Brechzahl n_C (rot)', unit: '–', description: 'Brechungsindex bei Fraunhofer-Linie C (656.3 nm)' },
    ],
    solveFor: {
      nu: (v) => (v.nd - 1) / (v.nF - v.nC),
      nF: (v) => v.nC + (v.nd - 1) / v.nu,
    },
    tags: ['abbe', 'dispersion', 'chromatisch', 'farbe', 'brechzahl'],
  },

  {
    id: 'chromatic_aberration',
    name: 'Chromatische Aberration (Farbfehler)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'Δf / f = 1 / ν',
    latex: '\\dfrac{\\Delta f}{f} = \\dfrac{1}{\\nu}',
    description: 'Relativer Farbfehler einer einfachen Linse. Δf = f_C − f_F (Differenz der Brennweiten für Rot und Blau).',
    variables: [
      { symbol: 'Deltaf_f', name: 'Relativer Farbfehler Δf/f', unit: '–', description: 'Verhältnis des Farbfehlers zur Brennweite' },
      { symbol: 'nu', name: 'Abbe-Zahl ν', unit: '–', description: 'Abbe-Zahl des Linsenmaterials' },
    ],
    solveFor: {
      Deltaf_f: (v) => 1 / v.nu,
      nu: (v) => 1 / v.Deltaf_f,
    },
    tags: ['chromatisch', 'farbfehler', 'aberration', 'abbe'],
  },

  {
    id: 'achromat',
    name: 'Achromat-Bedingung',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D₁/ν₁ + D₂/ν₂ = 0',
    latex: '\\dfrac{D_1}{\\nu_1} + \\dfrac{D_2}{\\nu_2} = 0',
    description: 'Bedingung für einen farbreinen Achromaten aus zwei dünnen Linsen in Kontakt. Löst chromatische Aberration erster Ordnung.',
    variables: [
      { symbol: 'D1', name: 'Brechkraft D₁', unit: 'dpt', description: 'Brechkraft der ersten Linse (Kron)' },
      { symbol: 'nu1', name: 'Abbe-Zahl ν₁', unit: '–', description: 'Abbe-Zahl der ersten Linse' },
      { symbol: 'D2', name: 'Brechkraft D₂', unit: 'dpt', description: 'Brechkraft der zweiten Linse (Flint)' },
      { symbol: 'nu2', name: 'Abbe-Zahl ν₂', unit: '–', description: 'Abbe-Zahl der zweiten Linse' },
    ],
    solveFor: {
      D1: (v) => -v.D2 * v.nu1 / v.nu2,
      D2: (v) => -v.D1 * v.nu2 / v.nu1,
    },
    tags: ['achromat', 'chromatisch', 'aberration', 'farbe', 'kron', 'flint'],
  },

  // ─── WELLENOPTIK ─────────────────────────────────────────────────────────
  {
    id: 'optical_path',
    name: 'Optischer Weg',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'OPL = n · s',
    latex: 'OPL = n \\cdot s',
    description: 'Optischer Wegunterschied (OPL = Optical Path Length). Grundgröße für Interferenz und Kohärenz.',
    variables: [
      { symbol: 'OPL', name: 'Optischer Weg OPL', unit: 'mm', description: 'Optische Weglänge' },
      { symbol: 'n', name: 'Brechzahl n', unit: '–', description: 'Brechungsindex des Mediums' },
      { symbol: 's', name: 'Geometrische Länge s', unit: 'mm', description: 'Physikalische Weglänge im Medium' },
    ],
    solveFor: {
      OPL: (v) => v.n * v.s,
      s: (v) => v.OPL / v.n,
      n: (v) => v.OPL / v.s,
    },
    tags: ['optischer weg', 'opl', 'interferenz', 'kohärenz'],
  },

  {
    id: 'rayleigh_criterion',
    name: 'Rayleigh-Kriterium (Auflösung)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'sin θ_min = 1.22 · λ / D',
    latex: '\\sin\\theta_{min} = 1.22 \\cdot \\dfrac{\\lambda}{D}',
    description: 'Minimaler Winkelabstand zweier gerade noch auflösbarer Punkte für eine kreisförmige Apertur.',
    variables: [
      { symbol: 'theta_min', name: 'Winkelauflösung θ_min', unit: '°', description: 'Minimaler auflösbarer Winkelabstand' },
      { symbol: 'lambda', name: 'Wellenlänge λ', unit: 'nm', description: 'Wellenlänge des Lichts (z.B. 550 nm)' },
      { symbol: 'D', name: 'Aperturöffnung D', unit: 'mm', description: 'Durchmesser der Apertur/Linse' },
    ],
    solveFor: {
      theta_min: (v) => Math.asin(1.22 * (v.lambda/1e6) / v.D) * 180/Math.PI,
      D: (v) => 1.22 * (v.lambda/1e6) / Math.sin(v.theta_min * Math.PI/180),
      lambda: (v) => Math.sin(v.theta_min * Math.PI/180) * v.D / 1.22 * 1e6,
    },
    tags: ['auflösung', 'rayleigh', 'beugung', 'apertur', 'wellenlänge'],
  },

  {
    id: 'numerical_aperture',
    name: 'Numerische Apertur',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'NA = n · sin θ',
    latex: 'NA = n \\cdot \\sin\\theta',
    description: 'Numerische Apertur eines optischen Systems. Bestimmt Auflösungsvermögen und Lichtsammelstärke.',
    variables: [
      { symbol: 'NA', name: 'Numerische Apertur NA', unit: '–', description: 'Numerische Apertur (0–1 in Luft, bis n in Immersion)' },
      { symbol: 'n', name: 'Brechzahl n', unit: '–', description: 'Brechungsindex des Mediums (1.0 Luft, 1.515 Öl)' },
      { symbol: 'theta', name: 'Halbwinkel θ', unit: '°', description: 'Halber Öffnungswinkel des Lichtkegels' },
    ],
    solveFor: {
      NA: (v) => v.n * Math.sin(v.theta * Math.PI/180),
      theta: (v) => Math.asin(v.NA / v.n) * 180/Math.PI,
      n: (v) => v.NA / Math.sin(v.theta * Math.PI/180),
    },
    tags: ['na', 'numerische apertur', 'auflösung', 'mikroskop'],
  },

  // ─── TIEFENSCHÄRFE ───────────────────────────────────────────────────────
  {
    id: 'depth_of_focus',
    name: 'Tiefenschärfe (Bildseite)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'Δb = ±f² · z / (f − g)²',
    latex: '\\Delta b = \\pm \\dfrac{f^2 \\cdot z}{(f-g)^2}',
    description: 'Tiefenschärfe auf der Bildseite. z = zulässiger Zerstreuungskreisdurchmesser.',
    variables: [
      { symbol: 'Deltab', name: 'Tiefenschärfe Δb', unit: 'mm', description: 'Tolerierbare Bildweitenänderung' },
      { symbol: 'f', name: 'Brennweite f', unit: 'mm', description: 'Brennweite der Linse' },
      { symbol: 'z', name: 'Zerstreuungskreis z', unit: 'mm', description: 'Zulässiger Durchmesser des Zerstreuungskreises' },
      { symbol: 'g', name: 'Gegenstandsweite g', unit: 'mm', description: 'Gegenstandsweite' },
    ],
    solveFor: {
      Deltab: (v) => (v.f * v.f * v.z) / Math.pow(v.f - v.g, 2),
    },
    tags: ['tiefenschärfe', 'schärfentiefe', 'zerstreuungskreis'],
  },

  {
    id: 'depth_of_field',
    name: 'Schärfentiefe (Gegenstandsseite)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'Δg ≈ ±z · g² / (f · D_Apertur)',
    latex: '\\Delta g \\approx \\pm \\dfrac{z \\cdot g^2}{f \\cdot D_{Ap}}',
    description: 'Schärfentiefe auf der Gegenstandsseite. D_Ap = Aperturdurchmesser. Näherung für g >> f.',
    variables: [
      { symbol: 'Deltag', name: 'Schärfentiefe Δg', unit: 'mm', description: 'Tolerierbare Abstandsänderung zum Objekt' },
      { symbol: 'z', name: 'Zerstreuungskreis z', unit: 'mm', description: 'Zulässiger Zerstreuungskreisdurchmesser' },
      { symbol: 'g', name: 'Gegenstandsweite g', unit: 'mm', description: 'Gegenstandsweite' },
      { symbol: 'f', name: 'Brennweite f', unit: 'mm', description: 'Brennweite' },
      { symbol: 'DAp', name: 'Aperturöffnung D_Ap', unit: 'mm', description: 'Durchmesser der Aperturblende' },
    ],
    solveFor: {
      Deltag: (v) => (v.z * v.g * v.g) / (v.f * v.DAp),
    },
    tags: ['schärfentiefe', 'tiefenschärfe', 'zerstreuungskreis', 'apertur'],
  },

  // ─── SONSTIGES ────────────────────────────────────────────────────────────
  {
    id: 'light_speed',
    name: 'Lichtgeschwindigkeit im Medium',
    category: 'Allgemeine Formeln',
    formula: 'v = c₀ / n',
    latex: 'v = \\dfrac{c_0}{n}',
    description: 'Phasengeschwindigkeit des Lichts in einem Medium mit Brechzahl n. c₀ = 299.792.458 m/s.',
    variables: [
      { symbol: 'v', name: 'Lichtgeschwindigkeit v', unit: 'm/s', description: 'Lichtgeschwindigkeit im Medium' },
      { symbol: 'c0', name: 'Vakuumlichtgeschwindigkeit c₀', unit: 'm/s', description: 'Lichtgeschwindigkeit im Vakuum (299792458 m/s)' },
      { symbol: 'n', name: 'Brechzahl n', unit: '–', description: 'Brechungsindex des Mediums' },
    ],
    solveFor: {
      v: (v) => v.c0 / v.n,
      n: (v) => v.c0 / v.v,
      c0: (v) => v.v * v.n,
    },
    tags: ['licht', 'geschwindigkeit', 'brechzahl', 'medium'],
  },

  {
    id: 'image_construction',
    name: 'Bildlage (allgemein)',
    category: 'Allgemeine Formeln',
    formula: 'b = f · g / (g − f)',
    latex: 'b = \\dfrac{f \\cdot g}{g - f}',
    description: 'Direkte Formel für die Bildweite aus Brennweite und Gegenstandsweite (umgestellte dünne Linsengleichung).',
    variables: [
      { symbol: 'b', name: 'Bildweite b', unit: 'mm', description: 'Abstand Bild–Linse' },
      { symbol: 'f', name: 'Brennweite f', unit: 'mm', description: 'Brennweite der Linse' },
      { symbol: 'g', name: 'Gegenstandsweite g', unit: 'mm', description: 'Abstand Gegenstand–Linse' },
    ],
    solveFor: {
      b: (v) => (v.f * v.g) / (v.g - v.f),
      g: (v) => (v.f * v.b) / (v.b - v.f),
      f: (v) => (v.g * v.b) / (v.g + v.b),
    },
    tags: ['bildweite', 'brennweite', 'abbildung', 'linse'],
  },

  // ─── VISUS & REFRAKTION ──────────────────────────────────────────────────
  {
    id: 'visus_basic',
    name: 'Visus (Sehschärfe)',
    category: 'Refraktion',
    formula: 'V = 1 / α [Bogenminuten]',
    latex: 'V = \\dfrac{1}{\\alpha}',
    description: 'Sehschärfe als Kehrwert des Sehwinkels α in Bogenminuten. V = 1,0 entspricht normalem Visus (Sehwinkel 1\').',
    variables: [
      { symbol: 'V',     name: 'Visus',       unit: '–',  description: 'Sehschärfe (1.0 = normal)' },
      { symbol: 'alpha', name: 'Sehwinkel α', unit: '\'', description: 'Sehwinkel in Bogenminuten' },
    ],
    solveFor: {
      V:     (v) => 1 / v.alpha,
      alpha: (v) => 1 / v.V,
    },
    tags: ['visus', 'sehschärfe', 'sehwinkel', 'refraktion'],
  },

  {
    id: 'logmar',
    name: 'logMAR-Visus',
    category: 'Refraktion',
    formula: 'logMAR = log₁₀(1 / V) = −log₁₀(V)',
    latex: '\\text{logMAR} = -\\log_{10}(V)',
    description: 'Logarithmischer Visusskalierung. logMAR = 0 entspricht V = 1.0, logMAR = 1.0 entspricht V = 0.1.',
    variables: [
      { symbol: 'logMAR', name: 'logMAR-Wert', unit: '–', description: 'Logarithmischer Visus (0 = normal)' },
      { symbol: 'V',      name: 'Dezimalvisus V', unit: '–', description: 'Visus als Dezimalzahl (z.B. 0.5)' },
    ],
    solveFor: {
      logMAR: (v) => -Math.log10(v.V),
      V:      (v) => Math.pow(10, -v.logMAR),
    },
    tags: ['logmar', 'visus', 'sehschärfe', 'logarithmisch'],
  },

  {
    id: 'visus_pruf',
    name: 'Visus bei veränderter Prüfentfernung',
    category: 'Refraktion',
    formula: 'V_neu = V_alt · d_alt / d_neu',
    latex: 'V_{neu} = V_{alt} \\cdot \\dfrac{d_{alt}}{d_{neu}}',
    description: 'Umrechnung des Visus auf eine andere Prüfentfernung.',
    variables: [
      { symbol: 'Vneu',  name: 'Neuer Visus',          unit: '–',  description: 'Visus bei neuer Prüfentfernung' },
      { symbol: 'Valt',  name: 'Bekannter Visus',       unit: '–',  description: 'Visus bei bekannter Prüfentfernung' },
      { symbol: 'dalt',  name: 'Alte Prüfentfernung',   unit: 'm',  description: 'Ursprüngliche Prüfentfernung' },
      { symbol: 'dneu',  name: 'Neue Prüfentfernung',   unit: 'm',  description: 'Neue Prüfentfernung' },
    ],
    solveFor: {
      Vneu: (v) => v.Valt * v.dalt / v.dneu,
      Valt: (v) => v.Vneu * v.dneu / v.dalt,
    },
    tags: ['visus', 'prüfentfernung', 'sehschärfe'],
  },

  {
    id: 'hofstetter',
    name: 'Hofstetter-Schätzformel (Akkommodation)',
    category: 'Refraktion',
    formula: 'A_max ≈ 15 − Alter / 4',
    latex: 'A_{max} \\approx 15 - \\dfrac{\\text{Alter}}{4}',
    description: 'Schätzformel für die maximale Akkommodationsbreite in Abhängigkeit vom Lebensalter in Jahren.',
    variables: [
      { symbol: 'Amax',  name: 'Max. Akkommodation', unit: 'dpt', description: 'Maximale Akkommodationsbreite' },
      { symbol: 'alter', name: 'Alter',               unit: 'a',  description: 'Lebensalter in Jahren' },
    ],
    solveFor: {
      Amax:  (v) => 15 - v.alter / 4,
      alter: (v) => (15 - v.Amax) * 4,
    },
    tags: ['hofstetter', 'akkommodation', 'alter', 'presbyopie'],
  },

  {
    id: 'refraktionsdefizit',
    name: 'Refraktionsdefizit',
    category: 'Refraktion',
    formula: 'D_RD = −A_R',
    latex: 'D_{RD} = -A_R',
    description: 'Refraktionsdefizit: negativer Wert der Fernpunktrefraktion. Bei Myopie negativ (A_R < 0 → D_RD > 0).',
    variables: [
      { symbol: 'DRD', name: 'Refraktionsdefizit', unit: 'dpt', description: 'Refraktionsdefizit (positiv = hyperop)' },
      { symbol: 'AR',  name: 'Fernpunktrefraktion A_R', unit: 'dpt', description: 'Vergenz am Fernpunkt (negativ = myop)' },
    ],
    solveFor: {
      DRD: (v) => -v.AR,
      AR:  (v) => -v.DRD,
    },
    tags: ['refraktion', 'fernpunkt', 'myopie', 'hyperopie', 'ametropsie'],
  },

  {
    id: 'aca_quotient',
    name: 'ACA-Quotient',
    category: 'Refraktion',
    formula: 'ACA = ΔKonvergenz / ΔAkkommodation',
    latex: 'ACA = \\dfrac{\\Delta\\text{Konvergenz}}{\\Delta\\text{Akkommodation}}',
    description: 'Akkommodations-Konvergenz-Akkommodations-Quotient. Normalwert: 3–5 cm/dpt.',
    variables: [
      { symbol: 'ACA',   name: 'ACA-Quotient',    unit: 'cm/dpt', description: 'Verhältnis Konvergenzänderung zu Akkommodationsänderung' },
      { symbol: 'dKonv', name: 'ΔKonvergenz',     unit: 'cm⁻¹',  description: 'Änderung der Konvergenz' },
      { symbol: 'dAkk',  name: 'ΔAkkommodation', unit: 'dpt',    description: 'Änderung der Akkommodation' },
    ],
    solveFor: {
      ACA:   (v) => v.dKonv / v.dAkk,
      dKonv: (v) => v.ACA * v.dAkk,
      dAkk:  (v) => v.dKonv / v.ACA,
    },
    tags: ['aca', 'akkommodation', 'konvergenz', 'binokularsehen'],
  },

  // ─── KONTAKTLINSEN ────────────────────────────────────────────────────────
  {
    id: 'kl_scheitelrefraktion',
    name: 'KL-Scheitelrefraktion (HSA-Umrechnung)',
    category: 'Kontaktlinsenanpassung',
    formula: "D_KL = D_Brille / (1 − d · D_Brille)",
    latex: "D_{KL} = \\dfrac{D_{Brille}}{1 - d \\cdot D_{Brille}}",
    description: 'Umrechnung von Brillenglasstärke auf Kontaktlinsenstärke. d = Hornhautscheitelabstand in Metern (ca. 0.012–0.015 m).',
    variables: [
      { symbol: 'DKL',     name: 'KL-Brechkraft',      unit: 'dpt', description: 'Benötigte Kontaktlinsenstärke' },
      { symbol: 'DBrille', name: 'Brillenglasbrechkraft', unit: 'dpt', description: 'Brillenglasstärke' },
      { symbol: 'd',       name: 'HSA d',               unit: 'm',   description: 'Hornhautscheitelabstand in Metern' },
    ],
    solveFor: {
      DKL:     (v) => v.DBrille / (1 - v.d * v.DBrille),
      DBrille: (v) => v.DKL / (1 + v.d * v.DKL),
      d:       (v) => (1 - v.DBrille / v.DKL) / v.DBrille,
    },
    tags: ['kontaktlinse', 'hsa', 'scheitelabstand', 'umrechnung', 'brille'],
  },

  {
    id: 'kl_traenenlinse',
    name: 'Tränenlinse (Kontaktlinse)',
    category: 'Kontaktlinsenanpassung',
    formula: 'D_TL ≈ 5 · Δr (näherungsweise)',
    latex: 'D_{TL} \\approx 5 \\cdot \\Delta r',
    description: 'Dioptrische Wirkung der Tränenlinse unter einer Kontaktlinse. Δr = Differenz der Hornhautkrümmungsradien zur KL-Rückfläche in mm.',
    variables: [
      { symbol: 'DTL',  name: 'Brechkraft Tränenlinse', unit: 'dpt', description: 'Wirkung der Tränenlinse' },
      { symbol: 'deltar', name: 'Radiendifferenz Δr',  unit: 'mm',  description: 'r_KL − r_Hornhaut in mm' },
    ],
    solveFor: {
      DTL:    (v) => 5 * v.deltar,
      deltar: (v) => v.DTL / 5,
    },
    tags: ['tränenlinse', 'kontaktlinse', 'anpassung'],
  },

  {
    id: 'kl_ophthalmometer',
    name: 'Ophthalmometerformel',
    category: 'Kontaktlinsenanpassung',
    formula: 'r = 2 · f · y / (y − y\')',
    latex: "r = \\dfrac{2 \\cdot f \\cdot y'}{y - y'}",
    description: 'Berechnung des Hornhautkrümmungsradius aus Ophthalmometermessung (Kearatometer). f = Objektivbrennweite, y/y\' = Bild-/Gegenstandsgröße.',
    variables: [
      { symbol: 'r',   name: 'Krümmungsradius r', unit: 'mm', description: 'Hornhautkrümmungsradius' },
      { symbol: 'f',   name: 'Brennweite f',       unit: 'mm', description: 'Objektivbrennweite des Ophthalmometers' },
      { symbol: 'yp',  name: "Bildgröße y'",       unit: 'mm', description: 'Bildgröße der Marke' },
      { symbol: 'y',   name: 'Gegenstandsgröße y', unit: 'mm', description: 'Markengröße (Objekt)' },
    ],
    solveFor: {
      r: (v) => 2 * v.f * v.yp / (v.y - v.yp),
    },
    tags: ['ophthalmometer', 'keratometer', 'hornhaut', 'kontaktlinse', 'radius'],
  },

  {
    id: 'kl_torizitaet',
    name: 'Torizität der Hornhaut',
    category: 'Kontaktlinsenanpassung',
    formula: 'Tor = r_Flach − r_Steil',
    latex: 'Tor = r_{flach} - r_{steil}',
    description: 'Torizität (Asphärizität) der Hornhaut: Differenz zwischen flachstem und steilstem Meridian.',
    variables: [
      { symbol: 'Tor',    name: 'Torizität',            unit: 'mm',  description: 'Torizität der Hornhaut' },
      { symbol: 'rFlach', name: 'Flachster Radius',     unit: 'mm',  description: 'Radius des flachsten Meridians (länger)' },
      { symbol: 'rSteil', name: 'Steilster Radius',     unit: 'mm',  description: 'Radius des steilsten Meridians (kürzer)' },
    ],
    solveFor: {
      Tor:    (v) => v.rFlach - v.rSteil,
      rFlach: (v) => v.Tor + v.rSteil,
      rSteil: (v) => v.rFlach - v.Tor,
    },
    tags: ['torizität', 'hornhaut', 'astigmatismus', 'kontaktlinse', 'radius'],
  },

  // ─── BRILLE & VERGR. SEHHILFEN ───────────────────────────────────────────
  {
    id: 'prentice',
    name: 'Prentice-Regel (Prismenwirkung)',
    category: 'Brillenanpassung',
    formula: 'P = c · |D\'|',
    latex: "P = c \\cdot |D'|",
    description: 'Prismatische Nebenwirkung bei Dezentration c (in cm) vom optischen Mittelpunkt.',
    variables: [
      { symbol: 'P',  name: 'Prismenwirkung P', unit: 'pdpt', description: 'Prismenablenkung in Prismendioptrien' },
      { symbol: 'c',  name: 'Dezentration c',   unit: 'cm',   description: 'Abstand vom optischen Mittelpunkt in cm' },
      { symbol: 'Dp', name: "Scheitelbrechwert D'", unit: 'dpt', description: 'Glasstärke am Berechnungspunkt' },
    ],
    solveFor: {
      P:  (v) => v.c * Math.abs(v.Dp),
      c:  (v) => v.P / Math.abs(v.Dp),
      Dp: (v) => v.P / v.c,
    },
    tags: ['prentice', 'prisma', 'dezentration', 'brille', 'nebenwirkung'],
  },

  {
    id: 'eigenvergroesserung',
    name: 'Eigenvergrößerung (Brillenglas)',
    category: 'Brillenanpassung',
    formula: "N_E = 1 / (1 − (d/n) · D₁) · 1 / (1 − d_s · D')",
    latex: "N_E = \\dfrac{1}{1 - \\frac{d}{n} D_1} \\cdot \\dfrac{1}{1 - d_s D'}",
    description: 'Eigenvergrößerung eines Brillenglases aus Formfaktor und Brechkraftfaktor.',
    variables: [
      { symbol: 'NE',  name: 'Eigenvergrößerung', unit: '×',   description: 'Vergrößerungsfaktor des Glases (>1 = Vergrößerung)' },
      { symbol: 'd',   name: 'Mittendicke d',      unit: 'm',   description: 'Mittendicke des Glases in Metern' },
      { symbol: 'n',   name: 'Brechzahl n',        unit: '–',   description: 'Brechungsindex des Glases' },
      { symbol: 'D1',  name: 'Vorderflächenbrechwert D₁', unit: 'dpt', description: 'Brechkraft der vorderen Fläche' },
      { symbol: 'ds',  name: 'HSA d_s',            unit: 'm',   description: 'Hornhautscheitelabstand in Metern' },
      { symbol: 'Dp',  name: "Scheitelbrechwert D'", unit: 'dpt', description: 'Hinterscheitelbrechwert des Glases' },
    ],
    solveFor: {
      NE: (v) => (1 / (1 - (v.d/v.n) * v.D1)) * (1 / (1 - v.ds * v.Dp)),
    },
    tags: ['eigenvergrößerung', 'brillenglas', 'vergrößerung', 'aniseikonie'],
  },

  {
    id: 'systemvergroesserung',
    name: 'Systemvergrößerung (Auge + Brille)',
    category: 'Brillenanpassung',
    formula: "N_S = A_R / D'",
    latex: "N_S = \\dfrac{A_R}{D'}",
    description: 'Systemvergrößerung: Verhältnis von Fernpunktrefraktion zu Scheitelbrechwert. Bei Emmetropie = 1.',
    variables: [
      { symbol: 'NS',  name: 'Systemvergrößerung', unit: '×',   description: 'Systemvergrößerung des korrigierten Auges' },
      { symbol: 'AR',  name: 'Fernpunktrefraktion A_R', unit: 'dpt', description: 'Vergenz am Fernpunkt des Auges' },
      { symbol: 'Dp',  name: "Scheitelbrechwert D'", unit: 'dpt', description: 'Hinterscheitelbrechwert des Brillenglases' },
    ],
    solveFor: {
      NS:  (v) => v.AR / v.Dp,
      AR:  (v) => v.NS * v.Dp,
      Dp:  (v) => v.AR / v.NS,
    },
    tags: ['systemvergrößerung', 'brille', 'auge', 'aniseikonie'],
  },

  {
    id: 'presbyopie_add',
    name: 'Nahzusatz (Presbyopie-Korrektion)',
    category: 'Brillenanpassung',
    formula: 'Add = D_nah − D_fern',
    latex: 'Add = D_{nah} - D_{fern}',
    description: 'Additio für Nahbrille oder Gleitsichtglas: Differenz zwischen benötigter Nah- und Fernkorrektion.',
    variables: [
      { symbol: 'Add',   name: 'Nahzusatz (Addition)', unit: 'dpt', description: 'Nahzusatz in Dioptrien' },
      { symbol: 'Dnah',  name: 'Nahkorrektion',        unit: 'dpt', description: 'Scheitelbrechwert für Nahsehen' },
      { symbol: 'Dfern', name: 'Fernkorrektion',       unit: 'dpt', description: 'Scheitelbrechwert für Fernsehen' },
    ],
    solveFor: {
      Add:   (v) => v.Dnah - v.Dfern,
      Dnah:  (v) => v.Add + v.Dfern,
      Dfern: (v) => v.Dnah - v.Add,
    },
    tags: ['addition', 'presbyopie', 'nahzusatz', 'gleitsichtglas', 'bifokalglas'],
  },

  {
    id: 'bildsprung',
    name: 'Bildsprung (Mehrstärkenglä.)',
    category: 'Brillenanpassung',
    formula: 'J = h_TK · Add',
    latex: 'J = h_{TK} \\cdot Add',
    description: 'Bildsprung an der Trennkante eines Mehrstärkenglases. h_TK = Abstand des Nahteilmittelpunktes von der Trennkante in cm.',
    variables: [
      { symbol: 'J',    name: 'Bildsprung J',     unit: 'pdpt', description: 'Prismatischer Bildsprung an der Trennkante' },
      { symbol: 'hTK',  name: 'Abstand h_TK',     unit: 'cm',   description: 'Abstand Nahteilmittelpunkt – Trennkante in cm' },
      { symbol: 'Add',  name: 'Nahzusatz Add',    unit: 'dpt',  description: 'Addition des Nahanteils' },
    ],
    solveFor: {
      J:   (v) => v.hTK * v.Add,
      hTK: (v) => v.J / v.Add,
      Add: (v) => v.J / v.hTK,
    },
    tags: ['bildsprung', 'mehrstärkenglas', 'bifokalglas', 'trennkante', 'prisma'],
  },

  // ─── PHYSIKALISCHE OPTIK ──────────────────────────────────────────────────
  {
    id: 'freq_wavelength',
    name: 'Frequenz und Wellenlänge',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'c = λ · f',
    latex: 'c = \\lambda \\cdot f',
    description: 'Zusammenhang zwischen Lichtgeschwindigkeit, Wellenlänge und Frequenz.',
    variables: [
      { symbol: 'c',      name: 'Lichtgeschwindigkeit c', unit: 'm/s', description: '≈ 3 × 10⁸ m/s im Vakuum' },
      { symbol: 'lambda', name: 'Wellenlänge λ',          unit: 'nm',  description: 'Wellenlänge (sichtbar: 380–780 nm)' },
      { symbol: 'f',      name: 'Frequenz f',             unit: 'Hz',  description: 'Schwingungsfrequenz des Lichts' },
    ],
    solveFor: {
      c:      (v) => (v.lambda / 1e9) * v.f,
      f:      (v) => v.c / (v.lambda / 1e9),
      lambda: (v) => (v.c / v.f) * 1e9,
    },
    tags: ['frequenz', 'wellenlänge', 'licht', 'dispersion'],
  },

  {
    id: 'wavelength_medium',
    name: 'Wellenlänge im Medium',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'λ_M = λ_Vak / n',
    latex: '\\lambda_M = \\dfrac{\\lambda_{Vak}}{n}',
    description: 'Wellenlänge des Lichts im Medium mit Brechzahl n. Die Frequenz bleibt konstant.',
    variables: [
      { symbol: 'lambdaM',   name: 'Wellenlänge im Medium', unit: 'nm', description: 'Wellenlänge im Medium' },
      { symbol: 'lambdaVak', name: 'Wellenlänge im Vakuum', unit: 'nm', description: 'Wellenlänge im Vakuum' },
      { symbol: 'n',         name: 'Brechzahl n',            unit: '–',  description: 'Brechungsindex des Mediums' },
    ],
    solveFor: {
      lambdaM:   (v) => v.lambdaVak / v.n,
      lambdaVak: (v) => v.lambdaM * v.n,
      n:         (v) => v.lambdaVak / v.lambdaM,
    },
    tags: ['wellenlänge', 'medium', 'brechzahl', 'dispersion'],
  },

  {
    id: 'reflexionsgrad_fresnel',
    name: 'Reflexionsgrad (Fresnel, senkrecht)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'ρ = ((n\' − n) / (n\' + n))²',
    latex: "\\rho = \\left(\\dfrac{n' - n}{n' + n}\\right)^2",
    description: 'Reflexionsgrad für senkrechten Lichteinfall an einer Grenzfläche (Fresnel-Formel). Für Glas/Luft: ca. 4% pro Fläche.',
    variables: [
      { symbol: 'rho',  name: 'Reflexionsgrad ρ', unit: '–',  description: 'Anteil des reflektierten Lichts (0–1)' },
      { symbol: 'np',   name: "Brechzahl n'",     unit: '–',  description: 'Brechzahl des zweiten Mediums' },
      { symbol: 'n',    name: 'Brechzahl n',      unit: '–',  description: 'Brechzahl des ersten Mediums' },
    ],
    solveFor: {
      rho: (v) => Math.pow((v.np - v.n) / (v.np + v.n), 2),
      np:  (v) => v.n * (1 + Math.sqrt(v.rho)) / (1 - Math.sqrt(v.rho)),
    },
    tags: ['reflexion', 'fresnel', 'entspiegelung', 'glas'],
  },

  {
    id: 'brewster',
    name: 'Brewster-Winkel (Polarisation)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'tan θ_B = n\' / n',
    latex: "\\tan\\theta_B = \\dfrac{n'}{n}",
    description: 'Brewster-Winkel: Bei diesem Einfallswinkel ist das reflektierte Licht vollständig polarisiert.',
    variables: [
      { symbol: 'thetaB', name: 'Brewster-Winkel θ_B', unit: '°', description: 'Winkel, bei dem Reflexion vollständig polarisiert' },
      { symbol: 'np',     name: "Brechzahl n'",         unit: '–', description: 'Brechzahl des zweiten Mediums' },
      { symbol: 'n',      name: 'Brechzahl n',          unit: '–', description: 'Brechzahl des ersten Mediums' },
    ],
    solveFor: {
      thetaB: (v) => Math.atan(v.np / v.n) * 180 / Math.PI,
      np:     (v) => v.n * Math.tan(v.thetaB * Math.PI / 180),
      n:      (v) => v.np / Math.tan(v.thetaB * Math.PI / 180),
    },
    tags: ['brewster', 'polarisation', 'reflexion'],
  },

  {
    id: 'malus',
    name: 'Malussches Gesetz (Polarisation)',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'I = I₀ · cos²α',
    latex: 'I = I_0 \\cdot \\cos^2\\alpha',
    description: 'Intensität nach Durchgang durch einen Polarisationsfilter, der um α gegen die Polarisationsrichtung gedreht ist.',
    variables: [
      { symbol: 'I',     name: 'Durchgelassene Intensität I', unit: 'cd/m²', description: 'Lichtintensität nach dem Filter' },
      { symbol: 'I0',    name: 'Eingangsintensität I₀',       unit: 'cd/m²', description: 'Intensität des polarisierten Lichts' },
      { symbol: 'alpha', name: 'Verdrehwinkel α',             unit: '°',     description: 'Winkel zwischen Polarisationsrichtung und Filter' },
    ],
    solveFor: {
      I:     (v) => v.I0 * Math.pow(Math.cos(v.alpha * Math.PI / 180), 2),
      I0:    (v) => v.I / Math.pow(Math.cos(v.alpha * Math.PI / 180), 2),
      alpha: (v) => Math.acos(Math.sqrt(v.I / v.I0)) * 180 / Math.PI,
    },
    tags: ['malus', 'polarisation', 'intensität', 'filter'],
  },

  {
    id: 'entspiegelung_dicke',
    name: 'Entspiegelungsschicht-Dicke',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'd_S = λ / (4 · n_S)',
    latex: 'd_S = \\dfrac{\\lambda}{4 \\cdot n_S}',
    description: 'Optimale Dicke einer Entspiegelungsschicht für destruktive Interferenz der Reflexionen. λ = Bezugswellenlänge (ca. 550 nm).',
    variables: [
      { symbol: 'dS',     name: 'Schichtdicke d_S',    unit: 'nm', description: 'Dicke der Entspiegelungsschicht' },
      { symbol: 'lambda', name: 'Wellenlänge λ',        unit: 'nm', description: 'Bezugswellenlänge (meist 550 nm für Grün)' },
      { symbol: 'nS',     name: 'Brechzahl Schicht n_S', unit: '–', description: 'Brechungsindex der Entspiegelungsschicht' },
    ],
    solveFor: {
      dS:     (v) => v.lambda / (4 * v.nS),
      lambda: (v) => v.dS * 4 * v.nS,
      nS:     (v) => v.lambda / (4 * v.dS),
    },
    tags: ['entspiegelung', 'schicht', 'interferenz', 'wellenlänge'],
  },

  {
    id: 'entspiegelung_n',
    name: 'Entspiegelungsschicht-Brechzahl',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'n_S = √(n_Glas)',
    latex: 'n_S = \\sqrt{n_{Glas}}',
    description: 'Optimale Brechzahl der Entspiegelungsschicht für minimale Reflexion. Amplitudenbedingung für MgF₂-Beschichtung.',
    variables: [
      { symbol: 'nS',    name: 'Brechzahl Schicht n_S', unit: '–', description: 'Brechungsindex der ET-Schicht (z.B. MgF₂ ≈ 1.38)' },
      { symbol: 'nGlas', name: 'Brechzahl Glas',        unit: '–', description: 'Brechungsindex des Trägerglases' },
    ],
    solveFor: {
      nS:    (v) => Math.sqrt(v.nGlas),
      nGlas: (v) => v.nS * v.nS,
    },
    tags: ['entspiegelung', 'brechzahl', 'schicht', 'amplitudenbedingung'],
  },

  // ─── PLANPARALLELE PLATTE ─────────────────────────────────────────────────
  {
    id: 'parallelverschiebung',
    name: 'Parallelverschiebung (Platte)',
    category: 'Allgemeine Formeln',
    formula: "e_P = d · sin(α₁ − α₁') / cos α₁'",
    latex: "e_P = d \\cdot \\dfrac{\\sin(\\alpha_1 - \\alpha_1')}{\\cos\\alpha_1'}",
    description: 'Seitliche Parallelverschiebung eines Lichtstrahls durch eine planparallele Platte der Dicke d.',
    variables: [
      { symbol: 'eP',      name: 'Parallelverschiebung e_P', unit: 'mm', description: 'Seitliche Verschiebung des Strahls' },
      { symbol: 'd',       name: 'Plattendicke d',            unit: 'mm', description: 'Dicke der planparallelen Platte' },
      { symbol: 'alpha1',  name: 'Einfallswinkel α₁',        unit: '°',  description: 'Einfallswinkel an der ersten Fläche' },
      { symbol: 'alpha1p', name: "Brechungswinkel α₁'",      unit: '°',  description: 'Brechungswinkel innerhalb der Platte' },
    ],
    solveFor: {
      eP: (v) => v.d * Math.sin((v.alpha1 - v.alpha1p) * Math.PI/180) / Math.cos(v.alpha1p * Math.PI/180),
    },
    tags: ['parallelverschiebung', 'planparallele platte', 'verschiebung'],
  },

  {
    id: 'laengsverschiebung',
    name: 'Längsverschiebung (Platte)',
    category: 'Allgemeine Formeln',
    formula: 'e_L = d · (1 − 1/n) [Näherung für kleine Winkel]',
    latex: 'e_L \\approx d \\cdot \\left(1 - \\dfrac{1}{n}\\right)',
    description: 'Scheinbare Längsverschiebung des Bildes durch eine planparallele Platte für kleine Winkel.',
    variables: [
      { symbol: 'eL', name: 'Längsverschiebung e_L', unit: 'mm', description: 'Scheinbare Verschiebung entlang der Achse' },
      { symbol: 'd',  name: 'Plattendicke d',          unit: 'mm', description: 'Dicke der Platte' },
      { symbol: 'n',  name: 'Brechzahl n',             unit: '–',  description: 'Brechungsindex der Platte' },
    ],
    solveFor: {
      eL: (v) => v.d * (1 - 1/v.n),
      d:  (v) => v.eL / (1 - 1/v.n),
      n:  (v) => 1 / (1 - v.eL/v.d),
    },
    tags: ['längsverschiebung', 'planparallele platte', 'optische wegänderung'],
  },

  // ─── PHOTOMETRIE ──────────────────────────────────────────────────────────
  {
    id: 'lichtstaerke',
    name: 'Lichtstärke & Lichtstrom',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'I = Φ / Ω',
    latex: 'I = \\dfrac{\\Phi}{\\Omega}',
    description: 'Lichtstärke I (Candela) = Lichtstrom Φ (Lumen) geteilt durch Raumwinkel Ω (Steradiant). Punktquelle: Φ = 4π · I.',
    variables: [
      { symbol: 'I',   name: 'Lichtstärke I',  unit: 'cd', description: 'Lichtstärke in Candela' },
      { symbol: 'Phi', name: 'Lichtstrom Φ',   unit: 'lm', description: 'Lichtstrom in Lumen' },
      { symbol: 'Omega', name: 'Raumwinkel Ω', unit: 'sr', description: 'Raumwinkel in Steradiant' },
    ],
    solveFor: {
      I:     (v) => v.Phi / v.Omega,
      Phi:   (v) => v.I * v.Omega,
      Omega: (v) => v.Phi / v.I,
    },
    tags: ['lichtstärke', 'lichtstrom', 'candela', 'lumen', 'photometrie'],
  },

  {
    id: 'beleuchtungsstaerke',
    name: 'Beleuchtungsstärke',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'E = I / r²',
    latex: 'E = \\dfrac{I}{r^2}',
    description: 'Beleuchtungsstärke (Lux) einer Punktlichtquelle im Abstand r. Bei schrägem Einfall: E = I·cos(α)/r².',
    variables: [
      { symbol: 'E', name: 'Beleuchtungsstärke E', unit: 'lx', description: 'Beleuchtungsstärke in Lux (lx = lm/m²)' },
      { symbol: 'I', name: 'Lichtstärke I',        unit: 'cd', description: 'Lichtstärke der Quelle in Candela' },
      { symbol: 'r', name: 'Abstand r',            unit: 'm',  description: 'Abstand zur Lichtquelle in Metern' },
    ],
    solveFor: {
      E: (v) => v.I / (v.r * v.r),
      I: (v) => v.E * v.r * v.r,
      r: (v) => Math.sqrt(v.I / v.E),
    },
    tags: ['beleuchtungsstärke', 'lux', 'photometrie', 'lichtquelle'],
  },

  {
    id: 'leuchtdichte',
    name: 'Leuchtdichte',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'L = I / A',
    latex: 'L = \\dfrac{I}{A}',
    description: 'Leuchtdichte L (cd/m²) = Lichtstärke I je leuchtender Fläche A. Maß für die wahrgenommene Helligkeit einer Fläche.',
    variables: [
      { symbol: 'L', name: 'Leuchtdichte L', unit: 'cd/m²', description: 'Leuchtdichte (Stilb = cd/cm²)' },
      { symbol: 'I', name: 'Lichtstärke I',  unit: 'cd',    description: 'Lichtstärke in Candela' },
      { symbol: 'A', name: 'Fläche A',       unit: 'm²',    description: 'Leuchtende Fläche in m²' },
    ],
    solveFor: {
      L: (v) => v.I / v.A,
      I: (v) => v.L * v.A,
      A: (v) => v.I / v.L,
    },
    tags: ['leuchtdichte', 'photometrie', 'candela', 'helligkeit'],
  },

  // ─── SPHÄROMETER & GLASBEARBEITUNG ───────────────────────────────────────
  {
    id: 'sphärometer',
    name: 'Sphärometer-Formel',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D_real = D_abgel · (n_real − 1) / (n_Abgl − 1)',
    latex: 'D_{real} = D_{abgl} \\cdot \\dfrac{n_{real} - 1}{n_{abgl} - 1}',
    description: 'Umrechnung des am Sphärometer abgelesenen Wertes auf den tatsächlichen Brechwert bei gegebenem Glasmaterial. n_Abgl = 1.523 (Eichglas).',
    variables: [
      { symbol: 'Dreal',  name: 'Realer Brechwert',         unit: 'dpt', description: 'Tatsächlicher Brechwert des Glases' },
      { symbol: 'Dabgl',  name: 'Abgelesener Brechwert',    unit: 'dpt', description: 'Brechwert am Sphärometer abgelesen' },
      { symbol: 'nreal',  name: 'Brechzahl des Glases n_r', unit: '–',   description: 'Tatsächliche Brechzahl des Glases' },
      { symbol: 'nabgl',  name: 'Brechzahl Eichglas n_e',  unit: '–',   description: 'Brechzahl des Eichglases (Standard: 1.523)' },
    ],
    solveFor: {
      Dreal: (v) => v.Dabgl * (v.nreal - 1) / (v.nabgl - 1),
      Dabgl: (v) => v.Dreal * (v.nabgl - 1) / (v.nreal - 1),
    },
    tags: ['sphärometer', 'glasbearbeitung', 'brechzahl', 'brechwert'],
  },

  {
    id: 'scheiteltiefe',
    name: 'Scheiteltiefe einer sphärischen Fläche',
    category: 'Optik & Technik der Sehhilfen',
    formula: 't = r − √(r² − (Ø/2)²)',
    latex: 't = r - \\sqrt{r^2 - \\left(\\dfrac{\\varnothing}{2}\\right)^2}',
    description: 'Pfeilhöhe (Scheiteltiefe) einer sphärisch gekrümmten Fläche mit Radius r und Durchmesser Ø.',
    variables: [
      { symbol: 't',   name: 'Scheiteltiefe t', unit: 'mm', description: 'Pfeilhöhe der gekrümmten Fläche' },
      { symbol: 'r',   name: 'Krümmungsradius r', unit: 'mm', description: 'Radius der Fläche' },
      { symbol: 'diam', name: 'Durchmesser Ø',   unit: 'mm', description: 'Glasdurchmesser' },
    ],
    solveFor: {
      t: (v) => v.r - Math.sqrt(v.r*v.r - Math.pow(v.diam/2, 2)),
      r: (v) => (Math.pow(v.diam/2, 2) + v.t*v.t) / (2*v.t),
    },
    tags: ['scheiteltiefe', 'pfeilhöhe', 'krümmungsradius', 'glasbearbeitung', 'sphärometer'],
  },

  // ─── FERNROHR-SPEZIFISCH ──────────────────────────────────────────────────
  {
    id: 'fernrohr_baulaenge',
    name: 'Baulänge Fernrohr (Kepler)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "L = f'_Obj + f'_Ok",
    latex: "L = f'_{Obj} + f'_{Ok}",
    description: "Baulänge (Rohrlänge) eines Keplerschen Fernrohrs = Summe der Brennweiten von Objektiv und Okular.",
    variables: [
      { symbol: 'L',    name: 'Baulänge L',       unit: 'mm', description: 'Länge des Fernrohrs' },
      { symbol: 'fObj', name: "Brennweite Objektiv f'_Obj", unit: 'mm', description: 'Bildseitige Brennweite des Objektivs' },
      { symbol: 'fOk',  name: "Brennweite Okular f'_Ok",  unit: 'mm', description: 'Bildseitige Brennweite des Okulars' },
    ],
    solveFor: {
      L:    (v) => v.fObj + v.fOk,
      fObj: (v) => v.L - v.fOk,
      fOk:  (v) => v.L - v.fObj,
    },
    tags: ['fernrohr', 'baulänge', 'kepler', 'objektiv', 'okular'],
  },

  {
    id: 'daemmerungszahl',
    name: 'Dämmerungszahl (Fernrohr)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "D_Z = √(Γ' · D_EP)",
    latex: "D_Z = \\sqrt{\\Gamma' \\cdot D_{EP}}",
    description: "Dämmerungszahl eines Fernrohrs: Maß für die Brauchbarkeit bei Dämmerung. D_EP = Objektivdurchmesser (Eintrittspupille) in mm.",
    variables: [
      { symbol: 'DZ',    name: 'Dämmerungszahl D_Z',  unit: '–',  description: 'Dämmerungszahl (höher = besser bei Dämmerung)' },
      { symbol: 'Gamma', name: "Vergrößerung Γ'",      unit: '×',  description: 'Vergrößerung des Fernrohrs' },
      { symbol: 'EP',    name: 'Eintrittspupille EP', unit: 'mm', description: 'Objektivdurchmesser (= Durchmesser der Eintrittspupille)' },
    ],
    solveFor: {
      DZ:    (v) => Math.sqrt(v.Gamma * v.EP),
      Gamma: (v) => (v.DZ * v.DZ) / v.EP,
      EP:    (v) => (v.DZ * v.DZ) / v.Gamma,
    },
    tags: ['dämmerungszahl', 'fernrohr', 'vergrößerung', 'eintrittspupille'],
  },

  {
    id: 'kuehl_lupe',
    name: 'Kühlsche Lupenformel',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = (D_L / 4) · (1 − e · D_L)",
    latex: "\\Gamma' = \\dfrac{D_L}{4} \\cdot (1 - e \\cdot D_L)",
    description: "Kühlsche Lupenformel für die Vergrößerung beim Benutzer mit Akkommodationsruhezustand (s₀ = 250 mm = 4 dpt). e = Abstand Auge-Lupe in Metern.",
    variables: [
      { symbol: 'Gamma', name: "Vergrößerung Γ'",    unit: '×',  description: 'Lupennormalvergrößerung' },
      { symbol: 'DL',    name: 'Lupenbrechkraft D_L', unit: 'dpt', description: 'Brechkraft der Lupe in Dioptrien' },
      { symbol: 'e',     name: 'Augenabstand e',    unit: 'm',  description: 'Abstand Auge–Lupe in Metern' },
    ],
    solveFor: {
      Gamma: (v) => (v.DL / 4) * (1 - v.e * v.DL),
      DL:    (v) => {
        // Γ' = (D_L/4)(1 − e·D_L)  →  (e/4)·D_L² − (1/4)·D_L + Γ' = 0
        const a_q = v.e / 4, b_q = -1/4, c_q = v.Gamma;
        const disc = b_q * b_q - 4 * a_q * c_q; // = 1/16 − e·Γ'
        if (disc < 0) return NaN;
        // Kleinere (physikalisch sinnvolle) Wurzel:
        return (-b_q - Math.sqrt(disc)) / (2 * a_q);
      },
    },
    tags: ['kühl', 'lupe', 'vergrößerung', 'sehweite'],
  },

  {
    id: 'sloan_habel',
    name: 'Sloan-Habel-Lupenformel',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = s₀ / (a_L − e · (1 + a_L · D_L))",
    latex: "\\Gamma' = \\dfrac{s_0}{a_L - e \\cdot (1 + a_L \\cdot D_L)}",
    description: "Sloan-Habel-Lupenformel: Vergrößerung unter Berücksichtigung des Augen-Abstands e und der Lupeneinstellentfernung a_L. s₀ = 0,25 m.",
    variables: [
      { symbol: 'Gamma', name: "Vergrößerung Γ'",           unit: '×',  description: 'Lupennormalvergrößerung' },
      { symbol: 's0',    name: 'Bezugssehweite s₀',        unit: 'm',  description: 'Konventionelle Bezugssehweite (0.25 m)' },
      { symbol: 'aL',    name: 'Einstellentfernung a_L',   unit: 'm',  description: 'Abstand Objekt–Lupe in Metern (negativ)' },
      { symbol: 'e',     name: 'Augenabstand e',           unit: 'm',  description: 'Abstand Auge–Lupe in Metern' },
      { symbol: 'DL',    name: 'Lupenbrechkraft D_L',      unit: 'dpt', description: 'Brechkraft der Lupe' },
    ],
    solveFor: {
      Gamma: (v) => v.s0 / (v.aL - v.e * (1 + v.aL * v.DL)),
    },
    tags: ['sloan', 'habel', 'lupe', 'vergrößerung'],
  },

  // ─── AUGE (ANATOMISCH/OPTISCH) ────────────────────────────────────────────
  {
    id: 'augensystem_gullstrand',
    name: 'Gullstrand-Auge (Referenzwerte)',
    category: 'Refraktion',
    formula: 'D_Auge = 59,74 dpt (unakkommodiert)',
    latex: 'D_{Auge} = 59{,}74\\,dpt',
    description: 'Optische Kenndaten des vereinfachten Gullstrand-Auges (DIN 5340): Gesamtbrechwert 59,74 dpt, Hornhaut 43,08 dpt, Linse 20,53 dpt. Brechzahlen: n_Kammerwasser = n_Glaskörper = 1,336.',
    variables: [
      { symbol: 'DAuge',   name: 'Gesamtbrechwert Auge', unit: 'dpt', description: 'Gesamtbrechkraft des Auges' },
      { symbol: 'DHH',     name: 'Hornhautbrechwert',    unit: 'dpt', description: 'Brechkraft der Hornhaut (≈ 43 dpt)' },
      { symbol: 'DLinse',  name: 'Linsenbrechwert',      unit: 'dpt', description: 'Brechkraft der Linse (≈ 20 dpt)' },
    ],
    solveFor: {
      DAuge: (v) => v.DHH + v.DLinse, // Näherung für Kontakt
    },
    tags: ['gullstrand', 'auge', 'hornhaut', 'linse', 'modell'],
  },

  {
    id: 'akkommodationsgebiet',
    name: 'Akkommodationsgebiet',
    category: 'Refraktion',
    formula: 'AG = |a_P − a_R|',
    latex: 'AG = |a_P - a_R|',
    description: 'Akkommodationsgebiet: Betrag der Strecke zwischen Nahpunkt P und Fernpunkt R (reell oder virtuell).',
    variables: [
      { symbol: 'AG', name: 'Akkommodationsgebiet AG', unit: 'm',   description: 'Ausdehnung des deutlichen Sehbereichs' },
      { symbol: 'aP', name: 'Nahpunktabstand a_P',    unit: 'm',   description: 'Abstand des Nahpunkts (negativ = reell vor Auge)' },
      { symbol: 'aR', name: 'Fernpunktabstand a_R',   unit: 'm',   description: 'Abstand des Fernpunkts (∞ bei Emmetropie)' },
    ],
    solveFor: {
      AG: (v) => Math.abs(v.aP - v.aR),
    },
    tags: ['akkommodationsgebiet', 'nahpunkt', 'fernpunkt', 'sehbereich'],
  },

  {
    id: 'augenlänge',
    name: 'Augenlänge bei Ametropie',
    category: 'Refraktion',
    formula: 'l = n_Gl / (A_R + D_A) + SH\'',
    latex: "l = \\dfrac{n_{Gl}}{A_R + D_A} + SH'",
    description: 'Berechnung der Augenlänge aus Fernpunktrefraktion und Gesamtbrechkraft. SH\' = bildseitiger Hauptpunktabstand ≈ 1,6 mm.',
    variables: [
      { symbol: 'l',   name: 'Augenlänge l',             unit: 'mm',  description: 'Gesamtlänge des Augapfels' },
      { symbol: 'nGl', name: 'Brechzahl Glaskörper n_Gl', unit: '–',  description: 'Brechzahl des Glaskörpers (1,336)' },
      { symbol: 'AR',  name: 'Fernpunktrefraktion A_R',  unit: 'dpt', description: 'Vergenz am Fernpunkt (0 = emmetrop)' },
      { symbol: 'DA',  name: 'Augenbrechwert D_A',       unit: 'dpt', description: 'Gesamtbrechwert des Auges (ca. 59,74 dpt)' },
      { symbol: 'SHp', name: "Hauptpunktabstand SH'",    unit: 'mm',  description: 'Bildseitiger Hauptpunktabstand (ca. 1,6 mm)' },
    ],
    solveFor: {
      l: (v) => (v.nGl / (v.AR + v.DA)) * 1000 + v.SHp,
      AR: (v) => v.nGl * 1000 / (v.l - v.SHp) - v.DA,
    },
    tags: ['augenlänge', 'baulänge', 'ametropie', 'auge'],
  },

  // ─── BEUGUNG ─────────────────────────────────────────────────────────────
  {
    id: 'gitter_verstaerkung',
    name: 'Gitter – Verstärkungsbedingung',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'sin θ = k · λ / g',
    latex: '\\sin\\theta = \\dfrac{k \\cdot \\lambda}{g}',
    description: 'Beugungsmaxima am optischen Gitter. k = Ordnung (1, 2, 3…), g = Gitterkonstante.',
    variables: [
      { symbol: 'theta',  name: 'Beugungswinkel θ', unit: '°',  description: 'Winkel des k-ten Maximums' },
      { symbol: 'k',      name: 'Ordnung k',         unit: '–',  description: 'Beugungsordnung (ganzzahlig)' },
      { symbol: 'lambda', name: 'Wellenlänge λ',     unit: 'nm', description: 'Lichtwellenlänge' },
      { symbol: 'g',      name: 'Gitterkonstante g', unit: 'µm', description: 'Abstand benachbarter Spalte in µm' },
    ],
    solveFor: {
      theta:  (v) => Math.asin(v.k * (v.lambda/1000) / v.g) * 180/Math.PI,
      lambda: (v) => Math.sin(v.theta * Math.PI/180) * v.g * 1000 / v.k,
      g:      (v) => v.k * (v.lambda/1000) / Math.sin(v.theta * Math.PI/180),
    },
    tags: ['gitter', 'beugung', 'wellenlänge', 'spektrum'],
  },

  // ─── SKIASKOPIE ───────────────────────────────────────────────────────────
  {
    id: 'skiaskopie_stabil',
    name: 'Skiaskopie (stabile Methode)',
    category: 'Refraktion',
    formula: "D_Auge = D_Abgl − 1/a",
    latex: "D_{Auge} = D_{Abgl} - \\dfrac{1}{a}",
    description: 'Berechnung der Augenrefraktion aus dem Abgleichergebnis bei der stabilen Skiaskopie. a = Skiaskopiermessabstand in Metern.',
    variables: [
      { symbol: 'DAuge', name: 'Augenrefraktion',    unit: 'dpt', description: 'Fernpunktbrechkraft des Auges' },
      { symbol: 'DAbgl', name: 'Abgleichbrechkraft', unit: 'dpt', description: 'Brechkraft bei Abgleich' },
      { symbol: 'a',     name: 'Messabstand a',      unit: 'm',   description: 'Skiaskopiermessabstand in Metern' },
    ],
    solveFor: {
      DAuge: (v) => v.DAbgl - 1/v.a,
      DAbgl: (v) => v.DAuge + 1/v.a,
      a:     (v) => 1 / (v.DAbgl - v.DAuge),
    },
    tags: ['skiaskopie', 'refraktion', 'messabstand', 'objektive refraktion'],
  },

  // ─── NEU: ABBILDUNGSOPTIK (KORREKTE SYMBOLIK) ────────────────────────────
  {
    id: 'flaechenbrechwert_vorder',
    name: 'Flächenbrechwert Vorderfläche D₁',
    category: 'Optik & Technik der Sehhilfen',
    formula: "D₁ = (n' − n) / r₁",
    latex: "D_1 = \\dfrac{n' - n}{r_1}",
    description: "Brechkraft der Vorderfläche einer Linse. n = Brechzahl des ersten Mediums (Luft = 1,0), n' = Brechzahl des Linsenmaterials. r₁ in Metern.",
    variables: [
      { symbol: 'D1',     name: 'Flächenbrechwert D₁',  unit: 'dpt', description: 'Brechkraft der Vorderfläche' },
      { symbol: 'nprime', name: "Brechzahl Glas n'",     unit: '–',   description: 'Brechzahl des Linsenmaterials (z.B. 1,5)' },
      { symbol: 'n',      name: 'Brechzahl Luft n',      unit: '–',   description: 'Brechzahl des ersten Mediums (Luft = 1,0)' },
      { symbol: 'r1',     name: 'Krümmungsradius r₁',   unit: 'm',   description: 'Krümmungsradius der Vorderfläche in Metern (positiv = Mittelpunkt rechts)' },
    ],
    solveFor: {
      D1:     (v) => (v.nprime - v.n) / v.r1,
      nprime: (v) => v.D1 * v.r1 + v.n,
      n:      (v) => v.nprime - v.D1 * v.r1,
      r1:     (v) => (v.nprime - v.n) / v.D1,
    },
    tags: ['flächenbrechwert', 'brechkraft', 'brechzahl', 'vorderfläche'],
  },

  {
    id: 'flaechenbrechwert_rueck',
    name: 'Flächenbrechwert Rückfläche D₂',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'D₂ = (1 − n) / r₂',
    latex: 'D_2 = \\dfrac{1 - n}{r_2}',
    description: "Brechkraft der Rückfläche einer Linse (Übergang Glas→Luft). n = Brechzahl des Glases. Hinweis: 1 steht für n_Luft = 1,0. r₂ in Metern.",
    variables: [
      { symbol: 'D2', name: 'Flächenbrechwert D₂',  unit: 'dpt', description: 'Brechkraft der Rückfläche' },
      { symbol: 'n',  name: 'Brechzahl Glas n',      unit: '–',   description: 'Brechzahl des Linsenmaterials' },
      { symbol: 'r2', name: 'Krümmungsradius r₂',   unit: 'm',   description: 'Krümmungsradius der Rückfläche in Metern' },
    ],
    solveFor: {
      D2: (v) => (1 - v.n) / v.r2,
      n:  (v) => 1 - v.D2 * v.r2,
      r2: (v) => (1 - v.n) / v.D2,
    },
    tags: ['flächenbrechwert', 'brechkraft', 'brechzahl', 'rückfläche'],
  },

  {
    id: 'bildseitige_brennweite',
    name: "Bildseitige Brennweite f'",
    category: 'Optik & Technik der Sehhilfen',
    formula: "f' = 1 / D",
    latex: "f' = \\dfrac{1}{D}",
    description: "Bildseitige Brennweite in Metern. Abstand vom bildseitigen Hauptpunkt H' zum bildseitigen Brennpunkt F'. Kehrwert der Gesamtbrechkraft D.",
    variables: [
      { symbol: 'fprime', name: "Bildseitige Brennweite f'", unit: 'm',   description: "Abstand H' → F' in Metern (positiv für Sammellinse)" },
      { symbol: 'D',      name: 'Gesamtbrechkraft D',        unit: 'dpt', description: 'Brechkraft des Systems in Dioptrien' },
    ],
    solveFor: {
      fprime: (v) => 1 / v.D,
      D:      (v) => 1 / v.fprime,
    },
    tags: ['brennweite', 'brechkraft', 'hauptpunkt', 'bildseitig'],
  },

  {
    id: 'objektseitige_brennweite',
    name: 'Objektseitige Brennweite f',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'f = −1 / D',
    latex: 'f = -\\dfrac{1}{D}',
    description: 'Objektseitige Brennweite in Metern. Abstand vom objektseitigen Hauptpunkt H zum objektseitigen Brennpunkt F. Für ein System in Luft gilt: f = −f\'.',
    variables: [
      { symbol: 'f', name: 'Objektseitige Brennweite f', unit: 'm',   description: 'Abstand H → F (negativ bei Sammellinse, Objekt links)' },
      { symbol: 'D', name: 'Gesamtbrechkraft D',          unit: 'dpt', description: 'Brechkraft des Systems in Dioptrien' },
    ],
    solveFor: {
      f: (v) => -1 / v.D,
      D: (v) => -1 / v.f,
    },
    tags: ['brennweite', 'brechkraft', 'objektseitig', 'hauptpunkt'],
  },

  {
    id: 'bildseitige_schnittweite',
    name: "Bildseitige Schnittweite s'",
    category: 'Optik & Technik der Sehhilfen',
    formula: "s' = f' + h'",
    latex: "s' = f' + h'",
    description: "Bildseitige Schnittweite: Abstand vom hinteren Scheitel der Linse zum Bildbrennpunkt F'. Bildet sich aus bildseitiger Brennweite f' und Hauptpunktverschiebung h'.",
    variables: [
      { symbol: 'sprime',  name: "Bildseitige Schnittweite s'", unit: 'm', description: "Abstand hinterer Scheitel → F' (in Metern)" },
      { symbol: 'fprime',  name: "Bildseitige Brennweite f'",   unit: 'm', description: "Abstand H' → F' (bildseitige Brennweite)" },
      { symbol: 'hprime',  name: "Hauptpunktverschiebung h'",   unit: 'm', description: "Abstand hinterer Scheitel → H'" },
    ],
    solveFor: {
      sprime: (v) => v.fprime + v.hprime,
      fprime: (v) => v.sprime - v.hprime,
      hprime: (v) => v.sprime - v.fprime,
    },
    tags: ['schnittweite', 'brennweite', 'hauptpunkt', 'scheitel'],
  },

  {
    id: 'bildseitiger_scheitelbrechwert',
    name: "Bildseitiger Scheitelbrechwert S'",
    category: 'Optik & Technik der Sehhilfen',
    formula: "S' = 1 / s'",
    latex: "S' = \\dfrac{1}{s'}",
    description: "Bildseitiger Scheitelbrechwert: Brechkraft, gemessen von der hinteren Scheitelfläche. s' ist die bildseitige Schnittweite in Metern. Entspricht dem messbaren Wert am Scheitelbrechwertmesser.",
    variables: [
      { symbol: 'Sprime', name: "Scheitelbrechwert S'",        unit: 'dpt', description: 'Bildseitiger Scheitelbrechwert (Scheitelbrechwertmesser)' },
      { symbol: 'sprime', name: "Bildseitige Schnittweite s'", unit: 'm',   description: "Schnittweite s' in Metern" },
    ],
    solveFor: {
      Sprime: (v) => 1 / v.sprime,
      sprime: (v) => 1 / v.Sprime,
    },
    tags: ['scheitelbrechwert', 'schnittweite', 'vertex', 'scheitelbrechwertmesser'],
  },

  {
    id: 'vergenz_abbildungsformel',
    name: 'Abbildungsgleichung (Vergenzform)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "A' = A + D",
    latex: "A' = A + D",
    description: "Vergenzform der Abbildungsgleichung: Die ausfallende Vergenz A' ergibt sich als Summe aus einfallender Vergenz A und Brechkraft D. A = n/a, A' = n'/a' (in Luft: A = 1/a, A' = 1/a').",
    variables: [
      { symbol: 'Aprime', name: "Ausfallende Vergenz A'", unit: 'dpt', description: "Vergenz nach dem optischen Element. A' = 1/a' (für Luft)" },
      { symbol: 'A',      name: 'Einfallende Vergenz A',  unit: 'dpt', description: 'Vergenz vor dem optischen Element. A = 1/a (für Luft; negativ für divergentes Licht)' },
      { symbol: 'D',      name: 'Brechkraft D',           unit: 'dpt', description: 'Brechkraft des optischen Elements' },
    ],
    solveFor: {
      Aprime: (v) => v.A + v.D,
      A:      (v) => v.Aprime - v.D,
      D:      (v) => v.Aprime - v.A,
    },
    tags: ['vergenz', 'abbildung', 'vergenzform', 'brechkraft'],
  },

  {
    id: 'voll_scheitelbrechwert',
    name: 'Vollkorrigierender Scheitelbrechwert (HSA-Änderung)',
    category: 'Brillenanpassung',
    formula: "S'_neu = S'_alt / (1 + (e_neu − e_alt) · S'_alt)",
    latex: "S'_{neu} = \\dfrac{S'_{alt}}{1 + (e_{neu} - e_{alt}) \\cdot S'_{alt}}",
    description: "Umrechnung des Scheitelbrechnwerts bei Änderung des Hornhautscheitelabstands (HSA). e in Metern. Wichtig beim Wechsel Brille ↔ Kontaktlinse oder bei neuer Fassung.",
    variables: [
      { symbol: 'Sneu',  name: "Neuer Scheitelbrechwert S'_neu", unit: 'dpt', description: 'Scheitelbrechwert am neuen Hornhautscheitelabstand' },
      { symbol: 'Salt',  name: "Alter Scheitelbrechwert S'_alt", unit: 'dpt', description: 'Bekannter Scheitelbrechwert am alten HSA' },
      { symbol: 'eneu',  name: 'Neuer HSA e_neu',                unit: 'm',   description: 'Neuer Hornhautscheitelabstand in Metern' },
      { symbol: 'ealt',  name: 'Alter HSA e_alt',                unit: 'm',   description: 'Alter Hornhautscheitelabstand in Metern' },
    ],
    solveFor: {
      Sneu:  (v) => v.Salt / (1 + (v.eneu - v.ealt) * v.Salt),
      Salt:  (v) => v.Sneu / (1 - (v.eneu - v.ealt) * v.Sneu),
      eneu:  (v) => v.ealt + (v.Salt - v.Sneu) / (v.Sneu * v.Salt),
    },
    tags: ['scheitelbrechwert', 'hsa', 'hornhautscheitelabstand', 'brille', 'kontaktlinse'],
  },

  {
    id: 'akkommodationsaufwand',
    name: 'Akkommodationsaufwand',
    category: 'Refraktion',
    formula: 'ΔD = D_E − D_R',
    latex: '\\Delta D = D_E - D_R',
    description: 'Akkommodationsaufwand: Differenz zwischen Einstellbrechkraft D_E (Nah) und Fernpunktbrechkraft D_R. Gibt an, wie viel Akkommodation aufgebracht werden muss.',
    variables: [
      { symbol: 'DeltaD', name: 'Akkommodationsaufwand ΔD', unit: 'dpt', description: 'Aufgebrachte Akkommodation' },
      { symbol: 'DE',     name: 'Einstellbrechkraft D_E',   unit: 'dpt', description: 'Brechkraft des Auges bei Einstellung auf Nahpunkt' },
      { symbol: 'DR',     name: 'Fernpunktbrechkraft D_R',  unit: 'dpt', description: 'Brechkraft des entspannten Auges (Fernpunkt)' },
    ],
    solveFor: {
      DeltaD: (v) => v.DE - v.DR,
      DE:     (v) => v.DeltaD + v.DR,
      DR:     (v) => v.DE - v.DeltaD,
    },
    tags: ['akkommodation', 'aufwand', 'auge', 'nahpunkt'],
  },

  {
    id: 'akkommodationserfolg',
    name: 'Akkommodationserfolg ΔA',
    category: 'Refraktion',
    formula: 'ΔA = A_R − A_E',
    latex: '\\Delta A = A_R - A_E',
    description: 'Akkommodationserfolg: Differenz aus Fernpunktvergenz A_R und Einstellvergenz A_E. Entspricht dem Vergenzunterschied zwischen Fern- und Einstellpunkt.',
    variables: [
      { symbol: 'DeltaA', name: 'Akkommodationserfolg ΔA', unit: 'dpt', description: 'Erzielte Akkommodation in Vergenz-Einheiten' },
      { symbol: 'AR',     name: 'Fernpunktvergenz A_R',    unit: 'dpt', description: 'Vergenz des Fernpunkts (A_R = 1/a_R)' },
      { symbol: 'AE',     name: 'Einstellvergenz A_E',     unit: 'dpt', description: 'Vergenz des Einstellpunkts (Nahpunkt)' },
    ],
    solveFor: {
      DeltaA: (v) => v.AR - v.AE,
      AR:     (v) => v.DeltaA + v.AE,
      AE:     (v) => v.AR - v.DeltaA,
    },
    tags: ['akkommodation', 'erfolg', 'vergenz', 'auge'],
  },

  {
    id: 'fernpunkt_refraktion',
    name: 'Fernpunktrefraktion A_R',
    category: 'Refraktion',
    formula: 'A_R = 1 / a_R',
    latex: 'A_R = \\dfrac{1}{a_R}',
    description: 'Fernpunktrefraktion: Vergenz am Fernpunkt des entspannten Auges. a_R = Fernpunktabstand vom Hauptpunkt des Auges (in Metern, negativ bei Myopie).',
    variables: [
      { symbol: 'AR', name: 'Fernpunktrefraktion A_R', unit: 'dpt', description: 'Vergenz am Fernpunkt (negativ = Myopie, positiv = Hyperopie)' },
      { symbol: 'aR', name: 'Fernpunktabstand a_R',    unit: 'm',   description: 'Abstand Hauptpunkt H – Fernpunkt (negativ wenn vor dem Auge)' },
    ],
    solveFor: {
      AR: (v) => 1 / v.aR,
      aR: (v) => 1 / v.AR,
    },
    tags: ['fernpunkt', 'refraktion', 'myopie', 'hyperopie', 'ametropie'],
  },

  {
    id: 'zylinder_fehler',
    name: 'Fehler bei Zylinderverdrehung',
    category: 'Brillenanpassung',
    formula: 'Z_Fehler = 2 · Z_Glas · sin(δ)',
    latex: 'Z_{Fehler} = 2 \\cdot Z_{Glas} \\cdot \\sin(\\delta)',
    description: 'Fehlerzylinderkomponente bei Verdrehung eines Zylinderglases um den Winkel δ. Z_Glas = Zylinderwert des Brillenglases.',
    variables: [
      { symbol: 'ZFehler', name: 'Fehlerzylinder',     unit: 'dpt', description: 'Entstehende Fehlerkomponente durch Verdrehung' },
      { symbol: 'ZGlas',   name: 'Zylinderwert Z_Glas', unit: 'dpt', description: 'Zylinderwert des verdrehten Brillenglases' },
      { symbol: 'delta',   name: 'Verdrehwinkel δ',     unit: '°',   description: 'Betrag der Verdrehung des Zylinderglases' },
    ],
    solveFor: {
      ZFehler: (v) => 2 * v.ZGlas * Math.sin(v.delta * Math.PI/180),
      ZGlas:   (v) => v.ZFehler / (2 * Math.sin(v.delta * Math.PI/180)),
      delta:   (v) => Math.asin(v.ZFehler / (2 * v.ZGlas)) * 180/Math.PI,
    },
    tags: ['zylinder', 'verdrehung', 'fehler', 'brille', 'astigmatismus'],
  },

  {
    id: 'hornhaut_astigmatismus_zentral',
    name: 'Zentraler Hornhautastigmatismus (A_K)',
    category: 'Kontaktlinsenanpassung',
    formula: 'AK = 376 · (1/r_steil − 1/r_flach)',
    latex: 'A_K = 376 \\cdot \\left(\\dfrac{1}{r_{steil}} - \\dfrac{1}{r_{flach}}\\right)',
    description: 'Berechnung des zentralen Hornhautastigmatismus aus den Krümmungsradien der steilen und flachen Hornhautmeridiane. Konstante 376 (in dpt·mm) basiert auf n_Hornhaut ≈ 1,376. Näherung: AK ≈ 6 · eKH.',
    variables: [
      { symbol: 'AK',     name: 'Hornhautastigmatismus A_K', unit: 'dpt', description: 'Betrag des zentralen Hornhautastigmatismus' },
      { symbol: 'rsteil', name: 'Steiler Radius r_steil',    unit: 'mm',  description: 'Kleiner Krümmungsradius (steiler Meridian), in mm' },
      { symbol: 'rflach', name: 'Flacher Radius r_flach',    unit: 'mm',  description: 'Großer Krümmungsradius (flacher Meridian), in mm' },
    ],
    solveFor: {
      AK:     (v) => 376 * (1/v.rsteil - 1/v.rflach),
      rsteil: (v) => 1 / (v.AK/376 + 1/v.rflach),
      rflach: (v) => 1 / (1/v.rsteil - v.AK/376),
    },
    tags: ['hornhaut', 'astigmatismus', 'kontaktlinse', 'krümmungsradius'],
  },

  {
    id: 'kl_23_regel',
    name: 'Anpassradius KL (2/3-Regel)',
    category: 'Kontaktlinsenanpassung',
    formula: 'r_KL = r_flach + (2/3) · eKH',
    latex: "r_{KL} = r_{flach} + \\dfrac{2}{3} \\cdot e_{KH}",
    description: 'Bestimmung des Anpassradius einer formstabilen Kontaktlinse nach der 2/3-Regel: Flacher Hornhautradius plus 2/3 der Hornhauttorizität (eKH).',
    variables: [
      { symbol: 'rKL',   name: 'Anpassradius KL r_KL',   unit: 'mm', description: 'Basisradius der anzupassenden Kontaktlinse' },
      { symbol: 'rflach',name: 'Flacher Hornhautradius',  unit: 'mm', description: 'Flacherer der beiden Hornhautradien' },
      { symbol: 'eKH',   name: 'Hornhauttorizität e_KH',  unit: 'mm', description: 'Hornhauttorizität = r_flach − r_steil' },
    ],
    solveFor: {
      rKL:    (v) => v.rflach + (2/3) * v.eKH,
      rflach: (v) => v.rKL - (2/3) * v.eKH,
      eKH:    (v) => (v.rKL - v.rflach) * 3/2,
    },
    tags: ['kontaktlinse', 'anpassradius', '2/3-regel', 'torizität'],
  },

  {
    id: 'restastigmatismus',
    name: 'Restastigmatismus bei torischer KL',
    category: 'Kontaktlinsenanpassung',
    formula: 'RA = A_ind + GA − ÄA',
    latex: 'RA = A_{ind} + GA - \\text{Ä}A',
    description: 'Restastigmatismus nach Einsetzen einer torischen Kontaktlinse. Setzt sich zusammen aus induziertem Astigmatismus A_ind, Gesamtastigmatismus GA und äußerem Astigmatismus ÄA.',
    variables: [
      { symbol: 'RA',   name: 'Restastigmatismus RA',    unit: 'dpt', description: 'Verbleibender Astigmatismus nach KL-Versorgung' },
      { symbol: 'Aind', name: 'Induzierter Astigm. A_ind', unit: 'dpt', description: 'Durch KL-Rückfläche induzierter Astigmatismus' },
      { symbol: 'GA',   name: 'Gesamtastigmatismus GA',  unit: 'dpt', description: 'GA = äußerer + innerer Astigmatismus' },
      { symbol: 'AeA',  name: 'Äußerer Astigm. ÄA',     unit: 'dpt', description: 'Astigmatismus der Hornhaut' },
    ],
    solveFor: {
      RA:   (v) => v.Aind + v.GA - v.AeA,
      Aind: (v) => v.RA - v.GA + v.AeA,
      GA:   (v) => v.RA - v.Aind + v.AeA,
      AeA:  (v) => v.GA + v.Aind - v.RA,
    },
    tags: ['restastigmatismus', 'kontaktlinse', 'torisch', 'astigmatismus'],
  },

  {
    id: 'farbsaum',
    name: 'Größe des Farbsaums P_chrom',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'P_chrom = P / ν_e',
    latex: 'P_{chrom} = \\dfrac{P}{\\nu_e}',
    description: 'Prismatische Wirkung eines Farbsaums. P = prismatische Wirkung in cm/m, ν_e = Abbe-Zahl des Glases. Größerer Farbsaum bei kleiner Abbe-Zahl (hochbrechendes Glas).',
    variables: [
      { symbol: 'Pchrom', name: 'Farbsaum P_chrom', unit: 'cm/m', description: 'Chromatische Aberration / Farbsaum' },
      { symbol: 'P',      name: 'Prismenbrechwert P', unit: 'cm/m', description: 'Prismatische Wirkung des Brillenglases' },
      { symbol: 'nue',    name: 'Abbe-Zahl ν_e',     unit: '–',    description: 'Abbe-Zahl des Glasmaterials (kennzeichnet Dispersion)' },
    ],
    solveFor: {
      Pchrom: (v) => v.P / v.nue,
      P:      (v) => v.Pchrom * v.nue,
      nue:    (v) => v.P / v.Pchrom,
    },
    tags: ['farbsaum', 'abbe-zahl', 'chromat', 'dispersion', 'prisma'],
  },

  {
    id: 'nasenflankenkraft',
    name: 'Nasenflankenkraft F_N',
    category: 'Brillenanpassung',
    formula: 'F_N = F_G / (2 · sin α)',
    latex: 'F_N = \\dfrac{F_G}{2 \\cdot \\sin\\alpha}',
    description: 'Kraft auf jede Nasenflanke beim Tragen einer Brille. F_G = Gewichtskraft der Brille, α = Neigungswinkel der Nasenflanke.',
    variables: [
      { symbol: 'FN',    name: 'Nasenflankenkraft F_N', unit: 'N',  description: 'Kraft auf eine Nasenflanke' },
      { symbol: 'FG',    name: 'Gewichtskraft F_G',     unit: 'N',  description: 'Gewichtskraft der Brille' },
      { symbol: 'alpha', name: 'Flankenwinkel α',        unit: '°',  description: 'Neigungswinkel der Nasenflanke zur Senkrechten' },
    ],
    solveFor: {
      FN:    (v) => v.FG / (2 * Math.sin(v.alpha * Math.PI/180)),
      FG:    (v) => 2 * v.FN * Math.sin(v.alpha * Math.PI/180),
      alpha: (v) => Math.asin(v.FG / (2 * v.FN)) * 180/Math.PI,
    },
    tags: ['nasenflankenkraft', 'brille', 'mechanik', 'anpassung'],
  },

  {
    id: 'nahzusatz_presbyopie',
    name: 'Vorläufiger Nahzusatz Z',
    category: 'Brillenanpassung',
    formula: 'Z = 1/|a| − (1/2 to 2/3) · A_max',
    latex: 'Z = \\dfrac{1}{|a|} - \\dfrac{1}{2} \\cdot A_{max}',
    description: 'Vorläufiger Nahzusatz für Presbyopen. 1/|a| = benötigte Vergenz für die Arbeitsentfernung a. Nach Köhler: 1/2 · A_max für A_max ≤ 1,00 dpt; 2/3 · A_max für A_max > 1,00 dpt.',
    variables: [
      { symbol: 'Z',    name: 'Nahzusatz Z',              unit: 'dpt', description: 'Vorläufiger Nahzusatz in Dioptrien' },
      { symbol: 'a',    name: 'Arbeitsentfernung a',       unit: 'm',   description: 'Gewünschte Lesedistanz in Metern (negativ eingeben)' },
      { symbol: 'Amax', name: 'Max. Akkommodationsbreite', unit: 'dpt', description: 'Maximale Akkommodationsbreite des Patienten' },
    ],
    solveFor: {
      Z:    (v) => 1/Math.abs(v.a) - 0.5 * v.Amax,
      a:    (v) => -1 / (v.Z + 0.5 * v.Amax),
      Amax: (v) => 2 * (1/Math.abs(v.a) - v.Z),
    },
    tags: ['nahzusatz', 'presbyopie', 'addition', 'leseglas', 'akkommodation'],
  },

  {
    id: 'bildsprung_e_dadd',
    name: 'Bildsprung bei Mehrstärkenglas',
    category: 'Brillenanpassung',
    formula: 'ΔP = e · D_Add',
    latex: '\\Delta P = e \\cdot D_{Add}',
    description: 'Prismatische Wirkung (Bildsprung) an der Trennkante eines Mehrstärkenglases. e = Abstand der Trennkante vom optischen Mittelpunkt des Fernteils in cm. D_Add = Nahzusatz in dpt.',
    variables: [
      { symbol: 'DeltaP', name: 'Bildsprung ΔP',           unit: 'cm/m', description: 'Prismatische Wirkung an der Trennkante' },
      { symbol: 'e',      name: 'Abstand Trennkante e',     unit: 'cm',   description: 'Abstand der Trennkante vom optischen Mittelpunkt des Fernteils in cm' },
      { symbol: 'DAdd',   name: 'Nahzusatz D_Add',          unit: 'dpt',  description: 'Nahzusatz (Addition) des Mehrstärkenglases' },
    ],
    solveFor: {
      DeltaP: (v) => v.e * v.DAdd,
      e:      (v) => v.DeltaP / v.DAdd,
      DAdd:   (v) => v.DeltaP / v.e,
    },
    tags: ['bildsprung', 'mehrstärkenglas', 'prisma', 'trennkante', 'addition'],
  },

  // ─── KONTAKTLINSEN (Astigmatismus) ────────────────────────────────────────
  {
    id: 'astigmatismus_aussen',
    name: 'Äußerer Astigmatismus (Hornhaut)',
    category: 'Kontaktlinsenanpassung',
    formula: 'A_außen = (n_k − 1) · (1/r_steil − 1/r_flach) · 1000',
    latex: 'A_{außen} = (n_k - 1) \\cdot \\left(\\dfrac{1}{r_{steil}} - \\dfrac{1}{r_{flach}}\\right) \\cdot 1000',
    description: 'Astigmatismus der Hornhorderfläche aus Keratometerwerten. Keratometrieindex n_k ≈ 1,3375. r_steil/r_flach in mm. Entspricht dem Hornhautastigmatismus (äußerer Astigmatismus). Näherung: A_außen ≈ 337,5 · (1/r_steil − 1/r_flach).',
    variables: [
      { symbol: 'A_au', name: 'Äußerer Astigmatismus', unit: 'dpt', description: 'Hornhautastigmatismus (Keratometrie)' },
      { symbol: 'n_k',  name: 'Keratometrieindex n_k', unit: '–',  description: 'Keratometrieindex (Standard: 1,3375)' },
      { symbol: 'rsteil', name: 'Radius steil r_steil', unit: 'mm', description: 'Kleiner Hornhautradius (steilster Meridian)' },
      { symbol: 'rflach', name: 'Radius flach r_flach', unit: 'mm', description: 'Großer Hornhautradius (flachster Meridian)' },
    ],
    solveFor: {
      A_au:   (v) => (v.n_k - 1) * (1/v.rsteil - 1/v.rflach) * 1000,
      rsteil: (v) => 1 / (v.A_au / ((v.n_k - 1) * 1000) + 1/v.rflach),
      rflach: (v) => 1 / (1/v.rsteil - v.A_au / ((v.n_k - 1) * 1000)),
    },
    tags: ['astigmatismus', 'äußer', 'hornhaut', 'keratometrie', 'kontaktlinse'],
  },

  {
    id: 'astigmatismus_innen',
    name: 'Innerer Astigmatismus',
    category: 'Kontaktlinsenanpassung',
    formula: 'A_innen = A_gesamt − A_außen',
    latex: 'A_{innen} = A_{gesamt} - A_{außen}',
    description: 'Innerer (residualer) Astigmatismus: Anteil des Gesamtastigmatismus, der nicht durch die Hornhaut verursacht wird. Er stammt aus Linsenflächen, Brechungsindex-Verteilung und Ausrichtungsfehlern. Typischerweise −0,25 bis −0,75 dpt mit Achse ca. 90° (gegen-den-Regelastigmatismus). Bei formstabiler KL bleibt A_innen unkorriert.',
    variables: [
      { symbol: 'A_i',    name: 'Innerer Astigmatismus A_innen', unit: 'dpt', description: 'Nicht-kornealer Anteil des Astigmatismus' },
      { symbol: 'A_ges',  name: 'Gesamtastigmatismus A_gesamt', unit: 'dpt', description: 'Totaler Astigmatismus aus der Refraktion' },
      { symbol: 'A_au2',  name: 'Äußerer Astigmatismus A_außen', unit: 'dpt', description: 'Hornhautastigmatismus aus Keratometrie' },
    ],
    solveFor: {
      A_i:   (v) => v.A_ges - v.A_au2,
      A_ges: (v) => v.A_i + v.A_au2,
      A_au2: (v) => v.A_ges - v.A_i,
    },
    tags: ['astigmatismus', 'innen', 'residual', 'kontaktlinse', 'linse'],
  },

  {
    id: 'kl_formstabil_restzyl',
    name: 'Restzylinder formstabile KL',
    category: 'Kontaktlinsenanpassung',
    formula: 'Z_Rest = A_innen (+ Z_ind)',
    latex: 'Z_{Rest} = A_{innen} + Z_{ind}',
    description: 'Bei einer formstabilen Kontaktlinse korrigiert die Tränenlinse den äußeren (kornealen) Astigmatismus vollständig. Als Restzylinder verbleibt der innere Astigmatismus A_innen plus ggf. ein induzierter Astigmatismus Z_ind durch eine Torizität der KL-Rückfläche. Wenn A_innen < 0,75 dpt: sphärische KL ausreichend.',
    variables: [
      { symbol: 'ZRest', name: 'Restzylinder Z_Rest', unit: 'dpt', description: 'Verbleibender Astigmatismus nach formstabiler KL' },
      { symbol: 'A_inn', name: 'Innerer Astigm. A_innen', unit: 'dpt', description: 'Innerer Astigmatismus (nicht-hornhautbedingt)' },
      { symbol: 'Zind',  name: 'Induzierter Zy. Z_ind', unit: 'dpt', description: 'Durch torische KL-Rückfläche induzierter Astigmatismus (0 bei sphär. Rückfläche)' },
    ],
    solveFor: {
      ZRest: (v) => v.A_inn + v.Zind,
      A_inn: (v) => v.ZRest - v.Zind,
      Zind:  (v) => v.ZRest - v.A_inn,
    },
    tags: ['restzylinder', 'formstabil', 'kontaktlinse', 'innerer astigmatismus'],
  },

  {
    id: 'kl_sagitta',
    name: 'Sagittahöhe (KL-Anpassung)',
    category: 'Kontaktlinsenanpassung',
    formula: 's = r − √(r² − (d/2)²)',
    latex: 's = r - \\sqrt{r^2 - \\left(\\dfrac{d}{2}\\right)^2}',
    description: 'Sagittahöhe einer Kugelkalotte mit Radius r und Sehnendurchmesser d. Wichtig für die KL-Anpassung: Sagittadifferenz zwischen Hornhaut und KL bestimmt das Aufsitzmuster. Einheiten: alle in mm.',
    variables: [
      { symbol: 's', name: 'Sagittahöhe s', unit: 'mm', description: 'Pfeilhöhe der Kugelkalotte' },
      { symbol: 'r', name: 'Radius r',      unit: 'mm', description: 'Krümmungsradius (Hornhaut oder KL)' },
      { symbol: 'd', name: 'Durchmesser d', unit: 'mm', description: 'Sehnendurchmesser (KL-Durchmesser oder Zonenbreite)' },
    ],
    solveFor: {
      s: (v) => v.r - Math.sqrt(v.r**2 - (v.d/2)**2),
      r: (v) => (v.s**2 + (v.d/2)**2) / (2 * v.s),
      d: (v) => 2 * Math.sqrt(v.r**2 - (v.r - v.s)**2),
    },
    tags: ['sagittahöhe', 'kontaktlinse', 'anpassung', 'radius', 'hornhaut'],
  },

  {
    id: 'prentice_toric',
    name: 'Prentice-Regel (torisches Glas)',
    category: 'Brillenanpassung',
    formula: 'P_H = Δx · D_H  |  P_V = Δy · D_V',
    latex: 'P_H = \\Delta x \\cdot D_H \\quad P_V = \\Delta y \\cdot D_V',
    description: 'Prismatische Nebenwirkung (PNW) bei torischen Gläsern. D_H = S + C·sin²(Achse), D_V = S + C·cos²(Achse). Dezentrierung Δ in cm, Brechkraft in dpt, Ergebnis in pdpt. Vollständige Berechnung (mit Kreuzkopplung) im Prismen-Tab.',
    variables: [
      { symbol: 'PH',     name: 'Horizontales Prisma P_H', unit: 'pdpt', description: 'Horizontale PNW-Komponente' },
      { symbol: 'PV',     name: 'Vertikales Prisma P_V',   unit: 'pdpt', description: 'Vertikale PNW-Komponente' },
      { symbol: 'deltax', name: 'Dezentrierung Δx',        unit: 'cm',   description: 'Horizontale Fehlzentrierung (OZ vs. Pupille) in cm' },
      { symbol: 'deltay', name: 'Dezentrierung Δy',        unit: 'cm',   description: 'Vertikale Fehlzentrierung in cm' },
      { symbol: 'DH',     name: 'Horizontale Brechkraft D_H', unit: 'dpt', description: 'Brechkraft im horizontalen Meridian' },
      { symbol: 'DV',     name: 'Vertikale Brechkraft D_V',   unit: 'dpt', description: 'Brechkraft im vertikalen Meridian' },
    ],
    solveFor: {
      PH:     (v) => v.deltax * v.DH,
      PV:     (v) => v.deltay * v.DV,
      deltax: (v) => v.PH / v.DH,
      deltay: (v) => v.PV / v.DV,
      DH:     (v) => v.PH / v.deltax,
      DV:     (v) => v.PV / v.deltay,
    },
    tags: ['prentice', 'prisma', 'dezentrierung', 'torisch', 'pnw', 'fehlzentrierung'],
  },

  {
    id: 'prisma_zerlegung',
    name: 'Prisma-Zerlegung (Komponenten)',
    category: 'Brillenanpassung',
    formula: 'P_H = P · cos α  |  P_V = P · sin α',
    latex: 'P_H = P \\cdot \\cos\\alpha \\quad P_V = P \\cdot \\sin\\alpha',
    description: 'Zerlegung eines Prismas P mit Basiswinkel α (TABO 0–360°) in horizontale und vertikale Komponenten. Umkehrung: P = √(P_H² + P_V²), α = atan2(P_V, P_H).',
    variables: [
      { symbol: 'P',   name: 'Gesamtprisma P',         unit: 'pdpt', description: 'Prismenwert (Betrag)' },
      { symbol: 'PH2', name: 'H-Komponente P_H',        unit: 'pdpt', description: 'Horizontale Komponente (positiv = Basis rechts)' },
      { symbol: 'PV2', name: 'V-Komponente P_V',        unit: 'pdpt', description: 'Vertikale Komponente (positiv = Basis oben)' },
      { symbol: 'alpha', name: 'Basiswinkel α (TABO)', unit: '°',    description: 'Richtung der Prismenbasis in TABO (0° = rechts, 90° = oben)' },
    ],
    solveFor: {
      P:     (v) => Math.sqrt(v.PH2**2 + v.PV2**2),
      PH2:   (v) => v.P * Math.cos(v.alpha * Math.PI/180),
      PV2:   (v) => v.P * Math.sin(v.alpha * Math.PI/180),
      alpha: (v) => { const a = Math.atan2(v.PV2, v.PH2)*180/Math.PI; return a < 0 ? a+360 : a; },
    },
    tags: ['prisma', 'zerlegung', 'komponenten', 'horizontal', 'vertikal', 'basis'],
  },

  {
    id: 'prisma_resultierend',
    name: 'Resultierendes Prisma (zwei Prismen)',
    category: 'Brillenanpassung',
    formula: 'P_res = √(P_H² + P_V²)',
    latex: 'P_{res} = \\sqrt{(P_{1H}+P_{2H})^2 + (P_{1V}+P_{2V})^2}',
    description: 'Vektorielle Addition zweier Prismen P₁ (Winkel α₁) und P₂ (Winkel α₂). Komponenten addieren, dann Betrag und Richtung berechnen. Für vollständige binokulare Analyse den Prismen-Tab nutzen.',
    variables: [
      { symbol: 'Pres',   name: 'Resultierendes Prisma', unit: 'pdpt', description: 'Betrag des resultierenden Prismenvektors' },
      { symbol: 'P1',     name: 'Prisma 1 P₁',           unit: 'pdpt', description: 'Erster Prismenwert' },
      { symbol: 'alpha1', name: 'Basis 1 α₁',            unit: '°',    description: 'Basisrichtung Prisma 1 (TABO)' },
      { symbol: 'P2',     name: 'Prisma 2 P₂',           unit: 'pdpt', description: 'Zweiter Prismenwert' },
      { symbol: 'alpha2', name: 'Basis 2 α₂',            unit: '°',    description: 'Basisrichtung Prisma 2 (TABO)' },
    ],
    solveFor: {
      Pres: (v) => {
        const r1 = v.alpha1*Math.PI/180, r2 = v.alpha2*Math.PI/180;
        return Math.sqrt((v.P1*Math.cos(r1)+v.P2*Math.cos(r2))**2 + (v.P1*Math.sin(r1)+v.P2*Math.sin(r2))**2);
      },
      P2: (v) => {
        const r1 = v.alpha1*Math.PI/180, r2 = v.alpha2*Math.PI/180;
        const Rx = v.Pres*Math.cos(r2) - v.P1*Math.cos(r1);
        const Ry = v.Pres*Math.sin(r2) - v.P1*Math.sin(r1);
        return Math.sqrt(Rx**2 + Ry**2);
      },
    },
    tags: ['prisma', 'resultierend', 'vektoraddition', 'kombination', 'basis'],
  },

  // ─── WEINHOLD-FORMEL (Erweiterte Prentice-Formel) ────────────────────────
  {
    id: 'weinhold',
    name: 'Weinhold-Formel (Erw. Prentice)',
    category: 'Brillenanpassung',
    formula: 'P_H = (S + C·sin²α)·Δx/10 + (−C·sinα·cosα)·Δy/10  |  P_V = (−C·sinα·cosα)·Δx/10 + (S + C·cos²α)·Δy/10',
    latex: 'P_H = D_{xx}\\cdot\\tfrac{\\Delta x}{10} + D_{xy}\\cdot\\tfrac{\\Delta y}{10},\\quad P_V = D_{xy}\\cdot\\tfrac{\\Delta x}{10} + D_{yy}\\cdot\\tfrac{\\Delta y}{10}',
    description: 'Erweiterte Prentice-Formel für torische Brillengläser (Brechkraft-Matrix-Methode). D_xx = S + C·sin²α, D_yy = S + C·cos²α, D_xy = −C·sinα·cosα (α = Zylinderachse TABO in Grad). Δx, Δy = Fehlzentrierung in mm; Division durch 10 ergibt Zentimeter. Ergebnis: P_H (horizontale) und P_V (vertikale Prismenkomponente) in pdpt. Für sphärische Gläser (C = 0) vereinfacht sich die Formel zur klassischen Prentice-Regel: P = D · c.',
    variables: [
      { symbol: 'PH',    name: 'Horizontales Prisma P_H',    unit: 'pdpt', description: 'Horizontale Prismakomponente nach Weinhold' },
      { symbol: 'PV',    name: 'Vertikales Prisma P_V',      unit: 'pdpt', description: 'Vertikale Prismakomponente nach Weinhold' },
      { symbol: 'S',     name: 'Sphäre S',                   unit: 'dpt',  description: 'Sphärischer Anteil der Korrektion' },
      { symbol: 'C',     name: 'Zylinder C',                 unit: 'dpt',  description: 'Zylindrischer Anteil (negatives Vorzeichen = Minusform)' },
      { symbol: 'alpha', name: 'Zylinderachse α',            unit: '°',    description: 'TABO-Achse des Zylinders (0–180°)' },
      { symbol: 'dx',    name: 'Dezentrierung Δx',           unit: 'mm',   description: 'Horizontale Fehlzentrierung (+: OZ rechts von Pupille)' },
      { symbol: 'dy',    name: 'Dezentrierung Δy',           unit: 'mm',   description: 'Vertikale Fehlzentrierung (+: OZ über Pupille)' },
    ],
    solveFor: {
      PH: (v) => {
        const r = v.alpha * Math.PI / 180;
        const Dxx = v.S + v.C * Math.sin(r)**2;
        const Dxy = -v.C * Math.sin(r) * Math.cos(r);
        return Dxx * v.dx/10 + Dxy * v.dy/10;
      },
      PV: (v) => {
        const r = v.alpha * Math.PI / 180;
        const Dyy = v.S + v.C * Math.cos(r)**2;
        const Dxy = -v.C * Math.sin(r) * Math.cos(r);
        return Dxy * v.dx/10 + Dyy * v.dy/10;
      },
    },
    tags: ['weinhold', 'prentice', 'prisma', 'dezentrierung', 'torisch', 'fehlzentrierung', 'nebenwirkung'],
  },

  // ─── TRÄNENLINSE (exakte Formel) ─────────────────────────────────────────
  {
    id: 'traenenlinse_exakt',
    name: 'Tränenlinse (exakte Formel)',
    category: 'Kontaktlinsenanpassung',
    formula: 'D_TL = (n_TL − 1)·(1/r_KL − 1/r_HH)·1000',
    latex: 'D_{TL} = (n_{TL} - 1) \\cdot \\left(\\dfrac{1}{r_{KL}} - \\dfrac{1}{r_{HH}}\\right) \\cdot 1000',
    description: 'Exakte Brechkraft der Tränenlinse zwischen Kontaktlinsen-Rückfläche (r_KL) und Hornhaut (r_HH). n_TL ≈ 1,336 (Brechzahl der Tränenflüssigkeit), r in mm → D in dpt. Bei formstabiler sphärischer KL: D_TL korrigiert den äußeren Astigmatismus vollständig. Vereinfachte Näherung: D_TL ≈ (r_HH − r_KL)·337,5 ≈ 5·Δr.',
    variables: [
      { symbol: 'DTL',  name: 'Brechkraft Tränenlinse D_TL', unit: 'dpt', description: 'Prismatische Wirkung der Tränenlinse' },
      { symbol: 'nTL',  name: 'Brechzahl Tränenflüssigkeit',  unit: '–',   description: 'n_TL ≈ 1,336' },
      { symbol: 'rKL',  name: 'Radius KL-Rückfläche r_KL',    unit: 'mm',  description: 'Rückseitenradius der Kontaktlinse' },
      { symbol: 'rHH',  name: 'Hornhautradius r_HH',          unit: 'mm',  description: 'Hornhautkrümmungsradius (zentraler Meridian)' },
    ],
    solveFor: {
      DTL:  (v) => (v.nTL - 1) * (1/v.rKL - 1/v.rHH) * 1000,
      rKL:  (v) => 1 / (v.DTL / ((v.nTL - 1) * 1000) + 1/v.rHH),
      rHH:  (v) => 1 / (1/v.rKL - v.DTL / ((v.nTL - 1) * 1000)),
    },
    tags: ['tränenlinse', 'kontaktlinse', 'anpassung', 'brechkraft', 'exakt'],
  },

  {
    id: 'traenenlinse_336',
    name: 'Tränenlinse (Meisterschule-Form, 336)',
    category: 'Kontaktlinsenanpassung',
    formula: "S'_Tr = 336 · (1/r_2/0 − 1/r_HH)",
    latex: "S'_{Tr} = 336 \\cdot \\left(\\dfrac{1}{r_{2/0}} - \\dfrac{1}{r_{HH}}\\right)",
    description: "Dioptrische Wirkung der Tränenlinse in der gebräuchlichen Form: Faktor 336 = (n_Tr − 1)·1000 mit n_Tr = 1,336. r_2/0 = Rückflächenradius (Basiszone 2/0) der formstabilen KL, r_HH = Hornhautradius im betrachteten Meridian. Beide Radien in mm. Näherung: S'_Tr ≈ 5·Δr.",
    variables: [
      { symbol: 'S_Tr', name: "Tränenlinse S'_Tr",         unit: 'dpt', description: 'Dioptrische Wirkung der Tränenlinse' },
      { symbol: 'r_20', name: 'KL-Rückflächenradius r_2/0', unit: 'mm',  description: 'Radius der KL-Basiszone (2/0)' },
      { symbol: 'r_HH', name: 'Hornhautradius r_HH',         unit: 'mm',  description: 'Hornhautradius im betrachteten Meridian' },
    ],
    solveFor: {
      S_Tr: (v) => 336 * (1/v.r_20 - 1/v.r_HH),
      r_20: (v) => 1 / (v.S_Tr/336 + 1/v.r_HH),
      r_HH: (v) => 1 / (1/v.r_20 - v.S_Tr/336),
    },
    tags: ['tränenlinse', 'kontaktlinse', '336', 'basiszone', 'hornhaut', 'formstabil'],
  },


  // ─── TRIGONOMETRIE & GEOMETRIE ────────────────────────────────────────────
  {
    id: 'pythagoras',
    name: 'Satz des Pythagoras',
    category: 'Allgemeine Formeln',
    formula: 'c² = a² + b²',
    latex: 'c^2 = a^2 + b^2',
    description: 'Im rechtwinkligen Dreieck: Das Quadrat der Hypotenuse c ist gleich der Summe der Quadrate der Katheten a und b. Umgestellt: c = √(a²+b²), a = √(c²−b²).',
    variables: [
      { symbol: 'c', name: 'Hypotenuse c', unit: '–', description: 'Längste Seite (gegenüber dem rechten Winkel)' },
      { symbol: 'a', name: 'Kathete a',    unit: '–', description: 'Erste Kathete des rechtwinkligen Dreiecks' },
      { symbol: 'b', name: 'Kathete b',    unit: '–', description: 'Zweite Kathete des rechtwinkligen Dreiecks' },
    ],
    solveFor: {
      c: (v) => Math.sqrt(v.a**2 + v.b**2),
      a: (v) => Math.sqrt(v.c**2 - v.b**2),
      b: (v) => Math.sqrt(v.c**2 - v.a**2),
    },
    tags: ['pythagoras', 'hypotenuse', 'kathete', 'dreieck', 'geometrie', 'grundformel'],
  },

  {
    id: 'trig_sinus',
    name: 'Sinus (sin)',
    category: 'Allgemeine Formeln',
    formula: 'sin α = Gegenkathete / Hypotenuse = a / c',
    latex: '\\sin\\alpha = \\dfrac{a}{c}',
    description: 'Sinus im rechtwinkligen Dreieck: Gegenkathete geteilt durch Hypotenuse. Umkehrung: α = arcsin(a/c). Wertebereich sin: −1 … +1.',
    variables: [
      { symbol: 'alpha', name: 'Winkel α',       unit: '°', description: 'Gesuchter Winkel (0–90°)' },
      { symbol: 'a',     name: 'Gegenkathete a', unit: '–', description: 'Seite gegenüber dem Winkel α' },
      { symbol: 'c',     name: 'Hypotenuse c',   unit: '–', description: 'Längste Seite des Dreiecks' },
    ],
    solveFor: {
      alpha: (v) => Math.asin(v.a / v.c) * 180/Math.PI,
      a:     (v) => v.c * Math.sin(v.alpha * Math.PI/180),
      c:     (v) => v.a / Math.sin(v.alpha * Math.PI/180),
    },
    tags: ['sinus', 'sin', 'arcsin', 'trigonometrie', 'winkel', 'dreieck', 'geometrie'],
  },

  {
    id: 'trig_kosinus',
    name: 'Kosinus (cos)',
    category: 'Allgemeine Formeln',
    formula: 'cos α = Ankathete / Hypotenuse = b / c',
    latex: '\\cos\\alpha = \\dfrac{b}{c}',
    description: 'Kosinus im rechtwinkligen Dreieck: Ankathete geteilt durch Hypotenuse. Umkehrung: α = arccos(b/c).',
    variables: [
      { symbol: 'alpha', name: 'Winkel α',     unit: '°', description: 'Gesuchter Winkel (0–90°)' },
      { symbol: 'b',     name: 'Ankathete b',  unit: '–', description: 'An Winkel α anliegende Kathete (nicht die Hypotenuse)' },
      { symbol: 'c',     name: 'Hypotenuse c', unit: '–', description: 'Längste Seite des Dreiecks' },
    ],
    solveFor: {
      alpha: (v) => Math.acos(v.b / v.c) * 180/Math.PI,
      b:     (v) => v.c * Math.cos(v.alpha * Math.PI/180),
      c:     (v) => v.b / Math.cos(v.alpha * Math.PI/180),
    },
    tags: ['kosinus', 'cos', 'arccos', 'trigonometrie', 'winkel', 'dreieck', 'geometrie'],
  },

  {
    id: 'trig_tangens',
    name: 'Tangens (tan)',
    category: 'Allgemeine Formeln',
    formula: 'tan α = Gegenkathete / Ankathete = a / b',
    latex: '\\tan\\alpha = \\dfrac{a}{b}',
    description: 'Tangens im rechtwinkligen Dreieck: Gegenkathete geteilt durch Ankathete. Umkehrung: α = arctan(a/b). Gilt auch: tan α = sin α / cos α.',
    variables: [
      { symbol: 'alpha', name: 'Winkel α',        unit: '°', description: 'Gesuchter Winkel (0–90°, ohne 90°)' },
      { symbol: 'a',     name: 'Gegenkathete a',  unit: '–', description: 'Seite gegenüber dem Winkel α' },
      { symbol: 'b',     name: 'Ankathete b',     unit: '–', description: 'An Winkel α anliegende Kathete' },
    ],
    solveFor: {
      alpha: (v) => Math.atan(v.a / v.b) * 180/Math.PI,
      a:     (v) => v.b * Math.tan(v.alpha * Math.PI/180),
      b:     (v) => v.a / Math.tan(v.alpha * Math.PI/180),
    },
    tags: ['tangens', 'tan', 'arctan', 'trigonometrie', 'winkel', 'dreieck', 'geometrie'],
  },

  {
    id: 'grad_bogenmass',
    name: 'Grad ↔ Bogenmaß',
    category: 'Allgemeine Formeln',
    formula: 'rad = α° · π / 180',
    latex: '\\text{rad} = \\alpha^\\circ \\cdot \\dfrac{\\pi}{180}',
    description: 'Umrechnung Grad → Bogenmaß und zurück. 180° = π rad ≈ 3,1416 rad. 1 rad ≈ 57,30°. 360° = 2π rad.',
    variables: [
      { symbol: 'rad',   name: 'Bogenmaß (rad)', unit: 'rad', description: 'Winkel im Bogenmaß' },
      { symbol: 'alpha', name: 'Winkel in Grad',  unit: '°',   description: 'Winkel in Grad' },
    ],
    solveFor: {
      rad:   (v) => v.alpha * Math.PI / 180,
      alpha: (v) => v.rad * 180 / Math.PI,
    },
    tags: ['bogenmaß', 'grad', 'winkel', 'umrechnung', 'geometrie', 'trigonometrie', 'radiant'],
  },

  // ─── KRAFT UND DRUCK ──────────────────────────────────────────────────────
  {
    id: 'gewichtskraft',
    name: 'Gewichtskraft (F_G = m · g)',
    category: 'Allgemeine Formeln',
    formula: 'F_G = m · g',
    latex: 'F_G = m \\cdot g',
    description: 'Gewichtskraft (Schwerkraft) einer Masse m im Schwerefeld der Erde. g ≈ 9,81 m/s². Einheit Newton (N = kg·m/s²). Praxisbeispiel Brille: Auflagekraft der Nasenpads.',
    variables: [
      { symbol: 'FG', name: 'Gewichtskraft F_G',   unit: 'N',    description: 'Gewichtskraft in Newton' },
      { symbol: 'm',  name: 'Masse m',              unit: 'kg',   description: 'Masse in Kilogramm' },
      { symbol: 'g',  name: 'Erdbeschleunigung g',  unit: 'm/s²', description: 'g ≈ 9,81 m/s² (Standardwert)' },
    ],
    solveFor: {
      FG: (v) => v.m * v.g,
      m:  (v) => v.FG / v.g,
      g:  (v) => v.FG / v.m,
    },
    tags: ['gewichtskraft', 'gewicht', 'masse', 'kraft', 'mechanik', 'grundformel', 'brille'],
  },

  {
    id: 'kraft_newton',
    name: '2. Newtonsches Gesetz (F = m · a)',
    category: 'Allgemeine Formeln',
    formula: 'F = m · a',
    latex: 'F = m \\cdot a',
    description: 'Zweites Newtonsches Gesetz: Kraft = Masse × Beschleunigung. Einheit: Newton (N = kg·m/s²). Sonderfall Gravitation: a = g ≈ 9,81 m/s².',
    variables: [
      { symbol: 'F', name: 'Kraft F',           unit: 'N',    description: 'Resultierende Kraft in Newton' },
      { symbol: 'm', name: 'Masse m',            unit: 'kg',   description: 'Masse des Körpers in kg' },
      { symbol: 'a', name: 'Beschleunigung a',   unit: 'm/s²', description: 'Beschleunigung des Körpers in m/s²' },
    ],
    solveFor: {
      F: (v) => v.m * v.a,
      m: (v) => v.F / v.a,
      a: (v) => v.F / v.m,
    },
    tags: ['kraft', 'newton', 'masse', 'beschleunigung', 'mechanik', 'grundformel'],
  },

  {
    id: 'druck_formel',
    name: 'Druck (p = F / A)',
    category: 'Allgemeine Formeln',
    formula: 'p = F / A',
    latex: 'p = \\dfrac{F}{A}',
    description: 'Druck = Kraft pro Fläche. Einheit Pascal (Pa = N/m²). 1 bar = 100 000 Pa. Praxis: Auflagedruck der Nasenpads einer Brille (F pro Pad = F_G/2, A = Auflagefläche in m²).',
    variables: [
      { symbol: 'p', name: 'Druck p',  unit: 'Pa',  description: 'Druck in Pascal (Pa = N/m²)' },
      { symbol: 'F', name: 'Kraft F',  unit: 'N',   description: 'Senkrecht wirkende Kraft in Newton' },
      { symbol: 'A', name: 'Fläche A', unit: 'm²',  description: 'Auflagefläche in Quadratmeter' },
    ],
    solveFor: {
      p: (v) => v.F / v.A,
      F: (v) => v.p * v.A,
      A: (v) => v.F / v.p,
    },
    tags: ['druck', 'kraft', 'fläche', 'pascal', 'mechanik', 'grundformel', 'nasenpad', 'brille'],
  },

  // ─── HORNHAUT-EXZENTRIZITÄT ───────────────────────────────────────────────
  {
    id: 'hornhaut_exzentrizitaet',
    name: 'Exzentrizität der Hornhaut (e-Wert / p-Wert)',
    category: 'Kontaktlinsenanpassung',
    formula: 'e = √(1 − p)   /   p = 1 − e²',
    latex: 'e = \\sqrt{1 - p} \\qquad\\Leftrightarrow\\qquad p = 1 - e^2',
    description: 'Die Hornhaut ist keine Kugel, sondern eine konikoidale (aspherische) Fläche. Der p-Wert (Formfaktor) und die Exzentrizität e beschreiben die periphere Abflachung. Kugel: p = 1, e = 0. Typische Hornhaut: p ≈ 0,75–0,85 → e ≈ 0,39–0,50. Je kleiner p (größer e), desto stärker die periphere Abflachung. Relevant für aspherische KL-Anpassung.',
    variables: [
      { symbol: 'e', name: 'Exzentrizität e', unit: '–', description: 'Exzentrizität der Hornhaut (0 = Kugel, typisch 0,40–0,55)' },
      { symbol: 'p', name: 'p-Wert (Formfaktor)', unit: '–', description: 'Formfaktor: p = 1 − e² (Kugel: p = 1; prolat abflachend: 0 < p < 1)' },
    ],
    solveFor: {
      e: (v) => Math.sqrt(1 - v.p),
      p: (v) => 1 - v.e * v.e,
    },
    tags: ['exzentrizität', 'e-wert', 'p-wert', 'formfaktor', 'hornhaut', 'konikoid', 'aspherisch', 'kontaktlinse'],
  },

  // ─── FERNROHR: VERGRÖSSERUNG & SEHFELD ───────────────────────────────────
  {
    id: 'fernrohr_vergr_pupille',
    name: "Fernrohrvergrößerung Γ' (Pupillendurchmesser)",
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ' = D_EP / D_AP  (= D_Obj / D_AP)",
    latex: "\\Gamma' = \\dfrac{D_{EP}}{D_{AP}} = \\dfrac{D_{Obj}}{D_{AP}}",
    description: "Winkelvergrößerung über Pupillendurchmesser. D_EP = Eintrittspupille (= Objektivdurchmesser bei afocalem System). D_AP = Austrittspupille (sichtbares Lichtaustrittsfeld am Okular). Äquivalent: Γ' = f'_Obj / |f'_Ok|. Je größer Γ', desto kleiner die Austrittspupille D_AP.",
    variables: [
      { symbol: 'Gamma', name: "Vergrößerung Γ'",          unit: '×',  description: 'Winkelvergrößerung (Betrag)' },
      { symbol: 'DEP',   name: 'Eintrittspupille D_EP',    unit: 'mm', description: 'Objektivdurchmesser = Eintrittspupille' },
      { symbol: 'DAP',   name: 'Austrittspupille D_AP',    unit: 'mm', description: 'Durchmesser der Austrittspupille am Okular' },
    ],
    solveFor: {
      Gamma: (v) => v.DEP / v.DAP,
      DEP:   (v) => v.Gamma * v.DAP,
      DAP:   (v) => v.DEP / v.Gamma,
    },
    tags: ['fernrohr', 'vergrößerung', 'eintrittspupille', 'austrittspupille', 'pupille', 'pupillendurchmesser', 'kepler', 'galilei'],
  },

  {
    id: 'sehfelddurchmesser',
    name: 'Sehfeldwinkel (Fernrohr)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "tan ω_real = y_FB / f'_Obj",
    latex: "\\tan\\omega_{real} = \\dfrac{y_{FB}}{f'_{Obj}}",
    description: "Realer Sehfeldwinkel ω_real des Fernrohrs. y_FB = Radius der Sehfeldblende (Feldblende) in der Zwischenbildebene. Scheinbarer Sehfeldwinkel: tan ω_schein = Γ' · tan ω_real. Sehfelddurchmesser auf 1000 m: d_SF = 2000 · tan ω_real (in Metern).",
    variables: [
      { symbol: 'omega_r', name: 'Realer Sehfeldwinkel ω_real', unit: '°',  description: 'Halber realer Sehfeldwinkel (Raumwinkel)' },
      { symbol: 'yFB',     name: 'Feldblenden-Radius y_FB',     unit: 'mm', description: 'Radius der Sehfeldblende in der Zwischenbildebene' },
      { symbol: 'fObj',    name: "Objektivbrennweite f'_Obj",   unit: 'mm', description: 'Bildseitige Brennweite des Objektivs' },
    ],
    solveFor: {
      omega_r: (v) => Math.atan(v.yFB / v.fObj) * 180/Math.PI,
      yFB:     (v) => v.fObj * Math.tan(v.omega_r * Math.PI/180),
      fObj:    (v) => v.yFB / Math.tan(v.omega_r * Math.PI/180),
    },
    tags: ['sehfeld', 'sehfeldwinkel', 'feldblende', 'fernrohr', 'kepler', 'galilei'],
  },

  {
    id: 'sehfeld_1000m',
    name: 'Sehfelddurchmesser auf 1000 m',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'd_SF = 2000 · tan ω_real',
    latex: 'd_{SF} = 2000 \\cdot \\tan\\omega_{real}',
    description: 'Sehfelddurchmesser auf 1000 m Entfernung in Metern. Standardangabe bei Ferngläsern (z.B. "115 m / 1000 m"). ω_real = halber realer Sehfeldwinkel des Fernrohrs.',
    variables: [
      { symbol: 'dSF',    name: 'Sehfelddurchmesser d_SF', unit: 'm', description: 'Sichtbares Feld auf 1000 m in Metern' },
      { symbol: 'omega_r', name: 'Realer Sehfeldwinkel ω', unit: '°', description: 'Halber realer Sehfeldwinkel' },
    ],
    solveFor: {
      dSF:     (v) => 2000 * Math.tan(v.omega_r * Math.PI/180),
      omega_r: (v) => Math.atan(v.dSF / 2000) * 180/Math.PI,
    },
    tags: ['sehfeld', 'sehfelddurchmesser', '1000m', 'fernglas', 'fernrohr'],
  },

  {
    id: 'lupe_normalvergr',
    name: "Lupe Normalvergrößerung Γ'",
    category: 'Optik & Technik der Sehhilfen',
    formula: "Γ'_N = D_L / 4 = 250 / f'_L",
    latex: "\\Gamma'_N = \\dfrac{D_L}{4} = \\dfrac{250}{f'_L}",
    description: "Normalvergrößerung einer Lupe bei Abbildung auf Unendlich (akkommodationsfreies Sehen). D_L = Brechkraft der Lupe in Dioptrien, f'_L = Brennweite in mm. Bezugssehweite: s₀ = 250 mm = 1/4 dpt.",
    variables: [
      { symbol: 'Gamma', name: "Normalvergrößerung Γ'_N",  unit: '×',   description: "Normalvergrößerung der Lupe (bei Bild im Unendlichen)" },
      { symbol: 'DL',    name: 'Brechkraft D_L',            unit: 'dpt', description: 'Brechkraft der Lupe in Dioptrien' },
      { symbol: 'fL',    name: "Brennweite f'_L",           unit: 'mm',  description: 'Bildseitige Brennweite der Lupe in mm' },
    ],
    solveFor: {
      Gamma: (v) => v.DL / 4,
      DL:    (v) => v.Gamma * 4,
      fL:    (v) => 250 / v.Gamma,
    },
    tags: ['lupe', 'normalvergrößerung', 'vergrößerung', 'sehweite', 'brennweite'],
  },

  // ─── REFRAKTION – ERGÄNZUNGEN (Handlungsfeld 1) ──────────────────────────
  {
    id: 'visus_schaetz_myopie',
    name: 'Visus-Schätzung (achsensymm. Fehlsichtigkeit)',
    category: 'Refraktion',
    formula: 'V = V_cc / 2^(2·M)',
    latex: "V = \\dfrac{V_{cc}}{2^{\\,2\\,M}}",
    description: 'Schätzt den unkorrigierten Visus bei rein sphärischer (achsensymmetrischer) Fehlsichtigkeit. Pro 0,50 dpt nicht korrigierter Myopie fällt der Visus auf die Hälfte des vorherigen Wertes. M als Betrag der Fehlsichtigkeit in dpt einsetzen.',
    variables: [
      { symbol: 'V',    name: 'Visus (unkorrigiert)',  unit: '–',   description: 'Geschätzter Visus ohne Korrektion' },
      { symbol: 'V_cc', name: 'Visus cc',              unit: '–',   description: 'Bestkorrigierter Visus (mit Korrektion)' },
      { symbol: 'M',    name: 'Fehlsichtigkeit',       unit: 'dpt', description: 'Betrag der unkorrigierten sphärischen Ametropie in dpt' },
    ],
    solveFor: {
      V:    (v) => v.V_cc / Math.pow(2, 2 * Math.abs(v.M)),
      V_cc: (v) => v.V * Math.pow(2, 2 * Math.abs(v.M)),
      M:    (v) => Math.log2(v.V_cc / v.V) / 2,
    },
    tags: ['visus', 'schätzformel', 'myopie', 'sphärisch', 'sehschärfe', 'refraktion'],
  },

  {
    id: 'visus_schaetz_astig',
    name: 'Visus-Schätzung (astigmatische Fehlsichtigkeit)',
    category: 'Refraktion',
    formula: 'V = V_cc / 2^(2·Z)',
    latex: "V = \\dfrac{V_{cc}}{2^{\\,2\\,Z}}",
    description: 'Schätzt den unkorrigierten Visus bei astigmatischer Fehlsichtigkeit. Pro 0,50 dpt nicht korrigierten Astigmatismus fällt der Visus auf die Hälfte des vorherigen Wertes. Z als Betrag des Zylinders in dpt einsetzen.',
    variables: [
      { symbol: 'V',    name: 'Visus (unkorrigiert)', unit: '–',   description: 'Geschätzter Visus ohne Korrektion' },
      { symbol: 'V_cc', name: 'Visus cc',             unit: '–',   description: 'Bestkorrigierter Visus (mit Korrektion)' },
      { symbol: 'Z',    name: 'Zylinder',             unit: 'dpt', description: 'Betrag des unkorrigierten Astigmatismus in dpt' },
    ],
    solveFor: {
      V:    (v) => v.V_cc / Math.pow(2, 2 * Math.abs(v.Z)),
      V_cc: (v) => v.V * Math.pow(2, 2 * Math.abs(v.Z)),
      Z:    (v) => Math.log2(v.V_cc / v.V) / 2,
    },
    tags: ['visus', 'schätzformel', 'astigmatismus', 'zylinder', 'sehschärfe', 'refraktion'],
  },

  {
    id: 'visus_schaetz_zusammen',
    name: 'Visus-Schätzung (zusammengesetzte Fehlsichtigkeit)',
    category: 'Refraktion',
    formula: 'V = V_cc / 2^(2·(M + Z))',
    latex: "V = \\dfrac{V_{cc}}{2^{\\,2\\,(M + Z)}}",
    description: 'Schätzt den unkorrigierten Visus bei kombinierter sphärischer und astigmatischer Fehlsichtigkeit. Die Effekte von Myopie (M) und Zylinder (Z) werden multiplikativ kombiniert. Beträge in dpt einsetzen.',
    variables: [
      { symbol: 'V',    name: 'Visus (unkorrigiert)', unit: '–',   description: 'Geschätzter Visus ohne Korrektion' },
      { symbol: 'V_cc', name: 'Visus cc',             unit: '–',   description: 'Bestkorrigierter Visus (mit Korrektion)' },
      { symbol: 'M',    name: 'Sphärische Ametropie', unit: 'dpt', description: 'Betrag der sphärischen Fehlsichtigkeit in dpt' },
      { symbol: 'Z',    name: 'Zylinder',             unit: 'dpt', description: 'Betrag des Astigmatismus in dpt' },
    ],
    solveFor: {
      V:    (v) => v.V_cc / Math.pow(2, 2 * (Math.abs(v.M) + Math.abs(v.Z))),
      V_cc: (v) => v.V * Math.pow(2, 2 * (Math.abs(v.M) + Math.abs(v.Z))),
    },
    tags: ['visus', 'schätzformel', 'zusammengesetzt', 'myopie', 'astigmatismus', 'sehschärfe', 'refraktion'],
  },

  {
    id: 'tiefenunterscheidung_stereo',
    name: 'Tiefenunterscheidungsvermögen (Stereowinkel)',
    category: 'Refraktion',
    formula: 'Δa_vorne = (a²·tan δ) / (p + a·tan δ)',
    latex: "\\Delta a_{vorne} = \\dfrac{a^2 \\cdot \\tan\\delta}{p + a \\cdot \\tan\\delta}",
    description: 'Kleinste noch unterscheidbare Tiefendifferenz vor dem fixierten Objekt (a) aus dem Stereo-Grenzwinkel δ. Für die Tiefe HINTER dem Objekt gilt das Minuszeichen im Nenner: Δa_hinten = a²·tan δ / (p − a·tan δ). p = Pupillendistanz, δ = Stereo-Grenzwinkel (Parallaxe benachbarter Knotenpunkte).',
    variables: [
      { symbol: 'da',    name: 'Tiefenunterschied Δa_vorne', unit: 'm', description: 'Kleinster unterscheidbarer Tiefenabstand vor dem Objekt' },
      { symbol: 'a',     name: 'Objektweite a',              unit: 'm', description: 'Abstand zum fixierten Objekt (positiv)' },
      { symbol: 'p',     name: 'Pupillendistanz p',          unit: 'm', description: 'Augenabstand (Pupillendistanz) in Metern' },
      { symbol: 'delta', name: 'Stereo-Grenzwinkel δ',       unit: '°', description: 'Stereoskopischer Grenzwinkel (Sehtiefe), typ. wenige Bogensekunden' },
    ],
    solveFor: {
      da: (v) => (v.a * v.a * Math.tan(v.delta * Math.PI/180)) / (v.p + v.a * Math.tan(v.delta * Math.PI/180)),
    },
    tags: ['tiefensehen', 'stereo', 'stereopsis', 'parallaxe', 'pupillendistanz', 'sehtiefe'],
  },

  {
    id: 'vergenzstellung',
    name: 'Vergenzstellung (Konvergenzbedarf)',
    category: 'Refraktion',
    formula: 'V = A · PD',
    latex: "V = A \\cdot PD \\;\\left[\\tfrac{cm}{m}\\right]",
    description: 'Aufzubringende Konvergenz eines Augenpaares (in cm/m = pdpt) für ein Objekt in der Einstellentfernung. A = Akkommodationsbedarf (= 1/Einstellentfernung), PD = Augendrehpunktabstand in cm. Vorzeichen kennzeichnet die Konvergenzrichtung (Original: V = −A·PD).',
    variables: [
      { symbol: 'V',  name: 'Konvergenzbedarf V',  unit: 'cm/m', description: 'Aufzubringende Konvergenz (1 cm/m = 1 pdpt)' },
      { symbol: 'A',  name: 'Akkommodationsbedarf', unit: 'dpt',  description: 'Akkommodationsbedarf = 1/Einstellentfernung [m]' },
      { symbol: 'PD', name: 'Augendrehpunktabstand PD', unit: 'cm', description: 'Pupillen-/Drehpunktabstand in Zentimetern' },
    ],
    solveFor: {
      V:  (v) => v.A * v.PD,
      A:  (v) => v.V / v.PD,
      PD: (v) => v.V / v.A,
    },
    tags: ['vergenz', 'konvergenz', 'aca', 'pupillendistanz', 'akkommodation', 'binokular'],
  },

  {
    id: 'aca_gradient',
    name: 'ACA-Gradient',
    category: 'Refraktion',
    formula: 'ACA = akkommodative Vergenz / Akkommodation',
    latex: "ACA = \\dfrac{\\text{akkommodative Vergenz}}{\\text{Akkommodation}}",
    description: 'Gradienten-Methode des AC/A-Verhältnisses: Änderung der akkommodativen Konvergenz pro Dioptrie Akkommodationsänderung (bei konstanter Objektentfernung, Vorhalten von ±-Gläsern). Im Gegensatz zum AC/A-Quotienten ohne psychische Vergenz.',
    variables: [
      { symbol: 'ACA', name: 'AC/A-Gradient',        unit: 'pdpt/dpt', description: 'Akkommodative Konvergenz pro dpt Akkommodation' },
      { symbol: 'AC',  name: 'Akkommodative Vergenz', unit: 'pdpt',    description: 'Änderung der akkommodativen Konvergenz' },
      { symbol: 'A',   name: 'Akkommodation',         unit: 'dpt',     description: 'Änderung der Akkommodation' },
    ],
    solveFor: {
      ACA: (v) => v.AC / v.A,
      AC:  (v) => v.ACA * v.A,
      A:   (v) => v.AC / v.ACA,
    },
    tags: ['aca', 'gradient', 'konvergenz', 'akkommodation', 'binokular'],
  },

  {
    id: 'skiaskopie_labil',
    name: 'Skiaskopie (labile Methode)',
    category: 'Refraktion',
    formula: "S'_Korr = S'_SG − 1/d'_s",
    latex: "S'_{Korr} = S'_{SG} - \\dfrac{1}{d'_s}",
    description: 'Korrektionsbrechwert aus der labilen (Strich-)Skiaskopie. Vom am Skiaskopiergerät gemessenen Brechwert S′_SG wird die Vergenz des Skiaskopierabstands abgezogen. d′_s = Abstand Untersucher–Patient in Metern.',
    variables: [
      { symbol: 'S_Korr', name: "Korrektion S'_Korr",      unit: 'dpt', description: 'Gesuchter Korrektionsbrechwert' },
      { symbol: 'S_SG',   name: "Skiaskopiewert S'_SG",     unit: 'dpt', description: 'Am Gerät abgelesener Brechwert (Schattengleichgewicht)' },
      { symbol: 'd_s',    name: "Skiaskopierabstand d'_s",  unit: 'm',   description: 'Arbeitsabstand Untersucher–Patient in Metern' },
    ],
    solveFor: {
      S_Korr: (v) => v.S_SG - 1 / v.d_s,
      S_SG:   (v) => v.S_Korr + 1 / v.d_s,
      d_s:    (v) => 1 / (v.S_SG - v.S_Korr),
    },
    tags: ['skiaskopie', 'labil', 'strichskiaskopie', 'refraktion', 'arbeitsabstand'],
  },

  {
    id: 'schiefgekreuzte_zylinder',
    name: 'Schiefgekreuzte Zylinder (resultierender Zylinder)',
    category: 'Refraktion',
    formula: 'Z_res = √((ΣZ_x)² + (ΣZ_y)²)',
    latex: "Z_{res} = \\sqrt{\\left(\\textstyle\\sum Z_x\\right)^2 + \\left(\\textstyle\\sum Z_y\\right)^2}",
    description: 'Vektorielle Überlagerung schiefgekreuzter Zylinder. Komponenten je Zylinder: Z_x = Z·cos²φ und Z_y = Z·sinφ·cosφ. Summe der Komponenten getrennt bilden, dann Betrag. Achse: tan φ_res = ΣZ_y / ΣZ_x (Quadranten beachten: φ_res<0 → +180°). Sphärenanteil: S_res = (Z_F − Z_res)/2 + ΣSph.',
    variables: [
      { symbol: 'Z_res', name: 'Resultierender Zylinder Z_res', unit: 'dpt', description: 'Betrag des resultierenden Zylinders' },
      { symbol: 'Zx',    name: 'Σ Z_x',                          unit: 'dpt', description: 'Summe der x-Komponenten (Z·cos²φ)' },
      { symbol: 'Zy',    name: 'Σ Z_y',                          unit: 'dpt', description: 'Summe der y-Komponenten (Z·sinφ·cosφ)' },
    ],
    solveFor: {
      Z_res: (v) => Math.sqrt(v.Zx * v.Zx + v.Zy * v.Zy),
    },
    tags: ['schiefgekreuzt', 'zylinder', 'überlagerung', 'astigmatismus', 'vektoraddition', 'refraktion'],
  },

  // ─── FERNROHRE – ERGÄNZUNGEN ─────────────────────────────────────────────
  {
    id: 'fernrohr_okularverschiebung',
    name: 'Okularverschiebung (Fernrohr)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "Δ = f'_Ok² · A_R",
    latex: "\\Delta = f'^2_{Ok} \\cdot A_R",
    description: 'Notwendige axiale Verschiebung des Okulars, um die Fehlsichtigkeit (Fernpunktrefraktion A_R) des Beobachters auszugleichen. Positiver A_R (Hyperopie) → Okular nach außen. f′_Ok = Okularbrennweite in Metern.',
    variables: [
      { symbol: 'Delta', name: 'Okularverschiebung Δ',    unit: 'm',   description: 'Axiale Verschiebung des Okulars in Metern' },
      { symbol: 'f_Ok',  name: "Okularbrennweite f'_Ok",  unit: 'm',   description: 'Bildseitige Brennweite des Okulars in Metern' },
      { symbol: 'A_R',   name: 'Fernpunktrefraktion A_R', unit: 'dpt', description: 'Fehlsichtigkeit des Beobachters (Fernpunktrefraktion)' },
    ],
    solveFor: {
      Delta: (v) => v.f_Ok * v.f_Ok * v.A_R,
      A_R:   (v) => v.Delta / (v.f_Ok * v.f_Ok),
      f_Ok:  (v) => Math.sqrt(v.Delta / v.A_R),
    },
    tags: ['fernrohr', 'okular', 'verschiebung', 'fernpunktrefraktion', 'fokussierung'],
  },

  {
    id: 'fernrohr_akkommodation_nah',
    name: 'Akkommodation bei naher Betrachtung (Fernrohr)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "A_mit = Γ'² · A_ohne",
    latex: "A_{mit} = \\Gamma'^2 \\cdot A_{ohne}",
    description: 'Beim Blick durch ein Fernrohr auf ein nahes Objekt steigt der Akkommodationsbedarf quadratisch mit der Fernrohrvergrößerung Γ′. A_ohne = Akkommodation ohne Fernrohr (= 1/Objektabstand).',
    variables: [
      { symbol: 'A_mit',   name: 'Akkommodation mit Fernrohr',  unit: 'dpt', description: 'Erforderliche Akkommodation durch das Fernrohr' },
      { symbol: 'Gamma',   name: "Fernrohrvergrößerung Γ'",     unit: '×',   description: 'Vergrößerung des Fernrohrs' },
      { symbol: 'A_ohne',  name: 'Akkommodation ohne Fernrohr', unit: 'dpt', description: 'Akkommodationsbedarf ohne Fernrohr (= 1/Objektabstand)' },
    ],
    solveFor: {
      A_mit:  (v) => v.Gamma * v.Gamma * v.A_ohne,
      A_ohne: (v) => v.A_mit / (v.Gamma * v.Gamma),
      Gamma:  (v) => Math.sqrt(v.A_mit / v.A_ohne),
    },
    tags: ['fernrohr', 'akkommodation', 'vergrößerung', 'nahbetrachtung'],
  },

  {
    id: 'fernrohr_nahgrenze',
    name: 'Nahgrenze eines Fernrohres',
    category: 'Optik & Technik der Sehhilfen',
    formula: "a_Nähe = −Γ'² / (D_A − A_R + ΔA_max)",
    latex: "a_{N\\ddot{a}he} = -\\dfrac{\\Gamma'^2}{D_A - A_R + \\Delta A_{max}}",
    description: 'Kleinste Objektentfernung, die mit einem Fernrohr (Γ′) noch scharf gesehen werden kann. D_A = positive Okulareinstellung (dpt), A_R = Fernpunktrefraktion des Beobachters, ΔA_max = maximale Akkommodationsbreite.',
    variables: [
      { symbol: 'a_Nahe',  name: 'Nahgrenze a_Nähe',        unit: 'm',   description: 'Kleinste scharf einstellbare Objektentfernung' },
      { symbol: 'Gamma',   name: "Fernrohrvergrößerung Γ'", unit: '×',   description: 'Vergrößerung des Fernrohrs' },
      { symbol: 'D_A',     name: 'Okulareinstellung D_A',   unit: 'dpt', description: 'Positive Okulareinstellung (dpt)' },
      { symbol: 'A_R',     name: 'Fernpunktrefraktion A_R', unit: 'dpt', description: 'Fehlsichtigkeit des Beobachters' },
      { symbol: 'dA_max',  name: 'Akkommodationsbreite ΔA_max', unit: 'dpt', description: 'Maximale Akkommodationsbreite des Beobachters' },
    ],
    solveFor: {
      a_Nahe: (v) => -(v.Gamma * v.Gamma) / (v.D_A - v.A_R + v.dA_max),
    },
    tags: ['fernrohr', 'nahgrenze', 'akkommodation', 'okulareinstellung', 'fernpunktrefraktion'],
  },

  {
    id: 'fernrohr_lichtstaerke_geom',
    name: 'Lichtstärke Fernrohr (geometrisch)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "L_geo = AP² = (EP / Γ')²",
    latex: "L_{geo} = AP^2 = \\left(\\dfrac{EP}{\\Gamma'}\\right)^2",
    description: 'Geometrische Lichtstärke eines Fernrohrs = Quadrat des Austrittspupillendurchmessers AP. AP = EP/Γ′ (Eintrittspupille geteilt durch Vergrößerung). Durchmesser in mm.',
    variables: [
      { symbol: 'L_geo', name: 'Lichtstärke (geom.)',   unit: 'mm²', description: 'Geometrische Lichtstärke = AP²' },
      { symbol: 'EP',    name: 'Eintrittspupille EP',   unit: 'mm',  description: 'Durchmesser der Eintrittspupille (Objektivöffnung)' },
      { symbol: 'Gamma', name: "Vergrößerung Γ'",       unit: '×',   description: 'Fernrohrvergrößerung' },
    ],
    solveFor: {
      L_geo: (v) => Math.pow(v.EP / v.Gamma, 2),
      EP:    (v) => Math.sqrt(v.L_geo) * v.Gamma,
      Gamma: (v) => v.EP / Math.sqrt(v.L_geo),
    },
    tags: ['fernrohr', 'lichtstärke', 'austrittspupille', 'eintrittspupille', 'geometrisch'],
  },

  {
    id: 'fernrohr_lichtstaerke_phys',
    name: 'Lichtstärke Fernrohr (physikalisch)',
    category: 'Optik & Technik der Sehhilfen',
    formula: "L_phys = (EP / Γ')² · τ",
    latex: "L_{phys} = \\left(\\dfrac{EP}{\\Gamma'}\\right)^2 \\cdot \\tau",
    description: 'Physikalische Lichtstärke = geometrische Lichtstärke × Durchlässigkeitsfaktor τ. Bei vergüteter (entspiegelter) Optik gilt τ ≈ 0,8.',
    variables: [
      { symbol: 'L_phys', name: 'Lichtstärke (phys.)',  unit: 'mm²', description: 'Physikalische Lichtstärke unter Berücksichtigung der Transmission' },
      { symbol: 'EP',     name: 'Eintrittspupille EP',  unit: 'mm',  description: 'Durchmesser der Eintrittspupille' },
      { symbol: 'Gamma',  name: "Vergrößerung Γ'",      unit: '×',   description: 'Fernrohrvergrößerung' },
      { symbol: 'tau',    name: 'Durchlässigkeit τ',    unit: '–',   description: 'Transmissionsfaktor (vergütete Optik ≈ 0,8)' },
    ],
    solveFor: {
      L_phys: (v) => Math.pow(v.EP / v.Gamma, 2) * v.tau,
      tau:    (v) => v.L_phys / Math.pow(v.EP / v.Gamma, 2),
    },
    tags: ['fernrohr', 'lichtstärke', 'transmission', 'vergütung', 'physikalisch'],
  },

  {
    id: 'fernrohrleistung',
    name: 'Fernrohrleistung',
    category: 'Optik & Technik der Sehhilfen',
    formula: 'FL = Visus mit Fernrohr / Visus ohne Fernrohr',
    latex: "FL = \\dfrac{V_{mit\\,Fernrohr}}{V_{ohne\\,Fernrohr}}",
    description: 'Tatsächlich erreichte Leistungssteigerung eines Fernrohrs als Verhältnis des Visus mit zu dem ohne Fernrohr. Liegt meist unter der nominellen Vergrößerung (Abbildungsfehler, Transmission).',
    variables: [
      { symbol: 'FL',     name: 'Fernrohrleistung',      unit: '×', description: 'Visusgewinn durch das Fernrohr' },
      { symbol: 'V_mit',  name: 'Visus mit Fernrohr',    unit: '–', description: 'Erreichter Visus mit Fernrohr' },
      { symbol: 'V_ohne', name: 'Visus ohne Fernrohr',   unit: '–', description: 'Visus ohne Fernrohr' },
    ],
    solveFor: {
      FL:     (v) => v.V_mit / v.V_ohne,
      V_mit:  (v) => v.FL * v.V_ohne,
      V_ohne: (v) => v.V_mit / v.FL,
    },
    tags: ['fernrohr', 'leistung', 'visus', 'vergrößerung'],
  },

  // ─── KONTAKTLINSEN – ERGÄNZUNGEN ─────────────────────────────────────────
  {
    id: 'kl_ueberrefraktion',
    name: 'Überrefraktion / Vollkorrektion (KL)',
    category: 'Kontaktlinsenanpassung',
    formula: "RD' = S'_KL + S'_Tr + RD",
    latex: "RD' = S'_{KL} + S'_{Tr} + RD",
    description: "Restdefizit RD′ einer Kontaktlinsenkorrektion aus KL-Scheitelbrechwert S′_KL, Tränenlinse S′_Tr und vorgehaltener Überrefraktion RD. Vollkorrektion liegt vor, wenn RD′ = 0 → benötigte Überrefraktion RD = −(S′_KL + S′_Tr).",
    variables: [
      { symbol: 'RD_p', name: "Restdefizit RD'",      unit: 'dpt', description: 'Verbleibendes Refraktionsdefizit (0 = vollkorrigiert)' },
      { symbol: 'S_KL', name: "KL-Brechwert S'_KL",   unit: 'dpt', description: 'Scheitelbrechwert der Kontaktlinse' },
      { symbol: 'S_Tr', name: "Tränenlinse S'_Tr",    unit: 'dpt', description: 'Dioptrische Wirkung der Tränenlinse' },
      { symbol: 'RD',   name: 'Überrefraktion RD',    unit: 'dpt', description: 'Vorgehaltene sphärische Überrefraktion' },
    ],
    solveFor: {
      RD_p: (v) => v.S_KL + v.S_Tr + v.RD,
      RD:   (v) => v.RD_p - v.S_KL - v.S_Tr,
      S_KL: (v) => v.RD_p - v.S_Tr - v.RD,
      S_Tr: (v) => v.RD_p - v.S_KL - v.RD,
    },
    tags: ['kontaktlinse', 'überrefraktion', 'vollkorrektion', 'restdefizit', 'scheitelbrechwert'],
  },

  {
    id: 'hornhautastig_peripher',
    name: 'Hornhautastigmatismus peripher',
    category: 'Kontaktlinsenanpassung',
    formula: 'HA_periph = 376 · (1/r_steil − 1/r_flach)',
    latex: "HA_{periph} = 376 \\cdot \\left(\\dfrac{1}{r_{sag,steil}} - \\dfrac{1}{r_{sag,flach}}\\right)",
    description: 'Peripherer Hornhautastigmatismus aus den sagittalen Radien (steil/flach) der Hornhautperipherie. Radien in mm. Achse parallel zum flachen Hauptschnitt. Faktor 376 = (n_HH − 1)·1000 mit n_HH = 1,376.',
    variables: [
      { symbol: 'HA',      name: 'Peripherer Astig. HA',   unit: 'dpt', description: 'Peripherer Hornhautastigmatismus' },
      { symbol: 'r_steil', name: 'Sagittalradius steil',   unit: 'mm',  description: 'Steiler sagittaler Hornhautradius (peripher)' },
      { symbol: 'r_flach', name: 'Sagittalradius flach',   unit: 'mm',  description: 'Flacher sagittaler Hornhautradius (peripher)' },
    ],
    solveFor: {
      HA: (v) => 376 * (1/v.r_steil - 1/v.r_flach),
    },
    tags: ['hornhaut', 'astigmatismus', 'peripher', 'sagittal', 'kontaktlinse'],
  },

  {
    id: 'kl_bitorisch_gesamt',
    name: 'Gesamtwirkung bitorische KL',
    category: 'Kontaktlinsenanpassung',
    formula: "S'_bitorisch = S'_innentorisch + S'_Überrefr.",
    latex: "S'_{bitorisch} = S'_{innentorisch} + S'_{\\ddot{U}berrefr.}",
    description: 'Scheitelbrechwert einer bitorischen Kontaktlinse aus dem innentorischen Anteil und der zusätzlichen Überrefraktion (= − RD′). Pro Hauptschnitt getrennt anwenden.',
    variables: [
      { symbol: 'S_bit',   name: "Bitorisch S'_bit",        unit: 'dpt', description: 'Gesamt-Scheitelbrechwert der bitorischen KL' },
      { symbol: 'S_innen', name: "Innentorisch S'_innen",   unit: 'dpt', description: 'Innentorischer Brechwertanteil' },
      { symbol: 'S_ueber', name: "Überrefraktion S'_über",  unit: 'dpt', description: 'Überrefraktionsanteil (= −RD′)' },
    ],
    solveFor: {
      S_bit:   (v) => v.S_innen + v.S_ueber,
      S_innen: (v) => v.S_bit - v.S_ueber,
      S_ueber: (v) => v.S_bit - v.S_innen,
    },
    tags: ['kontaktlinse', 'bitorisch', 'torisch', 'scheitelbrechwert', 'überrefraktion'],
  },

  // ─── BRILLENANPASSUNG – ERGÄNZUNGEN ──────────────────────────────────────
  {
    id: 'aniseikonie_aq',
    name: 'Aniseikonie (Aniseikoniequotient)',
    category: 'Brillenanpassung',
    formula: "AQ = y'_R / y'_L",
    latex: "AQ = \\dfrac{y'_{R}}{y'_{L}}",
    description: 'Aniseikoniequotient = Verhältnis der Netzhautbildgrößen rechts zu links. AQ = 1 → keine Aniseikonie. Durch Bildgrößenkorrektion (z. B. veränderte Glasdicke/Eigenvergrößerung) wird AQ_neu = AQ_alt / N angestrebt.',
    variables: [
      { symbol: 'AQ',  name: 'Aniseikoniequotient AQ', unit: '–', description: 'Verhältnis der Bildgrößen R/L' },
      { symbol: 'y_R', name: "Bildgröße rechts y'_R",  unit: 'mm', description: 'Netzhautbildgröße rechtes Auge' },
      { symbol: 'y_L', name: "Bildgröße links y'_L",   unit: 'mm', description: 'Netzhautbildgröße linkes Auge' },
    ],
    solveFor: {
      AQ:  (v) => v.y_R / v.y_L,
      y_R: (v) => v.AQ * v.y_L,
      y_L: (v) => v.y_R / v.AQ,
    },
    tags: ['aniseikonie', 'bildgröße', 'binokular', 'vergrößerung', 'brille'],
  },

  {
    id: 'nahbrille_zentrierabstand',
    name: 'Zentrierabstand Nahbrille (q)',
    category: 'Brillenanpassung',
    formula: "q = p · a / (a + b')",
    latex: "q = \\dfrac{p \\cdot a}{a + b'}",
    description: "Nahzentrierabstand (Gesamt) bei Einstärken-Nahbrillen für Konvergenz auf die Nahentfernung. a = positive Objektentfernung bis zur Glasebene, b′ = Augendrehpunktabstand (HSA + 13,50 mm), p = Gesamt-Pupillendistanz.",
    variables: [
      { symbol: 'q',  name: 'Nahzentrierabstand q',     unit: 'mm', description: 'Gesamter Nah-Zentrierabstand' },
      { symbol: 'p',  name: 'Pupillendistanz p',        unit: 'mm', description: 'Gesamt-Pupillendistanz (Ferne)' },
      { symbol: 'a',  name: 'Objektentfernung a',       unit: 'mm', description: 'Positive Objektentfernung bis zur Glasebene' },
      { symbol: 'b',  name: "Augendrehpunktabstand b'", unit: 'mm', description: 'HSA + 13,50 mm' },
    ],
    solveFor: {
      q: (v) => v.p * v.a / (v.a + v.b),
    },
    tags: ['nahbrille', 'zentrierung', 'konvergenz', 'pupillendistanz', 'nahteil'],
  },

  {
    id: 'nahteil_nasale_versetzung',
    name: 'Nasale Versetzung Nahteil (c)',
    category: 'Brillenanpassung',
    formula: "c = p · b' / (2·(a + b'))",
    latex: "c = \\dfrac{p \\cdot b'}{2 \\cdot (a + b')}",
    description: "Nasale Einwärtsversetzung des Nahteilmittelpunktes je Auge (von der Fern-Durchblickstelle). a = positive Objektentfernung bis zur Glasebene, b′ = Augendrehpunktabstand (HSA + 13,50 mm), p = Gesamt-Pupillendistanz.",
    variables: [
      { symbol: 'c', name: 'Nasale Versetzung c',      unit: 'mm', description: 'Einwärtsversetzung des Nahteils je Auge' },
      { symbol: 'p', name: 'Pupillendistanz p',        unit: 'mm', description: 'Gesamt-Pupillendistanz' },
      { symbol: 'a', name: 'Objektentfernung a',       unit: 'mm', description: 'Positive Objektentfernung bis zur Glasebene' },
      { symbol: 'b', name: "Augendrehpunktabstand b'", unit: 'mm', description: 'HSA + 13,50 mm' },
    ],
    solveFor: {
      c: (v) => v.p * v.b / (2 * (v.a + v.b)),
    },
    tags: ['nahteil', 'versetzung', 'nasal', 'zentrierung', 'nahbrille'],
  },

  {
    id: 'vorneigung_dezentration',
    name: 'Vorneigung & Dezentration',
    category: 'Brillenanpassung',
    formula: "tan α = x / b'",
    latex: "\\tan\\alpha = \\dfrac{x}{b'}",
    description: "Zusammenhang zwischen Fassungsvorneigung α und nötigem Höhenversatz x des Bezugspunktes in der Brillenglasebene. b′ = Augendrehpunktabstand. Näherung: x ≈ 0,5·α (x in mm, α in Grad).",
    variables: [
      { symbol: 'alpha', name: 'Vorneigung α',           unit: '°',  description: 'Vorneigungswinkel der Fassung' },
      { symbol: 'x',     name: 'Höhenversatz x',         unit: 'mm', description: 'Höhenversatz des Bezugspunktes in der Glasebene' },
      { symbol: 'b',     name: "Augendrehpunktabstand b'", unit: 'mm', description: 'HSA + 13,50 mm' },
    ],
    solveFor: {
      x:     (v) => v.b * Math.tan(v.alpha * Math.PI/180),
      alpha: (v) => Math.atan(v.x / v.b) * 180/Math.PI,
      b:     (v) => v.x / Math.tan(v.alpha * Math.PI/180),
    },
    tags: ['vorneigung', 'dezentration', 'höhenversatz', 'zentrierung', 'fassung'],
  },

  {
    id: 'trifokal_zwischenteil',
    name: 'Zwischenteil eines Trifokalglases',
    category: 'Brillenanpassung',
    formula: "Z_Zwischen = 0,5 · S'_Add",
    latex: "Z_{Zwischen} = 0{,}5 \\cdot S'_{Add}",
    description: 'Wirkung des Zwischenteils (Intermediärzone) eines Trifokalglases beträgt die Hälfte des Nahzusatzes (Addition).',
    variables: [
      { symbol: 'Z_zw',  name: 'Zwischenzusatz Z_Zw', unit: 'dpt', description: 'Addition des Zwischenteils' },
      { symbol: 'S_Add', name: "Nahzusatz S'_Add",    unit: 'dpt', description: 'Volle Addition (Nahzusatz)' },
    ],
    solveFor: {
      Z_zw:  (v) => 0.5 * v.S_Add,
      S_Add: (v) => 2 * v.Z_zw,
    },
    tags: ['trifokal', 'zwischenteil', 'addition', 'nahzusatz', 'mehrstärken'],
  },

  {
    id: 'nahzusatz_entfernung_umrechnung',
    name: 'Umrechnung Nahzusatz auf andere Entfernung',
    category: 'Brillenanpassung',
    formula: 'Z_neu = Z_alt + 1/a_alt − 1/a_neu',
    latex: "Z_{neu} = Z_{alt} + \\dfrac{1}{a_{alt}} - \\dfrac{1}{a_{neu}}",
    description: 'Rechnet den Nahzusatz Z von der ursprünglichen Prüfentfernung auf eine neue Arbeitsentfernung um. Entfernungen a in Metern und VORZEICHENRICHTIG (negativ) einsetzen.',
    variables: [
      { symbol: 'Z_neu', name: 'Nahzusatz neu Z_neu',  unit: 'dpt', description: 'Addition für die neue Entfernung' },
      { symbol: 'Z_alt', name: 'Nahzusatz alt Z_alt',  unit: 'dpt', description: 'Ursprüngliche Addition' },
      { symbol: 'a_alt', name: 'Entfernung alt a_alt', unit: 'm',   description: 'Ursprüngliche Arbeitsentfernung (negativ)' },
      { symbol: 'a_neu', name: 'Entfernung neu a_neu', unit: 'm',   description: 'Neue Arbeitsentfernung (negativ)' },
    ],
    solveFor: {
      Z_neu: (v) => v.Z_alt + 1/v.a_alt - 1/v.a_neu,
    },
    tags: ['nahzusatz', 'addition', 'entfernung', 'umrechnung', 'arbeitsabstand'],
  },

  {
    id: 'nahzusatz_dicke_glaeser',
    name: 'Nahzusatz-Umrechnung für dicke Gläser',
    category: 'Brillenanpassung',
    formula: 'Z_neu = N² · Z_alt',
    latex: "Z_{neu} = N^2 \\cdot Z_{alt}",
    description: 'Berücksichtigt die Eigenvergrößerung N dicker (stark gewölbter) Gläser bei der Nahzusatzbestimmung. N = Eigenvergrößerung des Glases.',
    variables: [
      { symbol: 'Z_neu', name: 'Nahzusatz korrigiert', unit: 'dpt', description: 'Korrigierter Nahzusatz' },
      { symbol: 'N',     name: 'Eigenvergrößerung N',  unit: '×',   description: 'Eigenvergrößerung des Glases' },
      { symbol: 'Z_alt', name: 'Nahzusatz Z_alt',      unit: 'dpt', description: 'Unkorrigierter Nahzusatz' },
    ],
    solveFor: {
      Z_neu: (v) => v.N * v.N * v.Z_alt,
      Z_alt: (v) => v.Z_neu / (v.N * v.N),
      N:     (v) => Math.sqrt(v.Z_neu / v.Z_alt),
    },
    tags: ['nahzusatz', 'dicke gläser', 'eigenvergrößerung', 'addition'],
  },

  {
    id: 'hoehenausgleichsprisma',
    name: 'Höhenausgleichsprisma (Anisometropie)',
    category: 'Brillenanpassung',
    formula: "ΔP_HAP = c_P · (S'_F,R − S'_F,L)",
    latex: "\\Delta P_{HAP} = c_P \\cdot \\left(S'_{F,R} - S'_{F,L}\\right)",
    description: 'Vertikale prismatische Differenz im Nahbezugspunkt bei Anisometropie (nach Prentice). c_P = Abstand Fern- zu Nahbezugspunkt im senkrechten Meridian (cm), S′_F = Fernteil-Scheitelbrechwerte rechts/links. Wird durch Höhenausgleichsprisma (Slab-off / Bi-Prism) kompensiert.',
    variables: [
      { symbol: 'dP',  name: 'Höhenimbalance ΔP_HAP', unit: 'pdpt', description: 'Vertikale prismatische Differenz im Nahbezugspunkt' },
      { symbol: 'c_P', name: 'Abstand c_P',           unit: 'cm',   description: 'Abstand Fern–Nahbezugspunkt (senkrechter Meridian)' },
      { symbol: 'S_R', name: "Fernteil R S'_F,R",     unit: 'dpt',  description: 'Vertikaler Fernteil-Scheitelbrechwert rechts' },
      { symbol: 'S_L', name: "Fernteil L S'_F,L",     unit: 'dpt',  description: 'Vertikaler Fernteil-Scheitelbrechwert links' },
    ],
    solveFor: {
      dP: (v) => v.c_P * (v.S_R - v.S_L),
    },
    tags: ['höhenausgleichsprisma', 'anisometropie', 'prentice', 'imbalance', 'nahteil', 'slab-off'],
  },

  // ─── SAGITTALRADIENMESSVERFAHREN / EXZENTRIZITÄT ─────────────────────────
  {
    id: 'sagittalradius_korrektur',
    name: 'Sagittaler Radius (Messkorrektur)',
    category: 'Kontaktlinsenanpassung',
    formula: 'r_sagittal = r_gemessen ± Δr₀',
    latex: "r_{sagittal} = r_{gemessen} \\pm \\Delta r_0",
    description: 'Korrektur des am Ophthalmometer peripher gemessenen Radius um den geräte-/winkelabhängigen Korrekturwert Δr₀. Vorzeichen: rectus → nasal/temporal +, superior/inferior −; inversus → umgekehrt.',
    variables: [
      { symbol: 'r_sag', name: 'Sagittaler Radius r_sagittal', unit: 'mm', description: 'Korrigierter sagittaler (peripherer) Radius' },
      { symbol: 'r_gem', name: 'Gemessener Radius r_gemessen', unit: 'mm', description: 'Abgelesener peripherer Radius' },
      { symbol: 'dr0',   name: 'Korrekturwert Δr₀',           unit: 'mm', description: 'Winkel-/geräteabhängige Radienkorrektur (mit Vorzeichen einsetzen)' },
    ],
    solveFor: {
      r_sag: (v) => v.r_gem + v.dr0,
      r_gem: (v) => v.r_sag - v.dr0,
      dr0:   (v) => v.r_sag - v.r_gem,
    },
    tags: ['sagittal', 'radius', 'ophthalmometer', 'peripher', 'hornhaut', 'kontaktlinse'],
  },

  {
    id: 'hornhaut_exzentrizitaet_sagittal',
    name: 'Numerische Exzentrizität (Sagittalradienmessverfahren)',
    category: 'Kontaktlinsenanpassung',
    formula: 'e = (1/sin φ) · √(1 − (r₀ / r_sagittal)²)',
    latex: "e = \\dfrac{1}{\\sin\\varphi}\\cdot\\sqrt{1 - \\left(\\dfrac{r_0}{r_{sagittal}}\\right)^2}",
    description: 'Numerische Exzentrizität (e-Wert) der Hornhaut aus dem Sagittalradienmessverfahren. φ = Fixierwinkel, r₀ = zentraler (apikaler) Radius, r_sagittal = peripher gemessener sagittaler Radius (= r_gemessen ± Δr₀). Hinweis: In der Quell-Formelsammlung ist die linke Seite irrtümlich als ε gedruckt — gemeint ist die Exzentrizität e.',
    variables: [
      { symbol: 'e',     name: 'Exzentrizität e',         unit: '–',  description: 'Numerische Exzentrizität der Hornhaut' },
      { symbol: 'phi',   name: 'Fixierwinkel φ',          unit: '°',  description: 'Fixierwinkel beim peripheren Messen' },
      { symbol: 'r_0',   name: 'Zentraler Radius r₀',     unit: 'mm', description: 'Zentraler (apikaler) Hornhautradius' },
      { symbol: 'r_sag', name: 'Sagittaler Radius r_sag', unit: 'mm', description: 'Peripher gemessener sagittaler Radius (= r_gemessen ± Δr₀)' },
    ],
    solveFor: {
      e:     (v) => (1 / Math.sin(v.phi * Math.PI/180)) * Math.sqrt(1 - Math.pow(v.r_0 / v.r_sag, 2)),
      r_sag: (v) => v.r_0 / Math.sqrt(1 - Math.pow(v.e * Math.sin(v.phi * Math.PI/180), 2)),
      phi:   (v) => Math.asin(Math.sqrt(1 - Math.pow(v.r_0 / v.r_sag, 2)) / v.e) * 180/Math.PI,
    },
    tags: ['exzentrizität', 'e-wert', 'sagittal', 'hornhaut', 'fixierwinkel', 'formfaktor', 'kontaktlinse'],
  },

  // ─── DEUTLICHE SEHBEREICHE & VERMUTLICHER VISUS ──────────────────────────
  {
    id: 'deutl_sehbereich_nahpunkt',
    name: 'Deutlicher Sehbereich – Nahpunkt',
    category: 'Brillenanpassung',
    formula: 'a_P = −1 / (Z + ΔA_max)',
    latex: "a_P = -\\dfrac{1}{Z + \\Delta A_{max}}",
    description: 'Nahpunkt (kürzeste deutliche Sehweite) eines Mehrstärkenglas-Durchblicks unter Einsatz der vollen Akkommodation. Z = wirksame Addition des Durchblicks (Fernteil: Z = 0). Bequemer Nahpunkt: ΔA_max durch ½·ΔA_max (≤1 dpt) bzw. ⅔·ΔA_max (>1 dpt) ersetzen. Ergebnis negativ (vor dem Auge).',
    variables: [
      { symbol: 'a_P',    name: 'Nahpunkt a_P',          unit: 'm',   description: 'Kürzeste deutliche Sehweite (negativ)' },
      { symbol: 'Z',      name: 'Wirksame Addition Z',   unit: 'dpt', description: 'Addition des Durchblicks (Fernteil: 0)' },
      { symbol: 'dA_max', name: 'Akkommodation ΔA_max',  unit: 'dpt', description: 'Eingesetzte (max. oder bequeme) Akkommodation' },
    ],
    solveFor: {
      a_P: (v) => -1 / (v.Z + v.dA_max),
    },
    tags: ['deutliche sehbereiche', 'nahpunkt', 'akkommodation', 'mehrstärken', 'addition', 'sehweite'],
  },

  {
    id: 'deutl_sehbereich_fernpunkt',
    name: 'Deutlicher Sehbereich – Fernpunkt (Nahteil)',
    category: 'Brillenanpassung',
    formula: 'a_R = −1 / Z',
    latex: "a_R = -\\dfrac{1}{Z}",
    description: 'Fernpunkt (weiteste deutliche Sehweite) eines Nahteil-Durchblicks ohne Akkommodation. Z = wirksame Addition des Nahteils. Ergebnis negativ (vor dem Auge).',
    variables: [
      { symbol: 'a_R', name: 'Fernpunkt a_R',        unit: 'm',   description: 'Weiteste deutliche Sehweite des Nahteils (negativ)' },
      { symbol: 'Z',   name: 'Wirksame Addition Z',  unit: 'dpt', description: 'Addition des Nahteil-Durchblicks' },
    ],
    solveFor: {
      a_R: (v) => -1 / v.Z,
      Z:   (v) => -1 / v.a_R,
    },
    tags: ['deutliche sehbereiche', 'fernpunkt', 'nahteil', 'addition', 'sehweite'],
  },

  {
    id: 'vermutlicher_visus_pruefentfernung',
    name: 'Vermutlicher Visus auf Prüfentfernung',
    category: 'Refraktion',
    formula: 'V = V_cc / 2^(2·|A_R − 1/d|)',
    latex: "V = \\dfrac{V_{cc}}{2^{\\,2\\,\\left|A_R - \\frac{1}{d}\\right|}}",
    description: 'Schätzt den auf einer bestimmten Prüfentfernung d (z. B. −6 m) erreichbaren Visus aus der (unkorrigierten) Fernpunktrefraktion A_R. Der Defokus ΔD = |A_R − 1/d| berücksichtigt die Objektvergenz 1/d der Prüfentfernung; je 0,50 dpt Defokus halbiert sich der Visus. d vorzeichenrichtig (negativ) einsetzen.',
    variables: [
      { symbol: 'V',    name: 'Vermutlicher Visus',     unit: '–',   description: 'Erwarteter Visus auf der Prüfentfernung' },
      { symbol: 'V_cc', name: 'Visus cc',               unit: '–',   description: 'Bestkorrigierter Visus' },
      { symbol: 'A_R',  name: 'Fernpunktrefraktion A_R', unit: 'dpt', description: 'Unkorrigierte Fernpunktrefraktion (Ametropie)' },
      { symbol: 'd',    name: 'Prüfentfernung d',        unit: 'm',   description: 'Prüfentfernung, negativ (z. B. −6 m); für „unendlich" sehr großen Betrag wählen' },
    ],
    solveFor: {
      V: (v) => v.V_cc / Math.pow(2, 2 * Math.abs(v.A_R - 1/v.d)),
    },
    tags: ['visus', 'prüfentfernung', 'defokus', 'schätzformel', 'fernpunktrefraktion', '6 meter'],
  },

  // ─── RESTLICHE ERGÄNZUNGEN ───────────────────────────────────────────────
  {
    id: 'geschwindigkeit',
    name: 'Geschwindigkeit',
    category: 'Allgemeine Formeln',
    formula: 'v = s / t',
    latex: "v = \\dfrac{s}{t}",
    description: 'Gleichförmige Geschwindigkeit = zurückgelegter Weg pro Zeit.',
    variables: [
      { symbol: 'v', name: 'Geschwindigkeit v', unit: 'm/s', description: 'Geschwindigkeit' },
      { symbol: 's', name: 'Weg s',             unit: 'm',   description: 'Zurückgelegte Strecke' },
      { symbol: 't', name: 'Zeit t',            unit: 's',   description: 'Benötigte Zeit' },
    ],
    solveFor: {
      v: (val) => val.s / val.t,
      s: (val) => val.v * val.t,
      t: (val) => val.s / val.v,
    },
    tags: ['geschwindigkeit', 'weg', 'zeit', 'kinematik', 'mechanik'],
  },

  {
    id: 'rohscheibendurchmesser',
    name: 'Rohscheibendurchmesser bei Dezentration',
    category: 'Brillenanpassung',
    formula: 'd_Roh = d_Nutz + 2·|c + u|',
    latex: "d_{Roh} = d_{Nutz} + 2 \\cdot |c + u|",
    description: 'Mindest-Rohglasdurchmesser einer runden Scheibe bei Dezentration. c = Dezentration (nasal positiv, temporal negativ), u = Abstand des Zentrierpunktes vom geometrischen Mittelpunkt der Scheibe (nasal positiv).',
    variables: [
      { symbol: 'd_Roh',  name: 'Rohglasdurchmesser d_Roh',   unit: 'mm', description: 'Benötigter Rohscheibendurchmesser' },
      { symbol: 'd_Nutz', name: 'Nutzdurchmesser d_Nutz',     unit: 'mm', description: 'Nutzbarer Glasdurchmesser (Fassungsscheibe)' },
      { symbol: 'c',      name: 'Dezentration c',             unit: 'mm', description: 'Dezentration (nasal +, temporal −)' },
      { symbol: 'u',      name: 'Zentrierpunktversatz u',     unit: 'mm', description: 'Abstand Zentrierpunkt ↔ Scheibenmittelpunkt (nasal +)' },
    ],
    solveFor: {
      d_Roh:  (v) => v.d_Nutz + 2 * Math.abs(v.c + v.u),
      d_Nutz: (v) => v.d_Roh - 2 * Math.abs(v.c + v.u),
    },
    tags: ['rohscheibe', 'durchmesser', 'dezentration', 'zentrierpunkt', 'fassung'],
  },

  {
    id: 'nahteilmittelpunkt_lage',
    name: 'Lage des optischen Nahteilmittelpunktes',
    category: 'Brillenanpassung',
    formula: "h_P = (−t − v)·S'_Add / (S'_Ferne + S'_Add)",
    latex: "h_P = \\dfrac{(-t - v)\\cdot S'_{Add}}{S'_{Ferne} + S'_{Add}}",
    description: 'Höhenlage des optisch wirksamen Nahteilmittelpunktes (OZ Nahteil) relativ zur Trennkante eines Mehrstärkenglases. t, v = geometrische Abstände (Trennkante/Bezugspunkte), S′_Ferne = Fernteil-Scheitelbrechwert, S′_Add = Addition.',
    variables: [
      { symbol: 'h_P',     name: 'Lage Nahteilmittelpunkt h_P', unit: 'mm',  description: 'Höhenlage des optischen Nahteilmittelpunktes' },
      { symbol: 't',       name: 'Abstand t',                   unit: 'mm',  description: 'Geometrischer Abstand (Trennkante ↔ Bezugspunkt)' },
      { symbol: 'vv',      name: 'Abstand v',                   unit: 'mm',  description: 'Geometrischer Abstand (Bezugspunkt)' },
      { symbol: 'S_Ferne', name: "Fernteil S'_Ferne",           unit: 'dpt', description: 'Fernteil-Scheitelbrechwert' },
      { symbol: 'S_Add',   name: "Addition S'_Add",             unit: 'dpt', description: 'Nahzusatz (Addition)' },
    ],
    solveFor: {
      h_P: (v) => (-v.t - v.vv) * v.S_Add / (v.S_Ferne + v.S_Add),
    },
    tags: ['nahteil', 'mittelpunkt', 'mehrstärken', 'addition', 'bildsprung'],
  },

]; // ── Ende FORMULAS Array ──

// Alle Kategorien extrahieren
const CATEGORIES = [
  'Allgemeine Formeln',
  'Refraktion',
  'Kontaktlinsenanpassung',
  'Optik & Technik der Sehhilfen',
  'Brillenanpassung',
];

// ─── SYMBOL-REGISTER / GLOSSAR ───────────────────────────────────────────────
const GLOSSARY = [

  // ── Abbildungsoptik ────────────────────────────────────────────────────────
  { symbol: 'a',       latex: 'a',        name: 'Gegenstandsweite',             unit: 'mm / m',  category: 'Abbildungsoptik', description: 'Signierter Abstand vom Objekt zur objektseitigen Hauptebene H. Negativ für reelle Objekte (links von H).' },
  { symbol: "a'",      latex: "a'",       name: 'Bildweite',                    unit: 'mm / m',  category: 'Abbildungsoptik', description: "Signierter Abstand von der bildseitigen Hauptebene H' zum Bild. Positiv für reelle Bilder (rechts von H')." },
  { symbol: "f'",      latex: "f'",       name: 'Bildseitige Brennweite',       unit: 'mm / m',  category: 'Abbildungsoptik', description: "Abstand von H' zu F' (bildseitigem Brennpunkt). Bei Sammellinse in Luft positiv; Kehrwert der Brechkraft D." },
  { symbol: 'f',       latex: 'f',        name: 'Objektseitige Brennweite',     unit: 'mm / m',  category: 'Abbildungsoptik', description: 'Abstand von H zu F (objektseitiger Brennpunkt). In Luft gilt f = −f\'.' },
  { symbol: "β'",      latex: "\\beta'",  name: 'Abbildungsmaßstab',            unit: '–',       category: 'Abbildungsoptik', description: "Verhältnis β' = y'/y = a'/a. Negativ = umgekehrtes Bild; |β'| > 1 = vergrößert; |β'| < 1 = verkleinert." },
  { symbol: 'y',       latex: 'y',        name: 'Gegenstandsgröße',             unit: 'mm',      category: 'Abbildungsoptik', description: 'Höhe des Gegenstands (vorzeichenbehaftet). Positiv wenn oberhalb der optischen Achse.' },
  { symbol: "y'",      latex: "y'",       name: 'Bildgröße',                    unit: 'mm',      category: 'Abbildungsoptik', description: 'Höhe des Bildes (vorzeichenbehaftet). Negativ = umgekehrtes Bild.' },
  { symbol: 's',       latex: 's',        name: 'Objektseitige Schnittweite',   unit: 'mm / m',  category: 'Abbildungsoptik', description: 'Abstand vorderer Scheitel → objektseitiger Brennpunkt F. s = f + h.' },
  { symbol: "s'",      latex: "s'",       name: 'Bildseitige Schnittweite',     unit: 'mm / m',  category: 'Abbildungsoptik', description: "Abstand hinterer Scheitel → bildseitiger Brennpunkt F'. s' = f' + h'. Entspricht dem Abstand, den ein Scheitelbrechwertmesser misst." },
  { symbol: 'H',       latex: 'H',        name: 'Objektseitige Hauptebene',     unit: '–',       category: 'Abbildungsoptik', description: 'Vordere Hauptebene. Schnittpunkt der verlängerten Eingangs- und Ausgangsstrahlen bei parallelem Einfall von links. Referenzebene für Gegenstandsweite a.' },
  { symbol: "H'",      latex: "H'",       name: 'Bildseitige Hauptebene',       unit: '–',       category: 'Abbildungsoptik', description: "Hintere Hauptebene. Referenzebene für Bildweite a'. In dünner Linse fällt H = H' zusammen." },
  { symbol: 'F',       latex: 'F',        name: 'Objektseitiger Brennpunkt',    unit: '–',       category: 'Abbildungsoptik', description: 'Objektseitiger Brennpunkt. Parallele Strahlen von rechts treffen sich nach Refraktion in F.' },
  { symbol: "F'",      latex: "F'",       name: 'Bildseitiger Brennpunkt',      unit: '–',       category: 'Abbildungsoptik', description: "Bildseitiger Brennpunkt. Parallele Strahlen von links treffen sich nach Refraktion in F'." },
  { symbol: 'K, K\'',  latex: 'K, K\'',  name: 'Knotenpunkte',                 unit: '–',       category: 'Abbildungsoptik', description: 'Durch die Knotenpunkte K und K\' verlaufende Strahlen behalten ihre Richtung. Bei Linse in homogenem Medium fallen Knotenpunkte mit Hauptpunkten zusammen.' },
  { symbol: 'h',       latex: 'h',        name: 'Vordere Hauptpunktverschiebung', unit: 'mm / m', category: 'Abbildungsoptik', description: 'Abstand vorderer Scheitel → H (Hauptpunktverschiebung). h = −(d/n) · D₂ / D.' },
  { symbol: "h'",      latex: "h'",       name: 'Hintere Hauptpunktverschiebung', unit: 'mm / m', category: 'Abbildungsoptik', description: "Abstand hinterer Scheitel → H'. h' = −(d/n) · D₁ / D." },
  { symbol: 'A',       latex: 'A',        name: 'Einfallende Vergenz',          unit: 'dpt',     category: 'Abbildungsoptik', description: 'Vergenz eines Strahlenbündels vor einem optischen Element. A = n/a (in Luft: A = 1/a).' },
  { symbol: "A'",      latex: "A'",       name: 'Ausfallende Vergenz',          unit: 'dpt',     category: 'Abbildungsoptik', description: "Vergenz eines Strahlenbündels nach einem optischen Element. A' = n'/a'. Vergenzform: A' = A + D." },
  { symbol: 'A_R',     latex: 'A_R',      name: 'Fernpunktrefraktion / -vergenz', unit: 'dpt',   category: 'Abbildungsoptik', description: 'Vergenz am Fernpunkt des entspannten Auges. A_R = 1/a_R. Negativ = Myopie, Positiv = Hyperopie.' },
  { symbol: 'A_P',     latex: 'A_P',      name: 'Nahpunktvergenz',              unit: 'dpt',     category: 'Abbildungsoptik', description: 'Vergenz am Nahpunkt des maximal akkommodierenden Auges. A_P = 1/a_P.' },
  { symbol: 'A_E',     latex: 'A_E',      name: 'Einstellvergenz',              unit: 'dpt',     category: 'Abbildungsoptik', description: 'Vergenz bei Einstellung auf ein bestimmtes Objekt. A_E = 1/a_E.' },

  // ── Brechkraft & Linse ────────────────────────────────────────────────────
  { symbol: 'D',       latex: 'D',        name: 'Gesamtbrechkraft / Brechwert', unit: 'dpt',     category: 'Brechkraft & Linse', description: 'Optische Brechkraft in Dioptrien. D = 1/f\' (f\' in Metern). Positiv = Sammellinse, Negativ = Zerstreuungslinse.' },
  { symbol: 'D₁',      latex: 'D_1',      name: 'Flächenbrechwert Vorderfläche', unit: 'dpt',    category: 'Brechkraft & Linse', description: 'Brechkraft der Vorderfläche einer Linse. D₁ = (n\' − n) / r₁ (r₁ in Metern).' },
  { symbol: 'D₂',      latex: 'D_2',      name: 'Flächenbrechwert Rückfläche',  unit: 'dpt',    category: 'Brechkraft & Linse', description: 'Brechkraft der Rückfläche. D₂ = (1 − n) / r₂ (für Übergang Glas → Luft, r₂ in Metern).' },
  { symbol: 'S\'',     latex: 'S\'',      name: 'Bildseitiger Scheitelbrechwert', unit: 'dpt',   category: 'Brechkraft & Linse', description: 'Messbarer Brechwert am Scheitelbrechwertmesser. S\' = 1/s\'. Wird bei Brillengläsern verwendet.' },
  { symbol: 'S',       latex: 'S',        name: 'Objektseitiger Scheitelbrechwert', unit: 'dpt', category: 'Brechkraft & Linse', description: 'Objektseitiger Scheitelbrechwert. S = −1/s.' },
  { symbol: 'n',       latex: 'n',        name: 'Brechungsindex (Brechzahl)',    unit: '–',      category: 'Brechkraft & Linse', description: 'Brechzahl eines Mediums. Luft ≈ 1,0; Glas ≈ 1,5–1,9; Hornhaut ≈ 1,376; Kammerwasser ≈ 1,336; Glaskörper ≈ 1,336.' },
  { symbol: "n'",      latex: "n'",       name: 'Brechzahl zweites Medium',      unit: '–',      category: 'Brechkraft & Linse', description: 'Brechungsindex des zweiten (gebrochenen) Mediums beim Flächenbrechwert.' },
  { symbol: 'r₁',      latex: 'r_1',      name: 'Vorderer Krümmungsradius',     unit: 'mm / m', category: 'Brechkraft & Linse', description: 'Krümmungsradius der Vorderfläche. Positiv wenn Krümmungsmittelpunkt rechts (konvex nach links).' },
  { symbol: 'r₂',      latex: 'r_2',      name: 'Hinterer Krümmungsradius',     unit: 'mm / m', category: 'Brechkraft & Linse', description: 'Krümmungsradius der Rückfläche. Negativ für bikonvexe Sammellinse.' },
  { symbol: 'd',       latex: 'd',        name: 'Mittendicke',                  unit: 'mm / m', category: 'Brechkraft & Linse', description: 'Mittendicke einer dicken Linse (Abstand der Scheitelpunkte). Gullstrandformel: D = D₁+D₂−(d/n)·D₁·D₂.' },
  { symbol: 'N_E',     latex: 'N_E',      name: 'Eigenvergrößerung',            unit: '–',      category: 'Brechkraft & Linse', description: 'Eigenvergrößerung eines Brillenglases. N_E = S\'/D = 1/(1−(d/n)·D₁). Unabhängig von der Lage des Gegenstands.' },
  { symbol: 'N_S',     latex: 'N_S',      name: 'Systemvergrößerung',           unit: '–',      category: 'Brechkraft & Linse', description: 'Systemvergrößerung: N_S = A_R/S\' = 1/(1−e·S\'). Abhängig von Ametropie A_R und HSA e.' },
  { symbol: 'N_G',     latex: 'N_G',      name: 'Gesamtvergrößerung',           unit: '–',      category: 'Brechkraft & Linse', description: 'Gesamtvergrößerung eines Brillenglases: N_G = N_E · N_S.' },

  // ── Brillenanpassung ──────────────────────────────────────────────────────
  { symbol: 'e',       latex: 'e',        name: 'Hornhautscheitelabstand (HSA)', unit: 'mm / m', category: 'Brillenanpassung', description: 'Abstand zwischen Hornhautscheitel und hinterer Glasfläche des Brillenglases. Typisch 12–15 mm. Wichtig für Scheitelbrechwert-Umrechnung.' },
  { symbol: 'e*',      latex: 'e^*',      name: 'Hauptpunktscheitelabstand',     unit: 'mm / m', category: 'Brillenanpassung', description: 'Abstand Hauptpunkt H\' des Auges zum hinteren Scheitel des Brillenglases. e* = e + SH\' (SH\' ≈ 1,63 mm).' },
  { symbol: 'P',       latex: 'P',        name: 'Prismenbrechwert',              unit: 'cm/m',   category: 'Brillenanpassung', description: 'Prismatische Ablenkung in Prismen-Dioptrien (pdpt oder cm/m). P = c · S\' nach Prentice-Regel. P = 100 · tan δ.' },
  { symbol: 'c',       latex: 'c',        name: 'Dezentration',                  unit: 'cm',     category: 'Brillenanpassung', description: 'Abstand des Durchblickpunkts vom optischen Mittelpunkt des Brillenglases in cm. Erzeugt Prisma: P = c · S\'.' },
  { symbol: 'Z',       latex: 'Z',        name: 'Nahzusatz (Addition)',          unit: 'dpt',    category: 'Brillenanpassung', description: 'Nahzusatz bei Mehrstärkengläsern (Addition). Z = D_Nah − D_Fern. Wird für Presbyopie-Versorgung benötigt.' },
  { symbol: 'δ (Pris)', latex: '\\delta', name: 'Ablenkungswinkel Prisma',       unit: '°',      category: 'Brillenanpassung', description: 'Winkelablenkung durch ein Prisma. Für schwache Prismen: δ ≈ α·(n−1) (α = brechender Winkel).' },

  // ── Akkommodation & Refraktion ────────────────────────────────────────────
  { symbol: 'A (Akk)', latex: 'A',        name: 'Akkommodationsbreite',         unit: 'dpt',    category: 'Akkommodation & Refraktion', description: 'Gesamte Akkommodationsamplitude: A = A_P − A_R = D_P − D_R. Nimmt mit dem Alter ab (Presbyopie).' },
  { symbol: 'ΔA',      latex: '\\Delta A', name: 'Akkommodationserfolg',        unit: 'dpt',    category: 'Akkommodation & Refraktion', description: 'Vergenzänderung des Auges beim Akkommodieren. ΔA = A_R − A_E.' },
  { symbol: 'ΔD',      latex: '\\Delta D', name: 'Akkommodationsaufwand',       unit: 'dpt',    category: 'Akkommodation & Refraktion', description: 'Änderung der Linsenbrechwert beim Akkommodieren. ΔD = D_E − D_R.' },
  { symbol: 'V',       latex: 'V',        name: 'Visus (Sehschärfe)',           unit: '–',      category: 'Akkommodation & Refraktion', description: 'Sehschärfe: V = 1/ε (ε = Sehwinkel in Bogenminuten). V = 1,0 entspricht normaler Sehschärfe (1\' Auflösungsvermögen).' },
  { symbol: 'ε',       latex: '\\varepsilon', name: 'Sehwinkel',               unit: '\'',     category: 'Akkommodation & Refraktion', description: 'Winkel (in Bogenminuten), unter dem ein Sehzeichen erscheint. Normalvisus: ε = 1\' → V = 1,0.' },
  { symbol: 'logMAR',  latex: '\\text{logMAR}', name: 'Logarithmischer Visus', unit: '–',      category: 'Akkommodation & Refraktion', description: 'Logarithmische Viskala: logMAR = −log₁₀(V). logMAR = 0 entspricht V = 1,0; logMAR = 1 entspricht V = 0,1.' },
  { symbol: 'ACA',     latex: 'ACA',      name: 'ACA-Quotient',                 unit: 'pdpt/dpt', category: 'Akkommodation & Refraktion', description: 'Akkommodations-Konvergenz-Akkommodations-Quotient. Verhältnis von aufgebrachter Konvergenz zu Akkommodation.' },

  // ── Kontaktlinsen ─────────────────────────────────────────────────────────
  { symbol: 'r_KL',    latex: 'r_{KL}',   name: 'Basisradius Kontaktlinse',     unit: 'mm',     category: 'Kontaktlinsenanpassung', description: 'Radius der Kontaktlinsen-Rückfläche. Bestimmt die Passform auf der Hornhaut.' },
  { symbol: 'r_HH',    latex: 'r_{HH}',   name: 'Hornhautradius',               unit: 'mm',     category: 'Kontaktlinsenanpassung', description: 'Krümmungsradius der Hornhaut. Gemessen mit Ophthalmometer/Keratometer. Normbereich: 7,5–8,0 mm.' },
  { symbol: 'e_KH',    latex: 'e_{KH}',   name: 'Hornhauttorizität',            unit: 'mm',     category: 'Kontaktlinsenanpassung', description: 'Differenz der Hornhautradien: e_KH = r_flach − r_steil. Maß für den Hornhautastigmatismus.' },
  { symbol: 'D_TL',    latex: 'D_{TL}',   name: 'Brechkraft Tränenlinse',       unit: 'dpt',    category: 'Kontaktlinsenanpassung', description: 'Brechkraft der Tränenlinse zwischen KL-Rückfläche und Hornhaut. D_TL ≈ 5 · (r_KL − r_HH) (Näherung, r in mm).' },
  { symbol: 'S\'_KL',  latex: "S'_{KL}",  name: 'Scheitelbrechwert Kontaktlinse', unit: 'dpt',  category: 'Kontaktlinsenanpassung', description: 'Erforderlicher Scheitelbrechwert der Kontaktlinse. S\'_KL = S\'_Br / (1 − e_Br · S\'_Br).' },
  { symbol: 'S\'_Br',  latex: "S'_{Br}",  name: 'Scheitelbrechwert Brille',      unit: 'dpt',   category: 'Kontaktlinsenanpassung', description: 'Bekannter Scheitelbrechwert des Brillenglases. Ausgangswert für KL-Umrechnung über Scheitelrefraktion.' },

  // ── Physikalische Optik ───────────────────────────────────────────────────
  { symbol: 'λ',       latex: '\\lambda', name: 'Wellenlänge',                  unit: 'nm',     category: 'Optik & Technik der Sehhilfen', description: 'Wellenlänge des Lichts im Vakuum. Sichtbares Licht: 380–780 nm. Referenzwellenlänge Helium-e-Linie: 546,1 nm.' },
  { symbol: 'ν_e',     latex: '\\nu_e',   name: 'Abbe-Zahl',                    unit: '–',      category: 'Optik & Technik der Sehhilfen', description: 'Maß für die Dispersion eines optischen Materials. ν_e = (n_e − 1) / (n_F\' − n_C\'). Hohe Abbe-Zahl = wenig Farbfehler.' },
  { symbol: 'ρ',       latex: '\\rho',    name: 'Reflexionsgrad (Fresnel)',      unit: '–',      category: 'Optik & Technik der Sehhilfen', description: 'Anteil des reflektierten Lichts an der Grenzfläche. ρ = ((n\' − n)/(n\' + n))². Für Glas n=1,5: ρ ≈ 4 % pro Fläche.' },
  { symbol: 'θ_B',     latex: '\\theta_B', name: 'Brewster-Winkel',             unit: '°',      category: 'Optik & Technik der Sehhilfen', description: 'Einfallswinkel, bei dem reflektiertes Licht vollständig polarisiert ist. tan θ_B = n\'/n.' },
  { symbol: 'τ',       latex: '\\tau',    name: 'Transmissionsgrad',             unit: '–',      category: 'Optik & Technik der Sehhilfen', description: 'Anteil des durchgelassenen Lichts. τ = Φ_durch / Φ_ein. Für entspiegeltes Glas τ → 1.' },
  { symbol: 'n_s',     latex: 'n_s',      name: 'Brechzahl Entspiegelungsschicht', unit: '–',  category: 'Optik & Technik der Sehhilfen', description: 'Brechzahl der Entspiegelungsschicht. Amplitudenbedingung: n_s = √n_Glas. Für n=1,5: n_s ≈ 1,22.' },
  { symbol: 'd_s',     latex: 'd_s',      name: 'Dicke Entspiegelungsschicht',  unit: 'nm',     category: 'Optik & Technik der Sehhilfen', description: 'Schichtdicke der Entspiegelungsschicht (λ/4-Schicht). d_s = λ_vak / (4 · n_s).' },

  // ── Vergrößernde Sehhilfen ────────────────────────────────────────────────
  { symbol: "Γ'",      latex: "\\Gamma'", name: "Vergrößerung Γ' (Lupe/Fernrohr)", unit: '×',  category: 'Vergrößernde Sehhilfen', description: "Allgemeine Winkelvergrößerung: Γ' = tan ω' / tan ω. Lupe: Γ' = D_L/4 (Normalvergrößerung). Fernrohr: Γ' = −f'_Obj/f'_Ok = D_EP/D_AP." },
  { symbol: 'EP',      latex: 'EP',       name: 'Eintrittspupille',             unit: 'mm',     category: 'Vergrößernde Sehhilfen', description: 'Eintrittspupille (EP): Bild der Aperturblende durch alle davor liegenden Linsen. Definiert den Strahlengang von der Objektseite. D_EP = Objektivdurchmesser bei Afokalsystem.' },
  { symbol: 'AP',      latex: 'AP',       name: 'Austrittspupille',             unit: 'mm',     category: 'Vergrößernde Sehhilfen', description: 'Austrittspupille (AP): Bild der Aperturblende durch alle dahinter liegenden Linsen. Beim Fernrohr: D_AP = D_EP / Γ\'. Optimale Lage: hinter dem Okular (Brillenträgeraugenpunkt).' },
  { symbol: 'a₀',      latex: 'a_0',      name: 'Bezugsentfernung (deutl. Sehen)', unit: 'm',  category: 'Vergrößernde Sehhilfen', description: 'Bezugsentfernung für deutliches Sehen: a₀ = −0,25 m (−250 mm). Standardwert für Lupen-Normalvergrößerung.' },
  { symbol: "f'_L",    latex: "f'_L",     name: 'Brennweite Lupe',              unit: 'mm',     category: 'Vergrößernde Sehhilfen', description: "Bildseitige Brennweite der Lupe. Normalvergrößerung: Γ'_N = D_L/4 = 250/f'_L." },
  { symbol: "f'_Ob",   latex: "f'_{Ob}",  name: 'Brennweite Objektiv',          unit: 'mm',     category: 'Vergrößernde Sehhilfen', description: 'Bildseitige Brennweite des Objektivs (Fernrohr/Mikroskop).' },
  { symbol: "f'_Ok",   latex: "f'_{Ok}",  name: 'Brennweite Okular',            unit: 'mm',     category: 'Vergrößernde Sehhilfen', description: "Bildseitige Brennweite des Okulars. Kepler: positiv. Galilei: negativ. Fernrohrvergrößerung: Γ' = −f'_Obj / f'_Ok." },
  { symbol: 'D_Z',     latex: 'D_Z',      name: 'Dämmerungszahl',               unit: '–',      category: 'Vergrößernde Sehhilfen', description: "Dämmerungszahl eines Fernrohrs: D_Z = √(Γ' · D_EP) (D_EP = Objektivdurchmesser in mm). Maß für Dämmerungsleistung." },
  { symbol: 'ω',       latex: '\\omega',  name: 'Sehfeldwinkel',                unit: '°',      category: 'Vergrößernde Sehhilfen', description: 'Realer Sehfeldwinkel ω (halber Öffnungswinkel des Sehfelds). Sehfeld auf 1000 m: d_SF = 2000 · tan ω.' },

  // ── Kontaktlinsen-Exzentrizität ────────────────────────────────────────────
  { symbol: 'e (Hornhaut)', latex: 'e',   name: 'Exzentrizität der Hornhaut',   unit: '–',      category: 'Kontaktlinsenanpassung', description: 'Exzentrizität der Hornhaut-Konikoidfläche. Kugel: e = 0. Typische Hornhaut: e ≈ 0,45–0,55. Zusammenhang: p = 1 − e².' },
  { symbol: 'p (Hornhaut)', latex: 'p',   name: 'p-Wert (Formfaktor Hornhaut)', unit: '–',      category: 'Kontaktlinsenanpassung', description: 'Formfaktor der Hornhaut. Kugel: p = 1. Prolat-elliptisch (periphere Abflachung): 0 < p < 1. Typisch: p ≈ 0,75–0,85. p = 1 − e².' },
  { symbol: 'A_K',     latex: 'A_K',      name: 'Zentraler Hornhautastigmatismus', unit: 'dpt', category: 'Kontaktlinsenanpassung', description: 'Zentraler Hornhautastigmatismus aus Keratometerwerten: A_K = 376 · (1/r_steil − 1/r_flach). Konstante 376 basiert auf n_HH ≈ 1,376.' },
  { symbol: 'A_außen', latex: 'A_{au}',   name: 'Äußerer Astigmatismus',        unit: 'dpt',    category: 'Kontaktlinsenanpassung', description: 'Astigmatismus der Hornhorderfläche (Keratometrie): A_au = (n_k − 1) · (1/r_steil − 1/r_flach) · 1000 mit n_k = 1,3375.' },
  { symbol: 'A_innen', latex: 'A_{innen}',name: 'Innerer Astigmatismus',        unit: 'dpt',    category: 'Kontaktlinsenanpassung', description: 'Innerer (residualer) Astigmatismus: A_innen = A_gesamt − A_außen. Nicht durch Hornhaut verursacht. Bleibt bei formstabiler KL unkorriert.' },

  // ── Trigonometrie & Mechanik ───────────────────────────────────────────────
  { symbol: 'sin α',   latex: '\\sin\\alpha', name: 'Sinus',                    unit: '–',      category: 'Allgemeine Formeln', description: 'sin α = Gegenkathete/Hypotenuse. Umkehrung: α = arcsin(x). Wertebereich: −1 bis +1.' },
  { symbol: 'cos α',   latex: '\\cos\\alpha', name: 'Kosinus',                  unit: '–',      category: 'Allgemeine Formeln', description: 'cos α = Ankathete/Hypotenuse. Umkehrung: α = arccos(x). Es gilt: sin²α + cos²α = 1.' },
  { symbol: 'tan α',   latex: '\\tan\\alpha', name: 'Tangens',                  unit: '–',      category: 'Allgemeine Formeln', description: 'tan α = Gegenkathete/Ankathete = sin α / cos α. Umkehrung: α = arctan(x).' },
  { symbol: 'F_G',     latex: 'F_G',          name: 'Gewichtskraft',            unit: 'N',      category: 'Allgemeine Formeln', description: 'Gewichtskraft: F_G = m · g. g ≈ 9,81 m/s². Relevant für Auflagedruck von Brillen.' },
  { symbol: 'p',       latex: 'p',            name: 'Druck',                    unit: 'Pa',     category: 'Allgemeine Formeln', description: 'Druck: p = F/A. Pascal (Pa = N/m²). Praxis: Auflagedruck Nasenpads = F_G/(2·A_Pad).' },

  // ── Photometrie ───────────────────────────────────────────────────────────
  { symbol: 'Φ',       latex: '\\Phi',    name: 'Lichtstrom',                   unit: 'lm',     category: 'Optik & Technik der Sehhilfen', description: 'Gesamter von einer Lichtquelle ausgesendeter Lichtstrom in Lumen (lm).' },
  { symbol: 'I',       latex: 'I',        name: 'Lichtstärke',                  unit: 'cd',     category: 'Optik & Technik der Sehhilfen', description: 'Lichtstärke in Candela (cd). I = Φ / Ω (Ω = Raumwinkel). SI-Basisgröße.' },
  { symbol: 'E',       latex: 'E',        name: 'Beleuchtungsstärke',           unit: 'lx',     category: 'Optik & Technik der Sehhilfen', description: 'Beleuchtungsstärke in Lux (lx). E = I/r² = Φ/A. Maß des auftreffenden Lichtstroms pro Fläche.' },
  { symbol: 'L',       latex: 'L',        name: 'Leuchtdichte',                 unit: 'cd/m²',  category: 'Optik & Technik der Sehhilfen', description: 'Leuchtdichte (Luminanz) in cd/m². L = I/A. Wahrgenommene Helligkeit einer Fläche.' },
  { symbol: 'η',       latex: '\\eta',    name: 'Lichtausbeute',                unit: 'lm/W',   category: 'Optik & Technik der Sehhilfen', description: 'Effizienz einer Lichtquelle: η = Φ/P (Lichtstrom / elektrische Leistung).' },

  // ── Prismen & Dezentrierung ──────────────────────────────────────────────
  { symbol: 'P',      latex: 'P',            name: 'Prismenwert',              unit: 'pdpt',  category: 'Brillenanpassung', description: 'Prismatische Ablenkung in Prismendioptrien (pdpt). 1 pdpt = 1 cm Ablenkung auf 1 m Entfernung. P = c[cm] × D[dpt] (Prentice-Regel).' },
  { symbol: 'P_H',    latex: 'P_H',          name: 'Horizontale Prismakomp.', unit: 'pdpt',  category: 'Brillenanpassung', description: 'Horizontale Komponente des Prismenvektors. Positiv = Basis Richtung TABO 0° (= B in/nasal beim RA, B out/temporal beim LA).' },
  { symbol: 'P_V',    latex: 'P_V',          name: 'Vertikale Prismakomp.',   unit: 'pdpt',  category: 'Brillenanpassung', description: 'Vertikale Komponente des Prismenvektors. Positiv = Basis oben.' },
  { symbol: 'PNW',    latex: 'PNW',          name: 'Prismatische Nebenwirkung', unit: 'pdpt', category: 'Brillenanpassung', description: 'Ungewolltes Prisma durch Fehlzentrierung: Pupille befindet sich nicht im optischen Zentrum. PNW = Δ[cm] × D[dpt] (sphärisch) bzw. Matrixmethode (torisch).' },
  { symbol: 'Δx',     latex: '\\Delta x',   name: 'Horizontale Dezentrierung', unit: 'mm/cm', category: 'Brillenanpassung', description: 'Abstand des optischen Zentrums von der Pupillenmitte horizontal. Positiv = OZ nasal der Pupille (beide Augen; nasal positiv, temporal negativ nach ISO/DIN).' },
  { symbol: 'Δy',     latex: '\\Delta y',   name: 'Vertikale Dezentrierung',   unit: 'mm',    category: 'Brillenanpassung', description: 'Abstand des optischen Zentrums von der Pupillenmitte vertikal. Positiv = OZ über Pupille (beide Augen).' },
  { symbol: 'B in',   latex: 'B_{in}',      name: 'Basis innen (nasal)',       unit: '–',     category: 'Brillenanpassung', description: 'Prismenbasis zur Nase hin. Für RA: 0° TABO, für LA: 180° TABO.' },
  { symbol: 'B out',  latex: 'B_{out}',     name: 'Basis außen (temporal)',    unit: '–',     category: 'Brillenanpassung', description: 'Prismenbasis zur Schläfe hin. Für RA: 180° TABO, für LA: 0° TABO.' },
  { symbol: 'α_TABO', latex: '\\alpha_{TABO}', name: 'TABO-Winkel (Basis)', unit: '°',    category: 'Brillenanpassung', description: 'Basisrichtung in TABO-Notation: 0° = horizontal nach +x, 90° = oben, 180° = horizontal nach −x, 270° = unten. Nasal entspricht 0° beim RA und 180° beim LA.' },

  // ─── KL-Materialdaten (Referenz) ─────────────────────────────────────────
  { symbol: 'n_PMMA',   latex: 'n_{PMMA}',    name: 'Brechzahl PMMA',          unit: '–', category: 'Kontaktlinsenanpassung', description: 'Brechzahl von PMMA (Polymethylmethacrylat): n = 1,49. Klassisches formstabiles KL-Material.' },
  { symbol: 'n_BO-7',   latex: 'n_{BO\\text{-}7}', name: 'Brechzahl BO-7',      unit: '–', category: 'Kontaktlinsenanpassung', description: 'Brechzahl des KL-Materials Boston BO-7: n = 1,428.' },
  { symbol: 'n_CAB',    latex: 'n_{CAB}',     name: 'Brechzahl CAB',           unit: '–', category: 'Kontaktlinsenanpassung', description: 'Brechzahl von CAB (Celluloseacetobutyrat): n = 1,47.' },
  { symbol: 'n_BO-Equa', latex: 'n_{BO\\text{-}Equa}', name: 'Brechzahl BO-Equalens', unit: '–', category: 'Kontaktlinsenanpassung', description: 'Brechzahl des KL-Materials Boston Equalens: n = 1,439.' },
  { symbol: 'C_PMMA',   latex: 'C_{PMMA}',    name: 'Materialkonstante PMMA',  unit: '–', category: 'Kontaktlinsenanpassung', description: 'KL-Materialkonstante PMMA: C = 0,314 (für induzierten Astigmatismus A_ind = C · A_RF).' },
  { symbol: 'C_BO-RXD', latex: 'C_{BO\\text{-}RXD}', name: 'Materialkonstante BO-RXD', unit: '–', category: 'Kontaktlinsenanpassung', description: 'KL-Materialkonstante Boston RXD: C = 0,227.' },
  { symbol: 'C_CAB',    latex: 'C_{CAB}',     name: 'Materialkonstante CAB',   unit: '–', category: 'Kontaktlinsenanpassung', description: 'KL-Materialkonstante CAB: C = 0,285.' },
  { symbol: 'C_BO-Equa', latex: 'C_{BO\\text{-}Equa}', name: 'Materialkonstante BO-Equalens', unit: '–', category: 'Kontaktlinsenanpassung', description: 'KL-Materialkonstante Boston Equalens: C = 0,234.' },

]; // ── Ende GLOSSARY ──

// Favoriten aus localStorage
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('ao_favorites') || '[]'); }
  catch { return []; }
}
function saveFavorites(ids) {
  localStorage.setItem('ao_favorites', JSON.stringify(ids));
}
function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  saveFavorites(favs);
  return favs.includes(id);
}
function isFavorite(id) { return getFavorites().includes(id); }

// ─── Maschinenlesbare Gleichungen für die schrittweise Umstellung (Druck) ────
// Schlüssel = Formel-ID, Wert = Gleichung in den Variablensymbolen der Formel.
// Wird von der Algebra-Engine (algebra.js) nach der gesuchten Größe isoliert.
const FORMULA_EQ = {
  thin_lens:                 "1/aprime = 1/a + 1/fprime",
  lensmakers:                "1/f = (n_L/n_M - 1)*(1/r1 - 1/r2)",
  snell:                     "n1*sin(theta1) = n2*sin(theta2)",
  critical_angle:            "sin(thetaG) = n2/n1",
  power_dioptrie:            "D = 1/f",
  vergence:                  "V = n/s",
  vergence_refraction:       "Vprime = V + D",
  surface_power:             "D = (n2 - n1)/r",
  geschwindigkeit:           "v = s/t",
  vergenzstellung:           "V = A*PD",
  aca_gradient:              "ACA = AC/A",
  skiaskopie_labil:          "S_Korr = S_SG - 1/d_s",
  deutl_sehbereich_fernpunkt:"a_R = -1/Z",
  traenenlinse_336:          "S_Tr = 336*(1/r_20 - 1/r_HH)",
  hornhautastig_peripher:    "HA = 376*(1/r_steil - 1/r_flach)",
  nahbrille_zentrierabstand: "q = p*a/(a + b)",
  nahteil_nasale_versetzung: "c = p*b/(2*(a + b))",
  trifokal_zwischenteil:     "Z_zw = 0.5*S_Add",
  nahzusatz_dicke_glaeser:   "Z_neu = N^2*Z_alt",
  fernrohr_okularverschiebung:"Delta = f_Ok^2*A_R",
  fernrohr_akkommodation_nah:"A_mit = Gamma^2*A_ohne",
  fernrohr_lichtstaerke_geom:"L_geo = (EP/Gamma)^2",
  fernrohrleistung:          "FL = V_mit/V_ohne",
  kl_bitorisch_gesamt:       "S_bit = S_innen + S_ueber",
};
if (typeof window !== 'undefined') window.FORMULA_EQ = FORMULA_EQ;

// ─── FORMULA_EQ – vollständige Abdeckung (Charge 2) ──────────────────────────
Object.assign(FORMULA_EQ, {
  combined_contact:        "Dges = D1 + D2",
  combined_separated:      "Dges = D1 + D2 - d*D1*D2/n",
  back_vertex_power:       "Dh = D1 + D2/(1 - d*D1/n)",
  front_vertex_power:      "Dv = D2 + D1/(1 - d*D2/n)",
  gullstrandformel:        "D = D1 + D2 - (d/n)*D1*D2",
  principal_plane_H:       "deltaH = -(d/n)*D2/D",
  principal_plane_H2:      "deltaHp = -(d/n)*D1/D",
  lateral_magnification:   "betaprime = aprime/a",
  angular_magnification:   "Gamma = tan(omegap)/tan(omega)",
  newton_imaging:          "x*xp = -f^2",
  accommodation:           "A = Dnah - Dfern",
  near_far_point:          "Dpunkt = n/spunkt",
  vertex_distance:         "Ds = D/(1 - d*D)",
  spectacle_correction:    "DBrille = DFern/(1 + d*DFern)",
  prism_deviation:         "delta = (n - 1)*alpha",
  prism_diopter:           "Delta = 100*tan(delta)",
  prism_min_deviation:     "n = sin((delta_min + alpha)/2)/sin(alpha/2)",
  magnifier:               "Gamma = s0/f",
  microscope:              "Gamma = (Delta/fObj)*(s0/fOk)",
  telescope_kepler:        "Gamma = -fObj/fOk",
  telescope_galilei:       "Gamma = -fObj/fOk",
  abbe_number:             "nu = (nd - 1)/(nF - nC)",
  chromatic_aberration:    "Deltaf_f = 1/nu",
  achromat:                "D1/nu1 + D2/nu2 = 0",
  optical_path:            "OPL = n*s",
  rayleigh_criterion:      "sin(theta_min) = 1.22*lambda/D",
  numerical_aperture:      "NA = n*sin(theta)",
  depth_of_focus:          "Deltab = f^2*z/(f - g)^2",
  depth_of_field:          "Deltag = z*g^2/(f*DAp)",
  light_speed:             "v = c0/n",
  image_construction:      "b = f*g/(g - f)",
  visus_basic:             "V = 1/alpha",
  visus_pruf:              "Vneu = Valt*dalt/dneu",
  hofstetter:              "Amax = 15 - alter/4",
  refraktionsdefizit:      "DRD = -AR",
  aca_quotient:            "ACA = dKonv/dAkk",
  kl_scheitelrefraktion:   "DKL = DBrille/(1 - d*DBrille)",
  kl_traenenlinse:         "DTL = 5*deltar",
  kl_ophthalmometer:       "r = 2*f*yp/(y - yp)",
  kl_torizitaet:           "Tor = rFlach - rSteil",
  prentice:                "P = c*abs(Dp)",
  eigenvergroesserung:     "NE = (1/(1 - (d/n)*D1))*(1/(1 - ds*Dp))",
  systemvergroesserung:    "NS = AR/Dp",
  presbyopie_add:          "Add = Dnah - Dfern",
  bildsprung:              "J = hTK*Add",
  freq_wavelength:         "c = lambda*f",
  wavelength_medium:       "lambdaM = lambdaVak/n",
  reflexionsgrad_fresnel:  "rho = ((np - n)/(np + n))^2",
  brewster:                "tan(thetaB) = np/n",
  malus:                   "I = I0*cos(alpha)^2",
  entspiegelung_dicke:     "dS = lambda/(4*nS)",
  entspiegelung_n:         "nS = sqrt(nGlas)",
  parallelverschiebung:    "eP = d*sin(alpha1 - alpha1p)/cos(alpha1p)",
  laengsverschiebung:      "eL = d*(1 - 1/n)",
  lichtstaerke:            "I = Phi/Omega",
  beleuchtungsstaerke:     "E = I/r^2",
  leuchtdichte:            "L = I/A",
  sphärometer:             "Dreal = Dabgl*(nreal - 1)/(nabgl - 1)",
  scheiteltiefe:           "t = r - sqrt(r^2 - (diam/2)^2)",
  fernrohr_baulaenge:      "L = fObj + fOk",
  daemmerungszahl:         "DZ = sqrt(Gamma*EP)",
  kuehl_lupe:              "Gamma = (DL/4)*(1 - e*DL)",
  sloan_habel:             "Gamma = s0/(aL - e*(1 + aL*DL))",
  augenlänge:              "l = nGl/(AR + DA) + SHp",
  gitter_verstaerkung:     "sin(theta) = k*lambda/g",
  skiaskopie_stabil:       "DAuge = DAbgl - 1/a",
  flaechenbrechwert_vorder:"D1 = (nprime - n)/r1",
  flaechenbrechwert_rueck: "D2 = (1 - n)/r2",
  bildseitige_brennweite:  "fprime = 1/D",
  objektseitige_brennweite:"f = -1/D",
  bildseitige_schnittweite:"sprime = fprime + hprime",
  bildseitiger_scheitelbrechwert:"Sprime = 1/sprime",
  vergenz_abbildungsformel:"Aprime = A + D",
  voll_scheitelbrechwert:  "Sneu = Salt/(1 + (eneu - ealt)*Salt)",
  akkommodationsaufwand:   "DeltaD = DE - DR",
  akkommodationserfolg:    "DeltaA = AR - AE",
  fernpunkt_refraktion:    "AR = 1/aR",
  zylinder_fehler:         "ZFehler = 2*ZGlas*sin(delta)",
  hornhaut_astigmatismus_zentral:"AK = 376*(1/rsteil - 1/rflach)",
  kl_23_regel:             "rKL = rflach + (2/3)*eKH",
  restastigmatismus:       "RA = Aind + GA - AeA",
  farbsaum:                "Pchrom = P/nue",
  nasenflankenkraft:       "FN = FG/(2*sin(alpha))",
  bildsprung_e_dadd:       "DeltaP = e*DAdd",
  astigmatismus_aussen:    "A_au = (n_k - 1)*(1/rsteil - 1/rflach)*1000",
  astigmatismus_innen:     "A_i = A_ges - A_au2",
  kl_formstabil_restzyl:   "ZRest = A_inn + Zind",
  kl_sagitta:              "s = r - sqrt(r^2 - (d/2)^2)",
  traenenlinse_exakt:      "DTL = (nTL - 1)*(1/rKL - 1/rHH)*1000",
  pythagoras:              "c^2 = a^2 + b^2",
  trig_sinus:              "sin(alpha) = a/c",
  trig_kosinus:            "cos(alpha) = b/c",
  trig_tangens:            "tan(alpha) = a/b",
  grad_bogenmass:          "rad = alpha*pi/180",
  gewichtskraft:           "FG = m*g",
  kraft_newton:            "F = m*a",
  druck_formel:            "p = F/A",
  hornhaut_exzentrizitaet: "e = sqrt(1 - p)",
  fernrohr_vergr_pupille:  "Gamma = DEP/DAP",
  sehfelddurchmesser:      "tan(omega_r) = yFB/fObj",
  sehfeld_1000m:           "dSF = 2000*tan(omega_r)",
  lupe_normalvergr:        "Gamma = DL/4",
  visus_schaetz_myopie:    "V = V_cc/2^(2*M)",
  visus_schaetz_astig:     "V = V_cc/2^(2*Z)",
  visus_schaetz_zusammen:  "V = V_cc/2^(2*(M + Z))",
  tiefenunterscheidung_stereo:"da = a^2*tan(delta)/(p + a*tan(delta))",
  schiefgekreuzte_zylinder:"Z_res = sqrt(Zx^2 + Zy^2)",
  fernrohr_nahgrenze:      "a_Nahe = -Gamma^2/(D_A - A_R + dA_max)",
  fernrohr_lichtstaerke_phys:"L_phys = (EP/Gamma)^2*tau",
  kl_ueberrefraktion:      "RD_p = S_KL + S_Tr + RD",
  aniseikonie_aq:          "AQ = y_R/y_L",
  vorneigung_dezentration: "tan(alpha) = x/b",
  nahzusatz_entfernung_umrechnung:"Z_neu = Z_alt + 1/a_alt - 1/a_neu",
  hoehenausgleichsprisma:  "dP = c_P*(S_R - S_L)",
  sagittalradius_korrektur:"r_sag = r_gem + dr0",
  hornhaut_exzentrizitaet_sagittal:"e = (1/sin(phi))*sqrt(1 - (r_0/r_sag)^2)",
  deutl_sehbereich_nahpunkt:"a_P = -1/(Z + dA_max)",
  rohscheibendurchmesser:  "d_Roh = d_Nutz + 2*abs(c + u)",
  nahteilmittelpunkt_lage: "h_P = (-t - vv)*S_Add/(S_Ferne + S_Add)",
});

// ─── Vorformulierte Umstellschritte (Vorrang vor der Engine) ─────────────────
// Für didaktisch heikle Fälle (Variable kommt mehrfach vor → Ausklammern nötig).
const FORMULA_STEPS = {
  gullstrandformel: {
    D1: [
      { tex: "D = D_1 + D_2 - \dfrac{d}{n}\,D_1\,D_2", note: "Ausgangsformel" },
      { tex: "D - D_2 = D_1 - \dfrac{d}{n}\,D_1\,D_2", note: "$D_2$ auf beiden Seiten subtrahieren — alle Terme mit $D_1$ bleiben rechts" },
      { tex: "D - D_2 = D_1\left(1 - \dfrac{d}{n}\,D_2\right)", note: "$D_1$ ausklammern (gemeinsamen Faktor herausziehen) — der Schlüsselschritt" },
      { tex: "D_1 = \dfrac{D - D_2}{\,1 - \dfrac{d}{n}\,D_2\,}", note: "durch die Klammer dividieren → $D_1$ steht allein" },
    ],
    D2: [
      { tex: "D = D_1 + D_2 - \dfrac{d}{n}\,D_1\,D_2", note: "Ausgangsformel" },
      { tex: "D - D_1 = D_2 - \dfrac{d}{n}\,D_1\,D_2", note: "$D_1$ auf beiden Seiten subtrahieren — alle Terme mit $D_2$ bleiben rechts" },
      { tex: "D - D_1 = D_2\left(1 - \dfrac{d}{n}\,D_1\right)", note: "$D_2$ ausklammern (gemeinsamen Faktor herausziehen) — der Schlüsselschritt" },
      { tex: "D_2 = \dfrac{D - D_1}{\,1 - \dfrac{d}{n}\,D_1\,}", note: "durch die Klammer dividieren → $D_2$ steht allein" },
    ],
  },
};
if (typeof window !== 'undefined') window.FORMULA_STEPS = FORMULA_STEPS;
