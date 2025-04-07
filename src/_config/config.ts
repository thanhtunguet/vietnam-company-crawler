import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';

export function validateConfiguration(config: EnvironmentVariables) {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_NAME',
    'NODE_ENV',
    'OPENAI_API_KEY',
    'OPENAI_BASE_URL',
    'OPENAI_MODEL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!config[envVar]) {
      throw new Error(`${envVar} is required`);
    }
  }

  // Convert boolean strings to actual booleans
  if (config.DB_SYNCHRONIZE !== undefined) {
    config.DB_SYNCHRONIZE =
      config.DB_SYNCHRONIZE === true || config.DB_SYNCHRONIZE === 'true';
  }

  if (config.DB_LOGGING !== undefined) {
    config.DB_LOGGING =
      config.DB_LOGGING === true || config.DB_LOGGING === 'true';
  }

  // Convert numeric strings to numbers
  if (config.SLEEP_GAP !== undefined) {
    config.SLEEP_GAP = Number(config.SLEEP_GAP);
  }

  if (config.SLEEP_MIN !== undefined) {
    config.SLEEP_MIN = Number(config.SLEEP_MIN);
  }

  // Convert DB_PORT to number
  if (config.DB_PORT !== undefined) {
    config.DB_PORT = Number(config.DB_PORT);
  }

  // Convert PORT to number
  if (config.PORT !== undefined) {
    config.PORT = Number(config.PORT);
  }

  // Convert RABBITMQ_PORT to number
  if (config.RABBITMQ_PORT !== undefined) {
    config.RABBITMQ_PORT = Number(config.RABBITMQ_PORT);
  }

  if (typeof config.CRAWLER_PROXIES === 'string') {
    config.CRAWLER_PROXIES = config.CRAWLER_PROXIES.split(',').map((proxy) =>
      proxy.trim(),
    );
  } else {
    config.CRAWLER_PROXIES = config.CRAWLER_PROXIES || [];
  }

  return config;
}
