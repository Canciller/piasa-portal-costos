export default {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  connectionTimeout: 300000,
  requestTimeout: 300000,
  pool: {
    idleTimeoutMillis: 300000,
  },
  options: {
    enableArithAbort: true,
    encrypt: false,
  },
  debug: process.env.NODE_ENV === 'development',
};
