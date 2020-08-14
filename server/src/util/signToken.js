import jsonwebtoken from 'jsonwebtoken';

require('dotenv').config();

export default function (user) {
  return jsonwebtoken.sign(
    {
      username: user.username,
      role: user.role,
    },
    process.env.SECRET,
    {
      algorithm: 'HS256',
    }
  );
}
