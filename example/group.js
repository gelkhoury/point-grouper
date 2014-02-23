var fs = require('fs');
var path = require('path');
var grouper = require('../');

var g = grouper();
g.on('region', function (region) {
    console.log('REGION ' + region.name);
    var outfile = path.join(__dirname, 'output', region.name + '.geojson');
    region.pipe(fs.createWriteStream(outfile));
});

process.argv.slice(2).forEach(function (file) {
    var ws = g.createWriteStream();
    fs.createReadStream(file).pipe(ws);
});
