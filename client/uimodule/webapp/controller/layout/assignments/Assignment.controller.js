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
    AssignmentService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.layout.assignments.Assignment.controller',
      {
        onInit: function () {
          this.oView = this.getView();
          this._bDescendingSort = false;
          this.oAssignmentsTable = this.oView.byId('assignmentsTable');

          AssignmentService.setOnChangeAssignmentsCallback(
            this.verifyAllSelected.bind(this)
          );
        },
        onSort: function () {
          this._bDescendingSort = !this._bDescendingSort;
          var oBinding = this.oAssignmentsTable.getBinding('items'),
            oSorter = new Sorter('KOSTL', this._bDescendingSort);

          oBinding.sort(oSorter);

          this.verifyAllSelected();
        },
        onRefresh: function () {
          const clearSorters = Promise.resolve({
            then: function (onFullfill) {
              this._bDescendingSort = false;
              var oBinding = this.oAssignmentsTable.getBinding('items');
              oBinding.aSorters = null;
              onFullfill();
            }.bind(this),
          });

          clearSorters
            .then(() => AssignmentService.getAll())
            .catch((error) => {
              MessageBox.error(error.message);
            });
        },
        onSelect: function (oEvent) {
          var selected = oEvent.getParameter('selected');
          var oSource = oEvent.getSource();

          var path = oSource.getBindingContext('assignments').getPath();
          AssignmentService.setSelectedAndStatus(path, selected);

          if (!selected) AssignmentService.setAllSelected(false);
          else this.verifyAllSelected();
        },
        onSelectAll: function (oEvent) {
          var selected = oEvent.getParameter('selected');
          this.setAllSelected(selected);
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

          this.verifyAllSelected();
        },
        verifyAllSelected: function () {
          if (!this.oAssignmentsTable) return;

          var oContexts = this.oAssignmentsTable
            .getBinding('items')
            .getCurrentContexts();

          var allSelected = true;
          for (var i = oContexts.length; i--; ) {
            var oContext = oContexts[i],
              path = oContext.getPath();

            var selected = AssignmentService.getProperty(path + '/selected');
            allSelected = allSelected && selected;
          }

          AssignmentService.setAllSelected(allSelected);
        },
        setAllSelected: function (selected) {
          var oContexts = this.oAssignmentsTable
            .getBinding('items')
            .getCurrentContexts();

          for (var i = oContexts.length; i--; ) {
            var oContext = oContexts[i],
              path = oContext.getPath();

            var username = AssignmentService.getProperty(path + '/username');
            var status = AssignmentService.getStatus(
              selected,
              username !== undefined
            );
            AssignmentService.setProperty(path + '/status', status);
            AssignmentService.setProperty(path + '/selected', selected);
          }

          AssignmentService.setAllSelected(selected);
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
        onGrowing: function() {
          this.verifyAllSelected();
        },
      }
    );
  }
);
