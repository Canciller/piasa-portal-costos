sap.ui.define(['sap/ui/core/format/NumberFormat'], function (NumberFormat) {
  'use strict';

  return function (value) {
    if (!value) value = 0;

    this.removeStyleClass('valueGreen');
    this.removeStyleClass('valueRed');

    if(value === 0);
    else if (value < 1)
      this.addStyleClass('valueGreen');
    else if (value > 1)
      this.addStyleClass('valueRed');

    var oPercentageFormat = NumberFormat.getPercentInstance({
      decimals: 2,
      groupingSeparator: ',',
      decimalSeparator: '.',
    });
    var result = oPercentageFormat.format(value);
    return result;
  };
});
