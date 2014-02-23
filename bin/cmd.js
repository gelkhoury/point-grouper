#!/bin/bash

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var mkdirp = require('mkdirp');
var xgroup = require('../');

var argv = minimist(process.argv.slice(2), {
    alias: { o: 'outdir' }
});
var dir = argv.outdir || process.cwd();
mkdirp.sync(dir);

var g = xgroup();

g.on('region', function (region) {
    var outfile = path.join(dir, region.name + '.geojson');
    region.pipe(fs.createWriteStream(outfile));
});

argv._.forEach(function (file) {
    var ws = g.createWriteStream();
    fs.createReadStream(file).pipe(ws);
});
