sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/table/Column',
    'sap/m/Button',
    'sap/m/HBox',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    '../../../service/UserService',
  ],
  function (
    BaseController,
    ToolHeader,
    Column,
    Button,
    HBox,
    MessageBox,
    MessageToast,
    UserService
  ) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.AdminLaunchpad.controller', {
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
        this._oTable.setEnableBusyIndicator(true);
        return UserService.getAll()
          .catch((error) => {
            // TODO: Change error toast style.
            MessageToast.show(error.message);
          })
          .then(() => {
            this._oTable.setEnableBusyIndicator(false);
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
            .catch((error) => {
              MessageBox.error(error.message, {
                styleClass: 'manageUsersError',
              });
            });
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
            .catch((error) => {
              MessageBox.error(error.message, {
                styleClass: 'manageUsersError',
              });
            });
        }
      },
      /*
       * Changes the current mode of all the table.
       * Currently normal mode is the only one implemented.
       * @param {string} mode
      _setMode: function (mode) {
        const oColumns = this._oTable.getColumns();
        const count = oColumns.length;

        if (this._hasRowActionsColumn) {
          this._hasRowActionsColumn = false;
          // This only works when table has fixed columns.
          this._oTable.removeColumn(count - 1); // Delete RowActions Column.
        }

        var rowActions;

        try {
          switch (mode) {
            case 'edit': // TODO: Maybe implement this later.
              break;
            default:
              // Normal mode
              rowActions = this._getNormalModeRowActions();
              break;
          }
          this._oTable.addColumn(
            new Column({
              width: '5.5rem',
              template: new HBox({
                items: rowActions,
              }),
            })
          );
          this._hasRowActionsColumn = true;
        } catch (error) {
          // TODO: Handle error.
          console.error(error);
        }
      },

       * Returns row actions for normal mode.
      _getNormalModeRowActions: function () {
        var oEditButton = new Button({
          tooltip: 'Editar',
          icon: 'sap-icon://edit',
          press: this._defaultActionHandler(this._handleEdit),
        });
        var oDeleteButton = new Button({
          tooltip: 'Eliminar',
          icon: 'sap-icon://delete',
          type: 'Reject',
          press: this._defaultActionHandler(this._handleDelete),
        });

        oEditButton.addStyleClass('tableActionButton');
        oDeleteButton.addStyleClass('tableActionButton');

        return [oEditButton, oDeleteButton];
      },

       * Returns row actions for edit mode.
       * @param {any} savedState - Pass state to callbacks
      _getEditModeRowActions: function (savedState) {
        var oCancelButton = new Button({
          tooltip: 'Cancelar',
          icon: 'sap-icon://cancel',
          type: 'Reject',
          press: this._defaultActionHandler(this._handleCancel, savedState),
        });
        var oSaveButton = new Button({
          tooltip: 'Guardar',
          icon: 'sap-icon://save',
          press: this._defaultActionHandler(this._handleSave, savedState),
        });

        oSaveButton.addStyleClass('tableActionButton');
        oCancelButton.addStyleClass('tableActionButton');

        return [oCancelButton, oSaveButton];
      },

       * Returns the base action handler binded
       * to an especific action callback.
       * @param {Function} actionCallback
      _defaultActionHandler: function (actionCallback, savedState) {
        return function (oEvent) {
          this._handleAction.bind(this, oEvent, actionCallback, savedState)();
        }.bind(this);
      },

       * Base action press callback.
       * @param {Object} oEvent
       * @param {Function} actionCallback
      _handleAction: function (oEvent, actionCallback, savedState) {
        // Fist parent is HBox, HBox parent is Row.
        var oHBox = oEvent.getSource().getParent();
        var oRow = oHBox.getParent();

        var contextPath = oRow.getBindingContext('users').getPath();

        actionCallback.bind(this, oRow, oHBox, contextPath, savedState)();
      },

       * Edit action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
      _handleEdit: function (oRow, oHBox, contextPath) {
        var user = this._oUserModel.getProperty(contextPath);
        var copyUser = JSON.parse(JSON.stringify(user));

        this._oUserModel.setProperty(contextPath + '/editable', true);
        this._loadEditModeActions(oHBox, copyUser);
      },

       * Delete action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
      _handleDelete: function (oRow, oHBox, contextPath) {
        var index = parseInt(contextPath.slice(-1));
        var username = this._oUserModel.getProperty(contextPath + '/username');
        var users = this._oUserModel.getProperty('/users');

        var spliceUser = function () {
          users.splice(index, 1);
          this._oUserModel.setProperty('/users', users);
          this._oUserModel.refresh();
        }.bind(this);

        if (users[index].new) {
          this._newFinished = true;
          spliceUser();
          return;
        }

        MessageBox.confirm(
          `Estas seguro de que quieres eliminar a '${username}'`,
          {
            onClose: function (sAction) {
              switch (sAction) {
                case MessageBox.Action.OK:
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
                  break;
                default:
                  break;
              }
            }.bind(this),
          }
        );
      },

       * Cancel action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
       * @param {Object} copyUser - Passed from savedState in edit row mode.
      _handleCancel: function (oRow, oHBox, contextPath, copyUser) {
        var user = this._oUserModel.getProperty(contextPath);
        if (user.new) {
          this._setMode('normal');
          this._handleDelete(oRow, oHBox, contextPath);
          this._newFinished = true;
        } else {
          copyUser.editable = false;
          this._oUserModel.setProperty(contextPath, copyUser);
          this._loadNormalModeActions(oHBox);
        }
      },

       * Save action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
       * @param {Object} copyUser - Passed from savedState in edit row mode.
      _handleSave: function (oRow, oHBox, contextPath, copyUser) {
        var user = this._oUserModel.getProperty(contextPath);

        if (user.new) {
          UserService.createUser(user)
            .then((createdUser) => {
              createdUser.editable = false;
              this._oUserModel.setProperty(contextPath, createdUser);
              this._loadNormalModeActions(oHBox);
              this._newFinished = true;
              MessageToast.show(
                `El usuario '${createdUser.username}' fue creado exitosamente.`
              );
            })
            .catch((error) => {
              MessageBox.error(error.message, {
                styleClass: 'manageUsersError',
              });
            });
        } else {
          UserService.updateUser(user.username, user)
            .then((updatedUser) => {
              updatedUser.editable = false;
              this._oUserModel.setProperty(contextPath, updatedUser);
              this._loadNormalModeActions(oHBox);
              MessageToast.show(
                `Informacion de usuario '${user.username}' actualizada.`
              );
            })
            .catch((error) => {
              MessageBox.error(error.message, {
                styleClass: 'manageUsersError',
              });
            });
        }
      },
      handleCreate: function () {
        var oRow = this._oTable.getRows()[0];
        var oCells = oRow.getCells();

        var giveFocus = function() {
          // Give focus to first cell.
          oCells[0].focus();
        };

        if (this._newFinished !== undefined && this._newFinished === false) {
          giveFocus();
          MessageToast.show('Solo se puede crear un usuario a la vez.');
          return;
        }

        var users = this._oUserModel.getProperty('/users');
        users.unshift({
          username: '',
          email: '',
          name: '',
          role: 'U',
          isActive: true,
          updatedAt: new Date(),
          createdAt: new Date(),
          new: true, // This is used to distinguish between a save or update operation.
        });
        this._oUserModel.setProperty('/users', users);
        this._newFinished = false;

        oCells.forEach((oCell) => {
          if (oCell.setEditable) oCell.setEditable(true);
        });
        giveFocus();

        // This only works if table columns are fixed.
        var rowActionsCellIndex = oCells.length - 1;
        var oHBox = oCells[rowActionsCellIndex];

        this._handleEdit(oRow, oHBox, '/users/0');
      },
      handleRefresh: function () {
        this._populateTable();
        this._setMode('normal');
      },
      _loadNormalModeActions: function (oHBox) {
        oHBox.destroyItems();
        var actions = this._getNormalModeRowActions();
        actions.forEach((action) => oHBox.addItem(action));
      },
      _loadEditModeActions: function (oHBox, savedData) {
        oHBox.destroyItems();
        var actions = this._getEditModeRowActions(savedData);
        actions.forEach((action) => oHBox.addItem(action));
      },
      */
    });
  }
);
