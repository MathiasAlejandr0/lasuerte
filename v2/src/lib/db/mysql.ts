import mysql from "mysql2/promise";

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

/**
 * Verifica si las variables de entorno para MySQL están configuradas.
 */
export function isDbConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_DATABASE &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD,
  );
}

/**
 * Obtiene el pool de conexiones MySQL (singleton para Next.js).
 */
export function getDbPool(): mysql.Pool {
  if (!isDbConfigured()) {
    throw new Error(
      "MySQL Database no está configurada en las variables de entorno",
    );
  }

  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      ssl:
        process.env.MYSQL_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return global._mysqlPool;
}

/**
 * Ejecuta una consulta SQL parametrizada en MySQL.
 */
export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const pool = getDbPool();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [rows] = await pool.execute(sql, params as any[]);
  return rows as T;
}

/**
 * Ejecuta un callback dentro de una transacción MySQL con rollback automático en caso de error.
 */
export async function transaction<T>(
  callback: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const pool = getDbPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
