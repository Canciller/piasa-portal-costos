sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/Sorter',
    '../../../service/AssignmentService',
    '../../../service/UserService',
    'sap/f/library',
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    Sorter,
    AssignmentService,
    UserService,
    fioriLibrary
  ) {
    'use strict';

    // TODO: Add refresh button.
    return BaseController.extend(
      'com.piasa.Costos.layout.assignments.Users.controller',
      {
        onInit: function () {
          this.oView = this.getView();
          this._bDescendingSort = false;
          this.oUsersTable = this.oView.byId('usersTable');
        },
        _changeSubtitle: function (user) {
          AssignmentService.setProperty(
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
          UserService.getAll();
        },
        onListItemPress: function (oEvent) {
          var oSource = oEvent.getSource();
          var path = oSource.getBindingContext('users').getPath();
          var user = UserService.getProperty(path);

          var oFCL = this.oView.getParent().getParent();

          oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

          this._changeSubtitle(user);
          AssignmentService.get(user.username, user);
        },
      }
    );
  }
);
