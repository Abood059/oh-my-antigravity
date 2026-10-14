#!/usr/bin/env node
/**
 * verify-ledger.js
 *
 * Verify .omg/state/task-ledger.md against the actual codebase.
 * Protocol: shared/verification.md
 *
 * Runtime: Node.js (cross-platform, no external dependencies).
 */

import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import process from 'process';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DEFAULT_LEDGER = '.omg/state/task-ledger.md';
const DEFAULT_ROOT = '.';
const DEFAULT_IGNORE = [
  '.git',
  '.omg',          // OmA state directory
  '.oma',          // OmA state directory (alt)
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
];

// Broken to avoid self-detection during codebase scans.
const CODE_PREFIX = 'OMA';
const CODE_PATTERN_STRICT = new RegExp(
  '^' + CODE_PREFIX + '-W[0-9]{3}-T[0-9]{3}$'
);
const CODE_PATTERN_GLOBAL = new RegExp(
  CODE_PREFIX + '-W[0-9]{3}-T[0-9]{3}',
  'g'
);

const VALID_STATUSES = ['planned', 'in-progress', 'done', 'verified', 'blocked', 'deprecated'];
const CRITICAL_STATUSES = ['done', 'verified'];

const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.kts',
  '.c', '.h', '.cpp', '.hpp', '.cs', '.swift',
  '.php', '.lua', '.pl', '.sh', '.bash', '.zsh',
  '.sql', '.yaml', '.yml', '.toml', '.ini', '.cfg',
  '.md', '.markdown', '.txt', '.html', '.htm', '.xml', '.json',
  '.vue', '.svelte', '.astro', '.ex', '.exs',
  '.clj', '.cljs', '.scala', '.groovy', '.dart', '.r', '.jl',
]);

// ─────────────────────────────────────────────────────────────
// Argument parsing
// ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    ledger: DEFAULT_LEDGER,
    root: DEFAULT_ROOT,
    mode: 'report',
    format: 'text',
    workflow: null,
    byStatus: null,
    ignorePaths: DEFAULT_IGNORE.slice(),
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case '--ledger': args.ledger = next; i++; break;
      case '--root': args.root = next; i++; break;
      case '--mode': args.mode = next; i++; break;
      case '--format': args.format = next; i++; break;
      case '--workflow': args.workflow = next; i++; break;
      case '--by-status': args.byStatus = next; i++; break;
      case '--ignore-paths':
        args.ignorePaths = next.split(',').map(s => s.trim()).filter(Boolean);
        i++;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error('Unknown option: ' + arg);
          process.exit(2);
        }
    }
  }

  if (!['report', 'strict'].includes(args.mode)) {
    console.error('Invalid --mode: ' + args.mode + ". Use 'report' or 'strict'.");
    process.exit(2);
  }
  if (!['text', 'json'].includes(args.format)) {
    console.error('Invalid --format: ' + args.format + ". Use 'text' or 'json'.");
    process.exit(2);
  }

  return args;
}

function printHelp() {
  console.log([
    '',
    'verify-ledger.js - Verify task-ledger.md against the codebase.',
    '',
    'Usage:',
    '  node scripts/verify-ledger.js [options]',
    '',
    'Options:',
    '  --ledger <path>          Ledger file (default: ' + DEFAULT_LEDGER + ')',
    '  --root <path>            Codebase root (default: ' + DEFAULT_ROOT + ')',
    '  --mode report|strict     report (default) prints and exits 0;',
    '                           strict exits 1 on critical issues.',
    '  --format text|json       Output format (default: text).',
    '  --workflow <name>        Filter by workflow run (e.g., complex-001).',
    '  --by-status <status>     Filter by status.',
    '  --ignore-paths <csv>     Comma-separated paths to skip.',
    '  --help, -h               Show this help.',
    '',
    'Always point --root at the project codebase, not at the OmA addon.',
    '',
  ].join('\n'));
}

// ─────────────────────────────────────────────────────────────
// Ledger parsing
// ─────────────────────────────────────────────────────────────

function parseMarkdownTable(content) {
  const lines = content.split(/\r?\n/);
  let header = null;
  let separatorSeen = false;
  const rows = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('|')) continue;

    const cells = splitRow(line);

    if (header === null) {
      header = cells;
      continue;
    }
    if (!separatorSeen && cells.every(c => /^:?-{3,}:?$/.test(c))) {
      separatorSeen = true;
      continue;
    }
    if (separatorSeen) {
      rows.push(cells);
    }
  }

  return { header, rows };
}

function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map(c => c.trim());
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/\s+/g, '_');
}

function rowsToObjects(header, rows) {
  if (!header) return [];
  const keys = header.map(normalizeKey);
  return rows.map((row, idx) => {
    const obj = { __rowIndex: idx + 1 };
    keys.forEach((key, i) => {
      obj[key] = row[i] !== undefined ? row[i] : '';
    });
    return obj;
  });
}

