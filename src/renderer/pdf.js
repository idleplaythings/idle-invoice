var fs = require('fs');
var PDFDocument = require('pdfkit');

var PdfRenderer = function PdfRenderer(translate) {
    this._columns = 10;
    this._translate = translate;
    this.__ = this._translate;
}

PdfRenderer.prototype.render = function(invoice, path) {
    this._reset();
    // this._renderColumns();
    this._renderHeader(invoice);
    this._renderLineItems(invoice);
    this._renderTotals(invoice);
    this._renderFooter(invoice);
    this._writeStream(path);
};

PdfRenderer.prototype._reset = function() {
    this._pdf = new PDFDocument({
        size: [ this.pageWidth(), this.pageHeight() ],
        margin: 0
    });
    this._pdf.y = this.top();

    this._pdf.registerFont('header', 'fonts/arialbd.ttf');
    this._pdf.registerFont('heading', 'fonts/arialbd.ttf');
    this._pdf.registerFont('normal', 'fonts/arial.ttf');
    this._pdf.registerFont('bold', 'fonts/arialbd.ttf');

    this._normalFont();
    this._normalStroke();

};

PdfRenderer.prototype._renderColumns = function() {
    this._debugStroke();

    for (var i=0; i<this._columns; i++) {
        this._saveY();
        this._up(1);
        this._text(i, i + 0.5, 0.5);
        this._restoreY();
        this._pdf
            .moveTo(this._column(i), this.top())
            .lineTo(this._column(i), this.top() + this.contentHeight())
            .stroke();
    }

    this._normalStroke();
};

PdfRenderer.prototype._debugStroke = function() {
    this._pdf.lineWidth(1);
    this._pdf.strokeColor('#ddd');
};

PdfRenderer.prototype._normalStroke = function() {
    this._pdf.lineWidth(0.5);
    this._pdf.strokeColor('#666');
};

PdfRenderer.prototype._renderHeader = function(invoice) {
    this._title();
    this._header();
    this._down(2);
    this._horizontalRuler();
    this._down(1);
    this._renderBillingDetails(invoice);
    this._renderMeta(invoice);
    this._down(1.5);
    this._horizontalRuler();
    this._down(1.5);
};

PdfRenderer.prototype._title = function() {
    this._saveY();
    this._headerFont();
    this._text(this.__('Invoice'), 5, 2);
    this._normalFont();
    this._restoreY();
};

PdfRenderer.prototype._header = function() {
    this._saveY();
    this._headerFont();
    this._text('Idle Playthings Oy', 0, 5);
    this._normalFont();
    this._restoreY();
};

PdfRenderer.prototype._horizontalRuler = function() {
    this._pdf
        .moveTo(this.margins().left, this._pdf.y)
        .lineTo(this.margins().left + this.contentWidth(), this._pdf.y)
        .stroke();
};

PdfRenderer.prototype._renderBillingDetails = function(invoice) {
    this._text('Fraktio Oy\nKaupintie 5, 5. kerros\n00440 Helsinki', 0, 5);
};

PdfRenderer.prototype._renderMeta = function(invoice) {
    var meta = invoice.getMeta();
    for (item in meta) {
        this._renderMetaItem(this.__(item), this.__(meta[item]));
    }
};

PdfRenderer.prototype._renderMetaItem = function(item, value) {
    this._boldFont();
    this._text(item, 5, 2);
    this._normalFont();
    this._text(value, 7, 2);
    this._down(1);
};

PdfRenderer.prototype._renderLineItems = function(invoice) {
    this._headingFont();
    this._text(this.__('Description'), 0, 3);
    this._text(this.__('Amount'), 4, 1, 'right');
    this._text(this.__('Unit price'), 5, 1, 'right');
    this._text(this.__('VAT %'), 6, 1, 'right');
    this._text(this.__('VAT total'), 7, 1, 'right');
    this._text(this.__('Total'), 8, 1, 'right');
    this._normalFont();
    this._down(1.25);
    invoice.getLineItems().forEach(this._renderLineItem.bind(this));
};

PdfRenderer.prototype._renderLineItem = function(lineItem) {
    this._text(lineItem.getDescription(), 0, 3);
    this._text(this.__(lineItem.getAmount()) + ' ' + lineItem.getDisplayUnit(), 4, 1, 'right');
    this._text(this.__(lineItem.getPriceExclTax()), 5, 1, 'right');
    this._text(this.__(lineItem.getTaxPercentage()), 6, 1, 'right');
    this._text(this.__(lineItem.getTaxTotal()), 7, 1, 'right');
    this._text(this.__(lineItem.getTotalInclTax()), 8, 1, 'right');
    this._down(1);
};

