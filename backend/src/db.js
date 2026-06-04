import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function isDatabaseConfigured() {
  return true;
}

export async function query(text, params = []) {
  return pool.query(text, params);
}
