var LineItem = require('./src/line-item').LineItem;
var Invoice = require('./src/invoice').Invoice;
var PdfRenderer = require('./src/renderer/pdf').PdfRenderer;
var Translation = require('./src/translation').Translation;

var invoice = new Invoice();
invoice.setMeta({
    'Date': '2014-01-01',
    'Due date': '2014-02-01',
    'Customer No': '1',
    'Invoice No': '1234',
    'Payment terms': '14 days net',
    'Penal interest': '8.00 %',
    'Notice period': '10 days'
});

invoice.addLineItem(new LineItem('Some thing', 4, 'h', 50, 22));
invoice.addLineItem(new LineItem('Some other thing', 4, 'h', 50, 22));
invoice.addLineItem(new LineItem('Tomfoolery', 4, 'h', 50, 22));

var fi = new Translation('./translation/fi.json');

var renderer = new PdfRenderer(fi.getTranslator());
renderer.render(invoice, 'test.pdf');
