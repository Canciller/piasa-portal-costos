import sql from 'mssql';

export default function (kostl) {
  var tvp = new sql.Table();
  tvp.columns.add('HKONT', sql.NChar(10), {
    nullable: false,
    primary: true,
  });

  if (kostl instanceof Array)
    kostl.forEach((value) =>
      tvp.rows.add(String(value).substr(0, 10).padStart(10, '0'))
    );

  return tvp;
}
