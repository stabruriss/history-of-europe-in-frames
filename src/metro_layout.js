// Turns the route plan in metro_design.js into exact geometry: solves x positions,
// builds simple octilinear rails, draws interchanges and places every name without
// collisions. Pure and deterministic, so a Node script can check it without a browser.
//
// An interchange is one station. Rails that run bundled share one capsule; rails that
// run apart each carry a ring, and a dashed link joins the rings at one x position.
(function (global) {
  'use strict';
  const RAIL_HALF = 3, GLYPH_R = 4.5, BUNDLED_R = 3.6, RING_R = 5.5, CAPSULE_R = 6.5;
  const NAME_H = 15, NAME_DATE_H = 27, FS = 12.5, MIN_STOP_GAP = 32;
  const FLAG_H = 20, FLAG_POINT = 8, SPARE_LANE = 48;

  const textWidth = (text, size) => {
    let w = 0;
    for (const c of String(text)) w += /[⺀-￯]/.test(c) ? size : size * 0.56;
    return w;
  };
  const overlaps = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

  function segmentHitsBox(s, box, pad) {
    const x0 = box.x0 - pad, x1 = box.x1 + pad, y0 = box.y0 - pad, y1 = box.y1 + pad;
    let t0 = 0, t1 = 1;
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    for (const [p, q] of [[-dx, s.x1 - x0], [dx, x1 - s.x1], [-dy, s.y1 - y0], [dy, y1 - s.y1]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const r = q / p;
      if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
      else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return true;
  }

  function properCross(a, b) {
    const side = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const A = { x: a.x1, y: a.y1 }, B = { x: a.x2, y: a.y2 }, C = { x: b.x1, y: b.y1 }, D = { x: b.x2, y: b.y2 };
    return side(A, B, C) * side(A, B, D) < -1e-6 && side(C, D, A) * side(C, D, B) < -1e-6;
  }

  function build({ stations, lines, lineStops, design, periods, ends }) {
    // Two stops of one line can share an anchor year; keep them in route order.
    const tx = new Map(stations.map(s => [s.key, s.t]));
    for (const line of lines) {
      let last = -Infinity;
      for (const s of lineStops.get(line.id)) {
        if (tx.get(s.key) <= last) tx.set(s.key, last + 0.25);
        last = tx.get(s.key);
      }
    }

    for (const [key, shift] of Object.entries(design.nudge || {})) tx.set(key, tx.get(key) + shift);

    // A line not yet drawn in metro_design.js still runs, on a spare lane under the rest; the report names it.
    const deepest = Math.max(...Object.values(design.routes).flat().map(k => k[1]));
    const undrawn = lines.filter(l => !design.routes[l.id]).map(l => l.id);
    const spareRoutes = Object.fromEntries(undrawn.map((id, i) => {
      const seq = lineStops.get(id), y = deepest + SPARE_LANE * (i + 1);
      return [id, [[tx.get(seq[0].key), y], [tx.get(seq[seq.length - 1].key), y]]];
    }));
    const knotsOf = id => design.routes[id] || spareRoutes[id];
    const allTimes = [...new Set([...tx.values(), ...lines.flatMap(l => knotsOf(l.id).map(k => k[0])), ...design.gaps.flatMap(g => [g[0], g[1]])])].sort((a, b) => a - b);
    const index = new Map(allTimes.map((t, i) => [t, i]));
    const learned = new Map();
    const addLearned = (a, b, d) => {
      const [p, q] = a < b ? [a, b] : [b, a];
      if (p === q) return;
      const key = p + '|' + q;
      learned.set(key, { a: p, b: q, d: Math.max(d, learned.get(key)?.d || 0) });
    };

    let xs = [];
    const X = t => xs[index.get(t)];
    const XAt = t => {
      if (index.has(t)) return X(t);
      if (t <= allTimes[0]) return xs[0];
      if (t >= allTimes[allTimes.length - 1]) return xs[xs.length - 1];
      let lo = 0, hi = allTimes.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (allTimes[m] <= t) lo = m; else hi = m; }
      return xs[lo] + (t - allTimes[lo]) / (allTimes[hi] - allTimes[lo]) * (xs[hi] - xs[lo]);
    };

    const labelWidth = s => Math.max(textWidth(s.title, FS), textWidth(s.period, 9.5) * 0.92) + 6;

    function solveX() {
      const cons = allTimes.map(() => []);
      const add = (a, b, d) => { const i = index.get(a), j = index.get(b); if (i < j) cons[j].push([i, d]); };
      for (const line of lines) {
        const seq = lineStops.get(line.id);
        seq.forEach((s, i) => {
          if (i) add(tx.get(seq[i - 1].key), tx.get(s.key), MIN_STOP_GAP);
          if (i > 1) add(tx.get(seq[i - 2].key), tx.get(s.key), (labelWidth(seq[i - 2]) + labelWidth(s)) / 2 + 8);
        });
        const knots = knotsOf(line.id);
        for (let i = 2; i < knots.length; i++) {
          // Every lane change after a branch's first leg is one clean 45deg run.
          const [t0, y0, , dx0 = 0] = knots[i - 1], [t1, y1, , dx1 = 0] = knots[i];
          const dy = Math.abs(y1 - y0);
          if (dy) add(t0, t1, dy + 6 - (dx1 - dx0));
        }
        if (knots.length > 1) {
          const [t0, y0, , dx0 = 0] = knots[0], [t1, y1, , dx1 = 0] = knots[1];
          const dy = Math.abs(y1 - y0);
          if (dy && t0 !== t1) add(t0, t1, dy + 6 - (dx1 - dx0));
        }
      }
      for (const [a, b, d] of design.gaps) add(a, b, d);
      for (const { a, b, d } of learned.values()) add(a, b, d);
      xs = new Array(allTimes.length);
      xs[0] = 170;
      for (let j = 1; j < allTimes.length; j++) {
        let x = xs[j - 1] + 0.4;
        for (const [i, d] of cons[j]) x = Math.max(x, xs[i] + d);
        xs[j] = x;
      }
    }

    function routePoints(id) {
      const knots = knotsOf(id), pts = [], tight = [];
      knots.forEach(([t, y, mode, dx = 0], i) => {
        const x = X(t) + dx;
        if (!i) { pts.push({ x, y }); return; }
        const prev = pts[pts.length - 1], dy = Math.abs(y - prev.y), run = x - prev.x, sign = Math.sign(y - prev.y);
        if (dy < 0.5) { pts.push({ x, y }); return; }
        if (run >= dy - 0.5) {
          // A final early turn ends where it lands: that is a merge into another line.
          if (mode === 'e' && i === knots.length - 1) pts.push({ x: prev.x + dy, y });
          else if (mode === 'e') pts.push({ x: prev.x + dy, y }, { x, y });
          else pts.push({ x: x - dy, y: prev.y }, { x, y });
          return;
        }
        // A branch drops straight off its parent's rail, then eases into its first stop.
        const c = Math.max(0, run);
        if (i !== 1) tight.push({ line: id, t, run: Math.round(run), dy: Math.round(dy) });
        pts.push({ x: x - c, y: y - sign * c }, { x, y });
      });
      // Stops added beyond the drawn route: the line carries straight on to reach them.
      const seq = lineStops.get(id), firstX = X(tx.get(seq[0].key)), lastX = X(tx.get(seq[seq.length - 1].key));
      const head = pts[0], tail = pts[pts.length - 1];
      if (firstX < head.x) { if (pts[1] && pts[1].y === head.y) head.x = firstX; else pts.unshift({ x: firstX, y: head.y }); }
      if (lastX > tail.x) { const before = pts[pts.length - 2]; if (before && before.y === tail.y) tail.x = lastX; else pts.push({ x: lastX, y: tail.y }); }
      return { pts: pts.filter((p, i) => !i || Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) > 0.5), tight };
    }

    const yOn = (pts, x) => {
      if (x <= pts[0].x) return pts[0].y;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if (x <= b.x) return b.x === a.x ? b.y : a.y + (x - a.x) / (b.x - a.x) * (b.y - a.y);
      }
      return pts[pts.length - 1].y;
    };

    const nodes = new Map(stations.map(s => [s.key, { key: s.key, s }]));
    let routes = new Map(), segments = [], links = [], tightList = [], flagList = [];

    function geometry() {
      solveX();
      routes = new Map(); segments = []; tightList = []; links = [];
      for (const line of lines) {
        const { pts, tight } = routePoints(line.id);
        routes.set(line.id, pts);
        tightList.push(...tight);
        for (let i = 1; i < pts.length; i++) segments.push({ line: line.id, x1: pts[i - 1].x, y1: pts[i - 1].y, x2: pts[i].x, y2: pts[i].y });
      }
      for (const n of nodes.values()) {
        n.x = X(tx.get(n.key));
        n.ys = Object.fromEntries(n.s.lines.map(id => [id, yOn(routes.get(id), n.x)]));
        const rails = n.s.lines.map(id => ({ id, y: n.ys[id] })).sort((a, b) => a.y - b.y);
        n.clusters = [];
        if (rails.length === 1) {
          // A plain stop beside another rail gets a smaller glyph, nudged off its neighbour.
          let r = GLYPH_R, shift = 0;
          for (const line of lines) {
            if (line.id === rails[0].id) continue;
            const pts = routes.get(line.id);
            if (!pts?.length || n.x < pts[0].x || n.x > pts[pts.length - 1].x) continue;
            const d = yOn(pts, n.x) - rails[0].y;
            if (Math.abs(d) < 10) { r = BUNDLED_R; shift = d > 0 ? -1.4 : 1.4; }
          }
          n.clusters.push({ lines: [rails[0].id], y0: rails[0].y + shift, y1: rails[0].y + shift, r });
        } else {
          for (const rail of rails) {
            const last = n.clusters[n.clusters.length - 1];
            if (last && rail.y - last.y1 <= design.B + 1) { last.lines.push(rail.id); last.y1 = rail.y; }
            else n.clusters.push({ lines: [rail.id], y0: rail.y, y1: rail.y });
          }
          for (const c of n.clusters) c.r = c.lines.length > 1 ? CAPSULE_R : RING_R;
        }
        for (const c of n.clusters) c.box = { x0: n.x - c.r, x1: n.x + c.r, y0: c.y0 - c.r, y1: c.y1 + c.r };
        n.y0 = n.clusters[0].y0;
        n.y1 = n.clusters[n.clusters.length - 1].y1;
        n.y = (n.y0 + n.y1) / 2;
        n.link = n.clusters.length > 1 ? { x: n.x, y0: n.clusters[0].y1 + n.clusters[0].r, y1: n.clusters[n.clusters.length - 1].y0 - n.clusters[n.clusters.length - 1].r } : null;
        if (n.link) links.push({ key: n.key, x1: n.x, y1: n.link.y0, x2: n.x, y2: n.link.y1 });
      }
    }

    const allGlyphs = () => [...nodes.values()].flatMap(n => n.clusters.map(c => ({ key: n.key, box: c.box })));

    // Signpost flags: the start flag points right at the line's first stop, the end flag
    // points left at its last. Station names then avoid them.
    function placeFlags(glyphs) {
      const out = [];
      for (const line of lines) {
        const seq = lineStops.get(line.id);
        if (!seq.length) continue;
        const w = textWidth(line.name, 11) + 12 + FLAG_POINT;
        for (const [end, n] of [['start', nodes.get(seq[0].key)], ['end', nodes.get(seq[seq.length - 1].key)]]) {
          const y = n.ys[line.id], sign = end === 'start' ? -1 : 1;
          const r = n.clusters.find(c => c.lines.includes(line.id)).r + 3;
          const tips = [[n.x + sign * r, y], [n.x + sign * 2, y + 16], [n.x + sign * 2, y - 16], [n.x + sign * (r + 18), y], [n.x + sign * 2, y + 32], [n.x + sign * 2, y - 32]];
          const boxAt = (tx0, ty) => ({ x0: sign < 0 ? tx0 - w : tx0, x1: sign < 0 ? tx0 : tx0 + w, y0: ty - FLAG_H / 2, y1: ty + FLAG_H / 2 });
          const free = (box, onRail) => !segments.some(s => (!onRail || s.line !== line.id) && segmentHitsBox(s, box, 1.5))
            && !links.some(l => segmentHitsBox(l, box, 1.5))
            && !glyphs.some(g => g.key !== n.key && overlaps(box, g.box))
            && !out.some(f => overlaps(box, f.box));
          const tip = tips.find(([tipX, tipY]) => free(boxAt(tipX, tipY), tipY === y));
          const [tipX, tipY] = tip || tips[0];
          out.push({ line: line.id, name: line.name, c: line.c, end, free: Boolean(tip), onRail: tipY === y, tipX, tipY, w, h: FLAG_H, box: boxAt(tipX, tipY) });
        }
      }
      return out;
    }

    function placeLabels() {
      const glyphs = allGlyphs();
      flagList = placeFlags(glyphs);
      const placed = flagList.filter(f => f.free).map(f => ({ key: 'flag:' + f.line + ':' + f.end, box: f.box, flag: true }));
      const unresolved = [];
      const ordered = [...nodes.values()].sort((a, b) => b.s.lines.length - a.s.lines.length || a.x - b.x);
      const sideOf = new Map();
      const prevSide = n => {
        for (const id of n.s.lines) {
          const seq = lineStops.get(id), i = seq.findIndex(s => s.key === n.key);
          for (const j of [i - 1, i + 1]) { const side = seq[j] && sideOf.get(seq[j].key); if (side) return side; }
        }
        return null;
      };
      const conflicts = (box, n) => {
        const hits = [];
        for (const s of segments) if (segmentHitsBox(s, box, RAIL_HALF)) { hits.push({ kind: 'rail', line: s.line }); break; }
        for (const l of links) if (segmentHitsBox(l, box, 2)) { hits.push({ kind: 'link', key: l.key }); break; }
        for (const g of glyphs) if (g.key !== n.key && overlaps(box, g.box)) { hits.push({ kind: 'glyph', key: g.key }); break; }
        for (const p of placed) if (overlaps(box, p.box)) { hits.push({ kind: 'label', key: p.key, flag: p.flag }); break; }
        return hits;
      };
      for (const n of ordered) {
        const w = textWidth(n.s.title, FS) + 4, wd = labelWidth(n.s), gap = 4;
        const top = n.clusters[0], bottom = n.clusters[n.clusters.length - 1];
        const above = (bw, h, shift = 0, anchor = 'middle') => {
          const x0 = anchor === 'middle' ? n.x - bw / 2 : anchor === 'start' ? n.x - 5 : n.x + 5 - bw;
          return { x0, x1: x0 + bw, y0: top.box.y0 - gap - h - shift, y1: top.box.y0 - gap - shift, anchor, side: 'above', far: shift > 0, leaderFrom: top.box.y0 };
        };
        const below = (bw, h, shift = 0, anchor = 'middle') => {
          const x0 = anchor === 'middle' ? n.x - bw / 2 : anchor === 'start' ? n.x - 5 : n.x + 5 - bw;
          return { x0, x1: x0 + bw, y0: bottom.box.y1 + gap + shift, y1: bottom.box.y1 + gap + h + shift, anchor, side: 'below', far: shift > 0, leaderFrom: bottom.box.y1 };
        };
        const beside = (bw, h, cy, right) => ({ x0: right ? n.x + RING_R + gap : n.x - RING_R - gap - bw, x1: right ? n.x + RING_R + gap + bw : n.x - RING_R - gap, y0: cy - h / 2, y1: cy + h / 2, anchor: right ? 'start' : 'end', side: right ? 'right' : 'left' });
        const candidates = (bw, h) => {
          const prefer = prevSide(n) === 'above' ? below : prevSide(n) === 'below' ? above : (n.s.lines.length > 1 ? above : below);
          const other = prefer === above ? below : above;
          const out = [prefer(bw, h), other(bw, h), prefer(bw, h, 0, 'start'), other(bw, h, 0, 'start'), prefer(bw, h, 0, 'end'), other(bw, h, 0, 'end')];
          // Names of far-apart interchanges can also sit beside the dashed link.
          if (n.link) for (const f of [0.5, 0.3, 0.7, 0.15, 0.85]) {
            const cy = n.link.y0 + (n.link.y1 - n.link.y0) * f;
            out.push(beside(bw, h, cy, true), beside(bw, h, cy, false));
          }
          for (const c of n.clusters) { const cy = (c.y0 + c.y1) / 2; out.push(beside(bw, h, cy, true), beside(bw, h, cy, false), beside(bw, h, cy - h / 2 - 8, true), beside(bw, h, cy + h / 2 + 8, true), beside(bw, h, cy - h / 2 - 8, false), beside(bw, h, cy + h / 2 + 8, false)); }
          for (const shift of [16, 36, 58]) out.push(prefer(bw, h, shift), other(bw, h, shift));
          return out;
        };
        let chosen = null, withDate = false;
        for (const [list, date] of [[candidates(wd, NAME_DATE_H), true], [candidates(w, NAME_H), false]]) {
          chosen = list.find(b => !conflicts(b, n).length) || null;
          if (chosen) { withDate = date; break; }
        }
        if (!chosen) {
          const best = candidates(w, NAME_H).map(b => ({ b, hits: conflicts(b, n) })).sort((p, q) => p.hits.length - q.hits.length)[0];
          chosen = best.b;
          unresolved.push({ key: n.key, title: n.s.title, hits: best.hits });
          // Only a clash with another name can be cured by moving stations apart.
          for (const h of best.hits) {
            if (h.flag || (h.kind !== 'label' && h.kind !== 'link')) continue;
            addLearned(tx.get(n.key), tx.get(h.key), Math.abs(n.x - nodes.get(h.key).x) + 18);
          }
        }
        n.label = {
          box: chosen, anchor: chosen.anchor, side: chosen.side, withDate, far: Boolean(chosen.far), leaderFrom: chosen.leaderFrom,
          x: chosen.anchor === 'middle' ? (chosen.x0 + chosen.x1) / 2 : chosen.anchor === 'start' ? chosen.x0 : chosen.x1,
          y: chosen.y0 + 12,
        };
        sideOf.set(n.key, chosen.side);
        placed.push({ key: n.key, box: chosen });
      }
      return { placed, unresolved };
    }

    let iterations = 0, result;
    for (; iterations < 6; iterations++) {
      geometry();
      result = placeLabels();
      if (!result.unresolved.length) break;
    }
    iterations++;

    // Dynasty and period marks along each line: ticks at boundaries, names where they fit.
    const periodMarks = [], ticks = [], periodBoxes = [];
    const glyphBoxes = allGlyphs().map(g => g.box);
    const labelBoxes = result.placed.map(p => p.box);
    const railFree = box => !segments.some(s => segmentHitsBox(s, box, RAIL_HALF)) && !links.some(l => segmentHitsBox(l, box, 2));
    for (const line of lines) {
      const seq = lineStops.get(line.id), list = periods[line.id] || [], pts = routes.get(line.id);
      if (!seq.length) continue;
      const first = seq[0].t, last = seq[seq.length - 1].t;
      for (const [start, end, name] of list) {
        const a = Math.max(start, first), b = Math.min(end, last);
        if (start >= last || end <= first) continue;
        if (end > first && end < last) {
          let x = XAt(end);
          const clear = v => !seq.some(st => Math.abs(nodes.get(st.key).x - v) < 13);
          if (!clear(x)) x = [x - 15, x + 15, x - 24, x + 24].find(clear) ?? x;
          const y = yOn(pts, x), yl = yOn(pts, x - 3), yr = yOn(pts, x + 3);
          if (Math.abs(yl - yr) < 0.5) ticks.push({ line: line.id, x, y });
        }
        const xa = XAt(a), xb = XAt(b), w = textWidth(name, 10.5) + 6, h = 13;
        if (xb - xa < 14) { periodMarks.push({ line: line.id, name, placed: false, tiny: true, start, end }); continue; }
        const tryPlace = strict => {
          const spots = [0.5];
          for (let d = 0.07; d <= 0.5; d += 0.07) spots.push(0.5 - d, 0.5 + d);
          for (const f of spots) {
            const cx = xa + (xb - xa) * f, ry = yOn(pts, cx), flat = Math.abs(yOn(pts, cx - w / 2) - ry) < 0.5 && Math.abs(yOn(pts, cx + w / 2) - ry) < 0.5;
            if (!flat) continue;
            for (const off of [7, 22, 38]) for (const side of [1, -1]) {
              const box = { x0: cx - w / 2, x1: cx + w / 2, y0: side > 0 ? ry + off : ry - off - h, y1: side > 0 ? ry + off + h : ry - off };
              if (!railFree(box) || glyphBoxes.some(g => overlaps(box, g)) || periodBoxes.some(p => overlaps(box, p))) continue;
              if (strict && labelBoxes.some(l => overlaps(box, l))) continue;
              return { box, cx };
            }
          }
          // A section that is all diagonal: sit beside the slope instead.
          for (const f of spots) {
            const px = xa + (xb - xa) * f, ry = yOn(pts, px);
            for (const [bx0, by0] of [[px + 8, ry + 3], [px - w - 8, ry - h - 3], [px + 8, ry - h - 3], [px - w - 8, ry + 3], [px + 16, ry + 10], [px - w - 16, ry - h - 10]]) {
              const box = { x0: bx0, x1: bx0 + w, y0: by0, y1: by0 + h };
              if (!railFree(box) || glyphBoxes.some(g => overlaps(box, g)) || periodBoxes.some(p => overlaps(box, p))) continue;
              if (strict && labelBoxes.some(l => overlaps(box, l))) continue;
              return { box, cx: bx0 + w / 2 };
            }
          }
          return null;
        };
        const strict = tryPlace(true), spot = strict || tryPlace(false);
        if (!spot) { periodMarks.push({ line: line.id, name, placed: false, start, end }); continue; }
        periodBoxes.push(spot.box);
        periodMarks.push({ line: line.id, name, placed: true, strict: Boolean(strict), x: spot.cx, y: spot.box.y0 + 10.5, start, end });
      }
    }

    // Branch and merge notes, using the atlas's own ends data only.
    const notes = [];
    for (const [id, t, name, note] of ends || []) {
      const pts = routes.get(id);
      if (!pts) continue;
      const end = pts[pts.length - 1], w = textWidth(name, 10.5) + 6, h = 13;
      const options = [[end.x + 6, end.y - 22], [end.x - w - 6, end.y - 22], [end.x + 6, end.y + 9], [end.x - w - 6, end.y + 9], [end.x + 14, end.y - 40], [end.x - w - 14, end.y + 26]];
      for (const [x, y] of options) {
        const box = { x0: x, x1: x + w, y0: y, y1: y + h };
        if (!railFree(box) || glyphBoxes.some(g => overlaps(box, g)) || labelBoxes.some(l => overlaps(box, l)) || periodBoxes.some(p => overlaps(box, p))) continue;
        notes.push({ line: id, name, note, year: t, x, y: y + 10.5 });
        periodBoxes.push(box);
        break;
      }
    }

    // Quality report, asserted by verify_mock.cjs.
    const foreign = [];
    for (const n of nodes.values()) for (const c of n.clusters) for (const s of segments) {
      if (c.lines.includes(s.line)) continue;
      if (segmentHitsBox(s, c.box, 0)) foreign.push({ station: n.s.title, line: s.line });
    }
    const linkThroughStations = [], linkOnRail = [];
    for (const l of links) {
      for (const n of nodes.values()) {
        if (n.key === l.key) continue;
        if (n.clusters.some(c => segmentHitsBox(l, c.box, 0))) linkThroughStations.push({ link: nodes.get(l.key).s.title, station: n.s.title });
      }
      for (const s of segments) {
        if (Math.abs(s.x1 - s.x2) > 0.5 || Math.abs(s.x1 - l.x1) > 3) continue;
        if (Math.min(l.y2, Math.max(s.y1, s.y2)) - Math.max(l.y1, Math.min(s.y1, s.y2)) > 6) linkOnRail.push({ link: nodes.get(l.key).s.title, line: s.line });
      }
    }
    const overlapsRail = [];
    let crossings = 0;
    for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i], b = segments[j];
      if (a.line === b.line) continue;
      if (properCross(a, b)) crossings++;
      const ax = a.x2 - a.x1, ay = a.y2 - a.y1, bx = b.x2 - b.x1, by = b.y2 - b.y1;
      if (Math.abs(ax * by - ay * bx) > 1e-6) continue;
      const d = Math.abs((b.x1 - a.x1) * ay - (b.y1 - a.y1) * ax) / Math.hypot(ax, ay);
      if (d > 2) continue;
      // Measured along the rails' own direction: on the x axis alone, two lines stacked on a vertical run always measured 0.
      const len = Math.hypot(ax, ay), along = (x, y) => ((x - a.x1) * ax + (y - a.y1) * ay) / len;
      const tb = [along(b.x1, b.y1), along(b.x2, b.y2)];
      const lo = Math.max(0, Math.min(...tb)), hi = Math.min(len, Math.max(...tb));
      if (hi - lo > 6) {
        const at = t => [Math.round(a.x1 + ax * t / len), Math.round(a.y1 + ay * t / len)];
        overlapsRail.push({ a: a.line, b: b.line, from: at(lo), to: at(hi) });
      }
    }
    const boxes = [...nodes.values()];
    const world = {
      minX: Math.min(...boxes.map(n => n.label.box.x0), ...segments.map(s => s.x1), ...flagList.map(f => f.box.x0)),
      maxX: Math.max(...boxes.map(n => n.label.box.x1), ...segments.map(s => s.x2), ...flagList.map(f => f.box.x1)),
      minY: Math.min(...boxes.map(n => n.label.box.y0), ...segments.map(s => Math.min(s.y1, s.y2))),
      maxY: Math.max(...boxes.map(n => n.label.box.y1), ...segments.map(s => Math.max(s.y1, s.y2))),
    };
    const bendsByLine = Object.fromEntries(lines.map(l => [l.id, Math.max(0, (routes.get(l.id)?.length || 2) - 2)]));

    return {
      nodes, routes, segments, ticks, periodMarks, flags: flagList, notes, X: XAt, world,
      report: {
        iterations,
        undrawnLines: undrawn,
        worldWidth: Math.round(world.maxX - world.minX),
        worldHeight: Math.round(world.maxY - world.minY),
        unresolvedLabels: result.unresolved.map(u => ({ title: u.title, hits: u.hits.map(h => h.kind + ':' + (h.line || h.key)) })),
        foreignStations: foreign,
        railOverlaps: overlapsRail,
        tightBends: tightList,
        linkThroughStations,
        linkOnRail,
        bends: Object.values(bendsByLine).reduce((a, b) => a + b, 0),
        bendsByLine,
        dashedLinks: links.length,
        capsules: boxes.reduce((v, n) => v + n.clusters.filter(c => c.lines.length > 1).length, 0),
        crossings,
        flagsWithoutRoom: flagList.filter(f => !f.free).map(f => f.line + ':' + f.end),
        flagsOffRail: flagList.filter(f => f.free && !f.onRail).map(f => f.line + ':' + f.end),
        periodsTotal: periodMarks.length,
        periodsPlaced: periodMarks.filter(p => p.placed).length,
        periodsSkippedTiny: periodMarks.filter(p => p.tiny).length,
        periodsWithStationNames: periodMarks.filter(p => p.strict).length,
        periodsUnplaced: periodMarks.filter(p => !p.placed && !p.tiny).map(p => p.line + ':' + p.name),
        routeOrderViolations: lines.flatMap(l => {
          const seq = lineStops.get(l.id), bad = [];
          for (let i = 1; i < seq.length; i++) if (nodes.get(seq[i].key).x <= nodes.get(seq[i - 1].key).x) bad.push(l.id + ':' + seq[i].title);
          return bad;
        }),
        labelsWithDates: boxes.filter(n => n.label.withDate).length,
      },
    };
  }

  global.buildNetworkLayout = build;
})(typeof window !== 'undefined' ? window : globalThis);
