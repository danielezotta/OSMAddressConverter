# OSM Address Converter

![OSM Address Converter](images/preview-1.png)

This project is a NodeJS and React based web application to visualize, elaborate and export housenumbers from OpenData (given by municipalities) into OpenStreetMap.

## Motivation

I was in search of an idea for a project to learn React and I remembered an [old project](https://github.com/danielezotta/osm_civici_trento) of mine, and decided to "rewrite" it.

## How to run

Clone or download this repo, then for both `client` and `server` directories run

```
npm install
npm start
```

The web application is accessible at  `http://localhost:3000/`

## Supported files

The files used for development are inside the `example_files` directory.


### OpenData or municipality files
For now, supported formats are `KML` and `SHP` (required are `.shp, .shx, .dbf` and `.prj`). Used files can be found in the `example_files` folder.

### OpenStreetMap file
At the moment only `GPKG` extractions are supported.


## Bugs or limitations

At the moment, this web application is stable and functional, but not very responsive. Major problems are:

* a lot of markers cause the map to lag massively when at max zoom, because leaflet-react markers aren't for now not using WebGL in rendering
* only one file format supported for OSM extractions, but planning on more

## License

Copyright (c) 2022 Daniele Zotta

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.