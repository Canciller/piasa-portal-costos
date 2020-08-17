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
            this._setMode('normal');
          }, this);

        this._oTable = this.byId('users');
        this._oTable.attachRowSelectionChange(this._onRowSelectionChange, this);
      },

      /**
       * Changes the current mode of all the table.
       * Currently normal mode is the only one implemented.
       * @param {string} mode
       */
      _setMode: function (mode) {
        const oColumns = this._oTable.getColumns();
        const count = oColumns.length;

        if (this._hasRowActionsColumn) {
          this._hasRowActionsColumn = false;
          this._oTable.removeColumn(count - 1); // Delete RowActions Column
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

      /**
       * Returns row actions for normal mode.
       */
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

      /**
       * Returns row actions for edit mode.
       * @param {any} savedState - Pass state to callbacks
       */
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

      /**
       * Returns the base action handler binded
       * to an especific action callback.
       * @param {Function} actionCallback
       */
      _defaultActionHandler: function (actionCallback, savedState) {
        return function (oEvent) {
          this._handleAction.bind(this, oEvent, actionCallback, savedState)();
        }.bind(this);
      },

      /**
       * Base action press callback.
       * @param {Object} oEvent
       * @param {Function} actionCallback
       */
      _handleAction: function (oEvent, actionCallback, savedState) {
        // Fist parent is HBox, HBox parent is Row.
        var oHBox = oEvent.getSource().getParent();
        var oRow = oHBox.getParent();

        var contextPath = oRow.getBindingContext('users').getPath();

        actionCallback.bind(this, oRow, oHBox, contextPath, savedState)();
      },

      /**
       * Edit action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
       */
      _handleEdit: function (oRow, oHBox, contextPath) {
        var user = this._oUserModel.getProperty(contextPath);
        var copyUser = JSON.parse(JSON.stringify(user));

        this._oUserModel.setProperty(contextPath + '/editable', true);
        this._loadEditModeActions(oHBox, copyUser);
      },

      /**
       * Delete action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
       */
      _handleDelete: function (oRow, oHBox, contextPath) {
        var index = parseInt(contextPath.slice(-1));
        var username = this._oUserModel.getProperty(contextPath + '/username');
        var users = this._oUserModel.getProperty('/users');

        MessageBox.confirm(
          `Estas seguro de que quieres eliminar a '${username}'`,
          {
            onClose: function (sAction) {
              switch (sAction) {
                case MessageBox.Action.OK:
                  UserService.deleteUser(username)
                    .then(() => {
                      users.splice(index, 1);
                      this._oUserModel.setProperty('/users', users);
                      this._oUserModel.refresh();

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

      /**
       * Cancel action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
       * @param {Object} copyUser - Passed from savedState in edit row mode.
       */
      _handleCancel: function (oRow, oHBox, contextPath, copyUser) {
        copyUser.editable = false;
        this._oUserModel.setProperty(contextPath, copyUser);
        this._loadNormalModeActions(oHBox);
      },

      /**
       * Save action press callback.
       * @param {Row} oRow
       * @param {HBox} oHBox
       * @param {string} contextPath
       * @param {Object} copyUser - Passed from savedState in edit row mode.
       */
      _handleSave: function (oRow, oHBox, contextPath, copyUser) {
        var user = this._oUserModel.getProperty(contextPath);

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
      },
      handleCreate: function () {
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
      _populateTable: function () {
        return UserService.getAll().catch((error) => {
          // TODO: Add better error handling.
          MessageToast.show(error.message);
        });
      },
    });
  }
);
