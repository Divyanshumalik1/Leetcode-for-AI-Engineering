#!/usr/bin/env node
// AI Engineering LeetCode tracker. No dependencies — plain Node 20+.
//
//   npm run new   -- <words from a question>   scaffold a problem folder from README.md
//   npm run t     -- <problem> [--once]        run that problem's tests (re-runs when you save)
//   npm run play  -- <problem>                 run the module / start the API server
//   npm run bench -- <problem>                 run bench.py (benchmark problems)
//   npm run log   -- <problem> --result pass|partial|fail [--time 60] [--missed "..."]
//   npm run reset -- <problem>                 archive your code, get blank files (tests and evals stay)
//   npm run today                              what's due, what's next
//   npm run sync                               rebuild README checkboxes + progress table
//
// <problem> can be the folder name (003-hybrid-retrieval), the slug (hybrid-retrieval) or words from the question.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const README = path.join(ROOT, 'README.md');
const PROGRESS = path.join(ROOT, 'PROGRESS.md');
const TEMPLATES = path.join(ROOT, '_templates');
const TRACK = ' <!--track-->';

// Mastered = a passing attempt on attempt 3 or later.
const MASTER_ATTEMPT = 3;
// Days to wait after attempt N before attempt N+1 is due.
const SPACING = { 1: 3, 2: 10 };
const RETRY_DAYS = 4;

// README section number → [repo folder, default template]
const SECTIONS = {
  1: ['01-llm', 'py'], 2: ['01-llm', 'py'],
  3: ['02-vectors', 'bench'], 4: ['02-vectors', 'bench'],
  5: ['03-rag', 'py'], 6: ['03-rag', 'bench'], 7: ['03-rag', 'bench'], 8: ['03-rag', 'service'],
  9: ['03-rag', 'py'], 10: ['03-rag', 'py'],
  11: ['04-evals', 'bench'], 12: ['04-evals', 'bench'],
  13: ['05-agents', 'py'], 14: ['05-agents', 'py'], 15: ['05-agents', 'py'], 16: ['05-agents', 'py'],
  17: ['05-agents', 'py'], 18: ['04-evals', 'bench'], 19: ['05-agents', 'py'],
  20: ['06-frameworks', 'py'], 21: ['06-frameworks', 'py'], 22: ['06-frameworks', 'py'], 23: ['06-frameworks', 'py'],
  24: ['06-frameworks', 'py'], 25: ['06-frameworks', 'js'],
  26: ['07-models', 'bench'], 27: ['07-models', 'bench'], 28: ['07-models', 'py'],
  29: ['08-production', 'py'], 30: ['08-production', 'py'], 31: ['08-production', 'py'], 32: ['08-production', 'bench'],
  33: ['08-production', 'service'], 34: ['08-production', 'js'],
  35: ['09-aws', 'cloud'], 36: ['10-azure', 'cloud'],
  37: ['11-capstones', 'capstone'], 38: ['12-system-design', 'design'], 39: ['13-drills', 'drill'],
};

const AREAS = [
  ['LLM foundations (1–4)', [1, 2, 3, 4]],
  ['Retrieval & RAG (5–10)', [5, 6, 7, 8, 9, 10]],
  ['Evaluation (11–12)', [11, 12]],
  ['Agents (13–19)', [13, 14, 15, 16, 17, 18, 19]],
  ['Frameworks (20–25)', [20, 21, 22, 23, 24, 25]],
  ['Models (26–28)', [26, 27, 28]],
  ['Production (29–34)', [29, 30, 31, 32, 33, 34]],
  ['Cloud: AWS & Azure (35–36)', [35, 36]],
  ['Capstones, design & drills (37–39)', [37, 38, 39]],
];

const CODE_TYPES = ['py', 'bench', 'service', 'js', 'cloud'];

// Files that stay in place on `reset`: your spec, notes, tests and eval data are the problem, not the attempt.
const KEEP_ON_RESET = (name) =>
  ['README.md', 'NOTES.md', 'meta.json', 'attempts', 'tests', 'eval', 'BENCHMARK.md'].includes(name) ||
  /^test_.*\.py$/.test(name) || /\.test\.jsx?$/.test(name);

// ---------- helpers ----------

