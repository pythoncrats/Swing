import { env } from "./env.js";
import sql from "mysql2/promise";

const pool = sql.createPool({
  user: env.user,
  password: env.dbPassword,
  port: env.dbPort,
  host: env.hostName,
  database: env.dbName,
});

export default pool;
