sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
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
            link: {},
            unlink: {},
          })
        );
      },
      getUsername: function () {
        return this.getProperty('/username');
      },
      get: async function (username, user) {
        username = username || this.getProperty('/username');
        user = user || this.getProperty('/user');

        try {
          var all = await this.api(`/${username}/all`).get();
          this.setProperty('/assignments', all);
          this.setProperty('/username', username);
          this.setProperty('/user', user);
          this.model.refresh(true);
        } catch (error) {
          this.setProperty('/assignments', []);
          this.setProperty('/username', undefined);
          this.setProperty('/user', undefined);
          this.model.refresh(true);
          throw error;
        }
      },
      save: async function () {
        var username = this.getUsername();
        if (!username) throw new Error('No hay ningun usuario seleccionado.');

        try {
          sap.ui.core.BusyIndicator.show(); // Show busy indicator

          var assignments = this.getProperty('/assignments');
          var remove = [],
            create = [];

          assignments.forEach((assignment) => {
            if (assignment.username === undefined) {
              if (assignment.selected) {
                create.push({
                  username: username,
                  kostl: assignment.KOSTL,
                });
              }
            } else {
              if (assignment.selected !== undefined && !assignment.selected) {
                remove.push({
                  username: username,
                  kostl: assignment.KOSTL,
                });
              }
            }
          });

          await this.api('/link', false).post(create);
          await this.api('/unlink', false).post(remove);

          return username;
        } catch (error) {
          throw error;
        } finally {
          sap.ui.core.BusyIndicator.hide(); // Hide busy indicator on error
        }
      },
    }
  );

  return new AssignmentService();
});
