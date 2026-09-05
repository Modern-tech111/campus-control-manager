import mysql from "mysql2/promise";

const host = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "campus-control";

export const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  // Return DATE/DATETIME columns as strings ("YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS")
  // so they match the shape of the mock data the frontend already expects.
  dateStrings: true,
});

/** Quick connectivity check used by /api/health */
export async function ping(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}