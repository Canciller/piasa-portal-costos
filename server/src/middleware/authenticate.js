import jwt from 'express-jwt';

require('dotenv').config();

export default jwt({
  secret: process.env.SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.token,
});
