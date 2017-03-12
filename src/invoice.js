var big = require('big.js');

var LineItem = require('./line-item').LineItem;

var Invoice = function Invoice(invoice) {
    this._invoice = invoice;

    this._lineItems = [];
    this._totals = {
        exclTax: big(0),
        inclTax: big(0),
        tax: big(0)
    };

    this._processLineItems();
};

Invoice.prototype._processLineItems = function() {
    if (this._invoice.lineItems instanceof Array === false) {
        return;
    }

    this._invoice.lineItems = this._invoice.lineItems.map(function(li) { return new LineItem(li) });
    this._invoice.lineItems.forEach(this._calculateLineItem.bind(this));
};

Invoice.prototype._calculateLineItem = function(lineItem) {
    this._totals.exclTax = this._totals.exclTax.plus(lineItem.getTotalExclTax());
    this._totals.inclTax = this._totals.inclTax.plus(lineItem.getTotalInclTax());
    this._totals.tax = this._totals.tax.plus(lineItem.getTaxTotal());
};

Invoice.prototype.getHeader = function() {
    return this._invoice.company;
};

Invoice.prototype.getLanguage = function() {
    return this._invoice.language;
};

Invoice.prototype.getCurrencySymbol = function() {
    return this._invoice.currencySymbol;
};

Invoice.prototype.getIban = function() {
    return this._invoice.iban;
};

Invoice.prototype.getSwift = function() {
    return this._invoice.swift;
};

Invoice.prototype.getReference = function() {
    return this._invoice.paymentReference;
};

Invoice.prototype.getLineItems = function() {
    return this._invoice.lineItems;
};

Invoice.prototype.getTotalExclTax = function() {
    return this._totals.exclTax.toFixed(2);
};

Invoice.prototype.getTotalInclTax = function() {
    return this._totals.inclTax.toFixed(2);
};

Invoice.prototype.getTaxTotal = function() {
    return this._totals.tax.toFixed(2);
};

Invoice.prototype.getBillingAddress = function() {
    return this._invoice.billingAddress;
};

Invoice.prototype.getFooter = function() {
    return this._invoice.footer;
};

exports.Invoice = Invoice;
