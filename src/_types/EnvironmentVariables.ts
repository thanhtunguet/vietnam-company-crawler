export interface EnvironmentVariables {
  DB_HOST?: string;

  DB_PORT?: number;

  DB_USER?: string;

  DB_PASSWORD?: string;

  DB_NAME?: string;

  DB_SYNCHRONIZE?: boolean | string;

  DB_LOGGING?: boolean | string;

  SLEEP_GAP?: number;

  SLEEP_MIN?: number;

  PORT?: number;

  NODE_ENV?: string;

  OPENAI_API_KEY?: string;

  OPENAI_BASE_URL?: string;

  OPENAI_MODEL?: string;

  ENABLE_CORS?: boolean | string;

  CORS_ORIGIN?: string;

  CORS_CREDENTIALS?: boolean | string;

  RABBITMQ_IP?: string;

  RABBITMQ_PORT?: number;

  CRAWLER_PROXIES?: string | string[];

  JWT_SECRET?: string;

  GOOGLE_CLIENT_ID?: string;

  GOOGLE_CLIENT_SECRET?: string;

  GOOGLE_CALLBACK_URL?: string;
}
