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
    assignments: {
      create: true,
      write: true,
      read: true,
      delete: true,
    },
    budget: {
      create: true,
      write: true,
      read: true,
      delete: true,
    },
  },
};

/**
 * Get permissions for role in collection.
 * @param {string} collection
 * @param {string} role
 */
export default async function (collection, role) {
  var r = permissions[role];
  if (r === undefined) return null;

  var coll = r[collection];
  if (coll === undefined) return null;

  return coll;
}
