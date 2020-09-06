import sql from 'mssql';

export default function (verak) {
  var tvp = new sql.Table();
  tvp.columns.add('VERAK', sql.Char(20), {
    nullable: false,
    primary: true,
  });

  if (verak instanceof Array)
    verak.forEach((value) => tvp.rows.add(String(value).substr(0, 20)));

  return tvp;
}
