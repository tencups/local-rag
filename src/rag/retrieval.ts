import { getAllDocs } from "../db/db";
import { extract } from "./embedding";


export async function retrieve(db: any, query: string, k = 3) {

    const queryEmb = await extract(query);
    const docs = await getAllDocs(db);

    // Compute similarities
    const scored = docs.map(d => ({
        ...d,
        score: cosineSimilarity(queryEmb, d.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
}

// -1 to 1
function cosineSimilarity(a: number[] | null, b: number[] | null): number {
    if (!a || !b) return -Infinity; // treat missing embedding as worst match
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : -Infinity;
}

