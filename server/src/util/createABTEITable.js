import sql from 'mssql';

export default function (abtei) {
  var tvp = new sql.Table();
  tvp.columns.add('ABTEI', sql.Char(12), {
    nullable: false,
    primary: true,
  });

  if (abtei instanceof Array)
    abtei.forEach((value) => tvp.rows.add(String(value).substr(0, 12)));

  return tvp;
}
