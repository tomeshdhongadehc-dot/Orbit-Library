import type { SearchEntry } from "./types";

export interface Hit {
  entry: SearchEntry;
  score: number;
}

function tokens(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Small, dependency-free scorer. Every query word must appear (prefix match counts).
 * Title matches weigh more than text matches; items weigh slightly more than lessons.
 */
export function search(index: SearchEntry[], query: string, limit = 30): Hit[] {
  const q = tokens(query);
  if (q.length === 0) return [];
  const hits: Hit[] = [];
  for (const entry of index) {
    const title = tokens(entry.title);
    const text = tokens(entry.text);
    let score = 0;
    let all = true;
    for (const w of q) {
      const inTitle = title.some((t) => t === w) ? 6 : title.some((t) => t.startsWith(w)) ? 4 : 0;
      const inText = text.some((t) => t === w) ? 2 : text.some((t) => t.startsWith(w)) ? 1 : 0;
      if (inTitle + inText === 0) {
        all = false;
        break;
      }
      score += inTitle + inText;
    }
    if (!all) continue;
    if (entry.kind === "item") score += 1;
    hits.push({ entry, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).slice(0, limit);
}
