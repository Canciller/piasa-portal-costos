export default function (res) {
  return (
    res &&
    Array.isArray(res.rowsAffected) &&
    res.rowsAffected.length > 0 &&
    res.rowsAffected[0] !== 0
  );
}
