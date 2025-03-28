import { configDotenv } from 'dotenv';

configDotenv();

export enum AppMode {
  APP = 'app',
  CRAWLER = 'crawler',
}

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT ?? 3306);
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;

export const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT ?? undefined;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_MODEL = process.env.OPENAI_MODEL;

export const SOURCE_URL = process.env.SOURCE_URL;
export const WEB_URL = process.env.WEB_URL;
export const MQTT_URL = process.env.MQTT_URL;

export const PORT = Number(process.env.PORT ?? 3000);
export const SLEEP_GAP = Number(process.env.SLEEP_GAP ?? 500);
export const SLEEP_MIN = Number(process.env.SLEEP_MIN ?? 500);

export const SECRET_KEY = process.env.SECRET_KEY ?? Math.random().toString();
