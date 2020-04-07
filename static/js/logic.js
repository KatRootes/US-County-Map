
stateNames = {'AK': 'ALASKA', 'AL': 'ALABAMA', 'AR': 'ARKANSAS', 'AZ': 'ARIZONA', 'CA': 'CALIFORNIA', 'CO': 'COLORADO', 'CT': 'CONNECTICUT', 'DC': 'DISTRICT OF COLUMBIA', 'DE': 'DELAWARE', 'FL': 'FLORIDA', 'GA': 'GEORGIA', 'HI': 'HAWAII', 'IA': 'IOWA', 'ID': 'IDAHO', 'IL': 'ILLINOIS', 'IN': 'INDIANA', 'KS': 'KANSAS', 'KY': 'KENTUCKY', 'LA': 'LOUISIANA', 'MA': 'MASSACHUSETTS', 'MD': 'MARYLAND', 'ME': 'MAINE', 'MI': 'MICHIGAN', 'MN': 'MINNESOTA', 'MO': 'MISSOURI', 'MS': 'MISSISSIPPI', 'MT': 'MONTANA', 'NC': 'NORTH CAROLINA', 'ND': 'NORTH DAKOTA', 'NE': 'NEBRASKA', 'NH': 'NEW HAMPSHIRE', 'NJ': 'NEW JERSEY', 'NM': 'NEW MEXICO', 'NV': 'NEVADA', 'NY': 'NEW YORK', 'OH': 'OHIO', 'OK': 'OKLAHOMA', 'OR': 'OREGON', 'PA': 'PENNSYLVANIA', 'PR': 'PUERTO RICO', 'RI': 'RHODE ISLAND', 'SC': 'SOUTH CAROLINA', 'SD': 'SOUTH DAKOTA', 'TN': 'TENNESSEE', 'TX': 'TEXAS', 'UT': 'UTAH', 'VA': 'VIRGINIA', 'VT': 'VERMONT', 'WA': 'WASHINGTON', 'WI': 'WISCONSIN', 'WV': 'WEST VIRGINIA', 'WY': 'WYOMING'}
var selectedState = "MN";
function nameToAbbr(name) {
    var abbr = "";
    var found = false;
    for(i=0; i< Object.keys(stateNames).length; i++){
        if(name.toUpperCase() === Object.values(stateNames)[i]){
            abbr = Object.keys(stateNames)[i];
            found = true;
        }
    }
    if(found){
        return abbr;
    }
    else{
        return "ERROR";
    }
}

function abbrToName(abbr){
  var name = "";
  var found = false;
  for(i=0; i<Object.keys(stateNames).length; i++){
    if(abbr.toUpperCase() === Object.keys(stateNames)[i]){
      name = Object.values(stateNames[i]);
      found = true;
    }
  }
  if(found){
    return name;
  }
  else{
    return "ERROR";
  }
}

function bounds(array1, array2) {
  var newArray = []

  for(i=0; i< array1.length; i++){
      newArray.push(array1[i]);
  };
  for(i=0; i< array1.length; i++){
      newArray.push(array2[i]);
  };
  return d3.extent(newArray);
}

function updateYear(year){
  for(var i=0; i<statesData["features"]["length"]; i++){


    var stateAbbr = nameToAbbr(statesData["features"][i]["properties"]["name"])
    //console.log(stateAbbr);
    statesData["features"][i]["properties"]["homeless"] = homelessData[stateAbbr][year];
    //console.log(statesData["features"][i]["properties"]["homeless"]);
    extentTester.push(homelessData[stateAbbr][year]);
  }
  
}

//https://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

//https://stackoverflow.com/questions/260857/changing-website-favicon-dynamically
document.head = document.head || document.getElementsByTagName('head')[0];

function changeFavicon(src) {
 var link = document.createElement('link'),
     oldLink = document.getElementById('dynamic-favicon');
 link.id = 'dynamic-favicon';
 link.rel = 'shortcut icon';
 link.href = src;
 if (oldLink) {
  document.head.removeChild(oldLink);
 }
 document.head.appendChild(link);
}



var dataset = {}
function init(){
  console.log("initializing dashboard");


  d3.json("/data").then(function(jsonData){
    dataset = jsonData;

    
    initializeLineChart(selectedState);
    initializeRadialChart(selectedState,"2019");
    updateInfoBox(selectedState,"2019");
    changeFavicon(`../static/icons/${selectedState}.ico`)
  })
}


