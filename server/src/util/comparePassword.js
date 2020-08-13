import bcrypt from 'bcrypt';

export default function (password, hash) {
  return bcrypt.compare(password, hash);
}
