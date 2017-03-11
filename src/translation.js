var fs = require('fs');

function Translation(source) {
    this._source = {};
    this._loadSource(source);
};

Translation.prototype.translate = function(str) {
    if (typeof this._source[str] !== 'undefined') {
        return this._source[str];
    }

    if (this._numericMatch(str)) {
        return this._formatNumber(str);
    }

    return str;
};

Translation.prototype.getTranslator = function() {
    return this.translate.bind(this);
};

Translation.prototype._loadSource = function(source) {
    this._source = JSON.parse(fs.readFileSync(source));
};

Translation.prototype._numericMatch = function(str) {
    if (typeof this._source.__numeric !== 'object') {
        return false;
    }

    var match = new RegExp('^-*([0-9]*)\\.([0-9]{2})$');
    var matches = str.match(match);

    return matches !== null;
};

Translation.prototype._formatNumber = function(str) {
    var parts = str.split('.');
    var integer = parts[0];
    var fractional = parts[1];
    var negative = false;

    if (integer[0] === '-') {
        negative = true;
        integer = integer.substr(1);
    }

    integer = integer.split('').reverse().map(function(digit, index) {
        if (index !== 0 && index % 3 === 0) {
            return digit + this._source.__numeric.thousandsSeparator;
        }

        return digit;
    }.bind(this)).reverse().join('');

    if (negative) {
        integer = '-' + integer;
    }

    return integer + this._source.__numeric.decimalSeparator + fractional;
};

exports.Translation = Translation;