const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const addDays = (date, n) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const clean = (t) => t.split(TRACK)[0].replace(/[⭐🆕]/gu, '').replace(/\s+/g, ' ').trim();
const keyOf = (t) => clean(t).replace(/`/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const VERBS = /^(implement|build|use|run|add|create) (a |an |the )?/;
const coreOf = (key) => key.replace(VERBS, '');
// Folder name: drop the leading verb and anything in parentheses, keep it short, cut at a word boundary.
const slugOf = (t) => {
  const words = coreOf(keyOf(clean(t).replace(/\([^)]*\)/g, ' '))).split(' ');
  let out = '';
  for (const w of words) { if ((out ? out.length + 1 : 0) + w.length > 40) break; out = out ? `${out}-${w}` : w; }
  return out || words[0].slice(0, 40);
};
const moduleOf = (slug) => { const m = slug.replace(/-/g, '_'); return /^\d/.test(m) ? `p_${m}` : m; };
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJSON = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
// Git on Windows checks files out with CRLF line endings; keep whatever the file uses.
const eolOf = (s) => (s.includes('\r\n') ? '\r\n' : '\n');

function die(msg) { console.error(`✖ ${msg}`); process.exit(1); }

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[k] = v;
    } else out._.push(a);
  }
  return out;
}

// ---------- README + problem folders ----------

function parseReadme() {
  const raw = fs.readFileSync(README, 'utf8');
  const eol = eolOf(raw);
  const lines = raw.split(/\r?\n/);
  const items = [];
  let sec = null;
  lines.forEach((line, i) => {
    const h = line.match(/^## (?:\S+ )?(\d+)\. /);
    if (h) { sec = Number(h[1]); return; }
    if (/^#{1,2} /.test(line)) { sec = null; return; }
    const m = line.match(/^- \[( |x)\] (.*)$/);
    if (m && sec && SECTIONS[sec]) {
      const text = m[2].split(TRACK)[0].replace(/\s+$/, '');
      items.push({ i, sec, text, star: text.includes('⭐'), key: keyOf(text) });
    }
  });
  return { lines, items, eol };
}

function loadProblems() {
  const out = [];
  for (const cat of fs.readdirSync(ROOT)) {
    const cdir = path.join(ROOT, cat);
    if (!/^\d{2}-/.test(cat) || !fs.statSync(cdir).isDirectory()) continue;
    for (const p of fs.readdirSync(cdir)) {
      const mf = path.join(cdir, p, 'meta.json');
      if (fs.existsSync(mf)) out.push({ dir: path.join(cdir, p), rel: `${cat}/${p}`, meta: readJSON(mf) });
    }
  }
  return out;
}

function findProblem(q) {
  if (!q) die('Tell me which problem, e.g. hybrid-retrieval or 003-hybrid-retrieval');
  const probs = loadProblems();
  const ql = q.toLowerCase();
  let hits = probs.filter((p) => p.rel.toLowerCase() === ql || p.rel.toLowerCase().endsWith(`/${ql}`));
  if (!hits.length) hits = probs.filter((p) => p.rel.toLowerCase().endsWith(`-${ql.replace(/\s+/g, '-')}`));
  if (!hits.length) {
    const words = keyOf(q).split(' ');
    hits = probs.filter((p) => { const hay = `${p.rel.toLowerCase()} ${p.meta.key}`; return words.every((w) => hay.includes(w)); });
  }
  if (!hits.length) die(`No started problem matches "${q}". Start it with: npm run new -- ${q}`);
  if (hits.length > 1) die(`"${q}" matches several problems — use the folder name:\n  ${hits.map((h) => h.rel).join('\n  ')}`);
  return hits[0];
}

const isMastered = (m) => m.attempts.some((a) => a.n >= MASTER_ATTEMPT && a.result === 'pass');

function statusLabel(m) {
  if (isMastered(m)) return '✅ mastered';
  const n = m.attempts.length;
  if (n === 0) return '⚪ not attempted';
  const last = m.attempts[n - 1];
  const icon = { pass: '🟢', partial: '🟡', fail: '🔴' }[last.result];
  return `${icon} attempt ${n}/${MASTER_ATTEMPT}`;
}

function vars(meta) {
  return {
    TITLE: meta.question,
    TITLE_PY: JSON.stringify(meta.question.replace(/`/g, '')),
    TITLE_JS: JSON.stringify(meta.question.replace(/`/g, '')),
    SECTION: String(meta.section),
    TYPE: meta.type,
    MODULE: meta.module,
    DATE: today(),
  };
}

const TEXT_EXT = /\.(md|py|js|json|jsonl|html|css|ya?ml|txt|sql|tf|toml|ini|env)$/;

function copyTemplate(type, dest, v, skip = () => false) {
  const src = path.join(TEMPLATES, type);
  const sub = (s) => s.replace(/\{\{(\w+)\}\}/g, (all, k) => (k in v ? v[k] : all));
  const walk = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      const outName = name.replace(/__MODULE__/g, v.MODULE);
      if (from === src && skip(outName)) continue;
      const f = path.join(from, name), t = path.join(to, outName);
      if (fs.statSync(f).isDirectory()) { walk(f, t); continue; }
      if (TEXT_EXT.test(name)) fs.writeFileSync(t, sub(fs.readFileSync(f, 'utf8')));
      else fs.copyFileSync(f, t);
    }
  };
  walk(src, dest);
}

// ---------- commands ----------

function cmdNew(argv) {
  const a = parseArgs(argv);
  const q = a._.join(' ');
  const types = fs.readdirSync(TEMPLATES).join('|');
  if (!q) die(`Usage: npm run new -- <words from the question> [--type ${types}]`);
  const { items } = parseReadme();
  const qk = keyOf(q);
  // Exact question first ("hybrid retrieval" → "Build hybrid retrieval"), then every word anywhere.
  let hits = items.filter((it) => it.key === qk || coreOf(it.key) === coreOf(qk));
  if (!hits.length) hits = items.filter((it) => coreOf(keyOf(clean(it.text).replace(/\([^)]*\)/g, ' '))) === coreOf(qk));
  if (!hits.length) { const w = qk.split(' '); hits = items.filter((it) => w.every((x) => it.key.includes(x))); }
  if (!hits.length) die(`No question in README.md matches "${q}".`);
  if (hits.length > 1) {
    die(`"${q}" matches ${hits.length} questions — add a word or two:\n${hits.slice(0, 20).map((h) => `  §${h.sec}  ${clean(h.text)}`).join('\n')}`);
  }
  const it = hits[0];
  const existing = loadProblems().find((p) => p.meta.key === it.key);
  if (existing) die(`Already started: ${existing.rel}`);

  const [cat, defType] = SECTIONS[it.sec];
  const type = typeof a.type === 'string' ? a.type : defType;
  if (!fs.existsSync(path.join(TEMPLATES, type))) die(`Unknown type "${type}". Options: ${types}`);

  const cdir = path.join(ROOT, cat);
  fs.mkdirSync(cdir, { recursive: true });
  const nums = fs.readdirSync(cdir).map((d) => parseInt(d, 10)).filter((n) => !Number.isNaN(n));
  const num = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
  const slug = slugOf(it.text);
  const name = `${num}-${slug}`;
  const rel = `${cat}/${name}`;
  const dir = path.join(ROOT, rel);

  const meta = { question: clean(it.text), key: it.key, section: it.sec, type, module: moduleOf(slug), created: today(), attempts: [] };
  copyTemplate(type, dir, vars(meta));
  writeJSON(path.join(dir, 'meta.json'), meta);
  sync(true);

  console.log(`✔ Created ${rel}  (${type} template)\n`);
  const steps = [`Write the spec in ${rel}/README.md — prompt, requirements, edge cases, how you'll measure it.`];
  if (CODE_TYPES.includes(type)) {
    steps.push('Turn each requirement into a test, then build it.');
    steps.push(`npm run t -- ${name}      (tests; re-runs when you save)`);
    if (type === 'bench') steps.push(`npm run bench -- ${name}  (fill eval/dataset.jsonl first; record results in BENCHMARK.md)`);
    if (type === 'service') steps.push(`npm run play -- ${name}   (starts the API on http://localhost:8000)`);
    if (type === 'cloud') steps.push('Fill in COST.md before you deploy, and work through TEARDOWN.md when you finish.');
  } else if (type === 'capstone') {
    steps.push('Build the POC stage first; tag each finished stage (see the README in the folder).');
  } else {
    steps.push('Start the timer and answer it in the files there.');
  }
  steps.push(`npm run log -- ${name} --result pass|partial|fail --time <minutes> --missed "..."`);
  console.log('Next:');
  steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
}

function cmdLog(argv) {
  const a = parseArgs(argv);
  const q = a._.join(' ');
  if (!q || !a.result) die('Usage: npm run log -- <problem> --result pass|partial|fail [--time 60] [--missed "what you missed"]');
  if (!['pass', 'partial', 'fail'].includes(a.result)) die('--result must be pass, partial or fail');
  const p = findProblem(q);
  const m = p.meta;
  const n = m.attempts.length + 1;
  const minutes = a.time && a.time !== true ? Number(a.time) : null;
  const missed = typeof a.missed === 'string' ? a.missed : '';
  const entry = { n, date: today(), minutes, result: a.result, missed };
  m.attempts.push(entry);
  writeJSON(path.join(p.dir, 'meta.json'), m);

  const icon = { pass: '✅', partial: '🟡', fail: '❌' }[a.result];
  const time = minutes == null ? '–' : `${minutes} min`;
  const esc = (s) => (s || '–').replace(/\|/g, '\\|');

  const notesFile = path.join(p.dir, 'NOTES.md');
  if (fs.existsSync(notesFile)) {
    const notes = fs.readFileSync(notesFile, 'utf8');
    const nl = eolOf(notes);
    const row = `| ${n} | ${entry.date} | ${time} | ${icon} ${a.result} | ${esc(missed)} |`;
    fs.writeFileSync(notesFile, notes.includes('<!-- attempts -->') ? notes.replace('<!-- attempts -->', `${row}${nl}<!-- attempts -->`) : `${notes}${nl}${row}${nl}`);
  }
  if (!fs.existsSync(PROGRESS)) fs.writeFileSync(PROGRESS, '# Progress log\n\n| Date | Problem | Attempt | Time | Result | Missed |\n|---|---|---|---|---|---|\n');
  const prog = fs.readFileSync(PROGRESS, 'utf8');
  const pnl = eolOf(prog);
  fs.appendFileSync(PROGRESS, `${prog.endsWith('\n') ? '' : pnl}| ${entry.date} | [${p.rel}](${p.rel}) | ${n} | ${time} | ${icon} ${a.result} | ${esc(missed)} |${pnl}`);

  sync(true);
  const slug = path.basename(p.dir);
  if (isMastered(m)) {
    console.log(`🎉 ${m.question} — mastered! README checkbox ticked.`);
  } else {
    const wait = n < MASTER_ATTEMPT ? SPACING[n] : RETRY_DAYS;
    console.log(`✔ Logged attempt ${n} (${a.result}) for ${p.rel}`);
    console.log(`  Next attempt due ${addDays(entry.date, wait)}. When you start it: npm run reset -- ${slug}`);
  }
}

function cmdReset(argv) {
  const p = findProblem(parseArgs(argv)._.join(' '));
  const n = p.meta.attempts.length;
  if (!n) die('Nothing to archive yet — log an attempt first (npm run log).');
  const dest = path.join(p.dir, 'attempts', `attempt-${n}`);
  if (fs.existsSync(dest)) die(`${path.relative(ROOT, dest)} already exists — you already reset after attempt ${n}.`);
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(p.dir)) {
    if (name === '__pycache__' || name === '.pytest_cache') { fs.rmSync(path.join(p.dir, name), { recursive: true, force: true }); continue; }
    if (!KEEP_ON_RESET(name)) fs.renameSync(path.join(p.dir, name), path.join(dest, name));
  }
  copyTemplate(p.meta.type, p.dir, vars(p.meta), KEEP_ON_RESET);
  console.log(`✔ Archived attempt ${n} to ${path.relative(ROOT, dest)} and restored blank files.`);
  console.log(`  Attempt ${n + 1}: blank editor, timer on. Your spec, tests and eval data are still there.`);
}

