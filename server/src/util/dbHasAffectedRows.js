/**
 * Check if database result has affected rows.
 * @param {Object} result
 * @param {int} total
 */
export default function (result, total) {
  const hasAffectedRows =
    result &&
    result.rowsAffected &&
    result.rowsAffected.length &&
    result.rowsAffected[0] > 0;

  if (total === undefined) return hasAffectedRows;
  return hasAffectedRows && result.rowsAffected[0] === total;
}
