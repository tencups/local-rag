export const createTables = `
CREATE TABLE IF NOT EXISTS docs (
  id INTEGER PRIMARY KEY,
  text TEXT,
  embedding BLOB
);
`;