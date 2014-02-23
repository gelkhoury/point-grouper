var select = require('json-select');
var through = require('through2');
var inRegion = require('point-in-polygon');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = ByPoly;
inherits(ByPoly, EventEmitter);

function ByPoly () {
    if (!(this instanceof ByPoly)) return new ByPoly;
    EventEmitter.call(this);
    this.unmatched = [];
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
            var region = createRegion(feature);
            region.index = self.regions.length;
            self.regions.push(region);
            self.emit('region', region);
            
            for (var i = 0; i < self.unmatched.length; i++) {
                var u = self.unmatched[i];
                if (inRegion(u.geometry.coordinates, region.coordinates)) {
                    region.write(u);
                    self.unmatched.splice(i, 1);
                    i--;
                }
            }
        }
        else if (geom.type === 'Point') {
            var len = self.regions.length;
            for (var i = 0; i < len; i++) {
                var r = self.regions[i];
                if (inRegion(geom.coordinates, r.coordinates)) {
                    r.write(feature);
                    break;
                }
            }
            if (i === len) {
                self.unmatched.push(feature);
            }
        }
        next();
    }
    function end () {
        if (--self.pending === 0) {
            self.regions.forEach(function (r) {
                r.end();
            });
        }
    }
};

function createRegion (feature) {
    var region = through({ objectMode: true }, write, end);
    region.push('{"type":"FeatureCollection","features":[');
    region.name = feature.properties.Name;
    region.feature = feature;
    region.coordinates = feature.geometry.coordinates[0];
    
    var times = 0;
    return region;
    
    function write (pt, enc, next) {
        var s = JSON.stringify(pt);
        if (times++ === 0) this.push(s)
        else this.push(',\n' + s)
        next();
    }
    function end () {
        this.push(']}\n');
        this.push(null);
    }
}
