// Tracker settings for this repo. The tracker itself (fl.mjs) is shared with the full-stack repo.
const both = ['py', 'ts'];
const none = ['none'];
export default {
  // Languages, in the order they're shown in the README.
  langs: ['py', 'ts'],
  // A failed or partial attempt comes due again after this many days.
  retryDays: 3,
  // README section number → repo folder, template ("kind") and the languages `npm run new` picks by default.
  // Override per question with --lang py|ts|both.
  sections: {
    1: { folder: '01-llm', kind: 'code', langs: both },
    2: { folder: '01-llm', kind: 'code', langs: both },
    3: { folder: '02-vectors', kind: 'bench', langs: both },
    4: { folder: '02-vectors', kind: 'bench', langs: both },
    5: { folder: '03-rag', kind: 'code', langs: both },
    6: { folder: '03-rag', kind: 'bench', langs: both },
    7: { folder: '03-rag', kind: 'bench', langs: both },
    8: { folder: '03-rag', kind: 'service', langs: both },
    9: { folder: '03-rag', kind: 'code', langs: both },
    10: { folder: '03-rag', kind: 'code', langs: both },
    11: { folder: '04-evals', kind: 'bench', langs: both },
    12: { folder: '04-evals', kind: 'bench', langs: both },
    13: { folder: '05-agents', kind: 'code', langs: both },
    14: { folder: '05-agents', kind: 'code', langs: both },
    15: { folder: '05-agents', kind: 'code', langs: both },
    16: { folder: '05-agents', kind: 'code', langs: both },
    17: { folder: '05-agents', kind: 'code', langs: both },
    18: { folder: '04-evals', kind: 'bench', langs: both },
    19: { folder: '05-agents', kind: 'code', langs: both },
    20: { folder: '06-frameworks', kind: 'code', langs: both },   // LangChain.js / LangGraph.js exist
    21: { folder: '06-frameworks', kind: 'code', langs: ['py'] }, // Haystack is Python-only
    22: { folder: '06-frameworks', kind: 'code', langs: both },
    23: { folder: '06-frameworks', kind: 'code', langs: ['py'] }, // CrewAI, AutoGen: Python-first
    24: { folder: '06-frameworks', kind: 'code', langs: ['py'] }, // DSPy, Outlines: Python
    25: { folder: '06-frameworks', kind: 'code', langs: ['ts'] }, // the TypeScript stack
    26: { folder: '07-models', kind: 'bench', langs: ['py'] },
    27: { folder: '07-models', kind: 'bench', langs: ['py'] },
    28: { folder: '07-models', kind: 'code', langs: both },
    29: { folder: '08-production', kind: 'code', langs: both },
    30: { folder: '08-production', kind: 'code', langs: both },
    31: { folder: '08-production', kind: 'code', langs: both },
    32: { folder: '08-production', kind: 'bench', langs: both },
    33: { folder: '08-production', kind: 'service', langs: both },
    34: { folder: '08-production', kind: 'code', langs: ['ts'] },
    35: { folder: '09-aws', kind: 'cloud', langs: both },
    36: { folder: '10-azure', kind: 'cloud', langs: both },
    37: { folder: '11-capstones', kind: 'capstone', langs: none },
    38: { folder: '12-system-design', kind: 'design', langs: none },
    39: { folder: '13-drills', kind: 'drill', langs: none },
  },
  areas: [
    ['LLM foundations (1–4)', [1, 2, 3, 4]],
    ['Retrieval & RAG (5–10)', [5, 6, 7, 8, 9, 10]],
    ['Evaluation (11–12)', [11, 12]],
    ['Agents (13–19)', [13, 14, 15, 16, 17, 18, 19]],
    ['Frameworks (20–25)', [20, 21, 22, 23, 24, 25]],
    ['Models (26–28)', [26, 27, 28]],
    ['Production (29–34)', [29, 30, 31, 32, 33, 34]],
    ['Cloud: AWS & Azure (35–36)', [35, 36]],
    ['Capstones, design & drills (37–39)', [37, 38, 39]],
  ],
  // Problems started before two-language support: old template → new kind + language.
  legacyLang: 'py',
  legacyTypes: {
    py: { kind: 'code', lang: 'py' },
    bench: { kind: 'bench', lang: 'py' },
    service: { kind: 'service', lang: 'py' },
    js: { kind: 'code', lang: 'ts' },
    cloud: { kind: 'cloud', lang: 'py' },
    capstone: { kind: 'capstone', lang: 'none' },
    design: { kind: 'design', lang: 'none' },
    drill: { kind: 'drill', lang: 'none' },
  },
};
