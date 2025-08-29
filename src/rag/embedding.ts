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


