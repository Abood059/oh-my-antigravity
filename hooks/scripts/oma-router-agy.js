#!/usr/bin/env node
/*
 * OmA silent PreInvocation router for Antigravity CLI.
 *
 * Routes outgoing model requests according to `.omg/state/model.json`
 * using Antigravity model names.
 */

import fs from "node:fs";
import path from "node:path";

const STATE_ROOT_ENV = "OMG_STATE_ROOT";
const DISABLED_HOOKS_ENV = "OMG_DISABLED_HOOKS";
const MODEL_ROUTING_ENV = "OMG_MODEL_ROUTING";
const MODEL_ROUTING_TRACE_ENV = "OMG_MODEL_ROUTING_TRACE";

const MODEL_HOOK_KEYS = new Set([
  "model",
  "model-routing",
  "model-router",
  "oma-model-router",
  "oma-router-agy",
]);

// Antigravity CLI model names (from `agy models`)
const DEFAULT_LANE_MODELS = {
  planning: "claude-opus-4-6-thinking",
  execution: "gemini-3.8-flash-medium",
  quick_edit: "gemini-3.8-flash-low",
  review_verify: "claude-sonnet-4-6",
};

const LANE_PATTERNS = [
  {
    lane: "quick_edit",
    label: "quick-edit",
    patterns: [
      /\boma-quick\b/i,
      /\bquick[_ -]?edit\b/i,
      /\blow-risk (edit|change|fix)\b/i,
    ],
  },
  {
    lane: "execution",
    label: "execution",
    patterns: [
      /\boma-executor\b/i,
      /\bteam-exec\b/i,
      /\bimplementation-heavy\b/i,
      /\bimplement approved\b/i,
    ],
  },
  {
    lane: "review_verify",
    label: "review-verify",
    patterns: [
      /\boma-reviewer\b/i,
      /\boma-verifier\b/i,
      /\boma-debugger\b/i,
      /\bteam-verify\b/i,
      /\bteam-fix\b/i,
      /\bverification\b/i,
    ],
  },
  {
    lane: "planning",
    label: "planning",
    patterns: [
      /\boma-director\b/i,
      /\boma-architect\b/i,
      /\boma-planner\b/i,
      /\boma-product\b/i,
      /\boma-consultant\b/i,
      /\boma-researcher\b/i,
      /\bteam-plan\b/i,
      /\bteam-prd\b/i,
      /\bteam-assemble\b/i,
      /\bplanning\b/i,
      /\bresearch\b/i,
      /\barchitecture\b/i,
    ],
  },
];

function readStdinText() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(typeof text === "string" ? text.replace(/^\uFEFF/, "") : text);
  } catch {
    return fallback;
  }
}

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function isOff(v) {
  return typeof v === "string" && ["0", "false", "no", "off"].includes(v.trim().toLowerCase());
}

function isOn(v) {
  return typeof v === "string" && ["1", "true", "yes", "on", "trace"].includes(v.trim().toLowerCase());
}

function parseCsvEnv(v) {
  if (typeof v !== "string") return [];
  return v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function isHookDisabled(disabled, candidates) {
  return candidates.some((c) => disabled.includes(c));
}

function resolveSessionCwd(hookInput) {
  const raw = typeof hookInput?.cwd === "string" ? hookInput.cwd.trim() : "";
  if (!raw) return null;
  const resolved = path.resolve(raw);
  try {
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) return resolved;
  } catch { return null; }
  return null;
}

function resolveStateRoot(cwd) {
  const custom = process.env[STATE_ROOT_ENV];
  if (typeof custom === "string" && custom.trim()) {
    return path.isAbsolute(custom) ? custom.trim() : cwd ? path.join(cwd, custom.trim()) : null;
  }
  return cwd ? path.join(cwd, ".omg", "state") : null;
}

function readJsonFile(filePath, fallback = {}) {
  if (!filePath) return fallback;
  try {
    const parsed = safeJsonParse(fs.readFileSync(filePath, "utf8"), fallback);
    return isObject(parsed) ? parsed : fallback;
  } catch { return fallback; }
}

function normalizeStrategy(s) {
  if (typeof s !== "string") return "balanced";
  const n = s.trim().toLowerCase();
  return ["balanced", "auto", "custom"].includes(n) ? n : "balanced";
}

function readModelPolicy(cwd) {
  const stateRoot = resolveStateRoot(cwd);
  const modelState = readJsonFile(stateRoot ? path.join(stateRoot, "model.json") : "", {});
  return {
    strategy: normalizeStrategy(modelState.strategy),
    laneModels: { ...DEFAULT_LANE_MODELS, ...(isObject(modelState.lane_models) ? modelState.lane_models : {}) },
  };
}

function collectText(value, parts = []) {
  if (typeof value === "string") { parts.push(value); return parts; }
  if (Array.isArray(value)) { for (const i of value) collectText(i, parts); return parts; }
  if (isObject(value)) { for (const i of Object.values(value)) collectText(i, parts); }
  return parts;
}

function detectLane(hookInput) {
  const req = hookInput?.llm_request || {};
  const text = collectText([
    hookInput?.prompt,
    hookInput?.agent,
    hookInput?.agent_name,
    hookInput?.metadata,
    req.messages,
    req.systemInstruction,
    req.system_instruction,
  ]).join("\n");

  for (const { lane, label, patterns } of LANE_PATTERNS) {
    const m = patterns.find((p) => p.test(text));
    if (m) return { lane, reason: `${label}:${m.source}` };
  }
  return { lane: "planning", reason: "fallback:planning-default" };
}

function buildOutput(model) {
  if (!model) {
    return { decision: "allow", systemMessage: "", suppressOutput: true };
  }
  return {
    decision: "allow",
    systemMessage: "",
    suppressOutput: true,
    hookSpecificOutput: { llm_request: { model } },
  };
}

function writeRouterTrace(stateRoot, trace) {
  if (!stateRoot || !isOn(process.env[MODEL_ROUTING_TRACE_ENV])) return;
  try {
    fs.mkdirSync(stateRoot, { recursive: true });
    fs.writeFileSync(
      path.join(stateRoot, "model-router-last.json"),
      `${JSON.stringify(trace, null, 2)}\n`,
      "utf8",
    );
  } catch {}
}

async function main() {
  const raw = await readStdinText();
  const hookInput = safeJsonParse(raw, {});
  const disabled = parseCsvEnv(process.env[DISABLED_HOOKS_ENV]);

  if (isOff(process.env[MODEL_ROUTING_ENV]) || isHookDisabled(disabled, [...MODEL_HOOK_KEYS])) {
    process.stdout.write(JSON.stringify(buildOutput("")));
    return;
  }

  const cwd = resolveSessionCwd(hookInput);
  const stateRoot = resolveStateRoot(cwd);
  const policy = readModelPolicy(cwd);
  const { lane, reason } = detectLane(hookInput);
  const model = policy.strategy === "auto" ? "auto" : policy.laneModels[lane] || DEFAULT_LANE_MODELS[lane];

  writeRouterTrace(stateRoot, {
    updated_at: new Date().toISOString(),
    cwd,
    strategy: policy.strategy,
    lane,
    model,
    reason,
    source: "oma-router-agy",
  });

  process.stdout.write(JSON.stringify(buildOutput(model)));
}

main().catch(() => {
  process.stdout.write(JSON.stringify(buildOutput("")));
});
