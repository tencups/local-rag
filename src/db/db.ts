import initSqlJs from "sql.js";
import { createTables } from "./schema";
import { extract } from "../rag/embedding";

let db: any;

export async function initDB() {
    const SQL = await initSqlJs({
        locateFile: () => "/sql-wasm.wasm"
    });
    db = new SQL.Database();
    db.run(createTables);
    return db;
}

export function insertDoc(text: string) {
    const stmt = db.prepare("INSERT INTO docs (text) VALUES (?)");
    stmt.run([text]);
    stmt.free();
}

export async function getAllDocs(db: any) {
    const result = await db.exec("SELECT id, text, embedding FROM docs");
    if (!result[0]) return [];

    const { values } = result[0];
    return values.map(([id, text, blob]: [number, string, Uint8Array]) => ({
        id,
        text,
        embedding: decodeEmbedding(blob),
    }));
}

export function getAllTexts() {
    return db.exec("SELECT text FROM docs");
}

// Encode number[] -> Uint8Array (for SQLite BLOB)
export function encodeEmbedding(vec: number[]): Uint8Array {
    return new Uint8Array(new Float32Array(vec).buffer);
}

// Decode Uint8Array -> Float32Array
export function decodeEmbedding(blob: Uint8Array): Float32Array {
    return new Float32Array(
        blob.buffer,
        blob.byteOffset,
        blob.byteLength / Float32Array.BYTES_PER_ELEMENT
    );
}

// Insert doc with embedding computed automatically
export async function insertDocWithAutoEmbedding(text: string) {
    const embedding = await extract(text);
    const encoded = encodeEmbedding(embedding);

    const stmt = db.prepare("INSERT INTO docs (text, embedding) VALUES (?, ?)");
    stmt.run([text, encoded]);
    stmt.free();
}

// Update docs that don’t yet have embeddings
export async function populateEmbeddings() {
    const stmt = db.prepare("SELECT id, text FROM docs WHERE embedding IS NULL");
    const rows: { id: number; text: string }[] = [];

    while (stmt.step()) {
        rows.push(stmt.getAsObject() as { id: number; text: string });
    }
    stmt.free();

    for (const row of rows) {
        const embedding = await extract(row.text);
        const encoded = encodeEmbedding(embedding);

        const upd = db.prepare("UPDATE docs SET embedding = ? WHERE id = ?");
        upd.run([encoded, row.id]);
        upd.free();
    }
}
