import { pipeline } from "@huggingface/transformers";

// Create a feature-extraction pipeline using Hugging Face transformers
export const extractor = await pipeline(
    "feature-extraction",
    "mixedbread-ai/mxbai-embed-xsmall-v1",
    { device: "webgpu" },
);


export async function extract(text: string): Promise<number[]> {

    // Get embeddings from the pipeline
    const embeddings = await extractor(text, { pooling: 'mean', normalize: true });
    return embeddings.tolist()[0];
}


// -1 to 1
export function cosineSimilarity(emb1: number[], emb2: number[]): number {
    if (emb1.length !== emb2.length) {
        throw new Error("Embedding vectors must have the same length");
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < emb1.length; i++) {
        dotProduct += emb1[i] * emb2[i];
        norm1 += emb1[i] * emb1[i];
        norm2 += emb2[i] * emb2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
