sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/table/RowAction',
    'sap/ui/table/RowActionItem',
    'sap/ui/table/RowSettings',
    'sap/ui/table/Column',
    'sap/m/Label',
    'sap/m/Button',
    'sap/m/HBox',
    '../../../service/UserService',
  ],
  function (
    BaseController,
    ToolHeader,
    RowAction,
    RowActionItem,
    RowSettings,
    Column,
    Label,
    Button,
    HBox,
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
          }, this);

        this._oTable = this.byId('users');
        this._oTable.attachRowSelectionChange(this._onRowSelectionChange, this);

        var oHBox = new HBox();
        this._oTable.addColumn(
          new Column({
            id: 'rowActions',
            width: '5.5rem',
            template: oHBox,
          })
        );
        this._setMainRowActionTemplate(oHBox);
      },
      // TODO: Call this function when sorting or filtering table, and cancel all changes.
      _setMainRowActionTemplate: function (oHBox) {
        var oEditButton = new Button({
          tooltip: 'Editar',
          icon: 'sap-icon://edit',
          press: this._handleActionEdit.bind(this),
        });
        var oDeleteButton = new Button({
          tooltip: 'Eliminar',
          icon: 'sap-icon://delete',
          press: this._handleActionDelete.bind(this),
          type: 'Reject',
        });

        oEditButton.addStyleClass('tableActionButton');
        oDeleteButton.addStyleClass('tableActionButton');

        oHBox.removeAllItems();
        oHBox.addItem(oEditButton);
        oHBox.addItem(oDeleteButton);
      },
      _setEditModeRowActionTemplate: function (
        oHBox,
        userCopy,
        bindingContextPath
      ) {
        var oSaveButton = new Button({
          tooltip: 'Guardar',
          icon: 'sap-icon://save',
          press: function (oEvent) {
            return this._handleActionSave.bind(
              this,
              oEvent,
              userCopy,
              bindingContextPath
            )();
          }.bind(this),
        });
        var oCancelButton = new Button({
          tooltip: 'Cancelar',
          icon: 'sap-icon://cancel',
          type: 'Reject',
          press: function (oEvent) {
            return this._handleActionCancel.bind(
              this,
              oEvent,
              userCopy,
              bindingContextPath
            )();
          }.bind(this),
        });

        oSaveButton.addStyleClass('tableActionButton');
        oCancelButton.addStyleClass('tableActionButton');

        oHBox.removeAllItems();
        oHBox.addItem(oCancelButton);
        oHBox.addItem(oSaveButton);
      },
      _onRowSelectionChange: function (oEvent) {
        var index = oEvent.getParameter('rowIndex');
      },
      _handleActionEdit: function (oEvent) {
        // Fist parent is HBox, HBox parent is Row.
        var oHBox = oEvent.getSource().getParent();
        var oRow = oHBox.getParent();
        var user = this._oUserModel.getProperty(
          '',
          oRow.getBindingContext('users')
        );

        var copyUser = JSON.parse(JSON.stringify(user));

        var oCells = oRow.getCells();
        oCells.forEach((oCell) => {
          if (oCell.setEditable) oCell.setEditable(true);
        });

        this._setEditModeRowActionTemplate(
          oHBox,
          copyUser,
          oRow.getBindingContext('users').getPath()
        );
      },
      _handleActionDelete: function (oEvent) {
        // Fist parent is HBox, HBox parent is Row.
        var oHBox = oEvent.getSource().getParent();
        var oRow = oHBox.getParent();
        var path = oRow.getBindingContext('users').getPath();
        this._oUserModel.setProperty(path, null);
        this._oUserModel.refresh();
      },
      _handleActionCancel: function (oEvent, userCopy, contextPath) {
        // Fist parent is HBox, HBox parent is Row.
        var oHBox = oEvent.getSource().getParent();
        var oRow = oHBox.getParent();
        this._oUserModel.setProperty(contextPath, userCopy);

        var oCells = oRow.getCells();
        oCells.forEach((oCell) => {
          if (oCell.setEditable) oCell.setEditable(false);
        });

        this._setMainRowActionTemplate(oHBox);
      },
      _handleActionSave: function (oEvent, userCopy, contextPath) {
        // Fist parent is HBox, HBox parent is Row.
        var oHBox = oEvent.getSource().getParent();
        var oRow = oHBox.getParent();

        var user = this._oUserModel.getProperty(contextPath);

        console.log('SAVING USER....');
        UserService.updateUser(userCopy.username, user)
          .then((user) => {
            this._oUserModel.setProperty(contextPath, user);
            console.log('USER SAVED');
          })
          .catch((err) => {
            this._oUserModel.setProperty(contextPath, userCopy);
            console.log('ERROR SAVIN USER...');
          });

        var oCells = oRow.getCells();
        oCells.forEach((oCell) => {
          if (oCell.setEditable) oCell.setEditable(false);
        });

        this._setMainRowActionTemplate(oHBox);
      },
      _populateTable: function () {
        UserService.getAll().catch((err) => {
          // TODO: Handle error.
          console.error(err);
        });
      },
    });
  }
);
