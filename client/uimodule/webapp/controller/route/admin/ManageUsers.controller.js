sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    '../../../service/UserService',
  ],
  function (BaseController, ToolHeader, MessageBox, MessageToast, UserService) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.admin.ManageUsers.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this._oUserModel = this.getOwnerComponent().getModel('users');

          this.getRouter()
            .getRoute('users')
            .attachMatched(function () {
              this._populateTable();
              //this._setMode('normal');
            }, this);

          this._oTable = this.byId('users');
        },

        /**
         * Populate table from database.
         */
        _populateTable: function () {
          this._newFinished = true;
          return UserService.getAll().catch((error) => {
            MessageBox.error(error.message);
          });
        },
        handleCreate: function () {
          var oRow = this._oTable.getRows()[0];
          var oCells = oRow.getCells();

          var users = this._oUserModel.getProperty('/users');
          users.unshift({
            username: '',
            email: '',
            name: '',
            role: 'U',
            isActive: true,
            updatedAt: new Date(),
            createdAt: new Date(),
            editable: true,
            new: true, // This is used to distinguish between a save or update operation.
          });

          this._oUserModel.setProperty('/users', users);
          oCells[0].focus(); // Give focus to added row.
        },
        handleRefresh: function () {
          this._populateTable();
        },
        handleEditOrCancel: function (oEvent) {
          var oButton = oEvent.getSource();
          var type = oButton.getType();

          var oRow = oButton.getParent();
          var bindingContextPath = oRow.getBindingContext('users').getPath();

          if (type === 'Default') {
            // Edit
            this._handleEdit.bind(this)(bindingContextPath);
          } else {
            // Cancel
            this._handleCancel.bind(this)(bindingContextPath);
          }
        },
        handleSaveOrDelete: function (oEvent) {
          var oButton = oEvent.getSource();

          var oRow = oButton.getParent();
          var bindingContextPath = oRow.getBindingContext('users').getPath();

          var type = oButton.getType();
          if (type === 'Default') {
            // Save
            this._handleSave.bind(this)(bindingContextPath);
          } else {
            // Remove
            this._handleDelete.bind(this)(bindingContextPath);
          }
        },
        _handleEdit: function (bindingContextPath) {
          // Create a copy of selected user and added to saved.
          var user = this._oUserModel.getProperty(bindingContextPath);
          user = Object.assign({}, user);
          UserService.saveUser(user.username, user);

          this._oUserModel.setProperty(bindingContextPath + '/editable', true);
        },
        _handleDelete: function (bindingContextPath) {
          var index = parseInt(bindingContextPath.slice(-1));
          var username = this._oUserModel.getProperty(
            bindingContextPath + '/username'
          );
          var users = this._oUserModel.getProperty('/users');

          var spliceUser = function () {
            users.splice(index, 1);
            this._oUserModel.setProperty('/users', users);
            this._oUserModel.refresh();
          }.bind(this);

          if (users[index].new) {
            // Delete new user.
            spliceUser();
          } else {
            // Delete existing user.
            MessageBox.confirm(
              `Estas seguro de que quieres eliminar al usuario '${username}'`,
              {
                onClose: function (sAction) {
                  if (sAction === MessageBox.Action.OK) {
                    UserService.deleteUser(username)
                      .then(() => {
                        spliceUser();

                        MessageToast.show(
                          `El usuario '${username}' ha sido eliminado exitosamente.`
                        );
                      })
                      .catch((error) => {
                        MessageBox.error(error.message, {
                          styleClass: 'manageUsersError',
                        });
                      });
                  }
                }.bind(this),
              }
            );
          }
        },
        _handleCancel: function (bindingContextPath) {
          var user = this._oUserModel.getProperty(bindingContextPath);
          if (user.new) {
            this._handleDelete(bindingContextPath);
          } else {
            // Get saved user from edit.
            var savedUser = UserService.getSavedUser(user.username);
            // Create copy of saved user.
            savedUser = Object.assign({}, savedUser);
            // Set previous saved user to undefined.
            UserService.saveUser(user.username, undefined);

            savedUser.editable = false;
            this._oUserModel.setProperty(bindingContextPath, savedUser);
          }
        },
        _handleSave: function (bindingContextPath) {
          var user = this._oUserModel.getProperty(bindingContextPath);

          var showErrorMessage = function (error) {
            var msg = error.message;
            if (error.details)
              error.details.errors.forEach(
                (detail) => (msg += '\n* ' + detail.msg)
              );

            MessageBox.error(msg, {
              styleClass: 'manageUsersError',
            });
          };

          if (user.new) {
            // Create user.
            UserService.createUser(user)
              .then((createdUser) => {
                createdUser.editable = false;
                this._oUserModel.setProperty(bindingContextPath, createdUser);
                MessageToast.show(
                  `El usuario '${createdUser.username}' fue creado exitosamente.`
                );
              })
              .catch(showErrorMessage);
          } else {
            // Update user.
            UserService.updateUser(user.username, user)
              .then((updatedUser) => {
                updatedUser.editable = false;
                this._oUserModel.setProperty(bindingContextPath, updatedUser);
                MessageToast.show(
                  `Informacion de usuario '${user.username}' actualizada.`
                );
              })
              .catch(showErrorMessage);
          }
        },
      }
    );
  }
);
