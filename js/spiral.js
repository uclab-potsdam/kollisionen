// specifying SVG

var width = 1000,
  height = 1000,
  start = 0, //centre point
  end = 2, //outer of the spiral
  // numSpirals = 77, //number of years in dataset - could be made dynamic to respond to the dataset - first year in data and last year
  // // numAxis = 1,
  numSpirals = 51,
  margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  };

  let scale


  function transform(t) {
    return function(d) {
      return "translate(" + t.apply(d) + ")";
    }
  }

let detailview = false;
let soundtoggle = false;
let uncertaintytoggle = false;

let firstYearforLabel = 1898 //we should take this from the data with d3.min()
let lastYearforLabel = 1949 //we should take this from the data with d3.max()

///audio
// const audio1 = new Audio("sounds/sound1.mp3")
// const audio2 = new Audio("sounds/sound2.mp3")
// const audio3 = new Audio("sounds/sound3.mp3")
// const audio4 = new Audio("sounds/sound4.mp3")
// const audio5 = new Audio("sounds/sound5.mp3")


function playAudio(file) {
  file.play();
}

// Constructing the spiral:

// theta for the spiral

var theta = function (r) {
  return numSpirals * Math.PI * r;
};

// the r works out the space within which the spiral can take shape - the width and height is set above

var r = d3.min([width, height]) / 2 - 40;

// The radius of the spiral

var radius = d3.scaleLinear()
  .domain([start, end])
  .range([40, r]);

// inserts svg into the DOM

let zoom = d3.zoom()
  .scaleExtent([1, 6])
  .on("zoom", zoomed)

const zoomRadiusScale = d3.scaleSqrt()
  .domain([1,8])
  .range([5,5/6])

var svg = d3.select("#chart").append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMidYMid")
  .attr("viewBox", "0 0 " + (width + margin.right) + " " + (height + margin.left + margin.right))
  .append("g")
  .classed("zoomG", true)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + (90 + height / 2) + ")")

//blur filter
const svgFilters = svg.append("defs")

svgFilters.append("filter")
  .attr("id", "blur")
  .append("feGaussianBlur")
  .attr("stdDeviation", 0.5);

svgFilters.append("filter")
  .attr("id", "blur2")
  .append("feGaussianBlur")
  .attr("stdDeviation", 1.5);


d3.select("#chart").call(zoom);


function zoomed(event, d) {
  d3.select(".zoomG").attr("transform", event.transform);
  d3.select(".pathG").selectAll("path").classed("zooming", true)
  d3.selectAll(".circles").classed("zooming", true)
  d3.selectAll(".timeLabels").style("font-size", function(){return 1/event.transform.k +"em"}).style("stroke-width", 4/event.transform.k)



  setTimeout(function () {
    d3.select(".pathG").selectAll("path").classed("zooming", false)//.style("stroke-width", 2 / event.transform.k)
    d3.selectAll(".circles").classed("zooming", false).attr("r", zoomRadiusScale(event.transform.k))
    if (event.transform.k <= 1.2) {
      d3.selectAll(".timeLabels").style("display", function (d) {
         if (d == firstYearforLabel || d == lastYearforLabel) { return "block" } else { return "none" } })
         .attr("dy", function(){if (i == "1898"){return "0.9em"}else{return "0.4em"}})
  }
    else if (event.transform.k > 1.2 && event.transform.k <= 1.8) {
      d3.selectAll(".timeLabels").style("display", function (d) {
         if (d == firstYearforLabel || d == lastYearforLabel || (d % 5) == 0) { return "block" } else { return "none" } })
          .attr("dy", function(){if (i == "1898"){return "0.4em"}else{return "0.4em"}})

  }else if (event.transform.k > 1.8 && event.transform.k <= 2.4) {
    d3.selectAll(".timeLabels").style("display", function (d) {
       if (d == firstYearforLabel || d == lastYearforLabel || (d % 2) == 0) { return "block" } else { return "none" } })
        .attr("dy", function(){if (i == "1898"){return "0.4em"}else{return "0.4em"}})

  }else if (event.transform.k > 2.4) {
    d3.selectAll(".timeLabels").style("display", function (d) { return "block" })
     .attr("dy", function(){if (i == "1898"){return "0.4em"}else{return "0.4em"}})

  }else{

    d3.selectAll(".timeLabels").style("display", function (d) {
       if (d == firstYearforLabel || d == lastYearforLabel) { return "block" } else { return "none" } })
        .attr("dy", function(){if (i == "1898"){return "0.4em"}else{return "0.4em"}})
  }


}, 600);

  //d3.selectAll("circle").attr("r", function(){return d3.select(this).attr("r")/event.transform.k})
}



// The path to draw the spiral needs data to inform it, points generates this, and is used in .datum(points) below

var points = d3.range(start, end + 0.001, (end - start) / 1000)
//console.log(points);

// this is the spiral, utilising the theta and radius generated above

var spiral = d3.radialLine()
  .curve(d3.curveCardinal)
  .angle(theta)
  .radius(radius);

const backgroundSpiralG = svg.append("g").classed("backgroundSpiralG", true)

var path = backgroundSpiralG.append("path")
  .datum(points)
  .attr("class", "backgroundspiral")
  .attr("d", spiral)
  .style("fill", "none") // do all style in css
  .style("stroke", "grey")
  .style("stroke", ("6, 5"))
  .style("opacity", 0.05)



//  computed value for the total length of the path in user units, this is important for mapping the data later

// var spiralLength = path.node().getTotalLength()

// for turning strings into dates

var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
var formatTime = d3.timeFormat("%e %B %Y"); //
var startParse = d3.timeParse("%Y-%m-%d %I:%M%p");
var endParse = d3.timeParse("%Y-%m-%d %I:%M%p");

//define data

//the dataset
var urlMinimal = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'

//local copy of the dataset
var url = './data/minimal_120522.csv' //local backup

//not used
// var itemsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpZlBfSa0sBkPXXCdHykUFi5N2zPcclrda8iaYlbWoyzaWxDj7q3WEtmP7m8hrzk5ejAgjk-Id_zk9/pub?gid=1626158426&single=true&output=csv'