function cmdToday() {
  const t = today();
  const probs = loadProblems();
  const due = [], upcoming = [];
  for (const p of probs) {
    const m = p.meta;
    if (isMastered(m)) continue;
    const n = m.attempts.length;
    if (n === 0) { due.push([p.rel, 'attempt 1 — not attempted yet']); continue; }
    const last = m.attempts[n - 1];
    const when = addDays(last.date, n < MASTER_ATTEMPT ? SPACING[n] : RETRY_DAYS);
    const row = [p.rel, `attempt ${n + 1} (last: ${last.result} on ${last.date})`, when];
    (when <= t ? due : upcoming).push(row);
  }
  const mastered = probs.filter((p) => isMastered(p.meta)).length;
  const { items } = parseReadme();
  console.log(`📅 ${t}  ·  ${probs.length} started  ·  ${mastered} mastered  ·  ${items.length} total\n`);
  console.log(due.length ? '🔔 Due now:' : '🔔 Nothing due right now.');
  for (const [rel, what] of due) console.log(`   • ${rel} — ${what}`);
  if (upcoming.length) {
    console.log('\n⏳ Coming up:');
    upcoming.sort((x, y) => x[2].localeCompare(y[2])).slice(0, 8).forEach(([rel, what, when]) => console.log(`   • ${when}  ${rel} — ${what}`));
  }
  const started = new Set(probs.map((p) => p.meta.key));
  const next = items.filter((it) => it.star && !started.has(it.key)).slice(0, 3);
  if (next.length) {
    console.log('\n⭐ Next starred problems:');
    for (const it of next) console.log(`   • ${clean(it.text)}   →  npm run new -- ${coreOf(keyOf(clean(it.text).replace(/\([^)]*\)/g, ' ')))}`);
  }
}

