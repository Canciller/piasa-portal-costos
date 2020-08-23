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
    login: function (username, password) {
      return this.api('/login')
        .post({
          username: username,
          password: password,
        })
        .then((user) => {
          this._setUser(user);
          return user;
        })
        .catch((error) => {
          this._clearUser();
          throw error;
        });
    },
    logout: function () {
      return this.api('/logout').get()
        .catch(error => {
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
