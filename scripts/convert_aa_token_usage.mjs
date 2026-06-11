#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = path.resolve("scripts/localfile-aa.json");
const outputPath = path.resolve("src/lib/token-usage.json");

// Artificial Analysis slug -> [OpenRouter id, usage bucket]. Prefer medium
// reasoning-effort rows when AA has multiple effort measurements.
const AA_TO_OR = {
  // Anthropic
  "claude-3-haiku": ["anthropic/claude-3-haiku", "direct"],
  "claude-3-5-haiku": ["anthropic/claude-3.5-haiku", "direct"],
  "claude-3-7-sonnet": ["anthropic/claude-3.7-sonnet", "direct"],
  "claude-3-7-sonnet-thinking": ["anthropic/claude-3.7-sonnet", "thinking"],
  "claude-4-sonnet": ["anthropic/claude-sonnet-4", "direct"],
  "claude-4-sonnet-thinking": ["anthropic/claude-sonnet-4", "thinking"],
  "claude-4-5-haiku": ["anthropic/claude-haiku-4.5", "direct"],
  "claude-4-5-haiku-reasoning": ["anthropic/claude-haiku-4.5", "thinking"],
  "claude-4-5-sonnet": ["anthropic/claude-sonnet-4.5", "direct"],
  "claude-4-5-sonnet-thinking": ["anthropic/claude-sonnet-4.5", "thinking"],
  "claude-opus-4-5": ["anthropic/claude-opus-4.5", "direct"],
  "claude-opus-4-5-thinking": ["anthropic/claude-opus-4.5", "thinking"],
  "claude-opus-4-6": ["anthropic/claude-opus-4.6", "direct"],
  "claude-opus-4-6-adaptive": ["anthropic/claude-opus-4.6", "thinking"],
  "claude-opus-4-7-non-reasoning": ["anthropic/claude-opus-4.7", "direct"],
  "claude-opus-4-7": ["anthropic/claude-opus-4.7", "thinking"],
  "claude-opus-4-8": ["anthropic/claude-opus-4.8", "thinking"],
  "claude-sonnet-4-6": ["anthropic/claude-sonnet-4.6", "direct"],
  "claude-sonnet-4-6-adaptive": ["anthropic/claude-sonnet-4.6", "thinking"],

  // Cohere
  "command-a": ["cohere/command-a", "direct"],

  // DeepSeek
  "deepseek-r1-0120": ["deepseek/deepseek-r1", "thinking"],
  "deepseek-r1": ["deepseek/deepseek-r1-0528", "thinking"],
  "deepseek-v3": ["deepseek/deepseek-chat", "direct"],
  "deepseek-v3-0324": ["deepseek/deepseek-chat-v3-0324", "direct"],
  "deepseek-v3-1": ["deepseek/deepseek-chat-v3.1", "direct"],
  "deepseek-v3-1-reasoning": ["deepseek/deepseek-chat-v3.1", "thinking"],
  "deepseek-v3-1-terminus": ["deepseek/deepseek-v3.1-terminus", "direct"],
  "deepseek-v3-1-terminus-reasoning": [
    "deepseek/deepseek-v3.1-terminus",
    "thinking",
  ],
  "deepseek-v3-2": ["deepseek/deepseek-v3.2", "direct"],
  "deepseek-v3-2-reasoning": ["deepseek/deepseek-v3.2", "thinking"],
  "deepseek-v3-2-0925": ["deepseek/deepseek-v3.2-exp", "direct"],
  "deepseek-v3-2-reasoning-0925": ["deepseek/deepseek-v3.2-exp", "thinking"],
  "deepseek-v4-flash-non-reasoning": ["deepseek/deepseek-v4-flash", "direct"],
  "deepseek-v4-flash-high": ["deepseek/deepseek-v4-flash", "thinking"],
  "deepseek-v4-pro-non-reasoning": ["deepseek/deepseek-v4-pro", "direct"],
  "deepseek-v4-pro-high": ["deepseek/deepseek-v4-pro", "thinking"],

  // Google
  "gemini-2-0-flash": ["google/gemini-2.0-flash-001", "direct"],
  "gemini-2-5-flash": ["google/gemini-2.5-flash", "direct"],
  "gemini-2-5-flash-reasoning": ["google/gemini-2.5-flash", "thinking"],
  "gemini-2-5-flash-lite": ["google/gemini-2.5-flash-lite", "direct"],
  "gemini-2-5-flash-lite-reasoning": [
    "google/gemini-2.5-flash-lite",
    "thinking",
  ],
  "gemini-2-5-flash-lite-preview-09-2025": [
    "google/gemini-2.5-flash-lite-preview-09-2025",
    "direct",
  ],
  "gemini-2-5-flash-lite-preview-09-2025-reasoning": [
    "google/gemini-2.5-flash-lite-preview-09-2025",
    "thinking",
  ],
  "gemini-2-5-pro": ["google/gemini-2.5-pro", "thinking"],
  "gemini-3-flash": ["google/gemini-3-flash-preview", "direct"],
  "gemini-3-flash-reasoning": ["google/gemini-3-flash-preview", "thinking"],
  "gemini-3-1-flash-lite-preview": ["google/gemini-3.1-flash-lite", "thinking"],
  "gemini-3-1-pro-preview": ["google/gemini-3.1-pro-preview", "thinking"],
  "gemini-3-5-flash": ["google/gemini-3.5-flash", "thinking"],
  "gemini-3-5-flash-minimal": ["google/gemini-3.5-flash", "direct"],
  "gemma-3-12b": ["google/gemma-3-12b-it", "direct"],
  "gemma-3-27b": ["google/gemma-3-27b-it", "direct"],
  "gemma-3-4b": ["google/gemma-3-4b-it", "direct"],
  "gemma-3n-e4b": ["google/gemma-3n-e4b-it", "direct"],
  "gemma-4-26b-a4b-non-reasoning": ["google/gemma-4-26b-a4b-it", "direct"],
  "gemma-4-26b-a4b": ["google/gemma-4-26b-a4b-it", "thinking"],
  "gemma-4-31b-non-reasoning": ["google/gemma-4-31b-it", "direct"],
  "gemma-4-31b": ["google/gemma-4-31b-it", "thinking"],

  // Z.ai
  "glm-4.5": ["z-ai/glm-4.5", "thinking"],
  "glm-4-5-air": ["z-ai/glm-4.5-air", "thinking"],
  "glm-4-5v": ["z-ai/glm-4.5v", "direct"],
  "glm-4-5v-reasoning": ["z-ai/glm-4.5v", "thinking"],
  "glm-4-6": ["z-ai/glm-4.6", "direct"],
  "glm-4-6-reasoning": ["z-ai/glm-4.6", "thinking"],
  "glm-4-6v": ["z-ai/glm-4.6v", "direct"],
  "glm-4-6v-reasoning": ["z-ai/glm-4.6v", "thinking"],
  "glm-4-7-non-reasoning": ["z-ai/glm-4.7", "direct"],
  "glm-4-7": ["z-ai/glm-4.7", "thinking"],
  "glm-4-7-flash-non-reasoning": ["z-ai/glm-4.7-flash", "direct"],
  "glm-4-7-flash": ["z-ai/glm-4.7-flash", "thinking"],
  "glm-5-non-reasoning": ["z-ai/glm-5", "direct"],
  "glm-5": ["z-ai/glm-5", "thinking"],
  "glm-5-turbo": ["z-ai/glm-5-turbo", "thinking"],
  "glm-5-1-non-reasoning": ["z-ai/glm-5.1", "direct"],
  "glm-5v-turbo": ["z-ai/glm-5v-turbo", "thinking"],

  // OpenAI
  "gpt-4-1": ["openai/gpt-4.1", "direct"],
  "gpt-4-1-mini": ["openai/gpt-4.1-mini", "direct"],
  "gpt-4-1-nano": ["openai/gpt-4.1-nano", "direct"],
  "gpt-4o-2024-08-06": ["openai/gpt-4o", "direct"],
  "gpt-4o": ["openai/gpt-4o-2024-11-20", "direct"],
  "gpt-5-minimal": ["openai/gpt-5", "direct"],
  "gpt-5-medium": ["openai/gpt-5", "thinking"],
  "gpt-5-mini-minimal": ["openai/gpt-5-mini", "direct"],
  "gpt-5-mini-medium": ["openai/gpt-5-mini", "thinking"],
  "gpt-5-nano-minimal": ["openai/gpt-5-nano", "direct"],
  "gpt-5-nano-medium": ["openai/gpt-5-nano", "thinking"],
  "gpt-5-codex": ["openai/gpt-5-codex", "thinking"],
  "gpt-5-1-non-reasoning": ["openai/gpt-5.1", "direct"],
  "gpt-5-1": ["openai/gpt-5.1", "thinking"],
  "gpt-5-1-codex": ["openai/gpt-5.1-codex", "thinking"],
  "gpt-5-1-codex-mini": ["openai/gpt-5.1-codex-mini", "thinking"],
  "gpt-5-2-non-reasoning": ["openai/gpt-5.2", "direct"],
  "gpt-5-2-medium": ["openai/gpt-5.2", "thinking"],
  "gpt-5-2-codex": ["openai/gpt-5.2-codex", "thinking"],
  "gpt-5-3-codex": ["openai/gpt-5.3-codex", "thinking"],
  "gpt-5-4-non-reasoning": ["openai/gpt-5.4", "direct"],
  "gpt-5-4-mini-non-reasoning": ["openai/gpt-5.4-mini", "direct"],
  "gpt-5-4-mini-medium": ["openai/gpt-5.4-mini", "thinking"],
  "gpt-5-4-nano-non-reasoning": ["openai/gpt-5.4-nano", "direct"],
  "gpt-5-4-nano-medium": ["openai/gpt-5.4-nano", "thinking"],
  "gpt-5-5-non-reasoning": ["openai/gpt-5.5", "direct"],
  "gpt-5-5-medium": ["openai/gpt-5.5", "thinking"],
  "gpt-oss-120b-low": ["openai/gpt-oss-120b", "thinking_low"],
  "gpt-oss-120b": ["openai/gpt-oss-120b", "thinking_high"],
  "gpt-oss-20b-low": ["openai/gpt-oss-20b", "thinking_low"],
  "gpt-oss-20b": ["openai/gpt-oss-20b", "thinking_high"],
  o1: ["openai/o1", "thinking"],
  o3: ["openai/o3", "thinking"],
  "o3-mini-high": ["openai/o3-mini", "thinking"],
  "o4-mini": ["openai/o4-mini", "thinking"],

  // xAI
  "grok-3": ["x-ai/grok-3", "direct"],
  "grok-3-mini-reasoning": ["x-ai/grok-3-mini", "thinking"],
  "grok-4": ["x-ai/grok-4", "thinking"],
  "grok-4-fast": ["x-ai/grok-4-fast", "direct"],
  "grok-4-fast-reasoning": ["x-ai/grok-4-fast", "thinking"],
  "grok-4-1-fast": ["x-ai/grok-4.1-fast", "direct"],
  "grok-4-1-fast-reasoning": ["x-ai/grok-4.1-fast", "thinking"],
  "grok-4-20-non-reasoning": ["x-ai/grok-4.20", "direct"],
  "grok-4-20": ["x-ai/grok-4.20", "thinking"],
  "grok-4-3-non-reasoning": ["x-ai/grok-4.3", "direct"],
  "grok-4-3-medium": ["x-ai/grok-4.3", "thinking"],
  "grok-code-fast-1": ["x-ai/grok-code-fast-1", "thinking"],

  // Moonshot
  "kimi-k2": ["moonshotai/kimi-k2", "direct"],
  "kimi-k2-0905": ["moonshotai/kimi-k2-0905", "direct"],
  "kimi-k2-thinking": ["moonshotai/kimi-k2-thinking", "thinking"],
  "kimi-k2-5-non-reasoning": ["moonshotai/kimi-k2.5", "direct"],
  "kimi-k2-5": ["moonshotai/kimi-k2.5", "thinking"],
  "kimi-k2-6-non-reasoning": ["moonshotai/kimi-k2.6", "direct"],
  "kimi-k2-6": ["moonshotai/kimi-k2.6", "thinking"],

  // Meta / Nous / Nvidia
  "llama-3-1-instruct-405b": ["meta-llama/llama-3.1-405b-instruct", "direct"],
  "llama-3-1-instruct-70b": ["meta-llama/llama-3.1-70b-instruct", "direct"],
  "llama-3-1-instruct-8b": ["meta-llama/llama-3.1-8b-instruct", "direct"],
  "llama-3-3-instruct-70b": ["meta-llama/llama-3.3-70b-instruct", "direct"],
  "llama-4-maverick": ["meta-llama/llama-4-maverick", "direct"],
  "llama-4-scout": ["meta-llama/llama-4-scout", "direct"],
  "hermes-4-llama-3-1-405b": ["nousresearch/hermes-4-405b", "direct"],
  "hermes-4-llama-3-1-405b-reasoning": [
    "nousresearch/hermes-4-405b",
    "thinking",
  ],
  "hermes-4-llama-3-1-70b": ["nousresearch/hermes-4-70b", "direct"],
  "hermes-4-llama-3-1-70b-reasoning": ["nousresearch/hermes-4-70b", "thinking"],
  "llama-nemotron-super-49b-v1-5": [
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    "direct",
  ],
  "llama-nemotron-super-49b-v1-5-reasoning": [
    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    "thinking",
  ],
  "nvidia-nemotron-3-nano-30b-a3b": [
    "nvidia/nemotron-3-nano-30b-a3b",
    "direct",
  ],
  "nvidia-nemotron-3-nano-30b-a3b-reasoning": [
    "nvidia/nemotron-3-nano-30b-a3b",
    "thinking",
  ],
  "nvidia-nemotron-3-super-120b-a12b": [
    "nvidia/nemotron-3-super-120b-a12b",
    "thinking",
  ],
  "nvidia-nemotron-nano-9b-v2": ["nvidia/nemotron-nano-9b-v2", "direct"],
  "nvidia-nemotron-nano-9b-v2-reasoning": [
    "nvidia/nemotron-nano-9b-v2",
    "thinking",
  ],

  // Qwen
  "qwen3-14b-instruct": ["qwen/qwen3-14b", "direct"],
  "qwen3-14b-instruct-reasoning": ["qwen/qwen3-14b", "thinking"],
  "qwen3-235b-a22b-instruct": ["qwen/qwen3-235b-a22b", "direct"],
  "qwen3-235b-a22b-instruct-reasoning": ["qwen/qwen3-235b-a22b", "thinking"],
  "qwen3-235b-a22b-instruct-2507": ["qwen/qwen3-235b-a22b-2507", "direct"],
  "qwen3-235b-a22b-instruct-2507-reasoning": [
    "qwen/qwen3-235b-a22b-thinking-2507",
    "thinking",
  ],
  "qwen3-30b-a3b-instruct": ["qwen/qwen3-30b-a3b", "direct"],
  "qwen3-30b-a3b-instruct-reasoning": ["qwen/qwen3-30b-a3b", "thinking"],
  "qwen3-30b-a3b-2507": ["qwen/qwen3-30b-a3b-instruct-2507", "direct"],
  "qwen3-30b-a3b-2507-reasoning": [
    "qwen/qwen3-30b-a3b-thinking-2507",
    "thinking",
  ],
  "qwen3-32b-instruct-reasoning": ["qwen/qwen3-32b", "thinking"],
  "qwen3-8b-instruct": ["qwen/qwen3-8b", "direct"],
  "qwen3-8b-instruct-reasoning": ["qwen/qwen3-8b", "thinking"],
  "qwen3-coder-30b-a3b-instruct": [
    "qwen/qwen3-coder-30b-a3b-instruct",
    "direct",
  ],
  "qwen3-coder-480b-a35b-instruct": ["qwen/qwen3-coder", "direct"],
  "qwen3-coder-next": ["qwen/qwen3-coder-next", "direct"],
  "qwen3-max": ["qwen/qwen3-max", "direct"],
  "qwen3-max-thinking": ["qwen/qwen3-max-thinking", "thinking"],
  "qwen3-next-80b-a3b-instruct": ["qwen/qwen3-next-80b-a3b-instruct", "direct"],
  "qwen3-next-80b-a3b-reasoning": [
    "qwen/qwen3-next-80b-a3b-thinking",
    "thinking",
  ],
  "qwen3-vl-235b-a22b-instruct": ["qwen/qwen3-vl-235b-a22b-instruct", "direct"],
  "qwen3-vl-235b-a22b-reasoning": [
    "qwen/qwen3-vl-235b-a22b-thinking",
    "thinking",
  ],
  "qwen3-vl-30b-a3b-instruct": ["qwen/qwen3-vl-30b-a3b-instruct", "direct"],
  "qwen3-vl-30b-a3b-reasoning": ["qwen/qwen3-vl-30b-a3b-thinking", "thinking"],
  "qwen3-vl-32b-instruct": ["qwen/qwen3-vl-32b-instruct", "direct"],
  "qwen3-vl-8b-instruct": ["qwen/qwen3-vl-8b-instruct", "direct"],
  "qwen3-vl-8b-reasoning": ["qwen/qwen3-vl-8b-thinking", "thinking"],
  "qwen3-5-122b-a10b-non-reasoning": ["qwen/qwen3.5-122b-a10b", "direct"],
  "qwen3-5-122b-a10b": ["qwen/qwen3.5-122b-a10b", "thinking"],
  "qwen3-5-27b-non-reasoning": ["qwen/qwen3.5-27b", "direct"],
  "qwen3-5-27b": ["qwen/qwen3.5-27b", "thinking"],
  "qwen3-5-35b-a3b-non-reasoning": ["qwen/qwen3.5-35b-a3b", "direct"],
  "qwen3-5-35b-a3b": ["qwen/qwen3.5-35b-a3b", "thinking"],
  "qwen3-5-397b-a17b-non-reasoning": ["qwen/qwen3.5-397b-a17b", "direct"],
  "qwen3-5-397b-a17b": ["qwen/qwen3.5-397b-a17b", "thinking"],
  "qwen3-5-9b-non-reasoning": ["qwen/qwen3.5-9b", "direct"],
  "qwen3-5-9b": ["qwen/qwen3.5-9b", "thinking"],
  "qwen3-6-27b-non-reasoning": ["qwen/qwen3.6-27b", "direct"],
  "qwen3-6-27b": ["qwen/qwen3.6-27b", "thinking"],
  "qwen3-6-35b-a3b-non-reasoning": ["qwen/qwen3.6-35b-a3b", "direct"],
  "qwen3-6-35b-a3b": ["qwen/qwen3.6-35b-a3b", "thinking"],
  "qwen3-6-max": ["qwen/qwen3.6-max-preview", "thinking"],
  "qwen3-6-plus": ["qwen/qwen3.6-plus", "thinking"],
  "qwen3-7-max": ["qwen/qwen3.7-max", "thinking"],

  // Mistral / MiniMax / Xiaomi / other labs
  "jamba-1-7-large": ["ai21/jamba-large-1.7", "direct"],
  "mistral-large-2": ["mistralai/mistral-large-2411", "direct"],
  "mistral-large-3": ["mistralai/mistral-large", "direct"],
  "mistral-medium-3": ["mistralai/mistral-medium-3", "direct"],
  "mistral-medium-3-1": ["mistralai/mistral-medium-3.1", "direct"],
  "mistral-medium-3-5": ["mistralai/mistral-medium-3-5", "thinking"],
  "mistral-small-3-1": ["mistralai/mistral-small-3.1-24b-instruct", "direct"],
  "mistral-small-3-2": ["mistralai/mistral-small-3.2-24b-instruct", "direct"],
  "ministral-3-14b": ["mistralai/ministral-14b-2512", "direct"],
  "ministral-3-3b": ["mistralai/ministral-3b-2512", "direct"],
  "ministral-3-8b": ["mistralai/ministral-8b-2512", "direct"],
  "minimax-m1-80k": ["minimax/minimax-m1", "thinking"],
  "minimax-m2": ["minimax/minimax-m2", "thinking"],
  "minimax-m2-1": ["minimax/minimax-m2.1", "thinking"],
  "minimax-m2-5": ["minimax/minimax-m2.5", "thinking"],
  "minimax-m2-7": ["minimax/minimax-m2.7", "thinking"],
  "minimax-m3": ["minimax/minimax-m3", "thinking"],
  "mimo-v2-flash": ["xiaomi/mimo-v2-flash", "direct"],
  "mimo-v2-flash-reasoning": ["xiaomi/mimo-v2-flash", "thinking"],
  "mimo-v2-omni": ["xiaomi/mimo-v2-omni", "thinking"],
  "mimo-v2-pro": ["xiaomi/mimo-v2-pro", "thinking"],
  "mimo-v2-5-0424": ["xiaomi/mimo-v2.5", "thinking"],
  "mimo-v2-5-pro-non-reasoning": ["xiaomi/mimo-v2.5-pro", "direct"],
  "mimo-v2-5-pro": ["xiaomi/mimo-v2.5-pro", "thinking"],
  "lfm2-24b-a2b": ["liquid/lfm-2-24b-a2b", "direct"],
  "lfm2-5-1-2b-instruct": ["liquid/lfm-2.5-1.2b-instruct:free", "direct"],
  "lfm2-5-1-2b-thinking": ["liquid/lfm-2.5-1.2b-thinking:free", "thinking"],
  "hy3-non-reasoning": ["tencent/hy3-preview", "direct"],
  hy3: ["tencent/hy3-preview", "thinking"],
  "kat-coder-pro-v2": ["kwaipilot/kat-coder-pro-v2", "direct"],
  "ling-2-6-1t": ["inclusionai/ling-2.6-1t", "direct"],
  "ling-2-6-flash": ["inclusionai/ling-2.6-flash", "direct"],
  "ring-2-6-1t": ["inclusionai/ring-2.6-1t", "thinking"],
  "mercury-2": ["inception/mercury-2", "thinking"],
  "intellect-3": ["prime-intellect/intellect-3", "thinking"],
  "trinity-large-thinking": ["arcee-ai/trinity-large-thinking", "thinking"],
  "solar-pro-3": ["upstage/solar-pro-3", "thinking"],
  "step-3-5-flash": ["stepfun/step-3.5-flash", "thinking"],
  "phi-4-mini": ["microsoft/phi-4-mini-instruct", "direct"],
  "granite-4-1-8b": ["ibm-granite/granite-4.1-8b", "direct"],
};