function replaceBlock(lines, name, content) {
  const s = lines.findIndex((l) => l.trim() === `<!-- ${name}:start -->`);
  const e = lines.findIndex((l) => l.trim() === `<!-- ${name}:end -->`);
  if (s === -1 || e === -1 || e < s) return false;
  lines.splice(s + 1, e - s - 1, ...content);
  return true;
}

const bar = (done, total) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const filled = Math.round(pct / 10);
  return `${'▓'.repeat(filled)}${'░'.repeat(10 - filled)} ${pct}%`;
};

function sync(quiet = false) {
  const { lines, items, eol } = parseReadme();
  const probs = loadProblems();
  const byKey = new Map(probs.map((p) => [p.meta.key, p]));

  for (const it of items) {
    const p = byKey.get(it.key);
    if (!p) { lines[it.i] = `- [ ] ${it.text}`; continue; }
    const done = isMastered(p.meta);
    lines[it.i] = `- [${done ? 'x' : ' '}] ${it.text}${TRACK} · [📂](${p.rel}) ${statusLabel(p.meta)}`;
  }

  const readmeKeys = new Set(items.map((it) => it.key));
  for (const p of probs) if (!readmeKeys.has(p.meta.key)) console.warn(`⚠ ${p.rel}: its question isn't in README.md any more ("${p.meta.question}")`);

  const stat = (list) => {
    const ps = list.map((it) => byKey.get(it.key)).filter(Boolean);
    return {
      total: list.length,
      started: ps.length,
      a1: ps.filter((p) => p.meta.attempts.length >= 1).length,
      a2: ps.filter((p) => p.meta.attempts.length >= 2).length,
      mastered: ps.filter((p) => isMastered(p.meta)).length,
    };
  };
  const row = (label, s, bold = false) => {
    const b = (x) => (bold ? `**${x}**` : x);
    return `| ${b(label)} | ${b(s.total)} | ${b(s.started)} | ${b(s.a1)} | ${b(s.a2)} | ${b(s.mastered)} | ${bar(s.mastered, s.total)} |`;
  };
  replaceBlock(lines, 'progress', [
    '',
    '| Area | Total | Started | Attempt 1 | Attempt 2 | Mastered | Progress |',
    '|---|---|---|---|---|---|---|',
    ...AREAS.map(([label, secs]) => row(label, stat(items.filter((it) => secs.includes(it.sec))))),
    row('⭐ Starred questions', stat(items.filter((it) => it.star))),
    row('Total', stat(items), true),
    '',
    `_Last synced ${today()} by \`npm run sync\`._`,
    '',
  ]);

  const all = stat(items);
  replaceBlock(lines, 'badges', [
    `![Questions](https://img.shields.io/badge/questions-${all.total}-blue)`,
    `![Started](https://img.shields.io/badge/started-${all.started}-orange)`,
    `![Mastered](https://img.shields.io/badge/mastered-${all.mastered}%2F${all.total}-brightgreen)`,
  ]);

  const next = lines.join(eol);
  if (next !== fs.readFileSync(README, 'utf8')) {
    fs.writeFileSync(README, next);
    if (!quiet) console.log(`✔ README.md synced — ${all.started} started, ${all.mastered}/${all.total} mastered.`);
  } else if (!quiet) console.log('✔ README.md already up to date.');
}

