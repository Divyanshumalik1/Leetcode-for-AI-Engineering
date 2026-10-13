#!/usr/bin/env node
// LeetCode-style practice tracker — Python + TypeScript. No dependencies; plain Node 20+.
// Repo-specific settings (sections, areas) live in scripts/tracker.config.mjs.
//
//   npm run new      -- <words from a question> [--lang py|ts|both]   scaffold a problem folder from README.md
//   npm run add-lang -- <problem> <py|ts>                             add the other language to a problem
//   npm run t        -- <problem> [--lang py|ts] [--once]             run tests (re-run when you save)
//   npm run play     -- <problem> [--lang py|ts]                      run it: module, API server or UI preview
//   npm run bench    -- <problem> [--lang py|ts]                      run the benchmark (benchmark problems)
//   npm run log      -- <problem> [--lang py|ts] --result pass|partial|fail [--time 45] [--missed "..."]
//   npm run reset    -- <problem> [--lang py|ts]                      archive your code, get blank files (tests stay)
//   npm run today                                                      what's due and what to start next
//   npm run sync                                                       rebuild README checkboxes + progress table
//
// <problem> can be the folder name (003-debounce), the slug (debounce) or words from the question.
// --lang is only needed when a problem has both languages.
//
// Rules:
//   • Every attempt is logged (NOTES.md in the problem folder + PROGRESS.md), per language.
//   • A language is MASTERED as soon as you log a `pass` in it.
//   • The README checkbox is ticked when every language you chose for that question is mastered.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import config from './tracker.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const README = path.join(ROOT, 'README.md');
const PROGRESS = path.join(ROOT, 'PROGRESS.md');
const TEMPLATES = path.join(ROOT, '_templates');
const TRACK = ' <!--track-->';
const LANGS = config.langs; // display order, e.g. ['py', 'ts']
const RETRY_DAYS = config.retryDays ?? 3;
const LANG_NAMES = { py: 'Python', ts: 'TypeScript', none: '' };

// Files that stay in place on `reset`: the spec, notes, tests and eval data are the problem, not the attempt.
const KEEP_ON_RESET = (name) =>
  ['README.md', 'NOTES.md', 'meta.json', 'attempts', 'tests', 'eval', 'BENCHMARK.md', 'COST.md', 'TEARDOWN.md', 'py', 'ts', 'node_modules'].includes(name) ||
  /^test_.*\.py$/.test(name) || /\.test\.[jt]sx?$/.test(name) || name === 'conftest.py';

// ---------- helpers ----------

