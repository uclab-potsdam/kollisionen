// specifying SVG

var width = 1000,
  height = 1000,
  start = 0, //centre point
  end = 2, //outer of the spiral
  numSpirals = 77, //number of years in dataset - could be made dynamic to respond to the dataset - first year in data and last year
  // numAxis = 1,
  margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  };

let detailview = false;
let soundtoggle = false;

///audio
const audio1 = new Audio("sounds/sound1.mp3")
const audio2 = new Audio("sounds/sound2.mp3")
const audio3 = new Audio("sounds/sound3.mp3")
const audio4 = new Audio("sounds/sound4.mp3")
const audio5 = new Audio("sounds/sound5.mp3")


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
  .scaleExtent([1 / 3, 8])
  .on("zoom", zoomed)

var svg = d3.select("#chart").append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMidYMid")
  .attr("viewBox", "0 0 " + (width + margin.right) + " " + (height + margin.left + margin.right))
  .append("g")
  .classed("zoomG", true)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

d3.select("#chart").call(zoom);


function zoomed(event, d) {
  d3.select(".zoomG").attr("transform", event.transform);
  d3.selectAll("path").style("stroke-width", 2/event.transform.k)
  //d3.selectAll("circle").attr("r", function(){return d3.select(this).attr("r")/event.transform.k})
}


// The path to draw the spiral needs data to inform it, points generates this, and is used in .datum(points) below

var points = d3.range(start, end + 0.001, (end - start) / 1000)
console.log(points);

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
  .style("opacity", 0.05);

let firstYear = 1898 //we should take this from the data with d3.min()
let lastYear = 1975 //we should take this from the data with d3.max()

let labelScale = d3.scaleLinear()
  .domain([firstYear, lastYear])
  .range([-40, -r])

for (let i = firstYear; i <= lastYear; i++) {
if(i== firstYear || i == lastYear || i%5 == 0){
  backgroundSpiralG.append("text").text(i)
  .attr("y", labelScale(i))
  .style("text-anchor", "middle")
  .attr("dy", "0.4em")
}
}



//  computed value for the total length of the path in user units, this is important for mapping the data later

// var spiralLength = path.node().getTotalLength()

// for turning strings into dates

var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
var formatTime = d3.timeFormat("%e %B %Y"); //
var startParse = d3.timeParse("%Y-%m-%d %I:%M%p");
var endParse = d3.timeParse("%Y-%m-%d %I:%M%p");

//define data

var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup


// htmlRenderer is a function in the form: (data) => htmlText
// eg. (title) => `<p class="title">${title}</p>`
// if data exists, it'll return the string with data inside it, otherwise it'll return an empty string
function conditionalReturn(data, htmlFormatter) {
  if (data == null || data === '' || data === false) {
    return '';
  }
  return htmlFormatter(data);
}

// create a function to compare content of strings and omit repeated strings

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

function replaceTemporal(d, temporalSwap) {

  let a = d.displayTemporal
  let b = d.vdateStart

  if (a == null || a === '' || a === false) {
    return temporalSwap(b)}
      else {
    }
  if (a !== null || a !== '' || a !== false) {
    return '';
  }}



function keywordSplit(data, keywordSplitter) {

 var kws = data.split(";")

 if (data == null || data === '' || data === false) {
      return '';}

      else {

      } if (kws.length > 1) { return keywordSplitter(kws.join(", ")) }

      else { return keywordSplitter(kws) }

  };

