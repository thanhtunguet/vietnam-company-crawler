import { configDotenv } from 'dotenv';

configDotenv();

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : null;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;

export const SOURCE_URL = process.env.SOURCE_URL;
export const WEB_URL = process.env.WEB_URL;
export const MQTT_URL = process.env.MQTT_URL;

export const PORT = Number(process.env.PORT ?? 3000);
export const SLEEP_GAP = Number(process.env.SLEEP_GAP ?? 150);
export const SLEEP_MIN = Number(process.env.SLEEP_MIN ?? 100);

export const CRAWLER_LOCAL_IPS: string[] = process.env.CRAWLER_LOCAL_IPS
  ? process.env.CRAWLER_LOCAL_IPS.split(',')
  : [];