// ---------- running code ----------

function python() {
  if (process.env.PYTHON) return process.env.PYTHON;
  const win = path.join(ROOT, '.venv', 'Scripts', 'python.exe');
  const nix = path.join(ROOT, '.venv', 'bin', 'python');
  if (fs.existsSync(win)) return win;
  if (fs.existsSync(nix)) return nix;
  return process.platform === 'win32' ? 'python' : 'python3';
}

function run(cmd, args, opts = {}) {
  const useShell = process.platform === 'win32' && cmd === 'npx';
  return spawn(cmd, args, { stdio: 'inherit', shell: useShell, cwd: ROOT, ...opts });
}

function watchAndRerun(dir, start, match) {
  let child = start();
  let timer = null;
  let pending = false;
  const rerun = () => {
    if (child && child.exitCode === null) { pending = true; return; }
    console.log('\n↻ change detected — re-running…\n');
    child = start();
    child.on('exit', () => { if (pending) { pending = false; rerun(); } });
  };
  fs.watch(dir, { recursive: true }, (_evt, file) => {
    if (!file || !match.test(file) || /attempts[\\/]|__pycache__|\.pytest_cache/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(rerun, 300);
  });
  console.log(`👀 Watching ${path.relative(ROOT, dir)} — save a file to re-run, Ctrl+C to stop.`);
}

function cmdTest(argv) {
  const a = parseArgs(argv);
  const p = findProblem(a._.join(' '));
  const t = p.meta.type;
  if (!CODE_TYPES.includes(t)) die(`${p.rel} is a ${t} problem — no tests to run.`);
  if (t === 'js') return run('npx', ['vitest', ...(a.once ? ['run'] : []), p.rel]);
  const start = () => run(python(), ['-m', 'pytest', p.rel, '-q']);
  if (a.once) {
    start().on('exit', (code) => process.exit(code ?? 1));
    return;
  }
  watchAndRerun(p.dir, start, /\.(py|jsonl?)$/);
}

function cmdPlay(argv) {
  const p = findProblem(parseArgs(argv)._.join(' '));
  const t = p.meta.type;
  const mod = p.meta.module;
  const has = (f) => fs.existsSync(path.join(p.dir, f));
  if (t === 'service') return run(python(), ['-m', 'uvicorn', `${mod}:app`, '--reload', '--app-dir', p.rel, '--port', '8000']);
  if (t === 'js' && has(`${mod}.js`)) return run('node', [path.join(p.rel, `${mod}.js`)]);
  if (has(`${mod}.py`)) return run(python(), [path.join(p.rel, `${mod}.py`)]);
  die(`Nothing to run for ${p.rel} (${t}).`);
}

function cmdBench(argv) {
  const p = findProblem(parseArgs(argv)._.join(' '));
  if (!fs.existsSync(path.join(p.dir, 'bench.py'))) die(`${p.rel} has no bench.py. Start bench problems with --type bench.`);
  run(python(), [path.join(p.rel, 'bench.py')]);
}

const [cmd, ...rest] = process.argv.slice(2);
const commands = { new: cmdNew, log: cmdLog, reset: cmdReset, today: cmdToday, sync: () => sync(false), test: cmdTest, play: cmdPlay, bench: cmdBench };
if (!commands[cmd]) {
  console.log('Commands: new, t (test), play, bench, log, reset, today, sync — see the top of scripts/fl.mjs');
  process.exit(cmd ? 1 : 0);
}
commands[cmd](rest);
