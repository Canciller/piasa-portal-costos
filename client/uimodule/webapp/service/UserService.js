sap.ui.define(['./APIService'], function (APIService) {
  'use strict';

  var UserService = APIService.extend('com.piasa.Costos.AuthService', {
    _setUsers: function (users) {
      users.forEach((user) => (user.editable = false));
      this.model.setProperty('/users', users);
    },
    _clearUsers: function () {
      this.model.setProperty('/users', []);
    },
    getAll: function () {
      return this.api()
        .get()
        .then((users) => {
          this._setUsers(users);
          return users;
        })
        .catch((error) => {
          this._clearUsers();
          console.log(error);
          throw error;
        });
    },
    addUser: function (user) {
      var users = this.model.getProperty('/users');
      users.push(user);
      this.model.refresh();
    },
    deleteUser: async function (username) {
      try {
        await this.api(`/${username}`).delete();
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateUser: async function (username, user) {
      try {
        // TODO: Improve this on the server side.
        // TODO: Change this, please.
        var updatedUser = await this.api(`/${username}`).put(user);
        var newUsername = user.username || username;
        var isActive = await this.api(
          `/${newUsername}/${user.isActive ? 'activate' : 'deactivate'}`
        ).get();
        updatedUser.isActive = isActive.isActive;
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  });

  return new UserService();
});
