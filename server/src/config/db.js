export default {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    enableArithAbort: true,
    trustedConnection: true,
  },
  debug: process.env.NODE_ENV === 'developmet',
};
