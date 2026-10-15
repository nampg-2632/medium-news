export type PostgresDriverError = Error & {
  code?: string;
  constraint?: string;
};
