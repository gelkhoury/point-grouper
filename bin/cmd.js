#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var mkdirp = require('mkdirp');
var xgroup = require('../');

var argv = minimist(process.argv.slice(2), {
    alias: { o: 'outdir', v: 'verbose' },
    boolean: 'v'
});
if (argv.h || argv.help) return usage(0);
if (process.argv.length === 2) return usage(1);

var dir = argv.outdir || process.cwd();
mkdirp.sync(dir);

var g = xgroup();

g.on('region', function (region) {
    if (argv.verbose) console.log('REGION', region.name);
    var outfile = path.join(dir, nameOf(region) + '.geojson');
    region.pipe(fs.createWriteStream(outfile));
});

argv._.forEach(function (file) {
    var ws = g.createWriteStream();
    fs.createReadStream(file).pipe(ws);
});

function usage (code) {
    var rs = fs.createReadStream(__dirname + '/usage.txt');
    rs.pipe(process.stdout);
    if (code) rs.on('end', function () { process.exit(code) });
}

function nameOf (region) {
    return (region.name || ('region_' + region.index))
        .trim().replace(/[\/ ]+/g, '_')
    ;
}
