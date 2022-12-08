export type LoggerOptions = {
  service: string;
  version: string;
  apiKey: string;
  env?: string;
  url?: string;
};
export type LogMessage = {
  message: string;
  level?: string;
  service?: string;
  tags?: string;
  chain?: string;
  [key: string]: unknown;
};
