import pino from 'pino';

// Configure logger based on environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
};

// Create logger instance
export const logger = pino(pinoConfig);

// Create child loggers for different modules
export function createLogger(name: string) {
  return logger.child({ module: name });
}

// Log levels convenience functions
export const logInfo = (msg: string, data?: any) => logger.info(data || {}, msg);
export const logError = (msg: string, error?: Error | any, data?: any) => {
  if (error instanceof Error) {
    logger.error({ error: error.message, stack: error.stack, ...data }, msg);
  } else {
    logger.error({ error, ...data }, msg);
  }
};
export const logWarn = (msg: string, data?: any) => logger.warn(data || {}, msg);
export const logDebug = (msg: string, data?: any) => logger.debug(data || {}, msg);
export const logTrace = (msg: string, data?: any) => logger.trace(data || {}, msg);

export default logger;
