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

    var match = new RegExp(this._source.__numeric.match);
    var matches = str.match(match);

    return matches !== null;
};

Translation.prototype._formatNumber = function(str) {
    var match = new RegExp(this._source.__numeric.match);
    var replace = this._source.__numeric.replace;
    return str.replace(match, replace);
};

exports.Translation = Translation;