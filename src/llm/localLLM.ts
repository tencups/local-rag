import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

// Mutable singleton
let engine: MLCEngine | null = null;

export async function initLLM(config?: {
    initProgressCallback?: (text: string) => void;
}) {
    if (!engine) {
        const selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC";

        engine = await CreateMLCEngine(
            selectedModel,
            {
                initProgressCallback: (status) => {
                    console.log(status.text); // console log everything
                    if (config?.initProgressCallback) {
                        config.initProgressCallback(status.text); // forward only text
                    }
                },
            },
        );
    }
    return engine;
}
// Generate a response from the local LLM
export async function generateFromPrompt(prompt: string) {
    if (!engine) throw new Error("LLM engine not initialized. Call initLLM first.");

    const messages = [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: prompt },
    ];

    const reply = await engine.chat.completions.create({ messages });

    return reply.choices[0].message.content;
}
