import ValidationError from './error/ValidationError';

// Keep this updated with client's BudgetService.
const P = [
  'P1',
  'P3',
  'P3',
  'P4',
  'P5',
  'P6',
  'P7',
  'P8',
  'P9',
  'P10',
  'P11',
  'P12',
];

function isEmptyString(str) {
  return typeof str === 'string' && str.length !== 0;
}

export default async function (budget) {
  if (!(budget instanceof Array)) return budget;

  var formatted = [];

  for (var i = budget.length; i--; ) {
    var formattedRow = {};
    var row = budget[i];

    row.KOSTL = String(row.KOSTL);
    row.HKONT = String(row.HKONT);
    row.GJAHR = String(row.GJAHR);

    if (row.GJAHR.length > 4) row.GJAHR = row.GJAHR.substr(0, 4);

    if (!isEmptyString(row.KOSTL))
      throw new ValidationError('El centro de costos no puede estar vacio.');
    if (!isEmptyString(row.HKONT))
      throw new ValidationError('La cuenta no puede estar vacia.');
    if (!isEmptyString(row.GJAHR))
      throw new ValidationError('El año no puede estar vacio.');

    formattedRow.KOSTL = row.KOSTL.padStart(10, '0');
    formattedRow.HKONT = row.HKONT.padStart(10, '0');
    formattedRow.GJAHR = row.GJAHR;
    for (var j = P.length; j--; ) {
      var month = j + 1;
      var forLine = `[${row.KOSTL}, ${row.HKONT}, ${row.GJAHR}, Mes ${month}]`;

      var key = P[j];
      var value = row[key];
      if (value === undefined || value === null) {
        value = 0
        /*
        throw new ValidationError(
          `El valor del mes ${month} no esta definido, para ${forLine}.`
        );
        */
      }
      value = parseInt(value);
      if (isNaN(value))
        throw new ValidationError(
          `El valor '${row[key]}' es invalido, para ${forLine}.`
        );

      month = String(month);
      if (month.length > 2) month = month.substr(0, 2);
      formattedRow.PERIOD = month.padStart(2, '0');
      formattedRow.DMBTR = value;
      formatted.push(Object.assign({}, formattedRow));
    }
  }

  return formatted;
}
