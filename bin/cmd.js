#!/bin/bash

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var JSONStream = require('JSONStream');

var argv = minimist(process.argv.slice(2), {
    alias: { o: 'outdir' }
});
var dir = argv.outdir || process.cwd();
var by = require('../')();

by.on('region', function (region) {
    console.log('DISTRICT ' + region.name);
    var outfile = path.join(dir, region.name + '.geojson');
    region.pipe(JSONStream.stringify())
        .pipe(fs.createWriteStream(outfile))
    ;
});

argv._.forEach(function (file) {
    var ws = by.createWriteStream();
    fs.createReadStream(file).pipe(ws);
});
