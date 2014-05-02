var LineItem = require('../src/line-item').LineItem;
var Invoice = require('../src/invoice').Invoice;

describe('Invoice', function() {
    it('calculates totals', function() {
        var lineItemMock = getLineItemMock();
        var invoice = new Invoice({
            lineItems: [
                lineItemMock,
                lineItemMock
            ]
        });

        expect(invoice.getTotalExclTax()).toEqual('20.00');
        expect(invoice.getTotalInclTax()).toEqual('40.00');
        expect(invoice.getTaxTotal()).toEqual('60.00');
    });

    it('returns line items', function() {
        var lineItemMock = getLineItemMock();
        var invoice = new Invoice({
            lineItems: [ lineItemMock ]
        });

        expect(invoice.getLineItems()).toEqual([lineItemMock]);
    });

    var getLineItemMock = function() {
        var lineItemMock = jasmine.createSpyObj(
            'Invoice',
            [
                'getTotalExclTax',
                'getTotalInclTax',
                'getTaxTotal'
            ]
        );

        lineItemMock.getTotalExclTax.andReturn('10.00');
        lineItemMock.getTotalInclTax.andReturn('20.00');
        lineItemMock.getTaxTotal.andReturn('30.00');

        return lineItemMock;
    };
});
