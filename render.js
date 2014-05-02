var yaml = require('js-yaml');
var fs = require('fs');

var LineItem = require('./src/line-item').LineItem;
var Invoice = require('./src/invoice').Invoice;
var PdfRenderer = require('./src/renderer/pdf').PdfRenderer;
var Translation = require('./src/translation').Translation;

var invoiceFile = process.argv[2];

try {
    var doc = yaml.safeLoad(fs.readFileSync(invoiceFile, 'utf8'));
    var invoice = new Invoice(doc);

    var fi = new Translation('./translation/fi.json');

    var renderer = new PdfRenderer(fi.getTranslator());
    renderer.render(invoice, 'test2.pdf');
} catch(e) {
    console.log(e.stack)
}