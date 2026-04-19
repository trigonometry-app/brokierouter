import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import type { ORModel } from "./types.ts";

const API_KEY = process.env.OPENROUTER_KEY ?? "";

const fetchJSON = async <T>(url: string): Promise<T> => {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error("unreachable");
};

const orRaw = await fetchJSON<{ data: ORModel[] }>(
  "https://openrouter.ai/api/v1/models",
);
rmSync("data/endpoints", { recursive: true, force: true });
mkdirSync("data/endpoints", { recursive: true });

let fetched = 0;

for (const m of orRaw.data) {
  const id = m.id.replace(":free", "");
  const path = `data/endpoints/${id.replace(/\//g, "_")}.json`;

  try {
    const res = await fetchJSON<{ data: { endpoints: unknown[] } }>(
      `https://openrouter.ai/api/v1/models/${m.id}/endpoints`,
    );
    const endpoints = res.data.endpoints;
    let merged: unknown[];
    try {
      const existing = JSON.parse(readFileSync(path, "utf-8")) as unknown[];
      merged = [...existing, ...endpoints];
    } catch {
      merged = endpoints;
    }
    writeFileSync(path, JSON.stringify(merged, null, 2));
    fetched++;
    if (fetched % 20 === 0) console.log(`Fetched ${fetched} endpoint files...`);
  } catch {
    console.error(`Failed to fetch endpoints for ${m.id}`);
  }

  await new Promise((r) => setTimeout(r, 100));
}

console.log(`Done. Fetched ${fetched} endpoint files.`);
