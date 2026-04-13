import "dotenv/config";

const APP_PORT = Number.parseInt(process.env.APP_PORT ?? "3000", 10);

export const env = {
  host: process.env.APP_HOST ?? "0.0.0.0",
  port: Number.isNaN(APP_PORT) ? 3000 : APP_PORT,
  nodeEnv: process.env.NODE_ENV ?? "development"
};

