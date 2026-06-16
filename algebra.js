// ─── Mini-Algebra-Kern: schrittweises Umstellen von Formeln ──────────────────
// Parst eine maschinenlesbare Gleichung "LHS = RHS" (in Variablensymbolen),
// isoliert eine Zielvariable Schritt für Schritt und rendert jeden Schritt als
// LaTeX. Deckt die in der Formelsammlung vorkommenden Operationen ab:
//   + − · /  Potenz ^  √  sowie sin/cos/tan/asin/acos/atan/ln/exp.
// Voraussetzung: Die Zielvariable kommt GENAU EINMAL vor (sonst → null, Fallback).

(function (global) {
  'use strict';

  // ── Tokenizer ──────────────────────────────────────────────────────────────
  const FN = new Set(['sin','cos','tan','asin','acos','atan','sqrt','ln','exp','arcsin','arccos','arctan','abs']);
  function tokenize(s) {
    const t = []; let i = 0;
    const isId = c => /[A-Za-z0-9_']/.test(c);
    while (i < s.length) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if ('+-*/^()'.includes(c)) { t.push({ k: c }); i++; continue; }
      if (c === '·' || c === '×' || c === '⋅') { t.push({ k: '*' }); i++; continue; }
      if (c === '−' || c === '–') { t.push({ k: '-' }); i++; continue; }
      if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; t.push({ k: 'num', v: parseFloat(s.slice(i, j)) }); i = j; continue; }
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < s.length && isId(s[j])) j++;
        const name = s.slice(i, j); i = j;
        t.push(FN.has(name) ? { k: 'fn', v: name } : { k: 'id', v: name });
        continue;
      }
      throw new Error('Unerwartetes Zeichen: ' + c);
    }
    return t;
  }

  // ── Parser (rekursiver Abstieg, Präzedenz) ───────────────────────────────────
  function parse(tokens) {
    let p = 0;
    const peek = () => tokens[p];
    const eat  = k => { const t = tokens[p]; if (!t || (k && t.k !== k)) throw new Error('Parserfehler'); p++; return t; };

    function expr() { // + -
      let n = term();
      while (peek() && (peek().k === '+' || peek().k === '-')) { const op = eat().k; n = { t: 'op', op, a: n, b: term() }; }
      return n;
    }
    function term() { // * /
      let n = factor();
      while (peek() && (peek().k === '*' || peek().k === '/')) { const op = eat().k; n = { t: 'op', op, a: n, b: factor() }; }
      return n;
    }
    function factor() { // unary, power (rechtsassoziativ)
      if (peek() && peek().k === '-') { eat('-'); return { t: 'neg', a: factor() }; }
      let n = primary();
      if (peek() && peek().k === '^') { eat('^'); n = { t: 'op', op: '^', a: n, b: factor() }; }
      return n;
    }
    function primary() {
      const tk = peek();
      if (!tk) throw new Error('Unerwartetes Ende');
      if (tk.k === 'num') { eat(); return { t: 'num', v: tk.v }; }
      if (tk.k === 'id')  { eat(); return { t: 'var', name: tk.v }; }
      if (tk.k === 'fn')  { eat(); eat('('); const a = expr(); eat(')'); return { t: 'fn', fn: tk.v, a }; }
      if (tk.k === '(')   { eat('('); const n = expr(); eat(')'); return n; }
      throw new Error('Unerwartetes Token: ' + tk.k);
    }

    const eqL = expr(); // bis '='? Gleichung wird getrennt übergeben
    return eqL;
  }
  function parseEq(eqStr) {
    const [l, r] = eqStr.split('=');
    if (r === undefined) throw new Error('Keine Gleichung (= fehlt)');
    return { L: parse(tokenize(l)), R: parse(tokenize(r)) };
  }

  // ── Helfer ───────────────────────────────────────────────────────────────────
  const clone = n => JSON.parse(JSON.stringify(n));
  function countVar(n, name) {
    if (!n) return 0;
    if (n.t === 'var') return n.name === name ? 1 : 0;
    if (n.t === 'num') return 0;
    if (n.t === 'neg' || n.t === 'fn') return countVar(n.a, name);
    if (n.t === 'op') return countVar(n.a, name) + countVar(n.b, name);
    return 0;
  }
  const has = (n, name) => countVar(n, name) > 0;

  // ── Isolation: liefert Array von {L,R}-Schritten oder null ────────────────────
  function isolate(L, R, name) {
    let lhs = clone(L), rhs = clone(R);
    if (has(rhs, name) && !has(lhs, name)) { const tmp = lhs; lhs = rhs; rhs = tmp; }
    if (countVar(lhs, name) + countVar(rhs, name) !== 1 || has(rhs, name)) return null;

    const steps = [{ L: clone(lhs), R: clone(rhs), note: null }];
    let guard = 0;
    const FNNAME = { sin:'\\sin', cos:'\\cos', tan:'\\tan', asin:'\\arcsin', acos:'\\arccos', atan:'\\arctan', ln:'\\ln', exp:'\\exp' };
    while (!(lhs.t === 'var' && lhs.name === name)) {
      if (++guard > 40) return null;
      const n = lhs;
      let note = '';
      if (n.t === 'op') {
        const inA = has(n.a, name);
        const keep = inA ? n.a : n.b, drop = inA ? n.b : n.a;
        if (n.op === '+') { rhs = { t: 'op', op: '-', a: rhs, b: drop }; lhs = keep; note = `$${tex(drop)}$ auf beiden Seiten subtrahieren`; }
        else if (n.op === '*') { rhs = { t: 'op', op: '/', a: rhs, b: drop }; lhs = keep; note = `beide Seiten durch $${tex(drop)}$ dividieren`; }
        else if (n.op === '-') {
          if (inA) { rhs = { t: 'op', op: '+', a: rhs, b: n.b }; lhs = n.a; note = `$${tex(n.b)}$ auf beiden Seiten addieren`; }
          else     { rhs = { t: 'op', op: '-', a: n.a, b: rhs }; lhs = n.b; note = `nach dem gesuchten Term auflösen (Subtraktion umkehren)`; }
        }
        else if (n.op === '/') {
          if (inA) { rhs = { t: 'op', op: '*', a: rhs, b: n.b }; lhs = n.a; note = `beide Seiten mit $${tex(n.b)}$ multiplizieren`; }
          else     { rhs = { t: 'op', op: '/', a: n.a, b: rhs }; lhs = n.b; note = (n.a.t === 'num' && n.a.v === 1) ? `Kehrwert bilden` : `nach dem Nenner auflösen`; }
        }
        else if (n.op === '^') {
          if (!inA) return null; // Variable im Exponenten → Fallback
          if (n.b.t === 'num' && n.b.v === 2) { rhs = { t: 'fn', fn: 'sqrt', a: rhs }; note = `Wurzel ziehen`; }
          else { rhs = { t: 'op', op: '^', a: rhs, b: { t: 'op', op: '/', a: { t: 'num', v: 1 }, b: n.b } }; note = `$${tex(n.b)}$-te Wurzel ziehen`; }
          lhs = n.a;
        }
        else return null;
      } else if (n.t === 'neg') {
        rhs = { t: 'neg', a: rhs }; lhs = n.a; note = `mit $(-1)$ multiplizieren`;
      } else if (n.t === 'fn') {
        const inv = { sin: 'asin', cos: 'acos', tan: 'atan', asin: 'sin', acos: 'cos', atan: 'tan', ln: 'exp', exp: 'ln' };
        if (n.fn === 'sqrt') { rhs = { t: 'op', op: '^', a: rhs, b: { t: 'num', v: 2 } }; lhs = n.a; note = `beide Seiten quadrieren`; }
        else if (inv[n.fn]) { rhs = { t: 'fn', fn: inv[n.fn], a: rhs }; lhs = n.a; note = `${FNNAME[inv[n.fn]] ? FNNAME[inv[n.fn]].replace('\\','') : inv[n.fn]} auf beide Seiten anwenden`; }
        else return null;
      } else return null;
      steps.push({ L: clone(lhs), R: clone(rhs), note });
    }
    return steps;
  }

  // ── Symbol → LaTeX ────────────────────────────────────────────────────────────
  const GREEK = { theta:'\\theta', alpha:'\\alpha', beta:'\\beta', delta:'\\delta',
    lambda:'\\lambda', nu:'\\nu', rho:'\\rho', tau:'\\tau', eta:'\\eta',
    epsilon:'\\varepsilon', gamma:'\\Gamma', phi:'\\varphi', omega:'\\omega',
    mu:'\\mu', sigma:'\\sigma', Delta:'\\Delta', Gamma:'\\Gamma', Phi:'\\Phi', pi:'\\pi' };
  function symTex(sym) {
    let s = sym.replace(/prime/g, "'");
    const prime = s.endsWith("'") ? "'" : '';
    let core = prime ? s.slice(0, -1) : s, base, sub = '';
    const um = core.match(/^([A-Za-z]+?)_(.+)$/), dm = core.match(/^([A-Za-z]+?)(\d+)$/);
    if (um) { base = um[1]; sub = um[2]; } else if (dm) { base = dm[1]; sub = dm[2]; } else base = core;
    base = GREEK[base] || base;
    const sb = sub ? (sub.length > 1 ? `_{${sub}}` : `_${sub}`) : '';
    return base + sb + prime;
  }
  const FNTEX = { sin:'\\sin', cos:'\\cos', tan:'\\tan', asin:'\\arcsin', acos:'\\arccos',
    atan:'\\arctan', arcsin:'\\arcsin', arccos:'\\arccos', arctan:'\\arctan', ln:'\\ln', exp:'\\exp' };
  function numTex(v) { return Number.isInteger(v) ? String(v) : String(v).replace('.', '{,}'); }

  // ── AST → LaTeX (mit Präzedenz-Klammerung) ───────────────────────────────────
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
  function prec(n) { if (n.t === 'op') return PREC[n.op]; if (n.t === 'neg') return 1; return 5; }
  function tex(n, parent, side) {
    switch (n.t) {
      case 'num': return numTex(n.v);
      case 'var': return symTex(n.name);
      case 'neg': return '-' + wrap(n.a, n, 'r');
      case 'fn':
        if (n.fn === 'sqrt') return `\\sqrt{${tex(n.a)}}`;
        if (n.fn === 'abs')  return `\\left|${tex(n.a)}\\right|`;
        return `${FNTEX[n.fn] || ('\\' + n.fn)}\\!\\left(${tex(n.a)}\\right)`;
      case 'op':
        if (n.op === '/') return `\\dfrac{${tex(n.a)}}{${tex(n.b)}}`;
        if (n.op === '^') return `${wrap(n.a, n, 'l')}^{${tex(n.b)}}`;
        if (n.op === '*') return `${wrap(n.a, n, 'l')} \\cdot ${wrap(n.b, n, 'r')}`;
        return `${wrap(n.a, n, 'l')} ${n.op} ${wrap(n.b, n, 'r')}`;
    }
    return '';
  }
  function wrap(child, parent, side) {
    let need = prec(child) < prec(parent);
    // Subtraktion/Division: rechte Summen/Differenzen klammern
    if (!need && side === 'r' && (parent.op === '-' ) && child.t === 'op' && (child.op === '+' || child.op === '-')) need = true;
    if (parent.op === '/' || (parent.t === 'fn')) need = false; // Bruch/Funktion klammert selbst
    const s = tex(child);
    return need ? `\\left(${s}\\right)` : s;
  }

  // ── Öffentliche API ───────────────────────────────────────────────────────────
  // Liefert Array von LaTeX-Strings (jeder ein Gleichungsschritt) oder null.
  function rearrangeSteps(eqStr, targetSym) {
    try {
      const { L, R } = parseEq(eqStr);
      const steps = isolate(L, R, targetSym);
      if (!steps) return null;
      const out = steps.map(s => ({ tex: `${tex(s.L)} = ${tex(s.R)}`, note: s.note }));
      out[0] = { tex: `${tex(L)} = ${tex(R)}`, note: 'Ausgangsformel' };   // Originalausrichtung
      return out;
    } catch (e) { return null; }
  }

  // Liefert die isolierte Ausdrucks-AST (RHS, wenn LHS = Ziel) oder null.
  function solveExpr(eqStr, targetSym) {
    try {
      const { L, R } = parseEq(eqStr);
      const steps = isolate(L, R, targetSym);
      if (!steps) return null;
      return steps[steps.length - 1].R;
    } catch (e) { return null; }
  }

  global.Algebra = { rearrangeSteps, parseEq, isolate, tex, symTex, solveExpr };
})(typeof window !== 'undefined' ? window : globalThis);
