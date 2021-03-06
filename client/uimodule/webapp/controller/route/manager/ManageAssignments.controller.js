sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/m/MessageBox',
    '../../../service/UserService',
    '../../../service/AssignmentService',
    '../../../service/GroupService',
  ],
  function (
    BaseController,
    ToolHeader,
    MessageBox,
    UserService,
    AssignmentService,
    GroupService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.ManageAssignments.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.getRouter()
            .getRoute('assignments')
            .attachMatched(function () {
              UserService.getAllFiltered()
                .then(() => AssignmentService.getAll())
                .then(() => GroupService.getAll())
                .catch((error) => {
                  MessageBox.error(error.message);
                });
            }, this);
        },
      }
    );
  }
);
