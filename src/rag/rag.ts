import { retrieve } from "./retrieval";
import { generateFromPrompt, initLLM } from "../llm/localLLM";

export async function ragQuery(db: any, query: string, k = 3) {
    // Step 1: Retrieve relevant docs
    const docs = await retrieve(db, query, k);

    // Step 2: Combine retrieved context into prompt
    const contextText = docs.map(d => d.text).join("\n---\n");
    const prompt = `You are a helpful assistant. Use the following context to answer the question.\n\nContext:\n${contextText}\n\nQuestion: ${query}\nAnswer:`;

    // Step 3: Generate answer locally
    const answer = await generateFromPrompt(prompt);
    return answer
}