PdfRenderer.prototype._renderTotals = function(invoice) {
    this._down(3);
    this._text(this.__('VAT total') + ' EUR', 3, 4, 'right');
    this._text(this.__(invoice.getTaxTotal()), 7, 2, 'right');
    this._down(1);
    this._text(this.__('Total (excl. VAT)') + ' EUR', 3, 4, 'right');
    this._text(this.__(invoice.getTotalExclTax()), 7, 2, 'right');
    this._down(1.5);
    this._boldFont();
    this._text(this.__('DUE') + ' EUR', 3, 4, 'right');
    this._text(this.__(invoice.getTotalInclTax()), 7, 2, 'right');
    this._normalFont();
    this._down(3);
    this._boldFont();
    this._text(this.__('IBAN') + ':', 0, 6.5, 'right');
    this._normalFont();
    this._text(this.__('FIXX XXXX XXXX XXXX XX'), 6.6, 3);
    this._down(1.2);
    this._boldFont();
    this._text(this.__('SWIFT (BIC)') + ':', 0, 6.5, 'right');
    this._normalFont();
    this._text(this.__('XXXXXXXX'), 6.6, 3);
    this._down(1.2);
    this._boldFont();
    this._text(this.__('REFERENCE') + ':', 0, 6.5, 'right');
    this._normalFont();
    this._text(this.__('XXXXX'), 6.6, 3);
};

PdfRenderer.prototype._renderFooter = function() {
    this._pdf.y = this.top() + this.contentHeight();
    this._smallFont();
    this._horizontalRuler();
    this._down(1);
    this._text('Idle Playthings Oy (2612717-3) | Linnoituskuja 1 A 8, 01280 VANTAA | contact@idleplaythings.com', 0, 10, 'center');
};

PdfRenderer.prototype._up = function(amount) {
    if (typeof amount === 'undefined') {
        amount = 1.5;
    }

    this._pdf.moveUp(amount);
};

PdfRenderer.prototype._down = function(amount) {
    if (typeof amount === 'undefined') {
        amount = 1.5;
    }

    this._pdf.moveDown(amount);
};

PdfRenderer.prototype._saveY = function() {
    this._y = this._pdf.y;
};

PdfRenderer.prototype._restoreY = function() {
    this._pdf.y = this._y;
};

PdfRenderer.prototype._text = function(text, startColumn, widthInColumns, align) {
    if (typeof align === 'undefined') {
        align = 'left';
    };

    var y = this._pdf.y;
    var left = this._column(startColumn);
    var width = this._column(startColumn + widthInColumns) - left;

    this._pdf.text(text, left, null, {
        align: align,
        width: width
    });
    this._pdf.y = y;
};

PdfRenderer.prototype._column = function(number) {
    return number * this._columnWidth() + this.left();
};

PdfRenderer.prototype._columnWidth = function() {
    return this.contentWidth() / this._columns;
};

PdfRenderer.prototype._headerFont = function() {
    this._pdf.font('header');
    this._pdf.fontSize(14);
};

PdfRenderer.prototype._headingFont = function() {
    this._pdf.font('heading');
    this._pdf.fontSize(10);
};

PdfRenderer.prototype._normalFont = function() {
    this._pdf.font('normal');
    this._pdf.fontSize(11);
};

PdfRenderer.prototype._smallFont = function() {
    this._pdf.font('normal');
    this._pdf.fontSize(10);
};

PdfRenderer.prototype._boldFont = function() {
    this._pdf.font('bold');
    this._pdf.fontSize(11);
};

PdfRenderer.prototype.margins = function() {
    return {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };
};

PdfRenderer.prototype.top = function() {
    return this.margins().top;
};

PdfRenderer.prototype.bottom = function() {
    return this.margins().bottom;
};

PdfRenderer.prototype.left = function() {
    return this.margins().left;
};

PdfRenderer.prototype.right = function() {
    return this.margins().right;
};

PdfRenderer.prototype.pageWidth = function() {
    return 8.27 * 72;
};

PdfRenderer.prototype.pageHeight = function() {
    return 11.69 * 72;
};

PdfRenderer.prototype.contentWidth = function() {
    return this.pageWidth() - this.right() - this.left();
};

PdfRenderer.prototype.contentHeight = function() {
    return this.pageHeight() - this.top() - this.bottom();
};

PdfRenderer.prototype._writeStream = function(path) {
    this._pdf.pipe(fs.createWriteStream(path));
    this._pdf.end();
};

exports.PdfRenderer = PdfRenderer;
