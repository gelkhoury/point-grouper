# point-grouper

group geojson points into containing polygons

[![build status](https://secure.travis-ci.org/substack/point-grouper.png)](http://travis-ci.org/substack/point-grouper)

# example

``` js
var fs = require('fs');
var path = require('path');
var grouper = require('point-grouper');

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
```

Then give point-grouper some files. Here we'll provide
[oakland city council district boundaries](https://github.com/maxogden/oakland-city-council-districts/blob/master/districts.geojson)
for the polygons and
[oakland street tree data](https://github.com/marishaf/Oakland_2006_Tree_Survey/blob/master/trees.geojson)
for the points.

```
$ mkdir -p output
$ node group.js districts.json trees.geojson
REGION 7
REGION 6
REGION 1
REGION 3
REGION 5
REGION 4
REGION 2
```

The program will then split up the tree data out into each district file:

```
$ ls -sh output/
total 41M
9.6M 1.geojson  6.7M 3.geojson  4.6M 5.geojson  4.0M 7.geojson
6.0M 2.geojson  4.9M 4.geojson  4.6M 6.geojson
```

You can also use the `point-grouper` command that ships with this module to do
the same thing without having to use the API directly:

```
$ point-grouper districts.json trees.geojson -o output/
```

# usage

```
usage: point-grouper FILES {-o OUTDIR}
```

# methods

``` js
var grouper = require('point-grouper')
```

## var g = grouper(cb)

Create a new grouper.

Optionally provide a `cb(err, region)` listener for `'error'` and `'region'`
events.

## g.createWriteStream()

# events

## g.on('region', function (region) {})

When a region (any polygon) was read from one of the input files, this event
fires with `region`, a readable stream of geojson data for all of the points
contained in the region.

The `region` stream has these properties:

* `region.index` - the numeric index of the region
* `region.name` - the property Name if one was present
* `region.feature` - the feature data for the region polygon
* `region.coordinates` - an array of the points in the region shape

# install

With [npm](https://npmjs.org), to get the library do:

```
npm install point-grouper
```

and to get the `point-grouper` command do:

```
npm install -g point-grouper
```

# license

MIT
