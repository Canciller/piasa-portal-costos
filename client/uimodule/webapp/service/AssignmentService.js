sap.ui.define(
  ['./APIService', 'sap/ui/model/json/JSONModel', './UserService'],
  function (APIService, JSONModel, UserService) {
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
          this._onSave = [];
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
        getAssignments: function () {
          return this.getProperty('/assignments');
        },
        setAssignments: function (assignments) {
          this.setProperty('/assignments', assignments);
        },
        getUsername: function () {
          return UserService.getProperty('/user/username');
        },
        getStatus: function (selected, withUsername) {
          if (withUsername && !selected) return sap.ui.core.MessageType.Error;
          else if (withUsername && selected)
            return sap.ui.core.MessageType.Information;
          else if (selected) return sap.ui.core.MessageType.Success;
          else return sap.ui.core.MessageType.None;
        },
        setAllSelected: function (allSelected) {
          this.setProperty('/allSelected', allSelected);
        },
        setSelectedAndStatus: function (path, selected) {
          var assignment = this.getProperty(path);

          if (assignment) {
            assignment.selected = selected;
            assignment.status = this.getStatus(
              selected,
              assignment.username !== undefined
            );
            this.setProperty(path, assignment);
          }
        },
        setAllInitialSelectedAndStatus: function () {
          var assignments = this.getProperty('/assignments');

          var allSelected = true;
          for (var i = assignments.length; i--; ) {
            var assignment = assignments[i];
            if (assignment.username) {
              assignment.selected = true;
              assignment.status = sap.ui.core.MessageType.Information;
            } else {
              assignment.selected = false;
            }

            this.setProperty('/assignments/' + i, assignment);

            allSelected = allSelected && assignment.selected;
          }

          this.setAllSelected(allSelected);
        },
        setCurrentUserAndGetAll: async function (user) {
          UserService.setProperty('/user', user);
          UserService.setProperty('/user/loading', false);
          return this.getAllForCurrentUser();
        },
        getAllForCurrentUser: async function () {
          try {
            var user = UserService.getProperty('/user');
            var username = user.username;

            if (username) {
              this.setProperty('/loading', true);
              this.setFormattedUser(user);

              var assignments = await this.api(`/${username}/all`).get();
              this.setAssignments(assignments);
              //this.setAllInitialSelectedAndStatus();
            }
          } catch (error) {
            this.setAssignments([]);
            throw error;
          } finally {
            this.model.refresh();
            this.setProperty('/loading', false);
            this._callOnChangeAssignmentsCallback();
          }
        },
        getAll: async function () {
          try {
            this.setProperty('/loading', true);

            var user = UserService.getProperty('/user');
            var username = user.username;

            if (username) {
              await UserService.get(username);

              user = UserService.getProperty('/user');
              this.setFormattedUser(user);

              var assignments = await this.api(`/${username}/all`).get();
              this.setAssignments(assignments);
              //this.setAllInitialSelectedAndStatus();
            }
          } catch (error) {
            this.setAssignments([]);
            throw error;
          } finally {
            this.model.refresh();
            this.setProperty('/loading', false);
            this._callOnChangeAssignmentsCallback();
          }
        },
        attachOnSave: function (onSave) {
          if (!onSave) return;
          if (!(onSave instanceof Function)) return;

          this._onSave.push(onSave);
        },
        save: async function () {
          var username = this.getUsername();
          if (!username) throw new Error('No hay ningun usuario seleccionado.');

          var assignments = this.getProperty('/assignments');
          var remove = [],
            create = [];

          this.setProperty('/loading', true);

          try {
            for (var i = assignments.length; i--; ) {
              var assignment = assignments[i];
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
            }

            // TODO: Create a single api call for this.
            if (create.length > 0) await this.api('/link').post(create);
            if (remove.length > 0) await this.api('/unlink').post(remove);

            if (create.length > 0 || remove.length > 0)
              await this.getAllForCurrentUser();

            for (var i = this._onSave.length; i--; ) this._onSave[i]();

            return username;
          } catch (error) {
            throw error;
          } finally {
            this.setProperty('/loading', false);
          }
        },
        setOnChangeAssignmentsCallback: function (onChange) {
          this._onChangeAssignmentsCallback = onChange;
        },
        _callOnChangeAssignmentsCallback: function () {
          if (this._onChangeAssignmentsCallback instanceof Function)
            this._onChangeAssignmentsCallback();
        },
      }
    );

    return new AssignmentService();
  }
);
