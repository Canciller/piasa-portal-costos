sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    '../../../service/UserService',
    '../../../service/AssignmentService',
  ],
  function (BaseController, ToolHeader, UserService, AssignmentService) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Assignments.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.getRouter()
            .getRoute('assignments')
            .attachMatched(function () {
              UserService.getAll();
              AssignmentService.get();
            }, this);
        },
      }
    );
  }
);
