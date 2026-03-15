import { Sequelize, Options } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

console.log("[database.ts] 开始配置数据库连接...");

const sequelizeOptions: Options = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "agentmanage",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

console.log("[database.ts] Sequelize配置参数:", {
  host: sequelizeOptions.host,
  port: sequelizeOptions.port,
  database: sequelizeOptions.database,
  dialect: sequelizeOptions.dialect,
});

const sequelize = new Sequelize(sequelizeOptions);

console.log("[database.ts] Sequelize实例创建成功");

export default sequelize;