const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const addDays = (date, n) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const clean = (t) => t.split(TRACK)[0].replace(/[⭐🆕]/gu, '').replace(/\s+/g, ' ').trim();
const keyOf = (t) => clean(t).replace(/`/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const VERBS = /^(implement|build|use|run|add|create) (a |an |the )?/;
const coreOf = (key) => key.replace(VERBS, '');
const noParens = (t) => clean(t).replace(/\([^)]*\)/g, ' ');
// Folder name: drop the leading verb and anything in parentheses, keep it short, cut at a word boundary.
const slugOf = (t) => {
  const words = coreOf(keyOf(noParens(t))).split(' ');
  let out = '';
  for (const w of words) { if ((out ? out.length + 1 : 0) + w.length > 40) break; out = out ? `${out}-${w}` : w; }
  return out || words[0].slice(0, 40);
};
const moduleOf = (slug) => { const m = slug.replace(/-/g, '_'); return /^\d/.test(m) ? `p_${m}` : m; };
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJSON = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
// Git on Windows checks files out with CRLF line endings; keep whatever the file uses.
const eolOf = (s) => (s.includes('\r\n') ? '\r\n' : '\n');
const fwd = (p) => p.split(path.sep).join('/');

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

// ---------- README ----------

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
    if (m && sec && config.sections[sec]) {
      const text = m[2].split(TRACK)[0].replace(/\s+$/, '');
      items.push({ i, sec, text, star: text.includes('⭐'), key: keyOf(text) });
    }
  });
  return { lines, items, eol };
}

// ---------- problems ----------

// Problems created before two-language support kept everything in the folder root with one attempts list.
// Convert their meta.json once; their files stay where they are (dir ".").
function upgradeMeta(meta, mf, folder) {
  if (meta.langs) return meta;
  const map = config.legacyTypes[meta.type] ?? { kind: meta.type, lang: config.legacyLang };
  const slug = meta.slug ?? folder.replace(/^\d+-/, '');
  const upgraded = {
    question: meta.question, key: meta.key, section: meta.section, kind: map.kind,
    slug, module: meta.module ?? moduleOf(slug), created: meta.created, legacy: true,
    langs: { [map.lang]: { dir: '.', attempts: meta.attempts ?? [] } },
  };
  writeJSON(mf, upgraded);
  return upgraded;
}

function loadProblems() {
  const out = [];
  for (const cat of fs.readdirSync(ROOT)) {
    const cdir = path.join(ROOT, cat);
    if (!/^\d{2}-/.test(cat) || !fs.statSync(cdir).isDirectory()) continue;
    for (const p of fs.readdirSync(cdir)) {
      const mf = path.join(cdir, p, 'meta.json');
      if (!fs.existsSync(mf)) continue;
      out.push({ dir: path.join(cdir, p), rel: `${cat}/${p}`, meta: upgradeMeta(readJSON(mf), mf, p), mf });
    }
  }
  return out;
}

function findProblem(q) {
  if (!q) die('Tell me which problem, e.g. debounce or 003-debounce');
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

function pickLang(p, requested) {
  const have = Object.keys(p.meta.langs);
  if (requested && requested !== true) {
    if (!have.includes(requested)) die(`${p.rel} has no ${requested} version. Add it with: npm run add-lang -- ${path.basename(p.dir)} ${requested}`);
    return requested;
  }
  if (have.length === 1) return have[0];
  die(`${p.rel} has ${have.join(' and ')} — add --lang ${have.join('|')}`);
}

const langDir = (p, lang) => { const d = p.meta.langs[lang].dir; return d === '.' ? p.dir : path.join(p.dir, d); };
const langRel = (p, lang) => { const d = p.meta.langs[lang].dir; return d === '.' ? p.rel : `${p.rel}/${d}`; };

const isLangMastered = (l) => l.attempts.some((a) => a.result === 'pass');
const isDone = (m) => Object.values(m.langs).every(isLangMastered);
const attemptCount = (m) => Object.values(m.langs).reduce((s, l) => s + l.attempts.length, 0);

function langStatus(name, l) {
  const prefix = name === 'none' ? '' : `${name} `;
  const n = l.attempts.length;
  if (isLangMastered(l)) return `${prefix}✅ (${n})`;
  if (!n) return `${prefix}⚪`;
  const icon = { pass: '✅', partial: '🟡', fail: '🔴' }[l.attempts[n - 1].result];
  return `${prefix}${icon} (${n})`;
}

const statusLabel = (m) => [...LANGS, 'none'].filter((k) => m.langs[k]).map((k) => langStatus(k, m.langs[k])).join(' · ');

// ---------- templates ----------

function templateLangs(kind) {
  const dir = path.join(TEMPLATES, kind);
  if (!fs.existsSync(dir)) return null;
  return fs.readdirSync(dir).filter((d) => d !== 'shared' && fs.statSync(path.join(dir, d)).isDirectory());
}

function vars(meta) {
  return {
    TITLE: meta.question,
    TITLE_PY: JSON.stringify(meta.question.replace(/`/g, '')),
    TITLE_JS: JSON.stringify(meta.question.replace(/`/g, '')),
    SECTION: String(meta.section),
    KIND: meta.kind,
    LANGS: Object.keys(meta.langs).filter((l) => l !== 'none').map((l) => LANG_NAMES[l]).join(' + ') || '—',
    MODULE: meta.module,
    SLUG: meta.slug,
    DATE: today(),
  };
}

const TEXT_EXT = /\.(md|py|js|jsx|ts|tsx|json|jsonl|html|css|ya?ml|txt|sql|tf|toml|ini|env)$/;

function copyTemplate(kind, part, dest, v, skip = () => false) {
  const src = path.join(TEMPLATES, kind, part);
  if (!fs.existsSync(src)) return false;
  const sub = (s) => s.replace(/\{\{(\w+)\}\}/g, (all, k) => (k in v ? v[k] : all));
  const walk = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      const outName = name.replace(/__MODULE__/g, v.MODULE).replace(/__SLUG__/g, v.SLUG);
      if (from === src && skip(outName)) continue;
      const f = path.join(from, name), t = path.join(to, outName);
      if (fs.statSync(f).isDirectory()) { walk(f, t); continue; }
      if (TEXT_EXT.test(name)) fs.writeFileSync(t, sub(fs.readFileSync(f, 'utf8')));
      else fs.copyFileSync(f, t);
    }
  };
  walk(src, dest);
  return true;
}

// ---------- commands ----------

function nextSteps(rel, name, meta) {
  const langs = Object.keys(meta.langs);
  const steps = [`Write the spec in ${rel}/README.md — prompt, requirements, edge cases, follow-ups.`];
  if (langs[0] === 'none') {
    steps.push(meta.kind === 'capstone' ? 'Build the POC stage first; tag each finished stage (see the folder README).' : 'Start the timer and answer it in the files there.');
    steps.push(`npm run log -- ${name} --result pass|partial|fail --time <minutes> --missed "..."`);
  } else {
    const flag = langs.length > 1 ? ` --lang ${langs[0]}` : '';
    steps.push(`Turn each requirement into a test (in ${langs.map((l) => `${l}/`).join(' and ')}), then build it.`);
    steps.push(`npm run t -- ${name}${flag}      (tests; re-run when you save)`);
    steps.push(`npm run play -- ${name}${flag}   (run it)`);
    steps.push(`npm run log -- ${name}${flag} --result pass|partial|fail --time <minutes> --missed "..."`);
  }
  console.log('Next:');
  steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
}

function cmdNew(argv) {
  const a = parseArgs(argv);
  const q = a._.join(' ');
  if (!q) die('Usage: npm run new -- <words from the question> [--lang py|ts|both] [--kind <template>]');
  const { items } = parseReadme();
  const qk = keyOf(q);
  // Exact question first ("debounce" → "Implement `debounce`"), then every word anywhere.
  let hits = items.filter((it) => it.key === qk || coreOf(it.key) === coreOf(qk));
  if (!hits.length) hits = items.filter((it) => coreOf(keyOf(noParens(it.text))) === coreOf(qk));
  if (!hits.length) { const w = qk.split(' '); hits = items.filter((it) => w.every((x) => it.key.includes(x))); }
  if (!hits.length) die(`No question in README.md matches "${q}".`);
  if (hits.length > 1) {
    die(`"${q}" matches ${hits.length} questions — add a word or two:\n${hits.slice(0, 20).map((h) => `  §${h.sec}  ${clean(h.text)}`).join('\n')}`);
  }
  const it = hits[0];
  const existing = loadProblems().find((p) => p.meta.key === it.key);
  if (existing) die(`Already started: ${existing.rel}. To add a language: npm run add-lang -- ${path.basename(existing.dir)} <py|ts>`);

  const sec = config.sections[it.sec];
  const kind = typeof a.kind === 'string' ? a.kind : sec.kind;
  const available = templateLangs(kind);
  if (!available) die(`Unknown template "${kind}". Options: ${fs.readdirSync(TEMPLATES).join(', ')}`);

  let langs;
  if (!available.length) langs = ['none'];
  else if (!a.lang || a.lang === true) langs = sec.langs.includes('none') ? ['none'] : sec.langs.filter((l) => available.includes(l));
  else if (a.lang === 'both') langs = LANGS.filter((l) => available.includes(l));
  else langs = String(a.lang).split(',');
  for (const l of langs) if (l !== 'none' && !available.includes(l)) die(`${kind} problems support: ${available.join(', ')}`);
  if (!langs.length) langs = [available[0]];

  const cdir = path.join(ROOT, sec.folder);
  fs.mkdirSync(cdir, { recursive: true });
  const nums = fs.readdirSync(cdir).map((d) => parseInt(d, 10)).filter((n) => !Number.isNaN(n));
  const num = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
  const slug = slugOf(it.text);
  const name = `${num}-${slug}`;
  const rel = `${sec.folder}/${name}`;
  const dir = path.join(ROOT, rel);

  const meta = {
    question: clean(it.text), key: it.key, section: it.sec, kind, slug, module: moduleOf(slug), created: today(),
    langs: Object.fromEntries(langs.map((l) => [l, { dir: l === 'none' ? '.' : l, attempts: [] }])),
  };
  const v = vars(meta);
  copyTemplate(kind, 'shared', dir, v);
  for (const l of langs) if (l !== 'none') copyTemplate(kind, l, path.join(dir, l), v);
  writeJSON(path.join(dir, 'meta.json'), meta);
  sync(true);

  console.log(`✔ Created ${rel}  (${kind} · ${langs[0] === 'none' ? 'no code' : langs.join(' + ')})\n`);
  nextSteps(rel, name, meta);
}

function cmdAddLang(argv) {
  const a = parseArgs(argv);
  const lang = a._.pop();
  const p = findProblem(a._.join(' '));
  if (!LANGS.includes(lang)) die(`Usage: npm run add-lang -- <problem> <${LANGS.join('|')}>`);
  if (p.meta.langs[lang]) die(`${p.rel} already has ${lang}.`);
  const available = templateLangs(p.meta.kind) ?? [];
  if (!available.includes(lang)) die(`${p.meta.kind} problems support: ${available.join(', ') || 'no code languages'}`);
  copyTemplate(p.meta.kind, lang, path.join(p.dir, lang), vars(p.meta));
  p.meta.langs[lang] = { dir: lang, attempts: [] };
  writeJSON(p.mf, p.meta);
  sync(true);
  console.log(`✔ Added ${LANG_NAMES[lang]} to ${p.rel} (${p.rel}/${lang}/). Its checkbox now needs both languages mastered.`);
}

function cmdLog(argv) {
  const a = parseArgs(argv);
  const q = a._.join(' ');
  if (!q || !a.result) die('Usage: npm run log -- <problem> [--lang py|ts] --result pass|partial|fail [--time 45] [--missed "what you missed"]');
  if (!['pass', 'partial', 'fail'].includes(a.result)) die('--result must be pass, partial or fail');
  const p = findProblem(q);
  const lang = pickLang(p, a.lang);
  const l = p.meta.langs[lang];
  const wasMastered = isLangMastered(l);
  const n = l.attempts.length + 1;
  const minutes = a.time && a.time !== true ? Number(a.time) : null;
  const missed = typeof a.missed === 'string' ? a.missed : '';
  const entry = { n, date: today(), minutes, result: a.result, missed };
  l.attempts.push(entry);
  writeJSON(p.mf, p.meta);

  const icon = { pass: '✅', partial: '🟡', fail: '❌' }[a.result];
  const time = minutes == null ? '–' : `${minutes} min`;
  const esc = (s) => (s || '–').replace(/\|/g, '\\|');
  const langCell = lang === 'none' ? '–' : lang;

  const notesFile = path.join(p.dir, 'NOTES.md');
  if (fs.existsSync(notesFile)) {
    const notes = fs.readFileSync(notesFile, 'utf8');
    const nl = eolOf(notes);
    const row = /\| Lang \|/.test(notes)
      ? `| ${n} | ${langCell} | ${entry.date} | ${time} | ${icon} ${a.result} | ${esc(missed)} |`
      : `| ${n} | ${entry.date} | ${time} | ${icon} ${a.result} (${langCell}) | ${esc(missed)} |`;
    fs.writeFileSync(notesFile, notes.includes('<!-- attempts -->') ? notes.replace('<!-- attempts -->', `${row}${nl}<!-- attempts -->`) : `${notes}${nl}${row}${nl}`);
  }
  if (!fs.existsSync(PROGRESS)) fs.writeFileSync(PROGRESS, '# Progress log\n\n| Date | Problem | Lang | Attempt | Time | Result | Missed |\n|---|---|---|---|---|---|---|\n');
  const prog = fs.readFileSync(PROGRESS, 'utf8');
  const pnl = eolOf(prog);
  const prow = /\| Lang \|/.test(prog)
    ? `| ${entry.date} | [${p.rel}](${p.rel}) | ${langCell} | ${n} | ${time} | ${icon} ${a.result} | ${esc(missed)} |`
    : `| ${entry.date} | [${p.rel}](${p.rel}) · ${langCell} | ${n} | ${time} | ${icon} ${a.result} | ${esc(missed)} |`;
  fs.appendFileSync(PROGRESS, `${prog.endsWith('\n') ? '' : pnl}${prow}${pnl}`);

  sync(true);
  const slug = path.basename(p.dir);
  const label = lang === 'none' ? '' : ` (${LANG_NAMES[lang]})`;
  console.log(`✔ Logged attempt ${n}${label} for ${p.rel}: ${a.result}`);
  if (a.result === 'pass' && !wasMastered) console.log(`🎉 Mastered${label}!`);
  if (isDone(p.meta)) console.log('✅ Every language for this question is mastered — README checkbox ticked.');
  else {
    const open = Object.entries(p.meta.langs).filter(([, x]) => !isLangMastered(x)).map(([k]) => k);
    if (!isLangMastered(l)) console.log(`  Retry${label} due ${addDays(entry.date, RETRY_DAYS)}. Before you start: npm run reset -- ${slug}${Object.keys(p.meta.langs).length > 1 ? ` --lang ${lang}` : ''}`);
    else if (open.length) console.log(`  Still to master: ${open.join(', ')}.`);
  }
}

function cmdReset(argv) {
  const a = parseArgs(argv);
  const p = findProblem(a._.join(' '));
  const lang = pickLang(p, a.lang);
  const l = p.meta.langs[lang];
  const n = l.attempts.length;
  if (!n) die('Nothing to archive yet — log an attempt first (npm run log).');
  const base = langDir(p, lang);
  const dest = path.join(base, 'attempts', `attempt-${n}`);
  if (fs.existsSync(dest)) die(`${fwd(path.relative(ROOT, dest))} already exists — you already reset after attempt ${n}.`);
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(base)) {
    if (['__pycache__', '.pytest_cache'].includes(name)) { fs.rmSync(path.join(base, name), { recursive: true, force: true }); continue; }
    if (!KEEP_ON_RESET(name)) fs.renameSync(path.join(base, name), path.join(dest, name));
  }
  const restored = p.meta.legacy ? false : copyTemplate(p.meta.kind, lang === 'none' ? 'shared' : lang, base, vars(p.meta), KEEP_ON_RESET);
  console.log(`✔ Archived attempt ${n} to ${fwd(path.relative(ROOT, dest))}${restored ? ' and restored blank files' : ''}.`);
  if (!restored && p.meta.legacy) console.log('  (Older-layout problem: create your solution file again from scratch.)');
  console.log('  Next attempt: blank editor, timer on. Your spec and tests are still there.');
}

function cmdToday() {
  const t = today();
  const probs = loadProblems();
  const due = [], upcoming = [];
  for (const p of probs) {
    for (const [lang, l] of Object.entries(p.meta.langs)) {
      if (isLangMastered(l)) continue;
      const tag = lang === 'none' ? '' : ` [${lang}]`;
      const n = l.attempts.length;
      if (!n) { due.push([`${p.rel}${tag}`, 'not attempted yet']); continue; }
      const last = l.attempts[n - 1];
      const when = addDays(last.date, RETRY_DAYS);
      (when <= t ? due : upcoming).push([`${p.rel}${tag}`, `attempt ${n + 1} (last: ${last.result} on ${last.date})`, when]);
    }
  }
  const done = probs.filter((p) => isDone(p.meta)).length;
  const { items } = parseReadme();
  console.log(`📅 ${t}  ·  ${probs.length} started  ·  ${done} done  ·  ${items.length} total\n`);
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
    for (const it of next) console.log(`   • ${clean(it.text)}   →  npm run new -- ${coreOf(keyOf(noParens(it.text)))}`);
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
    lines[it.i] = `- [${isDone(p.meta) ? 'x' : ' '}] ${it.text}${TRACK} · [📂](${p.rel}) ${statusLabel(p.meta)}`;
  }

  const readmeKeys = new Set(items.map((it) => it.key));
  for (const p of probs) if (!readmeKeys.has(p.meta.key)) console.warn(`⚠ ${p.rel}: its question isn't in README.md any more ("${p.meta.question}")`);

  const stat = (list) => {
    const ps = list.map((it) => byKey.get(it.key)).filter(Boolean);
    const s = { total: list.length, started: ps.length, attempts: ps.reduce((n, p) => n + attemptCount(p.meta), 0), done: ps.filter((p) => isDone(p.meta)).length };
    for (const lang of LANGS) s[lang] = ps.filter((p) => p.meta.langs[lang] && isLangMastered(p.meta.langs[lang])).length;
    return s;
  };
  const row = (label, s, bold = false) => {
    const b = (x) => (bold ? `**${x}**` : x);
    return `| ${[label, s.total, s.started, s.attempts, ...LANGS.map((l) => s[l]), s.done].map(b).join(' | ')} | ${bar(s.done, s.total)} |`;
  };
  replaceBlock(lines, 'progress', [
    '',
    `| Area | Total | Started | Attempts | ${LANGS.map((l) => `Mastered (${l})`).join(' | ')} | ✅ Done | Progress |`,
    `|---|---|---|---|${LANGS.map(() => '---|').join('')}---|---|`,
    ...config.areas.map(([label, secs]) => row(label, stat(items.filter((it) => secs.includes(it.sec))))),
    row('⭐ Starred questions', stat(items.filter((it) => it.star))),
    row('Total', stat(items), true),
    '',
    `_✅ Done = mastered in every language you chose for that question. Last synced ${today()} by \`npm run sync\`._`,
    '',
  ]);

  const all = stat(items);
  replaceBlock(lines, 'badges', [
    `![Questions](https://img.shields.io/badge/questions-${all.total}-blue)`,
    `![Started](https://img.shields.io/badge/started-${all.started}-orange)`,
    ...LANGS.map((l) => `![${LANG_NAMES[l]}](https://img.shields.io/badge/${encodeURIComponent(LANG_NAMES[l])}-${all[l]}%20mastered-informational)`),
    `![Done](https://img.shields.io/badge/done-${all.done}%2F${all.total}-brightgreen)`,
  ]);

  const next = lines.join(eol);
  if (next !== fs.readFileSync(README, 'utf8')) {
    fs.writeFileSync(README, next);
    if (!quiet) console.log(`✔ README.md synced — ${all.started} started, ${all.done}/${all.total} done.`);
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
  console.log(`👀 Watching ${fwd(path.relative(ROOT, dir))} — save a file to re-run, Ctrl+C to stop.`);
}

function cmdTest(argv) {
  const a = parseArgs(argv);
  const p = findProblem(a._.join(' '));
  const lang = pickLang(p, a.lang);
  if (lang === 'none') die(`${p.rel} is a ${p.meta.kind} problem — no tests to run.`);
  const rel = langRel(p, lang);
  if (lang === 'ts') return run('npx', ['vitest', ...(a.once ? ['run'] : []), rel]);
  const start = () => run(python(), ['-m', 'pytest', rel, '-q']);
  if (a.once) { start().on('exit', (code) => process.exit(code ?? 1)); return; }
  watchAndRerun(langDir(p, lang), start, /\.(py|jsonl?)$/);
}

function firstExisting(dir, names) { return names.find((n) => fs.existsSync(path.join(dir, n))); }

function cmdPlay(argv) {
  const a = parseArgs(argv);
  const p = findProblem(a._.join(' '));
  const lang = pickLang(p, a.lang);
  if (lang === 'none') die(`${p.rel} is a ${p.meta.kind} problem — nothing to run.`);
  const dir = langDir(p, lang);
  const rel = langRel(p, lang);
  const { module: mod, slug } = p.meta;
  const vite = (entry) => run('npx', ['vite', '--config', 'scripts/play/vite.config.js'], { env: { ...process.env, PROBLEM_ENTRY: path.join(dir, entry) } });
  const tsRun = (file, watch) => run('npx', ['tsx', ...(watch ? ['watch'] : []), `${rel}/${file}`]);

  const client = firstExisting(dir, ['client/App.tsx', 'client/App.jsx']);
  const server = firstExisting(dir, ['server/server.ts', 'server/server.js', 'src/server.ts', 'src/server.js']);
  const app = firstExisting(dir, ['App.tsx', 'App.jsx']);
  if (client && server) { tsRun(server, true); return vite(client); }
  if (app && fs.existsSync(path.join(ROOT, 'scripts/play/vite.config.js'))) return vite(app);
  if (server) return tsRun(server, true);
  const pyFile = firstExisting(dir, [`${mod}.py`]);
  if (pyFile && /FastAPI\(/.test(fs.readFileSync(path.join(dir, pyFile), 'utf8'))) {
    return run(python(), ['-m', 'uvicorn', `${mod}:app`, '--reload', '--app-dir', rel, '--port', '8000']);
  }
  if (pyFile) return run(python(), [`${rel}/${pyFile}`]);
  const tsFile = firstExisting(dir, [`${slug}.ts`, 'playground.ts', 'solution.ts']);
  if (tsFile) return tsRun(tsFile, false);
  const jsFile = firstExisting(dir, ['playground.js', 'solution.js']);
  if (jsFile) return run('node', [`${rel}/${jsFile}`]);
  die(`Nothing to run in ${rel}.`);
}

function cmdBench(argv) {
  const a = parseArgs(argv);
  const p = findProblem(a._.join(' '));
  const lang = pickLang(p, a.lang);
  const dir = langDir(p, lang);
  const rel = langRel(p, lang);
  if (fs.existsSync(path.join(dir, 'bench.py'))) return run(python(), [`${rel}/bench.py`]);
  if (fs.existsSync(path.join(dir, 'bench.ts'))) return run('npx', ['tsx', `${rel}/bench.ts`]);
  die(`${rel} has no bench file. Benchmark problems are created with --kind bench.`);
}

const [cmd, ...rest] = process.argv.slice(2);
const commands = {
  new: cmdNew, 'add-lang': cmdAddLang, log: cmdLog, reset: cmdReset, today: cmdToday,
  sync: () => sync(false), test: cmdTest, play: cmdPlay, bench: cmdBench,
};
if (!commands[cmd]) {
  console.log('Commands: new, add-lang, t (test), play, bench, log, reset, today, sync — see the top of scripts/fl.mjs');
  process.exit(cmd ? 1 : 0);
}
commands[cmd](rest);
