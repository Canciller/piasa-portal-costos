import bcrypt from 'bcrypt';

var saltRounds = process.env.SALT_ROUNDS || 10;

export default function (password) {
  return bcrypt.hash(password, saltRounds);
}
