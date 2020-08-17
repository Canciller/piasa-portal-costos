sap.ui.define(['./APIService'], function (APIService) {
  'use strict';

  var UserService = APIService.extend('com.piasa.Costos.AuthService', {
    _setUsers: function (users) {
      users.forEach((user) => (user.edit = false));
      this.model.setProperty('/users', users);
    },
    _clearUsers: function () {
      this.model.setProperty('/users', []);
    },
    clearAddedUsers: function () {
      this.model.setProperty('/update', []);
      this.model.setProperty('/delete', []);
      this.model.setProperty('/create', []);
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
    saveChanges: function () {
      // TODO: Save changes to server.
    },
    addUser: function (user) {
      var users = this.model.getProperty('/users');
      users.push(user);
    },
    addToUpdate: function (username, user) {
      var users = this.model.getProperty('/update');
      users.push({
        username: username,
        data: user,
      });
    },
    addToDelete: function (username) {
      var users = this.model.getProperty('/delete');
      users.push(username);
    },
    addToCreate: function (user) {
      var users = this.model.getProperty('/create');
      users.push(user);
    },
    updateUser: async function (username, user) {
      try {
        // TODO: Improve this on the server side.
        // TODO: Change this, please.
        var updatedUser = await this.api(`/${username}`).put(user);
        var newUsername = user.username || username;
        var isActive = await this.api(`/${newUsername}/${user.isActive ? 'activate' : 'deactivate'}`).get();
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
