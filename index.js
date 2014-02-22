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
    this.points = [];
    this.regions = [];
    this.streams = [];
}

ByPoly.prototype.createStream = function () {
    var self = this;
    var sel = select([ 'features', true, {
        name: [ 'properties', 'Name' ],
        points: [ 'geometry', 'coordinates' ],
        type: [ 'geometry', 'type' ]
    } ]);
    sel.pipe(through({ objectMode: true }, write, end));
    return sel;
    
    function write (row, enc, next) {
        if (row.type === 'Polygon') {
            var region = through({ objectMode: true });
            region.name = row.name;
            region.index = self.regions.length;
            region.points = row.points[0];
            self.regions.push(region);
            self.emit('region', region);
        }
        else if (row.type === 'Point') {
            for (var i = 0; i < self.regions.length; i++) {
                var r = self.regions[i];
                if (inRegion(row.points, r.points)) {
                    r.push(row);
                }
            }
        }
        next();
    }
    function end () {}
};