//this is a temporary dummy dataset (keep until the real dataset is ready)
var urlHighlights = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3XiwLUS9uF0SIvV0QOOTGJv5FY077vEEIiShwtJkEcxDC-Dghp9JEycZxNDAplPetp73-ssUqZ8dv/pub?gid=0&single=true&output=csv'

//this is the highlights dataset for 'Esisenstein's Universe'
var highlights = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1718305265&single=true&output=csv'

// local copy of urlHighlights
// var urlHighlights = './data/highlights.csv'

///load data and preprocessing- metadataschema
Promise.all([
  d3.csv(url), //data
])
  .then(([spiralData]) => {
    //console.log(spiralData);


spiralData = spiralData.filter(function(d){return d.start < '1948-12-31' && d.end < '1948-12-31' })


    // 1. add properties 'vstart' and 'vend' for inferred dates
    //    and uncertainty property
    for (let i = 0; i < spiralData.length; i++) {
      spiralData[i]["vstart"] = spiralData[i]["start"];
      spiralData[i]["vend"] = spiralData[i]["end"];
      spiralData[i]["uncertaintystart"] = 0;
      spiralData[i]["uncertaintyend"] = 0;
      spiralData[i]["category1"] = false;
      spiralData[i]["category2"] = false;
      spiralData[i]["category3"] = false;
      spiralData[i]["category4"] = false;
      spiralData[i]["category5"] = false;
    };

    for (let i = 0; i < spiralData.length; i++) {

      var startA = spiralData[i]["start"].split("-");

      if (startA[1] && startA[2] === "00" && spiralData[i]["end"] === "") spiralData[i]["end"] = spiralData[i]["start"];

      var endA = spiralData[i]["end"].split("-");
      // if (startA[1] && startA[2] == "00" && spiralData[i]["end"] == "") spiralData[i]["end"] = +startA[0] + 1 + "-01-01"; //duplicates where 'start' has a "-00-"" value to 'end' to create ranges

      /* 2. add 'uncertainty' levels:
      0: no uncertainty, e.g. 1898-01-23
      1: uncertainty in days, e.g. 1914-07-00
      2: uncertainty in months e.g. 1906-00-00
      */
      if (startA[1] == "00") spiralData[i]["uncertaintystart"] = 2;
      else if (startA[2] == "00") spiralData[i]["uncertaintystart"] = 1;
      if (endA[1] == "00") spiralData[i]["uncertaintyend"] = 2;
      else if (endA[2] == "00") spiralData[i]["uncertaintyend"] = 1;

      /* 3. populate vstart and vend. assign proper dates to events that automatically fall on 1st January
          start
            uncertainty == 2 → YYYY-01-01
            uncertainty == 1 → YYYY-MM-01
          end
            uncertainty == 2 → YYYY-12-31
            uncertainty == 1 → YYYY-MM-28
          */

      // gives all uncertain events actual dates values rather than placing it on 1st January

      if (spiralData[i]["uncertaintystart"] == 2) {
        spiralData[i]["vstart"] = startA[0] + "-01-01";
      } else if (spiralData[i]["uncertaintystart"] == 1) {
        spiralData[i]["vstart"] = startA[0] + "-" + startA[1] + "-01";
        spiralData[i]["vend"] = startA[0] + "-" + startA[1] + "-28";
      } else spiralData[i]["vstart"] = spiralData[i]["start"];

      if (spiralData[i]["uncertaintyend"] == 2) {
        spiralData[i]["vend"] = +endA[0] + "-12-31";
        // else if (spiralData[i]["uncertaintyend"] == 2) spiralData[i]["vend"] = +endA[0] + 1 + "-01-01";
      }
      else if (spiralData[i]["uncertaintyend"] == 1) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";
      } else spiralData[i]["vend"] = spiralData[i]["end"];

      // fix date ranges - 01, 03, 05, 07, 08, 10, 12 = 31
      // fix date ranges - 04, 06, 09, 11 = 30
      // else 28 (except leap years)

      if ((spiralData[i]["uncertaintyend"] == 1 && endA[1] == "01") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "03") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "05") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "07") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "08") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "10") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "12")) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-31";
      } else if ((spiralData[i]["uncertaintyend"] == 1 && endA[1] == "04") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "06") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "09") ||
        (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "11")) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-30";
      } else if (spiralData[i]["uncertaintyend"] == 1 && endA[1] == "02" && endA[0] % 4 === 0) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-29";
      }
      //  else spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";

      if (spiralData[i]["uncertaintyend"] == 2) spiralData[i]["vend"] = endA[0] + "-12-31"; // it is currently also doing this "-undefined-28"
    };

    for (let i = 0; i < spiralData.length; i++) {

      // category 1=Cinema and Theatre, category 2=Biography and Personality, category 3=Writing and Teaching, category 4=Graphic Art, category 5=Apartment
      //categories sorted into separate categories to aid with styling later

      if (spiralData[i]["category"].includes("Cinema and Theatre")) spiralData[i]["category1"] = true;
      if (spiralData[i]["category"].includes("Biography and Personality")) spiralData[i]["category2"] = true;
      if (spiralData[i]["category"].includes("Writing and Teaching")) spiralData[i]["category3"] = true;
      if (spiralData[i]["category"].includes("Graphic Art")) spiralData[i]["category1"] = true;
      if (spiralData[i]["category"].includes("Apartment")) spiralData[i]["categorfy2"] = true;

    };

    // // format the data
    spiralData.forEach(function (d) {
      //   // d.start = +parseDate(d.start);
      //   // d.end = +parseDate(d.end);
      d.vdateStart = +startParse(d.vstart + " 00:01AM");
      d.vdateEnd = +endParse(d.vend + " 23:59AM")
    });

    // load the data - items

    // Promise.all([
    //   d3.csv(itemsUrl), //data
    // ])
    //   .then(([itemsData]) => {
    //     console.log(itemsData);
    //     // });

    //     for (let i = 0; i < spiralData.length; i++) {

    //       if (spiralData[i]["items"]) {
    //         spiralData[i]["items"] = spiralData[i]["items"].split(",");
    //       }
    //     };

        // highlights

        Promise.all([
          d3.csv(highlights), //data
        ])
          .then(([highlightsData]) => {

            // remove hard-coded elements
            document.querySelectorAll(".highlights p").forEach((el) => el.remove());

            //create a p class for each of the 'identifier's and insert into into the div class="highlights" in index.html
            for (let i = 0; i < highlightsData.length; i++) {
              let identifier = highlightsData[i]["Object ID"];
              let text = highlightsData[i]["Title"];
              let p = document.createElement("p");
              p.className = identifier;
              p.innerHTML = text;
              document.getElementsByClassName("highlights")[0].appendChild(p);
            }

            //console.log(highlightsData);

            highlightsData.forEach(function (d,i) {

              d.events = highlightsData[i]["Related Events"]
              d.Object_ID = highlightsData[i]["Object ID"]
              d.Link_3D = highlightsData[i]["Link to WEB-3D"]
              d.Link_VR = highlightsData[i]["Link to VR"]
              d.Link_Archive = highlightsData[i]["Link to Archival Area"]

            });


            // });

            // The mapping of visual variables starts here

            //certain one day events - circles

            // scale to get relative position in the year from month and day
            const startYearForRelativeScale = 1900
            const relativeInYearScale = d3
              .scaleTime()
              .domain([new Date(startYearForRelativeScale, 0, 1), new Date(startYearForRelativeScale + 1, 0, 1)])
              .range([0, 1])

            // scale to get absolute radius without center and outer margins from year
            const firstYear = 1898
            const lastYear = firstYear + numSpirals
            const absoluteRadiusScale = d3
              .scaleLinear()
              .domain([firstYear, lastYear])
              .range([0, r - 40])

            var getRelativePositionInTheYear = function (month, day) {
              const date = new Date(startYearForRelativeScale, Math.max(month - 1, 0), Math.max(1, day))
              return relativeInYearScale(date)
            }

            var getEventCoordinate = function (year, month, day) {
              var monthScale = d3.scaleOrdinal()
                .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
                .range([1 / 12, 2 / 12, 3 / 12, 4 / 12, 5 / 12, 6 / 12, 7 / 12, 8 / 12, 9 / 12, 10 / 12, 11 / 12, 12 / 12])

              let percentageOfYear

              if (Number(month) == 1) {
                percentageOfYear = Number(day) / 365
              } else if (Number(month) == 2) {
                percentageOfYear = (31 + Number(day)) / 365
              } else if (Number(month) == 3) {
                percentageOfYear = (31 + 28 + Number(day)) / 365
              } else if (Number(month) == 4) {
                percentageOfYear = (31 + 28 + 31 + Number(day)) / 365
              } else if (Number(month) == 5) {
                percentageOfYear = (31 + 28 + 31 + 30 + Number(day)) / 365
              } else if (Number(month) == 6) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + Number(day)) / 365
              } else if (Number(month) == 7) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + 30 + Number(day)) / 365
              } else if (Number(month) == 8) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + 30 + 31 + Number(day)) / 365
              } else if (Number(month) == 9) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + Number(day)) / 365
              } else if (Number(month) == 10) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + Number(day)) / 365
              } else if (Number(month) == 11) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + Number(day)) / 365
              } else if (Number(month) == 12) {
                percentageOfYear = (31 + 28 + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + Number(day)) / 365
              }
              var yearWithPercentage = +year + percentageOfYear

              const relativePositionInTheYear = getRelativePositionInTheYear(month, day)
              const absoluteRadius = absoluteRadiusScale(yearWithPercentage)

              const emptyCenterRadius = 40
              const radius = emptyCenterRadius + absoluteRadius
              const topBasedAngle = 2 * Math.PI * relativePositionInTheYear
              return {
                'cx': radius * Math.sin(topBasedAngle),
                'cy': -radius * Math.cos(topBasedAngle)
              }
            };

            //Arcs (date ranges)

            /*
            aStart & aEnd are the angle start and end for the arcs
            rStart & rEnd are the radius start and end for the arcs
            */

            spiralData.forEach(function (d) {

              var [year, month, day] = d.vstart.split('-', 3)
              var eventCoordinate = getEventCoordinate(year, month, day)

              d.aStart = Math.atan2(eventCoordinate.cx, -eventCoordinate.cy);
              d.rStart = Math.hypot(eventCoordinate.cx, eventCoordinate.cy);
            });

            spiralData.forEach(function (d) {

              var [year, month, day] = d.vend.split('-', 3)
              var eventCoordinateEnd = getEventCoordinate(year, month, day)

              d.aEnd = Math.atan2(eventCoordinateEnd.cx, -eventCoordinateEnd.cy);
              d.rEnd = Math.hypot(eventCoordinateEnd.cx, eventCoordinateEnd.cy);
            });

            // Making arcs

            /* Arcs are to be split into several category types:
                                                              For those with a date value in both 'start/vstart' and 'end/vend'
                                                              0 -> 0 = no uncertainty, a date range
                                                              1 -> 1 = an uncertain range for months
                                                              2 -> 2 = an uncertain range for years
                                                              0 -> 1 = certain date start, uncertain end over a period of a month
                                                              0 -> 2 = certain date start, uncertain end over a period of a year
                                                              1 -> 0 = uncertain day in month start, certain date end
                                                              1 -> 2 = uncertain day in month start, uncertain end over a period of a year
                                                              2 -> 0 = uncertain date start over a period of a year, certain end date
                                                              2 -> 1 = uncertain start date over a period of a year, uncertain end over a period of a month
                                                              And, for those with only a value in 'start/vstart'
                                                              1 = range from 1st of month to 28th of month
                                                              2 = range from 1st January to 31st December */

            //This scale maps out the earliest date and latest dates in the data against the number of spirals - 1898 = 0 spirals & 1974 = 77 spirals (numSpirals)

            var numSpiralsThetaScale = d3.scaleLinear()
              .domain([d3.min(spiralData, function (d) {
                return startParse(d.vstart + " 00:01AM")
              }), d3.max(spiralData, function (d) {
                return endParse(d.vend + " 23:59AM")
              })])
              .range([0, numSpirals]);

            /*
            Scale returns a value between 0 and 77: see manual test above for 24 Jan 1930 - returns '36.27049731995325' which would be from 1896 - 1930
            min because vstart contains ealiest date and max because vend contains latest date
            There needs be another step here: This works out this scale but it needs to then work it out for each line between vstart and vend and return a number
            e.g. 1906-01-01 -> 1908-12-31 = 3 numSpiralsTheta (roughly) as it equals 3 years

            Using this scale numSpiralsThetaScale(d.vend) - numSpiralsThetaScale(d.vstart) -> number of spirals needed
            */


            //scale for width of timeline

