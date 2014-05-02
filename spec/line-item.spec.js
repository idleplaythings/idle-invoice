var LineItem = require('../src/line-item').LineItem;

describe('Line Item', function() {
    it('returns values', function() {
        var item = new LineItem({
            description: 'Some Item',
            amount: '3',
            displayUnit: 'x',
            priceExclTax: '12.34',
            taxPercentage: '14.5'
        });

        expect(item.getDescription()).toEqual('Some Item');
        expect(item.getAmount()).toEqual('3.00');
        expect(item.getDisplayUnit()).toEqual('x');
        expect(item.getPriceExclTax()).toEqual('12.34');
        expect(item.getTaxPercentage()).toEqual('14.50');
    });

    it('calculates totals', function() {
        var item = new LineItem({
            description: 'Some Item',
            amount: '3',
            displayUnit: 'x',
            priceExclTax: '12.34',
            taxPercentage: '14.5'
        });

        expect(item.getTaxAmount()).toEqual('1.79');
        expect(item.getTotalExclTax()).toEqual('37.02');
        expect(item.getTotalInclTax()).toEqual('42.39');
        expect(item.getTaxTotal()).toEqual('5.37');
    });
});
