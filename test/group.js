var fs = require('fs');
var path = require('path');
var grouper = require('../');
var test = require('tape');
var concat = require('concat-stream');

var expected = {
    1: require('./data/1.json'),
    2: require('./data/2.json'),
    3: require('./data/3.json'),
    4: require('./data/4.json'),
    5: require('./data/5.json'),
    6: require('./data/6.json'),
    7: require('./data/7.json')
};

Object.keys(expected).forEach(function (key) {
    expected[key] = sort(fudge(expected[key]));
});

test('trees', function (t) {
    t.plan(14);
    
    var g = grouper();
    g.on('region', function (region) {
        t.ok(region.name);
        
        region.pipe(concat(function (body) {
            var data = sort(fudge(JSON.parse(body)));
            t.deepEqual(data, expected[region.name]);
        }));
    });
    
    read('trees.json').pipe(g.createWriteStream());
    read('districts.json').pipe(g.createWriteStream());
});

function read (file) {
    return fs.createReadStream(path.join(__dirname, 'data', file));
}

function sort (c) {
    c.features.sort(cmp);
    function cmp (a, b) {
        return a.properties.SEGMENTID < b.properties.SEGMENTID ? -1 : 1
    }
    return c;
}

function fudge (node) {
    if (typeof node === 'number') {
        return Math.round(1e8 * node) / 1e8;
    }
    if (Array.isArray(node)) {
        return node.map(fudge);
    }
    if (node && typeof node === 'object') {
        return Object.keys(node).reduce(function (acc, key) {
            acc[key] = fudge(node[key]);
            return acc;
        }, {});
    }
    return node;
}
