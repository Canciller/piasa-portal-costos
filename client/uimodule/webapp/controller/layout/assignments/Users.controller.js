sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/Sorter',
    'sap/m/MessageBox',
    '../../../service/AssignmentService',
    '../../../service/GroupService',
    '../../../service/UserService',
    'sap/f/library',
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    AssignmentService,
    GroupService,
    UserService,
    fioriLibrary
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.layout.assignments.Users.controller',
      {
        onInit: function () {
          this.oView = this.getView();
          this._bDescendingSort = false;
          this.oUsersTable = this.oView.byId('usersTable');
        },
        onSearch: function (oEvent) {
          var oTableSearchState = [],
            sQuery = oEvent.getParameter('query');

          if (sQuery && sQuery.length > 0) {
            oTableSearchState = [
              new Filter('username', FilterOperator.Contains, sQuery),
            ];
          }

          this.oUsersTable
            .getBinding('items')
            .filter(oTableSearchState, 'username');
        },

        onSort: function () {
          this._bDescendingSort = !this._bDescendingSort;
          var oBinding = this.oUsersTable.getBinding('items'),
            oSorter = new Sorter('username', this._bDescendingSort);

          oBinding.sort(oSorter);
        },
        onRefresh: function () {
          UserService.getAllFiltered().catch((error) => {
            MessageBox.error(error.message);
          });
        },
        onListItemPress: function (oEvent) {
          var oSource = oEvent.getSource();
          var path = oSource.getBindingContext('users').getPath();
          var user = UserService.getProperty(path);

          var oFCL = this.oView.getParent().getParent();

          oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

          AssignmentService.setCurrentUserAndGetAll(user)
            .then(() => GroupService.setCurrentUserAndGetAll(user))
            .catch((error) => {
              MessageBox.error(error.message);
              throw error;
            });
        },
      }
    );
  }
);