///load data
Promise.all([
  d3.csv(url), //data
])
  .then(([spiralData]) => {
    console.log(spiralData);

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
        spiralData[i]["vend"] = +endA[0] + 1 + "-01-01";
        // else if (spiralData[i]["uncertaintyend"] == 2) spiralData[i]["vend"] = +endA[0] + 1 + "-01-01";
      }
      else if (spiralData[i]["uncertaintyend"] == 1) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";
      } else spiralData[i]["vend"] = spiralData[i]["end"];

    // fix date ranges - 01, 03, 05, 07, 08, 10, 12 = 31
    // fix date ranges - 02, 04, 06, 09, 11 = 30
    // else 28 (except leap years)

      if (spiralData[i]["uncertaintyend"] == 2 || 1 && endA[1] == "01" || "03" || "05" || "07" || "08" || "10" || "12" ) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-31";
      } else if (spiralData[i]["uncertaintyend"] === 2 || 1 && endA[1] == "02" || "04" || "06" || "09" || "11" ) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-30";
      } else if (spiralData[i]["uncertaintyend"] === 2 || 1 & endA[1] == "02" && endA[0] % 4 === 0) {
        spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-29";
      } else spiralData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";

       if (spiralData[i]["uncertaintyend"] === 2) spiralData[i]["vend"] = +endA[0] + 1 + "-01-01";
    };

    for (let i = 0; i < spiralData.length; i++) {

      // category 1=Cinema and Theatre, category 2=Biography and Personality, category 3=Writing and Teaching, category 4=Graphic Art, category 5=Apartment
      //categories sorted into separate categories to aid with styling later

      if (spiralData[i]["category"].includes("Cinema and Theatre")) spiralData[i]["category1"] = true;
      if (spiralData[i]["category"].includes("Biography and Personality")) spiralData[i]["category2"] = true;
      if (spiralData[i]["category"].includes("Writing and Teaching")) spiralData[i]["category3"] = true;
      if (spiralData[i]["category"].includes("Graphic Art")) spiralData[i]["category4"] = true;
      if (spiralData[i]["category"].includes("Apartment")) spiralData[i]["category5"] = true;

    };

    // // format the data
    spiralData.forEach(function (d) {
      //   // d.start needs to be just the certain single dates (0), and needs to filter out the uncertain dates (1 or 2). There are also 'ranges' that contain

      //   // d.start = +parseDate(d.start);
      //   // d.end = +parseDate(d.end);
      d.vdateStart = +startParse(d.vstart  + " 00:01AM");
      d.vdateEnd = +endParse(d.vend + " 23:59AM")
      //   // d.vend = +parseDate(d.vend);
    });


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
      const relativePositionInTheYear = getRelativePositionInTheYear(month, day)
      const absoluteRadius = absoluteRadiusScale(year)

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

    //this is the code for the arcs

    const pathG = svg.append("g").classed("pathG", true)

    for (let i = 0; i < spiralData.length; i++) {

      var endSpiralTheta = numSpiralsThetaScale(endParse(spiralData[i].vend  + " 23:59AM"));
      var startSpiralTheta = numSpiralsThetaScale(startParse(spiralData[i].vstart  + " 00:01AM"))
      var numSpiralsTheta = endSpiralTheta - startSpiralTheta;

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

      if (spiralData[i].vend != "") {
        d3.select(".pathG").append("g").classed("pathGs", true)
          .datum(function () { return spiralData[i] })
          .append("path")
          .datum(points)
          .classed("spiralArcs", true)
          .attr("d", spiralArcs)
          .classed("cinema", spiralData[i].category1 == true ? true : false)
          .classed("biography", spiralData[i].category2 == true ? true : false)
          .classed("writing", spiralData[i].category3 == true ? true : false)
          .classed("graphic", spiralData[i].category4 == true ? true : false)
          .classed("apartment", spiralData[i].category5 == true ? true : false)
          .style("opacity", function () {
            if (spiralData[i]["uncertaintystart"] == 0 && spiralData[i]["uncertaintyend"] == 0) {
              return 1
            } else if (spiralData[i]["uncertaintystart"] == 1 && spiralData[i]["uncertaintyend"] == 1) {
              return 0.66
            } else if (spiralData[i]["uncertaintystart"] == 2 && spiralData[i]["uncertaintyend"] == 2) {
              return 0.33
            }

          })
          .attr("transform", "rotate(" + angleStart + ")");
      }

    };

    const circleG = svg.append("g").classed("circleG", true)

    let circles = circleG.selectAll("g")
      .data(function (d) {
        return spiralData.filter(function (d) {
          return d.uncertaintystart === 0 && d.end === "" && d.start.includes("/") == false && d.start.includes(",") == false && d.start != "" //took out some data points that create errors for now
        });
      })
      .join("g")
      .classed("circles", true)
      .each(function (d, i) { //for each group create circles
        ///create an array of all categories to iterate over this and use the nubmer of iterations for the circle radius
        let localCategories = []
        if (d.category1 == true) {
          localCategories.push("cinema")
        }
        if (d.category2 == true) {
          localCategories.push("biography")
        }
        if (d.category3 == true) {
          localCategories.push("writing")
        }
        if (d.category4 == true) {
          localCategories.push("graphic")
        }
        if (d.category5 == true) {
          localCategories.push("apartment")
        }

        //use the array to create the circles
        d3.select(this).selectAll("circle")
          .data(localCategories)
          .join("circle")
          .classed("circle", true)
          .classed("cinema", function (D) {
            return D == "cinema" ? true : false
          })
          .classed("biography", function (D) {
            return D == "biography" ? true : false
          })
          .classed("writing", function (D) {
            return D == "writing" ? true : false
          })
          .classed("graphic", function (D) {
            return D == "graphic" ? true : false
          })
          .classed("apartment", function (D) {
            return D == "apartment" ? true : false
          })
          .attr("cx", function () {
            let [year, month, day] = d.vstart.split('-', 3)
            let eventCoordinate = getEventCoordinate(year, month, day)
            return eventCoordinate.cx
          })
          .attr("cy", function () {
            let [year, month, day] = d.vstart.split('-', 3)
            let eventCoordinate = getEventCoordinate(year, month, day)
            return eventCoordinate.cy
          })
          .attr("r", function (D, I) {
            return 5 - 2 * I
          }) // radius of circle
          .attr("opacity", 1)
      })

    //tooltip
    var tooltip = d3.select("#chart")
      .append('div')
      .attr('class', 'tooltip');

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
        tooltip
          .style('position', 'absolute')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY + 10}px`)
          .style('display', 'inline-block')
          .style('opacity', '0.9')
          .html(`
                ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
                ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
                <p class="tooltip-title">${d.title}</p>`);
      })
      .on("mouseover", function(event, d){if (soundtoggle == true){
        if (d.category1==true){playAudio(audio1)}
        else if(d.category2==true){playAudio(audio2)}
        else if(d.category3==true){playAudio(audio3)}
        else if(d.category4==true){playAudio(audio4)}
        else if(d.category5==true){playAudio(audio5)}
      }})
      .on('click', function (event, d) {
        d3.select("#closedsidebar").style("display", "block")
/// sidebar for single day dates
        sidebar
          .style('display', 'block')
          .html(`
                ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
                ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
                ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
                ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
                ${keywordSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
                ${keywordSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
                ${keywordSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
                ${keywordSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
                ${keywordSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
                <p> <b>Related Objects: </b></p>
                ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
                ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
                <br/>
                ${conditionalReturn(d.category1, (category1) => `<span class="key-dot cinema"></span>Cinema and Theatre<br>`)}
                ${conditionalReturn(d.category2, (category2) => `<span class="key-dot biography"></span>Biography and Personality<br>`)}
                ${conditionalReturn(d.category3, (category3) => `<span class="key-dot writing"></span>Writing and Teaching<br>`)}
                ${conditionalReturn(d.category4, (category4) => `<span class="key-dot graphic"></span>Graphic Art<br>`)}
                ${conditionalReturn(d.category5, (category5) => `<span class="key-dot apartment"></span>Apartment<br>`)}

                `)

      })
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
        tooltip.style('opacity', 0);
      })
/// tooltip for spans
    svg.selectAll(".pathGs")
      .on('mousemove', function (event, d) {
        tooltip
          .style('position', 'absolute')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY + 10}px`)
          .style('display', 'inline-block')
          .style('opacity', '0.9')
          .html(`
                      ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
                      ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
                      <p class="tooltip-title">${d.title}</p>`);
      })
      .on('click', function (event, d) {
        d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
          .style('display', 'block')
          .html(`
          ${replaceTemporal(d, (vdateStart) => `<b><p class="date">${formatTime(d.vdateStart)}</b> to <b>${formatTime(d.vdateEnd)}</b></p>`)}
          ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
          ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
          ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
          ${keywordSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
          ${keywordSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
          ${keywordSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
          ${keywordSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
          ${keywordSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
          <p> <b>Related Objects: </b></p>
          ${conditionalReturn(d.source, (source) => `<p class="source"><b>Source: </b>${source}</p>`)}
          ${conditionalReturn(d.reference, (reference) => `<p class="reference"><b>Further references: </b>${reference}</p>`)}
          <br/>
          ${conditionalReturn(d.category1, (category1) => `<span class="key-dot cinema"></span>Cinema and Theatre<br>`)}
          ${conditionalReturn(d.category2, (category2) => `<span class="key-dot biography"></span>Biography and Personality<br>`)}
          ${conditionalReturn(d.category3, (category3) => `<span class="key-dot writing"></span>Writing and Teaching<br>`)}
          ${conditionalReturn(d.category4, (category4) => `<span class="key-dot graphic"></span>Graphic Art<br>`)}
          ${conditionalReturn(d.category5, (category5) => `<span class="key-dot apartment"></span>Apartment<br>`)}
          `)

      })
      .on("mouseover", function(event, d){if (soundtoggle == true){
        if (d.category1==true){playAudio(audio1)}
        else if(d.category2==true){playAudio(audio2)}
        else if(d.category3==true){playAudio(audio3)}
        else if(d.category4==true){playAudio(audio4)}
        else if(d.category5==true){playAudio(audio5)}
      }})
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
        tooltip.style('opacity', 0);
      });

      //closes sidebar using 'x'

      d3.selectAll("#closedsidebar")
        .on('click', function (d) {

          d3.select(".sidebar")
            .style("display", "none")

          d3.select("#closedsidebar").style("display", "none")

        });


      ///filters

      d3.select("#soundcheckbox").on('change', function() {
        soundtoggle = !soundtoggle
      });

      d3.select(".f_c").on("click", function() {
        if (d3.select(this).style("font-weight") != "bold") {
          d3.selectAll(".filter").style("font-weight", 400)
          d3.select(this).style("font-weight", "bold")
          d3.selectAll("circle.cinema").transition().style("opacity", "1")
          d3.selectAll("circle:not(.cinema)").transition().style("opacity", "0")
          d3.selectAll(".pathG").selectAll("path.cinema").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path:not(.cinema)").transition().style("opacity", "0")
        } else {
          d3.select(this).style("font-weight", 400)
          d3.selectAll("circle").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
        }

      })

      d3.select(".f_b").on("click", function() {
        if (d3.select(this).style("font-weight") != "bold") {
          d3.selectAll(".filter").style("font-weight", 400)
          d3.select(this).style("font-weight", "bold")
          d3.selectAll("circle.biography").transition().style("opacity", "1")
          d3.selectAll("circle:not(.biography)").transition().style("opacity", "0")
          d3.selectAll(".pathG").selectAll("path.biography").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path:not(.biography)").transition().style("opacity", "0")
        } else {
          d3.select(this).style("font-weight", 400)
          d3.selectAll("circle").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
        }
      })

      d3.select(".f_w").on("click", function() {

        if (d3.select(this).style("font-weight") != "bold") {
          d3.selectAll(".filter").style("font-weight", 400)
          d3.select(this).style("font-weight", "bold")
          d3.selectAll("circle.writing").transition().style("opacity", "1")
          d3.selectAll("circle:not(.writing)").transition().style("opacity", "0")
          d3.selectAll(".pathG").selectAll("path.writing").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path:not(.writing)").transition().style("opacity", "0")
        } else {
          d3.select(this).style("font-weight", 400)
          d3.selectAll("circle").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
        }
      })

      d3.select(".f_g").on("click", function() {
        if (d3.select(this).style("font-weight") != "bold") {
          d3.selectAll(".filter").style("font-weight", 400)
          d3.select(this).style("font-weight", "bold")
          d3.selectAll("circle.graphic").transition().style("opacity", "1")
          d3.selectAll("circle:not(.graphic)").transition().style("opacity", "0")
          d3.selectAll(".pathG").selectAll("path.graphic").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path:not(.graphic)").transition().style("opacity", "0")
        } else {
          d3.select(this).style("font-weight", 400)
          d3.selectAll("circle").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
        }
      })

      d3.select(".f_d").on("click", function() {
        if (d3.select(this).style("font-weight") != "bold") {
          d3.selectAll(".filter").style("font-weight", 400)
          d3.select(this).style("font-weight", "bold")
          d3.selectAll("circle.apartment").transition().style("opacity", "1")
          d3.selectAll("circle:not(.apartment)").transition().style("opacity", "0")
          d3.selectAll(".pathG").selectAll("path.apartment").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path:not(.apartment)").transition().style("opacity", "0")
        } else {
          d3.select(this).style("font-weight", 400)
          d3.selectAll("circle").transition().style("opacity", "1")
          d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
        }
      })

  })
