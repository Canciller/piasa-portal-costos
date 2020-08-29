sap.ui.define(['./APIService'], function (APIService) {
  'use strict';

  var AuthService = APIService.extend('com.piasa.Costos.AuthService', {
    _setUser: function (user) {
      this.model.setProperty('/username', user.username);
      this.model.setProperty('/name', user.name);
      this.model.setProperty('/email', user.email);
      this.model.setProperty('/role', user.role);
    },
    _clearUser: function () {
      this.model.setProperty('/username', null);
      this.model.setProperty('/name', null);
      this.model.setProperty('/email', null);
      this.model.setProperty('/role', null);
    },
    changePassword: async function () {
      try {
        this.setProperty('/changingPassword', true);

        var oldPassword = this.getProperty('/oldPassword'),
          newPassword = this.getProperty('/newPassword'),
          newPasswordRepeat = this.getProperty('/newPasswordRepeat');

        if (newPassword !== newPasswordRepeat)
          throw new Error('Las contraseñas no coinciden.');

        await this.api('/change/password').post({
          password: newPassword,
          passwordRepeat: newPasswordRepeat,
          oldPassword: oldPassword,
        });
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/changingPassword', false);
      }
    },
    changeUser: async function () {
      try {
        this.setProperty('/changingUser', true);

        var username = this.getProperty('/username'),
          name = this.getProperty('/name'),
          email = this.getProperty('/email');

        await this.api('/change/user').post({
          username: username,
          name: name,
          email: email,
        });
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/changingUser', false);
      }
    },
    login: async function (username, password) {
      try {
        this.setProperty('/loading', true);

        var user = await this.api('/login').post({
          username: username,
          password: password,
        });

        this._setUser(user);
      } catch (error) {
        this._clearUser();
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
    logout: function () {
      return this.api('/logout')
        .get()
        .catch((error) => {
          throw error;
        });
    },
    me: function () {
      return this.api('/me')
        .get()
        .then((user) => {
          this._setUser(user);
          return user;
        })
        .catch((error) => {
          this._clearUser();
          throw error;
        });
    },
  });

  return new AuthService();
});
