#!/bin/bash

var fs = require('fs');
var minimist = require('minimist');
var JSONStream = require('JSONStream');

var argv = minimist(process.argv.slice(2));
var by = require('../')();

by.on('region', function (region) {
    console.log('DISTRICT ' + region.name);
    var outfile = __dirname + '/' + region.name + '.geojson';
    region.pipe(JSONStream.stringify())
        .pipe(fs.createWriteStream(outfile))
    ;
});

argv._.forEach(function (file) {
    fs.createReadStream(file).pipe(by.createStream());
});
