import sql from 'mssql';

export default function (groups) {
  var tvp = new sql.Table();
  tvp.columns.add('GRUPO', sql.Char(30), {
    nullable: false,
  });

  if (groups instanceof Array)
    groups.forEach((value) =>
      tvp.rows.add(String(value).substr(0, 30))
    );

  return tvp;
}
