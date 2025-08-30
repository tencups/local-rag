// llm/localLLM.js
import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { CacheManager } from "../utils/caching";

let engine = null;
const MODEL_ID = "SmolLM2-135M-Instruct-q0f16-MLC";

export async function initLLM(config) {
    if (!engine) {
        const isCached = await CacheManager.isModelCached(MODEL_ID);

        if (config?.initProgressCallback) {
            if (isCached) {
                config.initProgressCallback("Found cached model, loading...");
            } else {
                config.initProgressCallback("Model not cached, downloading...");
            }
        }

        engine = await CreateMLCEngine(MODEL_ID, {
            initProgressCallback: (status) => {
                console.log(status.text);
                if (config?.initProgressCallback) {
                    config.initProgressCallback(status.text);
                }
            },
            use_web_worker: true,
        });

        // Cache the model after successful initialization
        if (!isCached) {
            await CacheManager.cacheModel(MODEL_ID);
            if (config?.initProgressCallback) {
                config.initProgressCallback("Model cached for future use");
            }
        }
    }
    return engine;
}

export async function generateFromPrompt(prompt) {
    if (!engine) {
        throw new Error("LLM not initialized");
    }

    const completion = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "";
}

// Export cache-related functions
export const isModelCached = () => CacheManager.isModelCached(MODEL_ID);
export const getCachedModelInfo = () => CacheManager.getCachedModelInfo(MODEL_ID);
export const clearModelCache = () => CacheManager.clearModelCache(MODEL_ID);

// Export model ID for other components
export const getModelId = () => MODEL_ID;