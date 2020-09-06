sap.ui.define(['sap/ui/core/format/NumberFormat'], function (NumberFormat) {
  'use strict';

  return function (value) {
    if (!value) value = 0;

    this.removeStyleClass('valueGreen');
    this.removeStyleClass('valueRed');

    if (value > 0)
      this.addStyleClass('valueGreen');
    else if (value < 0)
      this.addStyleClass('valueRed');

    var oCurrencyFormat = NumberFormat.getCurrencyInstance({
      groupingSeparator: ',',
      decimalSeparator: '.',
    });
    var result = oCurrencyFormat.format(value);
    return result;
  };
});
