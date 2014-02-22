#!/bin/bash

var fs = require('fs');
var select = require('json-select');
var through = require('through');
var minimist = require('minimist');
var byPoly = require('../');
var argv = minimist(process.argv.slice(2));

var points = [];
var shapes = [];
var files = argv._;

files.forEach(function (file) {
    var stream = fs.createReadStream(file);
    stream.pipe(
        select([ 'features', true, {
            name: [ 'properties', 'Name' ]
        } ]))
        .pipe(through(polyWrite, polyEnd))
    ;
    function polyWrite (row) {
        console.log(row);
    }
    function polyEnd () {
    }
    /*
    else if (row.type === 'Point') {
        var pt = row.coordinates;
        pt[0]
        pt[1]
    }
    */
});
byPoly();
