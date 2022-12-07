export type LoggerOptions = {
  service: string;
  version?: string;
  env?: string;
  apiKey?: string;
};
export type LogMessage = {
  message: string;
  level?: string;
  service?: string;
  tags?: string;
  chain?: string;
  [key: string]: unknown;
};
