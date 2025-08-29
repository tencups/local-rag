import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

// Singleton to avoid reloading
const engine: MLCEngine | null = null;


const initProgressCallback = (initProgress) => {
    console.log(initProgress);
}
export async function initLLM() {
    if (!engine) {

        const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

        const engine = await CreateMLCEngine(
            selectedModel,
            { initProgressCallback: initProgressCallback }, // engineConfig
        );
    }
    return engine;
}

export async function generateFromPrompt(prompt: string) {
    if (!engine) throw new Error("LLM engine not initialized. Call initLocalLLM first.");

    const messages = [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: prompt },
    ];

    const reply = await engine.chat.completions.create({ messages });

    // reply.choices[0].message contains the assistant's message
    return reply.choices[0].message.content;
}
