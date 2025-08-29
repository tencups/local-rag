import { useEffect, useState } from "react";
import { initLLM, generateFromPrompt } from "./llm//localLLM";

export default function App() {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [llmReady, setLLMReady] = useState(false);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  useEffect(() => {
    (async () => {
      await initLLM({
        initProgressCallback: (text) => {
          // Save progress messages to state
          setLogMessages((prev) => [...prev, text]);
        },
      });
      setLLMReady(true);
    })();
  }, []);

  const handleSubmit = async () => {
    if (!llmReady) return;
    const result = await generateFromPrompt(input);
    setReply(result);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "monospace" }}>
      {!llmReady ? (
        <div>
          <h2>Loading LLM...</h2>
          <pre style={{ maxHeight: "300px", overflowY: "auto", background: "#111", color: "#0f0", padding: "0.5rem", borderRadius: "8px" }}>
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
          />
          <br />
          <button onClick={handleSubmit}>Ask</button>
          {reply && (
            <div style={{ marginTop: "1rem", padding: "0.5rem", border: "1px solid #ccc" }}>
              <strong>Reply:</strong>
              <p>{reply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
