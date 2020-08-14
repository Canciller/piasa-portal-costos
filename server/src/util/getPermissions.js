const permissions = {
  A: {
    users: {
      create: true,
      write: true,
      read: true,
      delete: true,
    },
  },
  M: {
    users: {
      read: true,
    },
  },
};

/**
 * Get permissions for role in collection.
 * @param {string} collection
 * @param {string} role
 */
export default function (collection, role) {
  var r = permissions[role];
  if (r === undefined) return null;

  var coll = r[collection];
  if (coll === undefined) return null;

  return coll;
}
