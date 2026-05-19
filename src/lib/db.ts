import mysql from "mysql2/promise";

// Prevent multiple connection pools from being created in Next.js development HMR
const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined;
};

// 1. Database Configuration
const poolConfig: mysql.PoolOptions = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Hiru1999@",          // Specified Credentials
  database: "warranty_buddy",
  waitForConnections: true,
  connectionLimit: 15,       // Maximum active connections in the pool
  maxIdle: 10,               // Maximum idle connections
  idleTimeout: 60000,        // Timeout idle connections (in ms)
  queueLimit: 0,             // Unlimited queueing
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// 2. Instantiate or retrieve the singleton pool
export const pool = globalForDb.pool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

/**
 * Executes a parameterized MySQL query safely.
 * Parameterization prevents SQL Injection attacks completely.
 * 
 * @param sql The SQL statement with "?" placeholders.
 * @param params The array of dynamic values mapping to the placeholders.
 */
export async function dbQuery<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    // Log the error internally for debugging (excluding password/credentials)
    console.error("Database Query Failed:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      query: sql,
    });
    throw new Error("Internal Database Error");
  }
}
