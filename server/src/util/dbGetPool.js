import sql from 'mssql';

export default function () {
  return sql.connect();
}
