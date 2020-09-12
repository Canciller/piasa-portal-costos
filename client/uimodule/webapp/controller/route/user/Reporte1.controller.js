sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/ReporteBase.controller',
    'sap/ui/export/SpreadSheet',
    'sap/m/MessageBox',
    "sap/ui/core/util/MockServer",
	  "sap/ui/model/odata/v4/ODataModel",
    '../../../service/AuthService',
    '../../../service/AssignmentService',
    '../../../service/Reporte1Service',
    '../../../service/Reporte1DetailService',
  ],
  function (
    ReporteController,
    SpreadSheet,
    MessageBox,
    MockServer,
    ODataModel, 
    AuthService,
    AssignmentService,
    Reporte1Service,
    Reporte1DetailService
  ) {
    'use strict';

    return ReporteController.extend(
      'com.piasa.Costos.route.manager.Reporte1.controller',
      {
        onInit: function () {
          var createMockServer = function() {
            var data = Reporte1Service.getProperty('/data');

            if(!this.oMockServer) {
              this.oMockServer = new MockServer({
                rootUri : '/'
              });

              this.oMockServer.simulate('../../../service/metadata/metadata.xml', {
                sMockdataBaseUrl: '../../../service/metadata',
	              bGenerateMissingMockData : true
              });

              this.oMockServer.start();
            }

            for(var i = data.length; i--;) {
              data[i]['ID'] = i;
              data[i]['__metadata'] = {
                id: `/R1(${i})`, type: 'Reporte.Models.R1Type', uri: `/R1(${i})`
              }
            }
            this.oMockServer.setEntitySetData('R1', data);

            if(!this.oModel) {
              this.oModel = new ODataModel({
                serviceUrl: '/',
                synchronizationMode: 'None'
              });
              //this.oModel.setDefaultCountMode("Inline");
              //this.oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.Request);
              this.setModel(this.oModel);
              //var oTable = this.byId('table');
              //oTable.setModel(this.oModel);
              /*
              oTable.bindRows({
                path: '/R1'
              });
              */
            }

            this.oModel.refresh();
          }.bind(this);

          this.getRouter()
            .getRoute('reporte_1')
            .attachMatched(async function () {
              if (!Reporte1Service.fromDetail()) await this.onDisplay();
              Reporte1Service.setFromDetail(false);
            }, this);

          this.setService(Reporte1Service);
          ReporteController.prototype.onInit.call(this);

          AssignmentService.attachOnSave(
            function () {
              this.disableAll();
            }.bind(this)
          );

          this.setupTableCellClick();
          this.setupExport();
          this.attachOnReady(
            async function () {
              if(this.isLoading()) Reporte1Service.abort();
              else {
                await Reporte1Service.fillReporte();
              }
            }.bind(this)
          );
          this.attachOnExport(this.handleExport.bind(this));
        },
        setupExport: function () {
          var aColumns = [
            {
              label: 'Tipo de Gasto',
              property: 'DESC2',
            },
            {
              label: 'Cuenta Monthly Package Manual',
              property: 'DESC1_',
            },
            {
              label: 'Real',
              property: 'Actual_CY',
              type: 'Number',
            },
            {
              label: 'Presupuesto',
              property: 'Budget_CY',
              type: 'Number',
            },
            {
              label: 'Real AA',
              property: 'Actual_LY',
              type: 'Number',
            },
            {
              label: 'Presupuesto AA',
              property: 'Budget_LY',
              type: 'Number',
            },
            {
              label: 'Var.$ Real vs Ppto',
              property: 'Var_vs_Ppto_CY',
              type: 'Number',
            },
            {
              label: 'Var.% Real vs Ppto',
              property: 'Percentage_1_CY',
              type: 'Number',
            },
            {
              label: 'Var.$ Real vs Real AA',
              property: 'Var_vs_AA_CY',
              type: 'Number',
            },
            {
              label: 'Var.% Real vs Real AA',
              property: 'Percentage_2_CY',
              type: 'Number',
            },
            {
              label: 'Actual Acumulado',
              property: 'Actual_Accum_CY',
              type: 'Number',
            },
            {
              label: 'Presupuesto Acumulado',
              property: 'Budget_Accum_CY',
              type: 'Number',
            },
            {
              label: 'Real Acumulado AA',
              property: 'Actual_Accum_LY',
              type: 'Number',
            },
            {
              label: 'Presupuesto Acumulado AA',
              property: 'Budget_Accum_LY',
              type: 'Number',
            },
            {
              label: 'Var.$ Real Acumulado vs Ppto Acumulado',
              property: 'Var_vs_Ppto_LY',
              type: 'Number',
            },
            {
              label: 'Var.% Real Acumulado vs Ppto Acumulado',
              property: 'Percentage_1_LY',
              type: 'Number',
            },
            {
              label: 'Var.$ Real Acumulado vs Real Acumulado AA',
              property: 'Var_vs_AA_LY',
              type: 'Number',
            },
            {
              label: 'Var.% Real Acumulado vs Real Acumulado AA',
              property: 'Percentage_2_LY',
              type: 'Number',
            },
          ];

          this._mSettings = {
            workbook: {
              columns: aColumns,
            },
          };
        },
        setupTableCellClick: function () {
          var oTable = this.byId('table'),
            aColumns = oTable.getColumns();

          oTable.attachBrowserEvent(
            'dblclick',
            async function () {
              var selected = this._selected;
              if (!selected) return;

              var oBindingContext = selected.rowBindingContext;
              if (!oBindingContext) return;

              var columnIndex = parseInt(selected.columnIndex),
                oColumn = aColumns[columnIndex];

              var path = oBindingContext.getPath(),
                key = oColumn.getSortProperty();

              var route = 'reporte1_real';

              var isBudget = false,
                isLastYear = false,
                desc1 = Reporte1Service.getProperty(path + '/DESC1'),
                desc2 = Reporte1Service.getProperty(path + '/DESC2');

              if(!desc1) return;

              switch (key) {
                case 'Actual_CY':
                  break;
                case 'Budget_CY':
                  route = 'reporte1_presupuesto';
                  isBudget = true;
                  break;
                case 'Actual_LY':
                  isLastYear = true;
                  break;
                case 'Budget_LY':
                  route = 'reporte1_presupuesto';
                  isLastYear = true;
                  isBudget = true;
                  break;
                default:
                  return;
              }

              Reporte1Service.setDESC2(desc2);
              Reporte1Service.setDESC1(desc1);
              Reporte1Service.setProperty('/isBudget', isBudget);
              Reporte1Service.setProperty('/isLastYear', isLastYear);
              Reporte1Service.setProperty('/fromReporte', true);

              this.navTo(route);
            }.bind(this)
          );
        },
        onCellClick: function (oEvent) {
          this._selected = oEvent.getParameters();
        },
        handleExport: async function () {
          var data = Reporte1Service.getProperty('/data'),
            date = Reporte1Service.getDate();

          var year = date.year,
            month = date.month;

          var name = `Costos Sumarizado ${year}.${month}`;
          this._mSettings.fileName = name + '.xlsx';
          this._mSettings.dataSource = data;
          this._mSettings.workbook.context = {
            sheetName: `${year}-${month}`,
          };
          var oSpreadsheet = new SpreadSheet(this._mSettings);
          oSpreadsheet.build();
        },
      }
    );
  }
);