const MANUAL_TOTALS = {
  // AA has low and xhigh for GPT-5.4, but no medium row; use geometric mean.
  "openai/gpt-5.4": {
    thinking: Math.round(Math.sqrt(9_872_802 * 120_579_080)),
  },
  // AA has low and high for gpt-oss, but no medium row; use geometric mean.
  "openai/gpt-oss-120b": {
    thinking: Math.round(Math.sqrt(7_713_152 * 77_700_466)),
  },
  "openai/gpt-oss-20b": {
    thinking: Math.round(Math.sqrt(9_664_387 * 60_996_569)),
  },
};

const tokenCounts = (model) =>
  model.intelligence_index_token_counts?.output_tokens;

const source = JSON.parse(await readFile(inputPath, "utf8"));
const bySlug = new Map(source.models.map((model) => [model.slug, model]));
const output = {};
const missing = [];

for (const [slug, [orId, bucket]] of Object.entries(AA_TO_OR)) {
  const model = bySlug.get(slug);
  const total = model && tokenCounts(model);
  if (!total) {
    missing.push(slug);
    continue;
  }

  if (!output[orId]) output[orId] = {};
  if (bucket === "thinking_low" || bucket === "thinking_high") continue; // handled in MANUAL_TOTALS
  if (output[orId][bucket] !== undefined) {
    throw new Error(`Duplicate ${bucket} mapping for ${orId}`);
  }
  output[orId][bucket] = total;
}

for (const [orId, values] of Object.entries(MANUAL_TOTALS)) {
  output[orId] = { ...output[orId], ...values };
}

const sorted = Object.fromEntries(
  Object.entries(output)
    .filter(
      ([, values]) =>
        values.direct !== undefined || values.thinking !== undefined,
    )
    .sort(([a], [b]) => a.localeCompare(b)),
);

await writeFile(outputPath, `${JSON.stringify(sorted, null, 2)}\n`);

console.log(
  `Wrote ${Object.keys(sorted).length} token usage entries to ${outputPath}`,
);
if (missing.length) {
  console.warn(`Missing AA slugs (${missing.length}):`);
  for (const slug of missing) console.warn(`  ${slug}`);
}
