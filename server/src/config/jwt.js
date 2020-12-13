require('dotenv').config();

export default {
  secret: process.env.SECRET,
  path: process.env.JWT_PATH,
  secure: process.env.JWT_SECURE === 'true',
};
