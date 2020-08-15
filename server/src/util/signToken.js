import jsonwebtoken from 'jsonwebtoken';

require('dotenv').config();

export default function (user) {
  return jsonwebtoken.sign(
    {
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET,
    {
      algorithm: 'HS256',
    }
  );
}
