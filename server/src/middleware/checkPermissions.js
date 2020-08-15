import authenticate from '../middleware/authenticate';
import getPermissions from '../util/getPermissions';
import UnauthorizedError from '../util/error/UnauthorizedError';

export default function (collection) {
  return [
    authenticate,
    async function (req, res, next) {
      const role = req.user.role;
      const permissions = await getPermissions(collection, role);
      if (!permissions) return next(new UnauthorizedError());

      var allow = false;

      switch (req.method) {
        case 'POST':
          allow = permissions.create !== undefined;
          break;
        case 'GET':
          allow = permissions.read !== undefined;
          break;
        case 'PUT':
          allow = permissions.write !== undefined;
          break;
        case 'DELETE':
          allow = permissions.delete !== undefined;
          break;
        default:
          break;
      }

      if (!allow) return next(new UnauthorizedError());

      return next(); // Allow
    },
  ];
}
