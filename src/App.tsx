// App.js
import { useEffect, useState } from "react";
import {
  initLLM,
  generateFromPrompt,
  isModelCached,
  clearModelCache,
  getCachedModelInfo
} from "./llm/localLLM";
import { ragQuery } from "./rag/rag";
import { initDB, insertDocWithAutoEmbedding } from "./db/db";
import { useTimer } from "./hooks/useTimer";
import { CacheManager } from "./utils/caching";

export default function App() {
  const [logMessages, setLogMessages] = useState([]);
  const [llmReady, setLLMReady] = useState(false);
  const [input, setInput] = useState("");
  const [db, setDb] = useState(null); // Add db to state
  const [reply, setReply] = useState("");
  const [cacheStatus, setCacheStatus] = useState({
    isCached: false,
    loading: true,
    info: null
  });

  const { loadTime, startTimer, stopTimer, formatTime } = useTimer();

  useEffect(() => {
    (async () => {
      try {
        // Start the timer
        startTimer();

        const database = await initDB();
        insertDocWithAutoEmbedding("Bob likes the color green"); // Does bob like green?
        setDb(database);

        // Check cache status
        const cached = await isModelCached();
        const info = await getCachedModelInfo();

        setCacheStatus({
          isCached: cached,
          loading: false,
          info: info
        });

        if (cached) {
          setLogMessages(prev => [...prev, "✅ Model found in cache!"]);
        } else {
          setLogMessages(prev => [...prev, "⬇️  Downloading model (first time)..."]);
        }

        // Initialize LLM
        await initLLM({
          initProgressCallback: (text) => {
            setLogMessages((prev) => [...prev, text]);
          },
        });

        // Stop timer and mark as ready
        stopTimer();
        setLLMReady(true);

        // Update cache status after initialization
        const updatedCached = await isModelCached();
        const updatedInfo = await getCachedModelInfo();
        setCacheStatus(prev => ({
          ...prev,
          isCached: updatedCached,
          info: updatedInfo
        }));

      } catch (error) {
        console.error("Failed to initialize LLM:", error);
        setLogMessages(prev => [...prev, `❌ Error: ${error.message}`]);
        stopTimer();
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!llmReady) return;

    try {
      setReply("Thinking...");
      const result = await ragQuery(db, input, 2);
      setReply(result);
    } catch (error) {
      setReply(`Error: ${error.message}`);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("Are you sure you want to clear the model cache? The model will need to be downloaded again.")) {
      return;
    }

    try {
      setLogMessages(prev => [...prev, "🗑️  Clearing cache..."]);
      await clearModelCache();

      setCacheStatus({
        isCached: false,
        loading: false,
        info: null
      });

      setLogMessages(prev => [...prev, "✅ Cache cleared successfully"]);

      // Optionally reload to reinitialize
      if (confirm("Cache cleared. Reload page to reinitialize?")) {
        window.location.reload();
      }
    } catch (error) {
      setLogMessages(prev => [...prev, `❌ Failed to clear cache: ${error.message}`]);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "monospace" }}>
      {/* Timer Display - Only show completion time after loading */}
      {!loadTime.isLoading && loadTime.totalTime && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          <strong>✅ Model loaded in {formatTime(loadTime.totalTime)}</strong>
          <div style={{ fontSize: "0.8em", color: "#666", marginTop: "0.25rem" }}>
            {cacheStatus.isCached ? "Loaded from cache" : "Downloaded and cached"}
          </div>
        </div>
      )}

      {/* Cache Status Bar */}
      <div style={{
        marginBottom: "1rem",
        padding: "0.5rem",
        backgroundColor: cacheStatus.isCached ? "#d4edda" : "#fff3cd",
        border: `1px solid ${cacheStatus.isCached ? "#c3e6cb" : "#ffeaa7"}`,
        borderRadius: "4px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>Cache Status:</strong> {cacheStatus.loading ? "Checking..." :
              cacheStatus.isCached ? "✅ Cached" : "❌ Not Cached"}
            {cacheStatus.info && (
              <div style={{ fontSize: "0.8em", color: "#666", marginTop: "0.25rem" }}>
                {CacheManager.formatCacheInfo(cacheStatus.info)}
              </div>
            )}
          </div>
          {cacheStatus.isCached && (
            <button
              onClick={handleClearCache}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer"
              }}
            >
              Clear Cache
            </button>
          )}
        </div>
      </div>

      {!llmReady ? (
        <div>
          <h2>Loading LLM...</h2>
          <div style={{ marginBottom: "1rem" }}>
            {cacheStatus.isCached ? (
              <p style={{ color: "green" }}>
                📦 Loading from cache - this should be quick!
              </p>
            ) : (
              <p style={{ color: "orange" }}>
                ⬇️  First time download - this may take a few minutes
              </p>
            )}
          </div>

          {/* Real-time progress with timer */}
          <div style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            backgroundColor: "#e3f2fd",
            border: "1px solid #90caf9",
            borderRadius: "4px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>⏱️  Elapsed: <strong>{formatTime(loadTime.elapsed)}</strong></span>
              <span style={{ fontSize: "0.8em", color: "#666" }}>
                {cacheStatus.isCached ? "Cache load" : "Initial download"}
              </span>
            </div>
          </div>

          <pre style={{
            maxHeight: "300px",
            overflowY: "auto",
            background: "#111",
            color: "#0f0",
            padding: "0.5rem",
            borderRadius: "8px"
          }}>
            {logMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </pre>
        </div>
      ) : (
        <div>
          <h2>✅ Model Ready</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: "0.5rem" }}
            placeholder="Enter your question here..."
          />
          <br />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: !input.trim() ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !input.trim() ? "not-allowed" : "pointer"
            }}
          >
            Ask
          </button>
          {reply && (
            <div style={{
              marginTop: "1rem",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#f8f9fa"
            }}>
              <strong>Reply:</strong>
              <p style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>{reply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}