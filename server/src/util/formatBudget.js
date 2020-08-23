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
  return typeof(str) === 'string' && str.length !== 0;
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
      var key = P[j];
      var value = row[key];
      if(!value) throw new ValidationError(`El valor del mes ${month} no esta definido.`);

      formattedRow.PERIOD = String(month).padStart(2, '0');
      formattedRow.DMBTR = value;
      formatted.push(Object.assign({}, formattedRow));
    }
  }

  return formatted;
}
