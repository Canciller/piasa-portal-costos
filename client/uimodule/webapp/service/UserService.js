sap.ui.define(['./APIService'], function (APIService) {
  'use strict';

  var UserService = APIService.extend('com.piasa.Costos.AuthService', {
    _setUsers: function (users) {
      users.forEach((user) => {
        user.editable = false;
        // TODO: Fix this on server side.
        user.createdAt = new Date(user.createdAt);
        user.updatedAt = new Date(user.updatedAt);
      });
      this.model.setProperty('/users', users);
    },
    _clearUsers: function () {
      this.model.setProperty('/users', []);
    },
    saveUser: function (username, user) {
      var saved = this.model.getProperty('/saved');
      saved[username] = user;
      this.model.setProperty('/saved', saved);
    },
    getSavedUser: function (username) {
      var saved = this.model.getProperty('/saved/' + username);
      return saved;
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
    deleteUser: async function (username) {
      try {
        await this.api(`/${username}`).delete();
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    createUser: async function (user) {
      try {
        var createdUser = await this.api().post(user);
        // TODO: Fix this on server side.
        createdUser.createdAt = new Date(createdUser.createdAt);
        createdUser.updatedAt = new Date(createdUser.updatedAt);
        return createdUser;
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

        // TODO: Fix this on server side.
        updatedUser.createdAt = new Date(updatedUser.createdAt);
        updatedUser.updatedAt = new Date(updatedUser.updatedAt);

        return updatedUser;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  });

  return new UserService();
});