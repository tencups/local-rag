import { useEffect, useState } from "react";
import { initDB, insertDoc, getAllDocs } from "./db/db";

export default function App() {
  const [docs, setDocs] = useState<string[][]>([]);

  useEffect(() => {
    (async () => {
      await initDB();
      insertDoc("Hello world");
      insertDoc("This is a local RAG test");
      const result = getAllDocs();
      setDocs(result[0]?.values || []);
      console.log("Query results:", result);
    })();
  }, []);


  return (
    <div className="p-4">
      <h1>SQLite WASM Test</h1>
      <ul>
        {docs.map(([id, text]) => (
          <li key={id}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
