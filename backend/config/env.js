import dotenv from "dotenv";
dotenv.config();

export const env = {
  hostName: process.env.HOSTNAME,
  user: process.env.USER,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: process.env.DB_PORT,
  appPort: process.env.APP_PORT,
};