function optionChanged(state, year){
  console.log(`Dropdown changed to ${state}, ${year}`);
  updateLineChart(state);
  updateRadialChart(state,year);
  updateInfoBox(state,year);
  changeFavicon(`../static/icons/${state}.ico`)
  selectedState = state;
}

function initializeLineChart(state){
  console.log(`Initializing Line Chart: State = ${state}`);
  var stateName = stateNames[state];
  var years = Object.keys(dataset[state]);
  var homelessness = [];
  for(i=0; i< years.length; i++){
    homelessness.push(dataset[state][years[i]]["categories"]["overall homeless"]);
  }
  var beds = [];
  for (i=0; i< years.length; i++){
    beds.push(dataset[state][years[i]]["beds"])
  }

  var options = {
      series: [
      {
      name: `Number of Homeless in ${stateName}`,
      data: homelessness
      },
      {
        name: `Total Year Round Homeless Shelter Beds in ${stateName}`,
        data: beds
      }
  ],
      chart: {
      height: '100%',
      type: 'line',
      dropShadow: {
      enabled: true,
      color: '#000',
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2
      },
      toolbar: {
      show: false
      }
  },
  colors: ['#77B6EA', '#545454'],
  dataLabels: {
      enabled: true,
  },
  stroke: {
      curve: 'smooth'
  },
  title: {
      text: '',//`Homelessness in ${stateName}`,
      align: 'left'
  },
  grid: {
      borderColor: '#e7e7e7',
      row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
      },
  },
  markers: {
      size: 1
  },
  xaxis: {
      categories: years,
      title: {
      text: 'Year'
      }
  },
  yaxis: {
      title: {
      text: 'Number'
      },
      min: bounds(homelessness, beds)[0]*0.95,
      max: bounds(homelessness, beds)[1]*1.03 
  },
  legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: 0,
      offsetX: 0
  }
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();




}

function initializeRadialChart(state,year){

  console.log(`Updating Radial Chart: State = ${state}, Year = ${year}`)
  var stateName = stateNames[state];

  var totalHomeless = dataset[state][year]["categories"]["overall homeless"]  
  var percentUnsheltered = round(100*dataset[state][year]["categories"]["unsheltered homeless"]/totalHomeless,2);
  var percentSheltered = round(100*dataset[state][year]["categories"]["sheltered homeless"]/totalHomeless,2);
  var percentInFamilies = round(100*dataset[state][year]["categories"]["in family homeless"]/totalHomeless,2);
  var percentIndivuals = round(100*dataset[state][year]["categories"]["individual homeless"]/totalHomeless,2);
  var percentVeteran = round(100*dataset[state][year]["categories"]["veteran homeless"]/totalHomeless,2);
  var percentChronic = round(100*dataset[state][year]["categories"]["chronic homeless"]/totalHomeless,2);



  var options = {
      series: [percentUnsheltered, percentSheltered, percentInFamilies, percentIndivuals, percentVeteran, percentChronic],
      chart: {
      
      height: '100%',
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '18px',
          },
          value: {
            fontSize: '18px',
          },
          total: {
            show: true,
            label: `Total Homeless in ${nameToAbbr(stateName)} in ${year}`,
            formatter: function (w) {
              // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
              return totalHomeless
            }
          }
        }
      }
    },
    labels: ["Unsheltered Homeless", "Sheltered Homeless",  "Homeless People in Families", "Homeless Individuals", "Homeless Veterans", "Chronically Homeless People"],
    colors: ["#4292c6", "#084594", "#08306b", "#545454", "#123456", "#7890ab"],  
  };

    var chart = new ApexCharts(document.querySelector("#radial"), options);
    chart.render();  
}

function updateInfoBox(state,year){
  console.log(`Updating Info Box: State = ${state}, Year = ${year}`);
  var stateName = stateNames[state];
  var homelessness = dataset[state][year]["categories"]["overall homeless"];
  var totalPopulation = dataset[state][year]["total state population"];
  var percentHomeless = homelessness/totalPopulation;
  var info = `${round(100*percentHomeless,3)}% of ${stateName} was homeless in ${year}.`;
  var approximation = round(1/percentHomeless,0);
  var approximateInfo = `That's approximately one person in every ${approximation}`;
  d3.select(".text1").text(info);
  d3.select(".text2").text(approximateInfo);
}

function updateLineChart(state){
  console.log(`Updating Line Chart: State = ${state}`);
  d3.select("#chart").remove();
  d3.select("#lineChart").append("div").attr("id","chart");
  initializeLineChart(state);
}

function updateRadialChart(state,year){
  console.log(`Updating Radial Chart: State = ${state}, Year = ${year}`);
  d3.select("#radial").remove();
  d3.select("#radialChart").append("div").attr("id","radial");
  initializeRadialChart(state, year);
}

