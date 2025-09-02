import dotenv from 'dotenv';
dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} must be set`);
  return value;
}
  
export const config = {
  server: {
      port: parseInt(getEnv("PORT")),
      nodeEnv: getEnv("NODE_ENV") as "development" | "production",
    },
  client: {
    url: getEnv("CLIENT_URL"),
  },
  betterAuth: {
    secret: getEnv("BETTER_AUTH_SECRET"),
    url: getEnv("BETTER_AUTH_URL"),
  },
  database: {
    url: getEnv("DATABASE_URL"),
  },
  smtp: {
    host: getEnv("SMTP_HOST"),
    port: parseInt(getEnv("SMTP_PORT")),
    secure: getEnv("SMTP_SECURE") === "true",
    user: getEnv("SMTP_USER"),
    pass: getEnv("SMTP_PASS"),
    from: getEnv("SMTP_FROM"),
  },
};
  