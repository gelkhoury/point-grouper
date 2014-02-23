# point-grouper

group points into polygons that contain the points

# example

``` js
var fs = require('fs');
var path = require('path');
var xgroup = require('point-grouper');

var g = xgroup();
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
