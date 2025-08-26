import { useEffect, useState } from "react";
import { initDB, insertDoc, getAllTexts } from "./db/db";
import { extract } from "./rag/embedding";

export default function App() {
  const [docs, setDocs] = useState<string[]>([]);
  const [embeddings, setEmbeddings] = useState<number[][] | number[]>([]);

  useEffect(() => {
    (async () => {
      await initDB();
      insertDoc("Hello world");
      insertDoc("This is a local RAG test");
      const result = getAllTexts();
      const docsFromDB = result[0]?.values || [];
      // Extract the text strings from the rows
      const texts = docsFromDB.map(row => row[0] as string);
      setDocs(texts);
      console.log("Query results:", result);

      // Convert embeddings to array format
      const embedResults = await extract(texts);
      setEmbeddings(embedResults);
    })();
  }, []);


  return (
    <div className="p-4">
      <h1>SQLite WASM Test</h1>
      <ul>
        {docs.map(([id, text], idx) => (
          <li key={id}>
            {text}
            <br />
            Embedding (first 10 dims): {embeddings[idx]?.slice(0, 10).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
