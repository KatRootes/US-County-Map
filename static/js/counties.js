/******************************************************* */
// Start with setup variables
/******************************************************* */
// Grab the geojson outline data:  https://eric.clst.org/tech/usgeojson/
const counties = "../data/gz_2010_us_050_00_500k.json"
const states = "../data/gz_2010_us_040_00_500k.json"
const us = "../data/gz_2010_us_outline_500k.json"

// Grab the data

// Initialize variables
const startLocation = [44.95, -93.09];
var outlineColor = "red"; //{"US":"red", "States":"blue", "Counties":"green"};
const layerName = "outdoors";
var statesOverlay = L.layerGroup();
var countiesOverlay = L.layerGroup();

// Create the background layer
function createLayer(name) {
        return L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 20,
            id: "mapbox." + name,
            accessToken: API_KEY
    });
}

// Function to create the geojson outline of regions
function createGeojsonOverlay(data, overlay, outlineColor)
{
    L.geoJson(data, 
    {
        // Style each feature 
        style: function(feature) 
        {
            if (feature.properties.STATE != "27")
            {
                console.log(feature);
                return {
                    color: "clear",
                    fillOpacity: 0.0,
                    weight: 1.0
                };
            }
            else return {
                color: outlineColor,
                fillOpacity: 0.0,
                weight: 1.0
            };
        }
    }).addTo(overlay);
}

// Here we go...


// Grabbing our GeoJSON data..
d3.json(counties).then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    console.log("Made it!!!");

    // Creating a geoJSON layer with the retrieved data
    createGeojsonOverlay(data, countiesOverlay, outlineColor);
});

d3.json(states).then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    console.log("Made it!!!");

    // Creating a geoJSON layer with the retrieved data
    createGeojsonOverlay(data, statesOverlay, outlineColor);
});

var backgroundLayer1 = createLayer(layerName);
var backgroundLayer2 = createLayer(layerName);

// Create map objects
var usMAP = L.map("map", {
    center: startLocation,
    zoom: 4,
    layers: [backgroundLayer1, statesOverlay]
});

var stateMap = L.map("radialChart", {
    center: startLocation,
    zoom: 4,
    layers: [backgroundLayer2, countiesOverlay]
});

