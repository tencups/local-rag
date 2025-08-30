const CACHE_NAME = 'webllm-model-cache';

export class CacheManager {
    static async isModelCached(modelId) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(modelId);
            return !!cachedResponse;
        } catch (error) {
            console.warn('Cache check failed:', error);
            return false;
        }
    }

    static async cacheModel(modelId) {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(modelId, new Response(JSON.stringify({
                modelId: modelId,
                cached: true,
                timestamp: Date.now()
            })));
            return true;
        } catch (error) {
            console.error('Failed to cache model:', error);
            return false;
        }
    }

    static async getCachedModelInfo(modelId) {
        try {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(modelId);
            if (cachedResponse) {
                return await cachedResponse.json();
            }
            return null;
        } catch (error) {
            console.warn('Failed to get cached model info:', error);
            return null;
        }
    }

    static async clearModelCache(modelId = null) {
        try {
            const cache = await caches.open(CACHE_NAME);

            if (modelId) {
                // Clear specific model
                await cache.delete(modelId);
            } else {
                // Clear all cached models
                const keys = await cache.keys();
                await Promise.all(keys.map(key => cache.delete(key)));
            }

            // Also clear any WebLLM internal caches
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
                if (cacheName.includes('webllm') || cacheName.includes('mlc')) {
                    await caches.delete(cacheName);
                }
            }

            console.log('Model cache cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear cache:', error);
            return false;
        }
    }

    static formatCacheInfo(info) {
        if (!info) return "No cache info";

        const date = new Date(info.timestamp);
        return `Cached on: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
}