// ─────────────────────────────────────────────────────────────
// Ledger validation
// ─────────────────────────────────────────────────────────────

function validateLedger(rows) {
  const issues = [];
  const codes = [];
  const seen = new Set();

  for (const row of rows) {
    const code = (row.code || '').trim();
    const status = (row.status || '').trim();
    const workflow = (row.workflow || '').trim();
    const rowRef = 'row ' + row.__rowIndex;

    if (!code) continue;

    if (!CODE_PATTERN_STRICT.test(code)) {
      issues.push({
        severity: 'critical',
        type: 'malformed-code',
        code,
        message: 'Code "' + code + '" (' + rowRef + ') does not match the required format.',
      });
      continue;
    }

    if (seen.has(code)) {
      issues.push({
        severity: 'critical',
        type: 'duplicate-code',
        code,
        message: 'Code "' + code + '" appears more than once in the ledger.',
      });
    }
    seen.add(code);

    if (!VALID_STATUSES.includes(status)) {
      issues.push({
        severity: 'critical',
        type: 'invalid-status',
        code,
        message: 'Code "' + code + '" has invalid status "' + status + '".',
      });
    }

    if (!workflow) {
      issues.push({
        severity: 'critical',
        type: 'missing-workflow',
        code,
        message: 'Code "' + code + '" is missing the Workflow value.',
      });
    }

    codes.push({ code, status, workflow, row });
  }

  return { issues, codes };
}

// ─────────────────────────────────────────────────────────────
// Codebase scanning
// ─────────────────────────────────────────────────────────────

async function scanCodebase(root, ignorePaths) {
  const found = new Map();
  let filesScanned = 0;

  const ignoreSet = new Set(ignorePaths.map(p => p.replace(/^\.\//, '')));

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full) || entry.name;

      if (isIgnored(rel, entry.name, ignoreSet)) continue;

      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
        filesScanned++;
        await scanFile(full, rel, found);
      }
    }
  }

  await walk(root);
  return { found, filesScanned };
}

function isIgnored(relPath, name, ignoreSet) {
  if (ignoreSet.has(name)) return true;
  const parts = relPath.split(path.sep);
  for (const part of parts) {
    if (ignoreSet.has(part)) return true;
  }
  return false;
}

