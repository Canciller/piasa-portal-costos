/**
 * Check if database result has affected rows.
 * @param {Object} result
 */
export default function (result) {
  return (
    result &&
    result.rowsAffected &&
    result.rowsAffected.length &&
    result.rowsAffected[0] > 0
  );
}