init();



var myMap;
var layer2019;

var homelessData = {}
var extentTester = [];

d3.json("../data/PIT").then(data => {
  //console.log("PIT Homeless Data");
  homelessData = data;
  //console.log(homelessData);
  

  var years = Object.keys(homelessData[Object.keys(homelessData)[0]]);
  for( var j=0; j<statesData["features"]["length"]; j++) {
    var year = years[j];
    updateYear(year);
  }
  var extentHomeless = d3.extent(extentTester);
  var maxHomeless = extentHomeless[1];
  var root = Math.pow(maxHomeless, 1/12);
  var base = round(root,1);
  divisions = [0,Math.pow(base,7), Math.pow(base,8), Math.pow(base,9), Math.pow(base,10), Math.pow(base,11), Math.pow(base,12)];
  

  // Creating map object
  
    
    // Adding tile layer
  var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    })


    
  

  function getColor(d) {

    return d > divisions[6] ? "#08306b": 

          d > divisions[5] ? "#284d81":
 
          d > divisions[4] ? "#476997":

          d > divisions[3] ? "#6785ad":

          d > divisions[2] ? "#87a2c3" :
   
          d > divisions[1] ? "#a6bed9" :
 
                    "#c6dbef";
  } 

  function style(feature) {
    return {
        fillColor: getColor(feature.properties.homeless),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '2',
        fillOpacity: 0.8
    };
  }
  
  function updateMaps(feature, layer) {
    var state = nameToAbbr(feature.properties.name);
    var id = layer._leaflet_id;
    var year;
    if(id <= 53) {
      year = 2019;
    }
    else if(id <= 106){
      year = 2018;
    }
    else if (id <= 159){
      year = 2017;
    }
    else if (id <= 212){
      year = 2016;
    }
    else if (id <= 265){
      year = 2015;
    }
    else if (id <= 318){
      year = 2014;
    }
    else if (id <= 371){
      year = 2013
    }
    else if (id <= 424){
      year = 2012;
    }
    else if (id <= 477){
      year = 2011;
    }
    else if (id <= 530){
      year = 2010;
    }
    else if (id <= 583){
      year = 2009;
    }
    else if (id <= 636){
      year = 2008;
    }
    else{
      year = 2007;
    }
    console.log(`CLICK! State: ${state}, Year: ${year}`)
    optionChanged(state, year);
  }


  function onEachFeature(feature, layer) {
    layer.on({
      click: (function(){
        updateMaps(feature, layer);
      }).bind(this)
    })
  }

  updateYear("2019");  
  layer2019 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });


  updateYear("2018");
  var layer2018 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2017");
  var layer2017 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2016");
  var layer2016 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2015");
  var layer2015 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2014");
  var layer2014 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2013");
  var layer2013 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2012");
  var layer2012 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2011");
  var layer2011 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2010");
  var layer2010 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2009");
  var layer2009 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2008");
  var layer2008 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });

  updateYear("2007");
  var layer2007 = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  });


  var baseMaps = {
    2019: layer2019,
    2018: layer2018,
    2017: layer2017,
    2016: layer2016,
    2015: layer2015,
    2014: layer2014,
    2013: layer2013,
    2012: layer2012,
    2011: layer2011,
    2010: layer2010,
    2009: layer2009,
    2008: layer2008,
    2007: layer2007
  }

  myMap = L.map("map", {
    center: [39.50, -98.35],
    zoom: 4,
    layers: [light, layer2019]
  });

  L.control.layers(baseMaps,null,{collapsed: false}).addTo(myMap);
    

    // // Set up the legend, horizontal legend
    var legend = L.control({ position: "bottomleft" });
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
          grades = [extentHomeless[0], divisions[1], divisions[2], divisions[3], divisions[4], divisions[5], Math.round(divisions[6])],
          colors = ["#c6dbef", "#a6bed9", "#87a2c3", "#6785ad", "#476997", "#284d81", "#08306b"],
          labels = [];

      // Add min & max
      var legendInfo = "<h4>Homeless Population</h4>"+
        "<div class=\"labels\">" +
          "<div class=\"min\">" + grades[0] + "</div>" +
          "<div class=\"max\">" + grades[grades.length - 1] + "</div>"
        "</div>";

      div.innerHTML = legendInfo;

      grades.forEach(function(grades, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
    
    function onLayerChange(e){
        optionChanged(selectedState, e.name);
    }
    myMap.on('baselayerchange', onLayerChange);

    


});

