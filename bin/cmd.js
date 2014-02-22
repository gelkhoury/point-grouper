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
    var sel = select([ 'features', true, {
        name: [ 'properties', 'Name' ],
        points: [ 'geometry', 'coordinates' ],
        type: [ 'geometry', 'type' ]
    } ]);
    stream.pipe(sel).pipe(through(write, end));
    
    function write (row) {
        if (row.type === 'Polygon') {
            var pts = row.points[0];
        }
        else if (row.type === 'Point') {
            
            console.log(row);
        }
    }
    function end () {}
});
byPoly();