async function scanFile(fullPath, relPath, found) {
  let content;
  try {
    content = await readFile(fullPath, 'utf-8');
  } catch {
    return;
  }

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(CODE_PATTERN_GLOBAL);
    if (matches) {
      for (const code of matches) {
        if (!found.has(code)) found.set(code, []);
        found.get(code).push({ file: relPath, line: i + 1 });
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Cross-check
// ─────────────────────────────────────────────────────────────

function crossCheck(ledgerCodes, foundInCode, fullLedgerSet) {
  const issues = [];
  const missing = [];
  const orphans = [];
  const deprecatedPresent = [];

  const ledgerSet = fullLedgerSet || new Set(ledgerCodes.map(c => c.code));

  for (const entry of ledgerCodes) {
    const { code, status, workflow } = entry;

    if (status === 'deprecated') {
      if (foundInCode.has(code)) {
        deprecatedPresent.push({ code, workflow });
        issues.push({
          severity: 'warning',
          type: 'deprecated-still-present',
          code,
          workflow,
          message: 'Code "' + code + '" is deprecated but still appears in the codebase.',
        });
      }
      continue;
    }

    if (CRITICAL_STATUSES.includes(status) && !foundInCode.has(code)) {
      missing.push({ code, status, workflow });
      issues.push({
        severity: 'critical',
        type: 'missing-code',
        code,
        workflow,
        message: 'Code "' + code + '" has status "' + status + '" but was not found in the codebase.',
      });
    }

    if (status === 'planned' && foundInCode.has(code)) {
      issues.push({
        severity: 'warning',
        type: 'planned-but-present',
        code,
        workflow,
        message: 'Code "' + code + '" has status "planned" but already appears in the codebase.',
      });
    }
  }

  for (const [code, locations] of foundInCode) {
    if (!ledgerSet.has(code)) {
      orphans.push({ code, locations });
      issues.push({
        severity: 'critical',
        type: 'orphan-code',
        code,
        message: 'Code "' + code + '" appears in the codebase but is not in the ledger.',
      });
    }
  }

  return { issues, missing, orphans, deprecatedPresent };
}

// ─────────────────────────────────────────────────────────────
// Filtering
// ─────────────────────────────────────────────────────────────

function applyFilters(codes, args) {
  let filtered = codes;
  if (args.workflow) {
    filtered = filtered.filter(c => c.workflow === args.workflow);
  }
  if (args.byStatus) {
    filtered = filtered.filter(c => c.status === args.byStatus);
  }
  return filtered;
}

// ─────────────────────────────────────────────────────────────
// Reporting
// ─────────────────────────────────────────────────────────────

function buildSummary(ledgerCodes, foundInCode, issues) {
  return {
    totalLedger: ledgerCodes.length,
    totalInCode: foundInCode.size,
    verified: ledgerCodes.filter(c => c.status === 'verified').length,
    done: ledgerCodes.filter(c => c.status === 'done').length,
    inProgress: ledgerCodes.filter(c => c.status === 'in-progress').length,
    planned: ledgerCodes.filter(c => c.status === 'planned').length,
    blocked: ledgerCodes.filter(c => c.status === 'blocked').length,
    deprecated: ledgerCodes.filter(c => c.status === 'deprecated').length,
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
  };
}

function reportText(args, summary, issues, missing, orphans, deprecatedPresent, filesScanned) {
  const lines = [];
  lines.push('');
  lines.push('Ledger Verification Report');
  lines.push('--------------------------');
  lines.push('Ledger:    ' + args.ledger);
  lines.push('Root:      ' + args.root);
  lines.push('Mode:      ' + args.mode);
  if (args.workflow) lines.push('Workflow:  ' + args.workflow);
  if (args.byStatus) lines.push('Status:    ' + args.byStatus);
  lines.push('');
  lines.push('Files scanned:      ' + filesScanned);
  lines.push('Codes in ledger:    ' + summary.totalLedger);
  lines.push('Codes in codebase:  ' + summary.totalInCode);
  lines.push('');
  lines.push('verified:     ' + summary.verified);
  lines.push('done:         ' + summary.done);
  lines.push('in-progress:  ' + summary.inProgress);
  lines.push('planned:      ' + summary.planned);
  lines.push('blocked:      ' + summary.blocked);
  lines.push('deprecated:   ' + summary.deprecated);
  lines.push('');

  if (missing.length > 0) {
    lines.push('MISSING (' + missing.length + '):');
    for (const m of missing) {
      lines.push('  - ' + m.code + '  (status: ' + m.status + ', workflow: ' + m.workflow + ')');
    }
    lines.push('');
  }

  if (orphans.length > 0) {
    lines.push('ORPHANS (' + orphans.length + '):');
    for (const o of orphans) {
      const loc = o.locations.map(l => l.file + ':' + l.line).join(', ');
      lines.push('  - ' + o.code + '  (' + loc + ')');
    }
    lines.push('');
  }

  if (deprecatedPresent.length > 0) {
    lines.push('DEPRECATED BUT STILL PRESENT (' + deprecatedPresent.length + '):');
    for (const d of deprecatedPresent) {
      lines.push('  - ' + d.code + '  (workflow: ' + d.workflow + ')');
    }
    lines.push('');
  }

  const warnings = issues.filter(i => i.severity === 'warning' && i.type !== 'deprecated-still-present');
  if (warnings.length > 0) {
    lines.push('WARNINGS (' + warnings.length + '):');
    for (const w of warnings) {
      lines.push('  - ' + w.message);
    }
    lines.push('');
  }

  if (summary.critical === 0) {
    lines.push('RESULT: no critical issues.');
  } else {
    lines.push('RESULT: CRITICAL - ' + summary.critical + ' issue(s) found.');
  }
  lines.push('');

  return lines.join('\n');
}

function reportJson(args, summary, issues, missing, orphans, deprecatedPresent) {
  return JSON.stringify({
    args: {
      ledger: args.ledger,
      root: args.root,
      mode: args.mode,
      workflow: args.workflow,
      byStatus: args.byStatus,
    },
    summary,
    missing,
    orphans,
    deprecatedPresent,
    issues,
  }, null, 2);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!existsSync(args.ledger)) {
    console.error('Ledger file not found: ' + args.ledger);
    process.exit(2);
  }

  const content = await readFile(args.ledger, 'utf-8');
  const { header, rows } = parseMarkdownTable(content);
  const ledgerRows = rowsToObjects(header, rows);

  const { issues: validationIssues, codes: allCodes } = validateLedger(ledgerRows);
  const filteredCodes = applyFilters(allCodes, args);

  const { found, filesScanned } = await scanCodebase(args.root, args.ignorePaths);

  const fullLedgerSet = new Set(allCodes.map(c => c.code));
  const { issues: crossIssues, missing, orphans, deprecatedPresent } = crossCheck(filteredCodes, found, fullLedgerSet);

  const allIssues = validationIssues.concat(crossIssues);
  const summary = buildSummary(filteredCodes, found, allIssues);

  if (args.format === 'json') {
    console.log(reportJson(args, summary, allIssues, missing, orphans, deprecatedPresent));
  } else {
    console.log(reportText(args, summary, allIssues, missing, orphans, deprecatedPresent, filesScanned));
  }

  if (args.mode === 'strict' && summary.critical > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error: ' + err.message);
  process.exit(2);
});
