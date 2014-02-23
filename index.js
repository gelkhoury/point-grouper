var select = require('json-select');
var through = require('through2');
var inRegion = require('point-in-polygon');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var gutter = require('gutter');

module.exports = ByPoly;
inherits(ByPoly, EventEmitter);

function ByPoly () {
    if (!(this instanceof ByPoly)) return new ByPoly;
    EventEmitter.call(this);
    this.points = [];
    this.regions = [];
    this.pending = 0;
}

ByPoly.prototype.createWriteStream = function () {
    var self = this;
    self.pending ++;
    var sel = select([ 'features', true ]);
    sel.pipe(through({ objectMode: true }, write, end));
    return sel;
    
    function write (feature, enc, next) {
        var geom = feature.geometry;
        if (geom.type === 'Polygon') {
            var points = through({ objectMode: true });
            var region = gutter({
                type: 'FeatureCollection',
                features: points
            });
            region.name = feature.properties.Name;
            region.feature = feature;
            region.index = self.regions.length;
            region.coordinates = geom.coordinates[0];
            region.stream = points;
            self.regions.push(region);
            self.emit('region', region);
        }
        else if (geom.type === 'Point') {
            for (var i = 0; i < self.regions.length; i++) {
                var r = self.regions[i];
                if (inRegion(geom.coordinates, r.coordinates)) {
                    r.stream.push(feature);
                }
            }
        }
        next();
    }
    function end () {
        if (--self.pending === 0) {
            self.regions.forEach(function (r) {
                r.push(null);
            });
        }
    }
};
