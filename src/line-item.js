var big = require('big.js');

var LineItem = function LineItem(lineItem) {
    this._description = lineItem.description;
    this._amount = big(lineItem.amount);
    this._displayUnit = lineItem.displayUnit;
    this._priceExclTax = big(lineItem.priceExclTax);
    this._taxPercentage = big(lineItem.taxPercentage);

    this._taxAmount = null;
    this._totalExclTax = null;
    this._totalInclTax = null;
    this._taxTotal = null;

    this._calculate();
};

LineItem.prototype._calculate = function() {
    this._taxAmount = this._priceExclTax.times(this._taxPercentage.div(100).plus(1)).minus(this._priceExclTax);
    this._totalExclTax = this._priceExclTax.times(this._amount);
    this._totalInclTax = this._totalExclTax.times(this._taxPercentage.div(100).plus(1));
    this._taxTotal = this._totalInclTax.minus(this._totalExclTax);
};

LineItem.prototype.getDescription = function() {
    return this._description;
};

LineItem.prototype.getAmount = function() {
    return this._amount.toFixed(2);
};

LineItem.prototype.getTaxAmount = function() {
    return this._taxAmount.toFixed(2);
};

LineItem.prototype.getDisplayUnit = function() {
    return this._displayUnit;
};

LineItem.prototype.getPriceExclTax = function() {
    return this._priceExclTax.toFixed(2);
};

LineItem.prototype.getTaxPercentage = function() {
    return this._taxPercentage.toFixed(2);
};

LineItem.prototype.getTotalExclTax = function() {
    return this._totalExclTax.toFixed(2);
};

LineItem.prototype.getTotalInclTax = function() {
    return this._totalInclTax.toFixed(2);
};

LineItem.prototype.getTaxTotal = function() {
    return this._taxTotal.toFixed(2);
};

exports.LineItem = LineItem;