var dateStart = d3.min(spiralData, function(d) { return d.vdateStart; });
var dateEnd = d3.max(spiralData, function(d) { return d.vdateEnd; });

var dateRange = d3.timeYear.range(dateStart, dateEnd);

var dateRangeLength = dateRange.length;

console.log(dateRangeLength); //number of years


            ///////////////////search


            let nodes = []
            let links = []

            spiralData.forEach(function (d, i) {

              let peopleNodes = d.people == "" ? [] : d.people.split(";")
              let placesNodes = d.places == "" ? [] : d.places.split(";")
              let worksNodes = d.works == "" ? [] : d.works.split(";")
              //let projectNodes = d.project == "" ? [] : d.project.split(";")
              let artisticNodes = d.artistic == "" ? [] : d.artistic.split(";")
              let additionalNodes = d.additional == "" ? [] : d.additional.split(";")

              //add people to nodes
              peopleNodes.forEach(function (D) {
                if (nodes.filter(function (x) {
                  return x.name == D
                }).length == 0) {
                  nodes.push({
                    name: D,
                    count: 1,
                    category: "people"
                  })
                } else {
                  nodes.filter(function (x) {
                    return x.name == D
                  })[0].count++
                }
              })


              //add places to nodes
              placesNodes.forEach(function (D) {
                if (nodes.filter(function (x) {
                  return x.name == D
                }).length == 0) {
                  nodes.push({
                    name: D,
                    count: 1,
                    category: "places"
                  })
                } else {
                  nodes.filter(function (x) {
                    return x.name == D
                  })[0].count++
                }
              })

              //add works to nodes
              worksNodes.forEach(function (D) {
                if (nodes.filter(function (x) {
                  return x.name == D
                }).length == 0) {
                  nodes.push({
                    name: D,
                    count: 1,
                    category: "works"
                  })
                } else {
                  nodes.filter(function (x) {
                    return x.name == D
                  })[0].count++
                }
              })

              // //add project to nodes
              // projectNodes.forEach(function(D){
              //   if (nodes.filter(function(x){return x.name == D}).length == 0){
              //     nodes.push({
              //       name: D,
              //       count: 1,
              //       category: "project"
              //     })
              //   }else{
              //     nodes.filter(function(x){return x.name == D})[0].count++
              //   }
              // })

              //add artistic to nodes
              artisticNodes.forEach(function (D) {
                if (nodes.filter(function (x) {
                  return x.name == D
                }).length == 0) {
                  nodes.push({
                    name: D,
                    count: 1,
                    category: "artistic"
                  })
                } else {
                  nodes.filter(function (x) {
                    return x.name == D
                  })[0].count++
                }
              })

              //add additional to nodes
              additionalNodes.forEach(function (D) {
                if (nodes.filter(function (x) {
                  return x.name == D
                }).length == 0) {
                  nodes.push({
                    name: D,
                    count: 1,
                    category: "additional"
                  })
                } else {
                  nodes.filter(function (x) {
                    return x.name == D
                  })[0].count++
                }
              })

              let allNodes = [].concat(peopleNodes, placesNodes, worksNodes, artisticNodes, additionalNodes)

              //create combinations of source+targets out of all "objects"
              //https://stackoverflow.com/questions/43241174/javascript-generating-all-combinations-of-elements-in-a-single-array-in-pairs
              allNodes.flatMap(
                function (v, i) {
                  return allNodes.slice(i + 1).forEach(function (w) {
                    //  console.log( v + '+ ' + w )
                    if (links.filter(function (D) {
                      return (D.source == v && D.target == w) || D.source == w && D.target == v
                    }).length == 0) {
                      links.push({
                        source: v,
                        target: w,
                        children: [{
                          source: v,
                          target: w,
                          category: d.category,
                          dateStart: new Date(d.vstart),
                          dateEnd: new Date(d.vend),
                          relation_source: d.title,
                          description: d.description
                        }],
                      })
                    } else {
                      links.filter(function (D) {
                        return (D.source == v && D.target == w) || D.source == w && D.target == v
                      })[0].children.push({
                        source: v,
                        target: w,
                        category: d.category,
                        dateStart: new Date(d.vstart),
                        dateEnd: new Date(d.vend),
                        relation_source: d.title,
                        description: d.description
                      })

                    }

                  })
                }
              )



            })

            console.log(links)
            console.log(nodes)

            nodes.sort(function (a, b) {
              return b.count - a.count;
            })

            ///////////////////search



            let searchDaten = [{
                text: "People",
                children: []
              },
              {
                text: "Places",
                children: []
              },
              {
                text: "Concepts",
                children: []
              },
              {
                text: "Miscellaneous",
                children: []
              },
              {
                text: "Works",
                children: []
              },

            ];


            nodes.filter(function(d) {
              return d.category == "people"
            }).forEach(function(d, i) {
              searchDaten[0].children.push({
                id: i,
                text: d.name + " (" + d.count  + (d.count > 1 ? " events)": " event)"),
                name: d.name,
                category: "people",
                count: d.count,
              })
            })

            nodes.filter(function(d) {
              return d.category == "places"
            }).forEach(function(d, i) {
              searchDaten[1].children.push({
                id: i,
                text: d.name + " (" + d.count + (d.count > 1 ? " events)": " event)"),
                name: d.name,
                category: "places",
                count: d.count,
              })
            })

            nodes.filter(function(d) {
              return d.category == "artistic"
            }).forEach(function(d, i) {
              searchDaten[2].children.push({
                id: i,
                text: d.name + " (" + d.count + (d.count > 1 ? " events)": " event)"),
                name: d.name,
                category: "artistic",
                count: d.count,
              })
            })

            nodes.filter(function(d) {
              return d.category == "additional"
            }).forEach(function(d, i) {
              searchDaten[3].children.push({
                id: i,
                text: d.name + " (" + d.count + (d.count > 1 ? " events)": " event)"),
                name: d.name,
                category: "additional",
                count: d.count,
              })
            })

            nodes.filter(function(d) {
              return d.category == "works"
            }).forEach(function(d, i) {
              searchDaten[4].children.push({
                id: i,
                text: d.name + " (" + d.count  + (d.count > 1 ? " events)": " event)"),
                name: d.name,
                category: "works",
                count: d.count,
              })
            })

            nodes.filter(function (d) { return d.category == "works" }).forEach(function (d, i) {
              searchDaten[4].children.push(
                {
                  id: i,
                  text: d.name + " (" + d.count + ")",
                  name: d.name,
                  category: "works",
                  count: d.count,
                }
              )
            })

            ////search
            $("#search").select2({
              data: searchDaten,
              containerCssClass: "search",
              selectOnClose: true,
              // placeholder: "Search events keywords",
              placeholder: "Search",
              allowClear: true

            });


            $("#search").on("select2-selecting", function (e) {

              d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)
              d3.selectAll(".circles,.pathGs").classed("selected", false).classed("notSelected", false)
              d3.select("#closedsidebar").style("display", "none")
              d3.select(".sidebar").style("display", "none")
              d3.select(".highlightbar").style("display", "none")
              d3.select("#closedhighlightbar").style("display", "none")
              d3.selectAll(".filter").style("font-weight", 400)
              d3.selectAll(".highlights p").style("font-weight", 400)

              d3.selectAll("circle").classed("filteredout", function (d) {
                if (e.choice.category == "people") {
                  if (d.people.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "places") {
                  if (d.places.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "artistic") {
                  if (d.artistic.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "additional") {
                  if (d.additional.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "works") {
                  if (d.works.includes(e.choice.name)) { return false } else { return true }
                }
              })

              d3.selectAll(".pathGs").classed("filteredout", function (d) {
                if (e.choice.category == "people") {
                  if (d.people.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "places") {
                  if (d.places.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "artistic") {
                  if (d.artistic.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "additional") {
                  if (d.additional.includes(e.choice.name)) { return false } else { return true }
                } else if (e.choice.category == "works") {
                  if (d.works.includes(e.choice.name)) { return false } else { return true }
                }
              })


            })


            $("#search").on("select2-clearing", function (e) {
              d3.selectAll(".pathGs").classed("filteredout", false)
              d3.selectAll("circle").classed("filteredout", false)
            })









            //this is the code for the arcs

            const pathG = svg.append("g").classed("pathG", true)

            for (let i = 0; i < spiralData.length; i++) {

              var endSpiralTheta = numSpiralsThetaScale(endParse(spiralData[i].vend + " 23:59AM"));
              var startSpiralTheta = numSpiralsThetaScale(startParse(spiralData[i].vstart + " 00:01AM"))
              var numSpiralsTheta = (endSpiralTheta - startSpiralTheta) + 0.00121369930219;

              // console.log(numSpiralsThetaScale(-63205260000))
              // console.log(numSpiralsThetaScale(-94697940000))

              var radiusArc1 = d3.scaleLinear()
                .domain([start, end])
                .range([spiralData[i].rStart, spiralData[i].rEnd])

              //console.log(radiusArc1(2))

              var thetaArc = function (r) {
                return numSpiralsTheta * Math.PI * r;
              };
              /*
                      theta still needs to be used to guide the spiral but it needs to have a defined starting point for the spiral
                      the numSpirals needs to be dynamic - based on a scale - to ascertain how much of a spiral is needs to draw between two points
                      there also needs to be a way of adjusting the start point (the starting angle) - this is captured in 'aStart'
                      */

              var spiralArcs = d3.radialLine()
                .curve(d3.curveCardinal)
                .angle(thetaArc)
                .radius(radiusArc1)

              var angleStart = spiralData[i].aStart * (180 / Math.PI)

              if (spiralData[i].vend != "" && spiralData[i].vstart < '1948-12-31') {
                d3.select(".pathG").append("g").classed("pathGs", true)
                  .datum(function () { return spiralData[i] })
                  .append("path")
                  .datum(points)
                  .classed("spiralArcs", true)
                  .attr("d", spiralArcs)
                  .classed("cinema", function () {
                    if (spiralData[i].category1 == true && spiralData[i].category2 == false && spiralData[i].category3 == false) {
                      return true;
                    } return false;
                  })
                  .classed("biography", function () {
                    if (spiralData[i].category2 == true && spiralData[i].category1 == false && spiralData[i].category3 == false) {
                      return true;
                    } return false;
                  })
                  .classed("writing", function () {
                    if (spiralData[i].category3 == true && spiralData[i].category1 == false && spiralData[i].category2 == false) {
                      return true;
                    } return false;
                  })
                  .classed("cinebio", function () {
                    if (spiralData[i].category1 == true && spiralData[i].category2 == true && spiralData[i].category3 == false) {
                      return true;
                    } return false;
                  })
                  .classed("biowrit", function () {
                    if (spiralData[i].category1 == false && spiralData[i].category2 == true && spiralData[i].category3 == true) {
                      return true;
                    } return false;
                  })
                  .classed("cinewrit", function () {
                    if (spiralData[i].category1 == true && spiralData[i].category2 == false && spiralData[i].category3 == true) {
                      return true;
                    } return false;
                  })
                  .classed("allcat", function () {
                    if (spiralData[i].category1 == true && spiralData[i].category2 == true && spiralData[i].category3 == true) {
                      return true;
                    } return false;
                  })

                  .attr("opacity", 1)
                  .attr("transform", "rotate(" + angleStart + ")");
              }

            };

            const circleG = svg.append("g").classed("circleG", true)

            let circles = circleG.selectAll("g")

              .data(function (d) {
                return spiralData.filter(function (d) {
                  return d.uncertaintystart === 0 && d.end === "" && d.start.includes("/") == false && d.start.includes(",") == false && d.start != "" //took out some data points that create errors for now
                  && d.start < '1948-12-31' && d.end < '1948-12-31'
                });
              })
              .join("g")
              .append("circle")
              .classed("circles", true)
              .classed("cinema", function (d) {
                if (d.category1 == true && d.category2 == false && d.category3 == false) {
                  return true;

                } return false;
              })
              .classed("biography", function (d) {
                if (d.category2 == true && d.category1 == false && d.category3 == false) {
                  return true;
                } return false;
              })
              .classed("writing", function (d) {
                if (d.category3 == true && d.category1 == false && d.category2 == false) {
                  return true;
                } return false;
              })
              .classed("cinebio", function (d) {
                if (d.category1 == true && d.category2 == true && d.category3 == false) {
                  return true;
                } return false;
              })
              .classed("biowrit", function (d) {
                if (d.category1 == false && d.category2 == true && d.category3 == true) {
                  return true;
                } return false;
              })
              .classed("cinewrit", function (d) {
                if (d.category1 == true && d.category2 == false && d.category3 == true) {
                  return true;
                } return false;
              })
              .classed("allcat", function (d) {
                if (d.category1 == true && d.category2 == true && d.category3 == true) {
                  return true;
                } return false;
              })
              .attr("cx", function (d) {
                let [year, month, day] = d.vstart.split('-', 3)
                let eventCoordinate = getEventCoordinate(year, month, day)
                return eventCoordinate.cx
              })
              .attr("cy", function (d) {
                let [year, month, day] = d.vstart.split('-', 3)
                let eventCoordinate = getEventCoordinate(year, month, day)
                return eventCoordinate.cy
              })
              .attr("r", 5) // radius of circle
              .attr("opacity", 1)
              .attr("transform", console.log(d3.zoomIdentity))

            const yearLabelG = svg.append("g").classed("yearLabelG", true)



            let labelScale = d3.scaleLinear()
              .domain([firstYearforLabel, lastYearforLabel])
              .range([-40, -r])

            // for (let i = firstYearforLabel; i <= lastYearforLabel; i++) {
            for (let i = firstYearforLabel; i <= lastYearforLabel; i++) {
              yearLabelG.append("text").text(i)
                .classed("timeLabels", true)
                .datum(i)
                .attr("y", labelScale(i))
                .style("text-anchor", "middle")
                .attr("dy", function(){if (i == "1898"){return "0.9em"}else{return "0.4em"}})
                .style("pointer-events", "none")
                .style("stroke", "white")
                .style("stroke-width", 4)
                .style("display", function () { if (i == firstYearforLabel || i == lastYearforLabel) { return "block" } else { return "none" } })

              yearLabelG.append("text").text(i)
                .classed("timeLabels", true)
                .datum(i)
                .attr("y", labelScale(i))
                .style("text-anchor", "middle")
                .attr("dy", function(){if (i == "1898"){return "0.9em"}else{return "0.4em"}})
                .style("pointer-events", "none")
                .style("display", function () { if (i == firstYearforLabel || i == lastYearforLabel) { return "block" } else { return "none" } })
            }

            // Set of functions for html formatting in tooltip and sidebar

            // htmlRenderer is a function in the form: (data) => htmlText
            // eg. (title) => `<p class="title">${title}</p>`
            // if data exists, it'll return the string with data inside it, otherwise it'll return an empty string
            function conditionalReturn(data, htmlFormatter) {
              if (data == null || data === '' || data === false) {
                return '';
              }
              return htmlFormatter(data);
            }

            // function to compare content of strings and omit repeated strings

            function compareDescription(d, descriptionFormat) {

              let a = d.description

              let b = d.title

              if (a === b) {
                return '';
              }
              else {
                return descriptionFormat(d.description);
              }
            };

            // function to replace date with optional uncertain date

            function replaceTemporal(d, temporalSwap) {

              let a = d.displayTemporal
              let b = d.vdateStart

              if (a == null || a === '' || a === false) {
                return temporalSwap(b)
              }
              else {
              }
              if (a !== null || a !== '' || a !== false) {
                return '';
              }
            };

            //function to split keywords by comma

            function stringSplit(data, keywordSplitter) {

              var kws = data.split(";")

              if (data == null || data === '' || data === false) {
                return '';
              } else {

              } if (kws.length > 1) { return keywordSplitter(kws.join(", ")) }

              else { return keywordSplitter(kws) }

            };

            //function to split images by comma



            //tooltip
            var tooltip = d3.select("body")
              .append('div')
              .attr('class', 'tooltip')
              .style('display', 'none');

              var highlightbar = d3.select("#sidebar")
                .append('div')
                .attr('class', 'highlightbar');

            var sidebar = d3.select("#sidebar")
              .append('div')
              .attr('class', 'sidebar');


            // tooltip.append('div')
            //   .attr('class', 'date');

            // tooltip.append('div')
            //   .attr('class', 'value');

            // sidebar.append('circle')
            //   .attr('class', 'sidebar_circle')
            //   .attr('r', 5)

            ///tooltip for single day events
            svg.selectAll(".circles")
              .on('mousemove', function (event, d) {

                // if filters are not selected then show all events
                //display same year nodes/arcs
                var [year, month, day] = d.vstart.split('-', 3)

                d3.selectAll(".circles,.pathGs").classed("notHovered", true).classed("hovered", false)
                d3.select(this).classed("notHovered", false).classed("hovered", true)



                // d3.selectAll(".timeLabels")
                //   .style("opacity", function (D) { if (D == year) { return 1 } else { return 0 } })



                //tooltip
                tooltip
                  .style('position', 'absolute')
                  .style('left', `${event.pageX + 5}px`)
                  .style('top', `${event.pageY + 10}px`)
                  .style('display', 'inline-block')
                  .style('opacity', '0.9')
                  .html(`
                ${replaceTemporal(d, (vdateStart) => `<p class="tooltip-date">${formatTime(d.vdateStart)}</p>`)}
                ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="tooltip-displayTemporal"><b>${displayTemporal}</b></p>`)}
                <p class="tooltip-title">${d.title}</p>`);
              })
              // .on("mouseover", function (event, d) {
              //   if (soundtoggle == true) {
              //     if (d.category1 == true) { playAudio(audio1) }
              //     else if (d.category2 == true) { playAudio(audio2) }
              //     else if (d.category3 == true) { playAudio(audio3) }
              //     else if (d.category4 == true) { playAudio(audio4) }
              //     else if (d.category5 == true) { playAudio(audio5) }
              //   }
              // })
              .on('click', function (event, d) {
                //  if  (d3.select(this).style("stroke") != "black" && d3.select(this).style("stroke-width") != "3px") {
                d3.selectAll(".circles,.pathGs").classed("notSelected", true).classed("selected", false)
                d3.select(this).classed("selected", true).classed("notSelected", false)


                //display sidebar

                d3.select("#closedsidebar").style("display", "block")
                /// sidebar for single day dates
                sidebar
                  .style('display', 'block')
                  .attr('sidebarType', '')
                  .html(`
                ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
                ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
                ${conditionalReturn(d.title, (title) => `<h2 class="title">${title}</h2>`)}
                ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
                ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
                ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
                ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
                ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
                ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
                ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
                ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
                <br/>
                ${conditionalReturn(d.category1, (category1) => `<p><span class="key-dot cinema"></span>Cinema and Theatre<br></p>`)}
                ${conditionalReturn(d.category2, (category2) => `<p><span class="key-dot biography"></span>Biography and Personality<br></p>`)}
                ${conditionalReturn(d.category3, (category3) => `<p><span class="key-dot writing"></span>Writing and Teaching<br></p>`)}
                ${conditionalReturn(d.category4, (category4) => `<p><span class="key-dot graphic"></span>Graphic Art<br></p>`)}
                ${conditionalReturn(d.category5, (category5) => `<p><span class="key-dot apartment"></span>Apartment<br></p>`)}

                `)

              })
              .on('mouseout', function (d) {
                // tooltip.style('display', 'none');
                tooltip.style('opacity', 0);

                d3.selectAll(".circles,.pathGs").classed("notHovered", false).classed("hovered", false)

              })
            /// tooltip for spans
            svg.selectAll(".pathGs")
              .on('mousemove', function (event, d) {

                //display same year nodes/arcs
                var [year, month, day] = d.vstart.split('-', 3)

                d3.selectAll(".circles,.pathGs").classed("notHovered", true).classed("hovered", false)
                d3.select(this).classed("notHovered", false).classed("hovered", true)

                // d3.selectAll(".timeLabels")
                //   .style("opacity", function (D) { if (D == year) { return 1 } else { return 0 } })



                tooltip
                  .style('position', 'absolute')
                  .style('left', `${event.pageX + 5}px`)
                  .style('top', `${event.pageY + 10}px`)
                  .style('display', 'inline-block')
                  .style('opacity', '0.9')
                  .html(`
                      ${replaceTemporal(d, (vdateStart) => `<p class="tooltip-date">${formatTime(d.vdateStart)} to ${formatTime(d.vdateEnd)}</p>`)}
                      ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="tooltip-displayTemporal"><b>${displayTemporal}</b><p>`)}
                      <p class="tooltip-title">${d.title}</p>`);
              })
              .on('click', function (event, d) {


                d3.selectAll(".circles,.pathGs").classed("notSelected", true).classed("selected", false)
                d3.select(this).classed("selected", true).classed("notSelected", false)

                d3.select("#closedsidebar").style("display", "block")
                /// sidebar for spans
                sidebar
                  .style('display', 'block')
                  .attr('sidebarType', '')
                  .html(`
          ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
          ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
          ${conditionalReturn(d.title, (title) => `<h2 class="title">${title}</h2>`)}
          ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
          ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
          ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
          ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
          ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
          ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
          ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
          ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
          <br/>
          ${conditionalReturn(d.category1, (category1) => `<p><span class="key-dot cinema"></span>Cinema and Theatre<br></p>`)}
          ${conditionalReturn(d.category2, (category2) => `<p><span class="key-dot biography"></span>Biography and Personality<br></p>`)}
          ${conditionalReturn(d.category3, (category3) => `<p><span class="key-dot writing"></span>Writing and Teaching<br></p>`)}
          `)

              })
              // .on("mouseover", function (event, d) {
              //   if (soundtoggle == true) {
              //     if (d.category1 == true) { playAudio(audio1) }
              //     else if (d.category2 == true) { playAudio(audio2) }
              //     else if (d.category3 == true) { playAudio(audio3) }
              //     else if (d.category4 == true) { playAudio(audio4) }
              //     else if (d.category5 == true) { playAudio(audio5) }
              //   }
              // })
              .on('mouseout', function (d) {
                tooltip.style('display', 'none');
                // tooltip.style('opacity', 0);

                d3.selectAll(".circles,.pathGs").classed("notHovered", false).classed("hovered", false)

          //      d3.selectAll(".timeLabels")
                  //.style("opacity", function (D) { if (D == firstYearforLabel || D == lastYearforLabel) { return 1 } else { return 0 } })
                // .style('display', function(D){if(D== firstYearforLabel || D == lastYearforLabel){return 'block'}else{return 'none'}})

              });

            //closes sidebar using 'x'
            d3.selectAll("#closedhighlightbar")
              .on('click', function (d) {

                d3.select(".highlightbar")
                  .style("display", "none")


                d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)

                d3.selectAll(".highlights p").style("font-weight", 400)
                d3.select("#closedhighlightbar").style("display", "none")
              })

            d3.selectAll("#closedsidebar")
              .on('click', function (event,d) {
                event.stopPropagation()
                d3.select(".sidebar")
                  .style("display", "none")

                d3.selectAll(".circles,.pathGs").classed("selected", false).classed("notSelected", false)

                d3.select("#closedsidebar").style("display", "none")

              });


            ///filters

            d3.select("#soundbutton").on('click', function() {
              if (soundtoggle) {
                soundtoggle = !soundtoggle;
                d3.select("#soundbutton").attr("src", "images/sound-off.svg")
                Tone.Transport.stop();
              } else if (!soundtoggle) {
                soundtoggle = !soundtoggle;
                d3.select("#soundbutton").attr("src", "images/sound-on.svg")
                Tone.Transport.start();
              }
            });

            d3.select("#uncertaintycheckbox").on('change', function () {
              uncertaintytoggle = !uncertaintytoggle
              if (uncertaintytoggle == true) {
                d3.selectAll(".pathGs").filter(function (d) {
                  return d.uncertaintystart == 1 && d.uncertaintyend == 1
                })
                  .attr("filter", "url(#blur)")

                d3.selectAll(".pathGs").filter(function (d) {
                  return d.uncertaintystart == 2 && d.uncertaintyend == 2
                })
                  .attr("filter", "url(#blur2)")
              } else {
                d3.selectAll(".pathGs").filter(function (d) {
                  return d.uncertaintystart == 2 && d.uncertaintyend == 2
                })
                  .attr("filter", null)
              }


            });


            // filters for 'highlights'

            // d3.select the <p class=> that is clicked on in the 'highlights' div class


            d3.selectAll(".highlights p")
              .on("click", function (d, i) {
                d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false).classed("notSelected", false).classed("selected", false)
                d3.select("#closedsidebar").style("display", "none")
                d3.select(".sidebar").style("display", "none")

                if (d3.select(this).style("font-weight") != "bold") {
                  $('#search').select2('data', null)

                  d3.selectAll(".highlights p").style("font-weight", 400)
                  d3.select(this).style("font-weight", "bold")
                  let selectedIdentifier = d3.select(this).attr("class") // get the class of the p tag that was clicked on

                  d3.selectAll(".circles,.pathGs").filter(function (X, Y) {
                    return highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].events.includes(X.Event_ID) == true
                  }).classed("catFilteredOut", false)
                  d3.selectAll(".circles,.pathGs").filter(function (X, Y) {
                    return highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].events.includes(X.Event_ID) == false
                  }).classed("catFilteredOut", true)

                  d3.selectAll(".filter,.allfilter").style("font-weight", 400)

                  d3.select("#closedhighlightbar").style("display", "block")

                  /// sidebar for spans
                  highlightbar
                    .html(`
<h1 class="title">${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Title}</h1>
<p class="highlightsImage"><img src="images/objects/${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Object_ID}.png" alt="${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Object_ID}" width = "50%" height = "auto" class="image"></p>
<h2 class="title">${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Subtitle}</h2>
<p class="highlightsDescription"><b>Description: </b>${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Description}</p>
<p class="highlightsLinks"><b>Links: </b>You can explore more aspects of this object and its story in our <a href="${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Link_VR}">VR Experience</a>, in <a href="${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Link_VR}">Web3D</a> and on our <a href="${highlightsData.filter(function (D) { return D.Object_ID == selectedIdentifier })[0].Link_Archive}">Archival Page</a>.</p>
`)
                    .style('display', 'block')
                    .attr('sidebarType', 'highlights')
                } else {
                  d3.select(this).style("font-weight", 400)
                  d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)
                  d3.select(".highlightbar").style("display", "none")
                  d3.select("#closedhighlightbar").style("display", "none")
                }
              })



            // if (d3.select(".highlights p").style("font-weight") != "bold") {

            //if highlights are selected then don't do this


            d3.select(".f_c").on("click", function () {
              twGain.gain.rampTo(-0.3,0.5);
              projGain.gain.rampTo(3.0,0.5);
              therGain.gain.rampTo(-0.5,0.5);
              if (d3.select(this).style("font-weight") != "bold") {
                $('#search').select2('data', null)

                d3.selectAll(".filter").style("font-weight", 400)
                d3.selectAll(".highlights p").style("font-weight", 400)
                d3.select(this).style("font-weight", "bold")

                d3.select(".highlightbar").style("display", "none")
                d3.select("#closedhighlightbar").style("display", "none")

                d3.selectAll(".circles,.pathGs").filter(function (d) { return d.category.includes("Cinema") || d.category.includes("Graphic") }).classed("catFilteredOut", false)
                d3.selectAll(".circles,.pathGs").filter(function (d) { return d.category.includes("Cinema") == false && d.category.includes("Graphic") == false }).classed("catFilteredOut", true)
              } else {
                d3.select(this).style("font-weight", 400)
                d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)
                twGain.gain.rampTo(0.2,30)
                projGain.gain.rampTo(0.2,30);
                therGain.gain.rampTo(0.05,5);
              }

            })

            d3.select(".f_b").on("click", function () {
              twGain.gain.rampTo(-0.1,0.5);
              projGain.gain.rampTo(0.1,0.5);
              therGain.gain.rampTo(0.3,0.5);
              if (d3.select(this).style("font-weight") != "bold") {
                $('#search').select2('data', null)

                d3.selectAll(".filter").style("font-weight", 400)
                d3.selectAll(".highlights p").style("font-weight", 400)
                d3.select(this).style("font-weight", "bold")

                d3.select(".highlightbar").style("display", "none")
                d3.select("#closedhighlightbar").style("display", "none")

                d3.selectAll(".circles,.pathGs").filter(function (d) { return d.category.includes("Biography") || d.category.includes("Apartment") }).classed("catFilteredOut", false)
                d3.selectAll(".circles,.pathGs").filter(function (d) { return d.category.includes("Biography") == false && d.category.includes("Apartment") == false }).classed("catFilteredOut", true)
              } else {
                d3.select(this).style("font-weight", 400)
                d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)
                twGain.gain.rampTo(0.2,30)
                projGain.gain.rampTo(0.2,30);
                therGain.gain.rampTo(0.05,5);
              }
            })

            d3.select(".f_w").on("click", function () {
              twGain.gain.rampTo(3.5,1);
              projGain.gain.rampTo(0.1,1);
              therGain.gain.rampTo(-0.5,1);
              if (d3.select(this).style("font-weight") != "bold") {
                $('#search').select2('data', null)

                d3.selectAll(".filter").style("font-weight", 400)
                d3.selectAll(".highlights p").style("font-weight", 400)
                d3.select(this).style("font-weight", "bold")

                d3.select(".highlightbar").style("display", "none")
                d3.select("#closedhighlightbar").style("display", "none")

                d3.selectAll(".circles,.pathGs").filter(function (d) { return d.category.includes("Writing") }).classed("catFilteredOut", false)
                d3.selectAll(".circles,.pathGs").filter(function (d) { return d.category.includes("Writing") == false }).classed("catFilteredOut", true)
              } else {
                d3.select(this).style("font-weight", 400)
                d3.selectAll(".circles,.pathGs").classed("catFilteredOut", false)
                twGain.gain.rampTo(0.2,30)
                projGain.gain.rampTo(0.2,30);
                therGain.gain.rampTo(0.05,5);
              }
            })



            // concluding } for the csv promises

          })
      })

  // })
