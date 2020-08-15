sap.ui.define(['sap/ui/base/Object'], function (BaseObject) {
  'use strict';

  var roles = {
    A: {
      key: 'A',
      name: 'Administrador',
      permissions: {
        users: {
          all: true,
        },
      },
    },
    M: {
      key: 'A',
      name: 'Manager',
      permissions: {
        users: {
          read: true,
        },
      },
    },
    U: {
      key: 'U',
      name: 'Usuario',
      permissions: {
        users: {},
      },
    },
  };

  // TODO: Get roles from server.

  var RoleService = BaseObject.extend('com.piasa.Costos.RoleService', {
    getRole: function (role) {
      return new Promise(function (resolve, reject) {
        var data = roles[role];
        if (data) resolve(data);
        else reject(new Error('Unknown role'));
      });
    },
    getRoleName: function (role) {
      return this.getRole(role).then((data) => data.name);
    },
    getPermissions: function (role) {
      return this.getRole(role).then((data) => data.permissions);
    },
  });

  return new RoleService();
});
