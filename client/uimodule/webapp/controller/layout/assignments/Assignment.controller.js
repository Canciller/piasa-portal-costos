sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/Sorter',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel',
    '../../../service/AssignmentService',
    '../../../service/UserService',
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    MessageToast,
    JSONModel,
    AssignmentService,
    UserService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.layout.assignments.Assignment.controller',
      {
        onInit: function () {
          this.oView = this.getView();
          this._bDescendingSort = false;
          this.oAssignmentsTable = this.oView.byId('assignmentsTable');
        },
        onSearch: function (oEvent) {
          var oTableSearchState = [],
            sQuery = oEvent.getParameter('query');

          if (sQuery && sQuery.length > 0) {
            oTableSearchState = [
              new Filter('KOSTL', FilterOperator.Contains, sQuery),
            ];
          }

          this.oAssignmentsTable
            .getBinding('items')
            .filter(oTableSearchState, 'KOSTL');
        },
        onSort: function () {
          this._bDescendingSort = !this._bDescendingSort;
          var oBinding = this.oAssignmentsTable.getBinding('items'),
            oSorter = new Sorter('KOSTL', this._bDescendingSort);

          oBinding.sort(oSorter);
        },
        onRefresh: function () {
          AssignmentService.getAllForCurrentUser();
        },
        onSave: function () {
          AssignmentService.save()
            .then((username) => {
              MessageToast.show(
                `Asignaciones para '${username}' se han guardado exitosamente.`
              );
            })
            .catch((error) => {
              MessageBox.error(error.message, {
                styleClass: 'manageUsersError',
              });
            });
        },
        onSelectionChange: function (oEvent) {
          var selected = oEvent.getParameter('selected');
          var oItems = oEvent.getParameter('listItems');

          oItems.forEach((oItem) => {
            var oContext = oItem.getBindingContext('assignments');
            var path = oContext.getPath();
            AssignmentService.setProperty(path + '/selected', selected);
          });
        },
      }
    );
  }
);
