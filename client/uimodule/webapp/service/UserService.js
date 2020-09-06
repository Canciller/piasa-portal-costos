sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  var UserService = APIService.extend('com.piasa.Costos.UserService', {
    constructor: function () {
      this.setBaseUrl('/api/v1/users');
      this.setModel(
        new JSONModel({
          user: {},
          users: [],
          saved: {},
        })
      );
    },
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
    get: async function (username) {
      try {
        this.setProperty('/user/loading', true);
        var user = await this.api(`/${username}`).get();
        this.setProperty('/user', user);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/user/loading', false);
      }
    },
    getAll: async function () {
      try {
        this.setProperty('/loading', true);
        var users = await this.api().get();
        this._setUsers(users);
        return users;
      } catch (error) {
        this._clearUsers();
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
    getAllFiltered: async function() {
      try {
        this.setProperty('/loading', true);
        var users = await this.api('/filter').get();
        this._setUsers(users);
        return users;
      } catch(error) {
        this._clearUsers();
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
    deleteUser: async function (username) {
      try {
        this.setProperty('/loading', true);
        await this.api(`/${username}`).delete();
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
    createUser: async function (user) {
      try {
        this.setProperty('/loading', true);
        var createdUser = await this.api().post(user);
        this._setDates(createdUser);

        return createdUser;
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
    updateUser: async function (username, user) {
      try {
        this.setProperty('/loading', true);
        var updatedUser = await this.api(`/${username}`).put(user);
        this._setDates(updatedUser);

        return updatedUser;
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
  });

  return new UserService();
});
