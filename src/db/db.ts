import initSqlJs from "sql.js";
import { createTables } from "./schema";

let db: any;

export async function initDB() {
    const SQL = await initSqlJs({
        locateFile: (file: string) => `/sql-wasm.wasm`,
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

export function getAllDocs() {
    return db.exec("SELECT * FROM docs");
}
