sap.ui.define(['sap/ui/base/Object'], function (BaseObject) {
  'use strict';

  return BaseObject.extend('com.piasa.Costos.CoreService', {
    constructor: function () {},
    setBaseUrl: function (base) {
      this.base = base;
    },
    setModel: function (model) {
      this.model = model;
    },
    api: function (endpoint) {
      var base = this.base;

      var http = function (method, endpoint, data, options) {
        var op = {};
        if (options) op = options;

        op.body = JSON.stringify(data);
        op.method = method;
        if (method === 'POST' || method === 'PUT') {
          op.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          };
        }

        return fetch(base + endpoint, op)
          .then((res) => res.json())
          .then((json) => {
            if (json.error) throw json.error;
            return json;
          });
      };

      return {
        get: function (options) {
          return http('GET', endpoint, undefined, options);
        },
        post: function (data, options) {
          return http('POST', endpoint, data, options);
        },
        put: function (data, options) {
          return http('PUT', endpoint, data, options);
        },
        delete: function (options) {
          return http('DELETE', endpoint, undefined, options);
        },
      };
    },
  });
});
