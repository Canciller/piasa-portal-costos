sap.ui.define(['./APIService'], function (APIService) {
  'use strict';

  var UserService = APIService.extend('com.piasa.Costos.UserService', {
    _setUsers: function (users) {
      users.forEach((user) => {
        user.editable = false;
        this._setDates(user);
      });
      this.model.setProperty('/users', users);
    },
    _clearUsers: function () {
      this.model.setProperty('/users', []);
    },
    _setDates: function (user) {
      // TODO: Fix this on server side.
      user.createdAt = new Date(user.createdAt);
      user.updatedAt = new Date(user.updatedAt);
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
    getAll: async function () {
      try {
        var users = await this.api().get();
        this._setUsers(users);
        return users;
      } catch (error) {
        this._clearUsers();
        throw error;
      }
    },
    deleteUser: async function (username) {
      try {
        await this.api(`/${username}`).delete();
      } catch (error) {
        throw error;
      }
    },
    createUser: async function (user) {
      try {
        var createdUser = await this.api().post(user);
        this._setDates(createdUser);

        return createdUser;
      } catch (error) {
        throw error;
      }
    },
    updateUser: async function (username, user) {
      try {
        var updatedUser = await this.api(`/${username}`).put(user);
        this._setDates(updatedUser);

        return updatedUser;
      } catch (error) {
        throw error;
      }
    },
  });

  return new UserService();
});
