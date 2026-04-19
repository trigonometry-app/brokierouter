import { readFileSync, existsSync } from "node:fs";
import { safeParse, summarize } from "valibot";
import type { GenericSchema } from "valibot";

export const fetchJSON = async <T>(
  url: string,
  opts?: { headers?: Record<string, string>; token?: string },
): Promise<T> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...opts?.headers,
  };
  if (opts?.token) headers["Authorization"] = `Bearer ${opts.token}`;
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

export const fetchValidated = async <T>(
  url: string,
  schema: GenericSchema<T>,
  opts?: { headers?: Record<string, string>; token?: string },
): Promise<T> => {
  const raw = await fetchJSON<unknown>(url, opts);
  const result = safeParse(schema, raw);
  if (result.success) return result.output;
  const issues = summarize(result.issues);
  throw new Error(
    `Validation failed for ${url}:\n${JSON.stringify(issues, null, 2)}`,
  );
};

export const readJSON = <T>(path: string): T =>
  JSON.parse(readFileSync(path, "utf-8"));

export const readJSONOr = <T>(path: string, fallback: T): T =>
  existsSync(path) ? readJSON(path) : fallback;

export const readValidated = <T>(
  path: string,
  schema: GenericSchema<T>,
): T => {
  const raw: unknown = JSON.parse(readFileSync(path, "utf-8"));
  const result = safeParse(schema, raw);
  if (result.success) return result.output;
  const issues = summarize(result.issues);
  throw new Error(
    `Validation failed for ${path}:\n${JSON.stringify(issues, null, 2)}`,
  );
};
