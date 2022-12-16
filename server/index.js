const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const parser = require('xml2json');
const turf = require('@turf/turf');
const stringSimilarity = require("string-similarity");
var { GeoPackageAPI, setCanvasKitWasmLocateFile } = require('@ngageoint/geopackage');
const xmlbuilder = require('xmlbuilder');


const app = express();
const port = 3001;


app.use(cookieParser());
 
app.use(session({
    secret: "SuperSecret",
    saveUninitialized: true,
    resave: true
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// multer setup, keep file extension
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})
var upload = multer({storage: storage})

app.post("/api/files/kml", upload.single("kml"), async (req, res) => {
  try {
    if (req.file) {
      
      // Begin elaboration
      fs.readFile(`./uploads/${req.file.filename}`, function(err, data) {
        var jsonString = parser.toJson(data);
        const jsonObject = JSON.parse(jsonString);
        var addresses = jsonObject.kml.Document.Folder.Placemark;

        var addressesPoints = [];

        for (var i = 0; i < addresses.length; i++) {
          if (addresses[i].ExtendedData.SchemaData.SimpleData.find(x => x.name == "tipo_en")['$t'] != "side entrance") {

            var geoJSONPoint = new Object();

            geoJSONPoint.type = "Feature";
            geoJSONPoint.id = i;
            geoJSONPoint.geometry = new Object();
            geoJSONPoint.geometry,type = "Point";
            geoJSONPoint.geometry.coordinates = [ parseFloat(parseFloat(addresses[i].Point.coordinates.toString().split(',')[1]).toFixed(7)), parseFloat(parseFloat(addresses[i].Point.coordinates.toString().split(',')[0]).toFixed(7)) ];
            geoJSONPoint.properties = new Object();

            for (var j = 0; j < addresses[i].ExtendedData.SchemaData.SimpleData.length; j++) {
              var addressSpecs = addresses[i].ExtendedData.SchemaData.SimpleData[j];
              geoJSONPoint.properties[addressSpecs.name] = addressSpecs.$t;
            }

            addressesPoints.push(geoJSONPoint);

          }          
        }

        req.session.baseGeoJson = addressesPoints;
        
        res.status(200).json(addressesPoints);
      });

      fs.unlink(`./uploads/${req.file.filename}`, (err) => {
        if (err)
          return console.error(err);
      });

    } else {
      res.status(400).send({
        status: false,
        data: "File Not Found in the request",
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
  
});


app.post("/api/files/gpkg", upload.single("gpkg"), (req, res) => {
  
  GeoPackageAPI.open(`./uploads/${req.file.filename}`).then(geoPackage => {
    
    var addressesPoints = [];

    // get the feature table names
    const featureTables = geoPackage.getFeatureTables();
    
    var table = "multipolygons";

    // query for all features as geojson
    const geojsonFeaturesMultipolygons = geoPackage.queryForGeoJSONFeaturesInTable(table);


    for (var i = 0; i < geojsonFeaturesMultipolygons.length; i++) {

      if (geojsonFeaturesMultipolygons[i].properties.other_tags != null && geojsonFeaturesMultipolygons[i].properties.other_tags.includes("addr:housenumber")) {
        var geoJSONPoint = new Object();
        var othertags = geojsonFeaturesMultipolygons[i].properties.other_tags.replace(/"/g, "").split(',');

        geoJSONPoint.type = "Feature";
        geoJSONPoint.id = i;
        geoJSONPoint.geometry = new Object();
        geoJSONPoint.geometry.type = "Point";
        geoJSONPoint.geometry.coordinates = turf.center(turf.points(geojsonFeaturesMultipolygons[i].geometry.coordinates[0][0])).geometry.coordinates.reverse();
        geoJSONPoint.properties = new Object();

        Object.keys(geojsonFeaturesMultipolygons[i].properties).map((key) => {
          if (geojsonFeaturesMultipolygons[i].properties[key] != null) {
            geoJSONPoint.properties[key] = geojsonFeaturesMultipolygons[i].properties[key];
          }
        });

        for (var j = 0; j < othertags.length; j++) {
          tag = othertags[j].split('=>')[0];
          value = othertags[j].split('=>')[1];
          geoJSONPoint.properties[tag] = value;
        }

        addressesPoints.push(geoJSONPoint);
      }
    }

    table = "points";

    // query for all features as geojson
    const geojsonFeaturesPoints = geoPackage.queryForGeoJSONFeaturesInTable(table);
    
    for (var i = 0; i < geojsonFeaturesPoints.length; i++) {
      
      if (geojsonFeaturesPoints[i].properties.other_tags != null && geojsonFeaturesPoints[i].properties.other_tags.includes("addr:housenumber")) {

        var geoJSONPoint = new Object();
        var othertags = geojsonFeaturesPoints[i].properties.other_tags.replace(/"/g, "").split(',');

        geoJSONPoint.type = "Feature";
        geoJSONPoint.id = i + geojsonFeaturesMultipolygons.length;
        geoJSONPoint.geometry = new Object();
        geoJSONPoint.geometry,type = "Point";
        geoJSONPoint.geometry.coordinates = [parseFloat(geojsonFeaturesPoints[i].geometry.coordinates[1].toFixed(7)), parseFloat(geojsonFeaturesPoints[i].geometry.coordinates[0].toFixed(7))];
        geoJSONPoint.properties = new Object();

        Object.keys(geojsonFeaturesPoints[i].properties).map((key) => {
          if (geojsonFeaturesPoints[i].properties[key] != null) {
            geoJSONPoint.properties[key] = geojsonFeaturesPoints[i].properties[key];
          }
        });

        for (var j = 0; j < othertags.length; j++) {
          tag = othertags[j].split('=>')[0];
          value = othertags[j].split('=>')[1];
          geoJSONPoint.properties[tag] = value;
        }

        addressesPoints.push(geoJSONPoint);
      }
    }

    req.session.osmGeoJson = addressesPoints;
    res.status(200).json(addressesPoints);
    
  });
  
});

app.post("/api/housenumbers", (req, res) => {

  var distanceBetweenAddresses = (!req.body.distance)? 0.005 : req.body.distance;
  var similarityPercentage = (!req.body.streetSimilarity)? 0.9 : req.body.streetSimilarity;
  var baseRemoveIds = [];
  var baseAddress, osmAddress;

  if (req.session.baseGeoJson !== undefined && req.session.osmGeoJson !== undefined) {
    for (var i = 0; i < req.session.osmGeoJson.length; i++) {
      osmAddress = req.session.osmGeoJson[i];
      for (var j = 0; j < req.session.baseGeoJson.length; j++) {
        baseAddress = req.session.baseGeoJson[j];
        if (turf.distance(osmAddress.geometry.coordinates, baseAddress.geometry.coordinates, {units: 'kilometers'}) <= distanceBetweenAddresses
                && osmAddress.properties.number == baseAddress.properties.number
                && stringSimilarity.compareTwoStrings(osmAddress.properties.street.toLowerCase(), baseAddress.properties.street.toLowerCase()) >= similarityPercentage) {
          baseRemoveIds.push(baseAddress.id);
          break;
        }
      }
    }
  }

  req.session.baseGeoJson = req.session.baseGeoJson.filter((x) => !baseRemoveIds.includes(x.id));
  res.status(200).send(req.session.baseGeoJson);
});

app.post("/api/housenumbers/compare", (req, res) => {

  var addressOne = req.body.markers[0], addressTwo = req.body.markers[1];
  var compareParameters = req.body.compareParameters;

  var result = new Object();

  result.distance = turf.distance(addressOne.geometry.coordinates, addressTwo.geometry.coordinates, {units: 'kilometers'}) + " km";

  for (var i = 0; i < compareParameters.length; i++) {
    var opRes = "";

    switch (compareParameters[i].compareOperation) {
      case "equals":
        opRes = (addressOne.properties[compareParameters[i].sourceAttribute] == addressOne.properties[compareParameters[i].destinationAttribute]);
        break;
      case "similarity":
        opRes = (stringSimilarity.compareTwoStrings(
          String(addressOne.properties[compareParameters[i].sourceAttribute]).toLowerCase(), 
          String(addressTwo.properties[compareParameters[i].destinationAttribute]).toLowerCase()
        ) * 100) + " %";
        break;
    }

    result[compareParameters[i].sourceAttribute + "," + compareParameters[i].destinationAttribute + "," + compareParameters[i].compareOperation] = opRes;
  }
  // result.streetSimilarity = stringSimilarity.compareTwoStrings(addressOne.properties.street.toLowerCase(), addressTwo.properties.street.toLowerCase());

  res.status(200).json(result);
});

app.post("/api/housenumbers/similar", (req, res) => {

  var result = [];

  if (req.session.baseGeoJson !== undefined && req.session.osmGeoJson !== undefined) {
    for (var i = 0; i < req.session.osmGeoJson.length; i++) {
      osmAddress = req.session.osmGeoJson[i];
      for (var j = 0; j < req.session.baseGeoJson.length; j++) {
        baseAddress = req.session.baseGeoJson[j];
        if (osmAddress.properties.number == baseAddress.properties.number
              && stringSimilarity.compareTwoStrings(osmAddress.properties.street.toLowerCase(), baseAddress.properties.street.toLowerCase()) >= 1.0) {
          baseAddress.properties.similarAddress = osmAddress.geometry.coordinates;
          result.push(baseAddress);
          break;
        }
      }
    }
  }
  
  res.status(200).json(result);
});

app.get("/api/housenumbers/attributes", (req, res) => {

});

app.get("/api/housenumbers/osm", (req, res) => {
  const fileName = Date.now() + ".osm";
  var rootNode = xmlbuilder.create('osm').att('version', 0.6);

  if (req.session.baseGeoJson !== undefined) {
    for (var j = 0; j < req.session.baseGeoJson.length; j++) {
      baseAddress = req.session.baseGeoJson[j];

      node = xmlbuilder.create('node')
        .att('lat', baseAddress.geometry.coordinates[0])
        .att('lon', baseAddress.geometry.coordinates[1]);

      node.ele('tag')
        .att('k', 'addr:housenumber')
        .att('v', baseAddress.properties.number);

      node.ele('tag')
        .att('k', 'addr:postcode')
        .att('v', baseAddress.properties.cap);

      node.ele('tag')
        .att('k', 'addr:street')
        .att('v', baseAddress.properties.street);

      node.ele('tag')
        .att('k', 'addr:city')
        .att('v', 'Trento');

      node.ele('tag')
        .att('k', 'addr:hamlet')
        .att('v', baseAddress.properties.suburb);
      
      rootNode.importDocument(node);
    }
  }
  
  var xmlResult = rootNode.end({ pretty: true });
  fs.writeFile(`./downloads/${fileName}`, xmlResult, function (err) {
    if (err) 
      return res.status(500).json({"error" : err});

    res.status(200).json({"osm" : "/downloads/" + fileName});
  });

});

app.delete("/api/housenumbers/base", (req, res) => {
  var addressesToRemove = req.body.addresses;
  
  req.session.baseGeoJson = req.session.baseGeoJson.filter((x) => {
    return !addressesToRemove.some(address => address.id === x.id);
  });
  res.status(200).json(req.session.baseGeoJson);
});

app.listen(port, () => {
  console.log(`Node server listening on port ${port}`);
});
