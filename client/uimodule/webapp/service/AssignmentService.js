sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel', './UserService'], function (
  APIService,
  JSONModel,
  UserService
) {
  'use strict';

  var AssignmentService = APIService.extend(
    'com.piasa.Costos.AssignmentService',
    {
      constructor: function () {
        this.setBaseUrl('/api/v1/assignments');
        this.setModel(
          new JSONModel({
            assignments: {},
            user: {
              loading: true,
            },
            subtitle: '',
          })
        );
      },
      setFormattedUser: function (user) {
        this.setProperty(
          '/subtitle',
          `
          <p>
            <strong>Usuario: </strong> ${user.username}
          </p>
          <p>
            <strong>Email: </strong> ${user.email}
          </p>
        `
        );
      },
      clearFormattedUser: function () {
        this.setProperty('/subtitle', '');
      },
      getUsername: function () {
        return this.getProperty('/user/username');
      },
      setCurrentUserAndGetAll: async function (user) {
        UserService.setProperty('/user', user);
        UserService.setProperty('/user/loading', false);
        return this.getAllForCurrentUser(false);
      },
      getAllForCurrentUser: async function (fetchUser = true) {
        try {
          var user = UserService.getProperty('/user');
          var username = user.username;

          if (username) {
            this.setProperty('/loading', true);
            this.setFormattedUser(user);

            if (fetchUser) UserService.get(username);

            var all = await this.api(`/${username}/all`).get();
            this.setProperty('/assignments', all);
          }
        } catch (error) {
          this.setProperty('/assignments', []);
          UserService.setProperty('/user', {});
          this.clearFormattedUser();
          throw error;
        } finally {
          //this.model.refresh(true);
          this.setProperty('/loading', false);
        }
      },
      save: async function () {
        var username = this.getUsername();
        if (!username) throw new Error('No hay ningun usuario seleccionado.');

        var assignments = this.getProperty('/assignments');
        var remove = [],
          create = [];

        this.setProperty('/loading', true);

        try {
          assignments.forEach((assignment) => {
            if (assignment.username === undefined) {
              if (assignment.selected) {
                create.push({
                  username: username,
                  kostl: assignment.KOSTL,
                });
                //assignment.username = username;
              }
            } else {
              if (assignment.selected !== undefined && !assignment.selected) {
                remove.push({
                  username: username,
                  kostl: assignment.KOSTL,
                });
                //assignment.username = undefined;
              }
            }
          });

          if (create.length > 0) await this.api('/link').post(create);
          if (remove.length > 0) await this.api('/unlink').post(remove);

          if (create.length > 0 || remove.length > 0) await this.get();

          return username;
        } catch (error) {
          throw error;
        } finally {
          this.setProperty('/loading', false);
        }
      },
    }
  );

  return new AssignmentService();
});
