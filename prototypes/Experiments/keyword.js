//link to the data
var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup

const width = window.innerWidth
const height = window.innerHeight
const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  };

var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
var formatTime = d3.timeFormat("%e %B %Y"); //
var startParse = d3.timeParse("%Y-%m-%d %I:%M%p");
var endParse = d3.timeParse("%Y-%m-%d %I:%M%p");

let color =  d3.scaleOrdinal(d3.schemeCategory10)

///load data and preprocessing
Promise.all([
    d3.csv(url), //data
  ])
  .then(([keywordsData]) => {
    console.log(keywordsData)

//preprocessing

keywordsData.forEach(function(d,i){

    keywordsData[i]["vstart"] = keywordsData[i]["start"];
    keywordsData[i]["vend"] = keywordsData[i]["end"];
    keywordsData[i]["uncertaintystart"] = 0;
    keywordsData[i]["uncertaintyend"] = 0;
    keywordsData[i]["category1"] = false;
    keywordsData[i]["category2"] = false;
    keywordsData[i]["category3"] = false;
    keywordsData[i]["category4"] = false;
    keywordsData[i]["category5"] = false;

})

for (let i = 0; i < keywordsData.length; i++) {

    var startA = keywordsData[i]["start"].split("-");

    if (startA[1] && startA[2] === "00" && keywordsData[i]["end"] === "") keywordsData[i]["end"] = keywordsData[i]["start"];

    var endA = keywordsData[i]["end"].split("-");
    // if (startA[1] && startA[2] == "00" && keywordsData[i]["end"] == "") keywordsData[i]["end"] = +startA[0] + 1 + "-01-01"; //duplicates where 'start' has a "-00-"" value to 'end' to create ranges

    /* 2. add 'uncertainty' levels:
    0: no uncertainty, e.g. 1898-01-23
    1: uncertainty in days, e.g. 1914-07-00
    2: uncertainty in months e.g. 1906-00-00
    */
    if (startA[1] == "00") keywordsData[i]["uncertaintystart"] = 2;
    else if (startA[2] == "00") keywordsData[i]["uncertaintystart"] = 1;
    if (endA[1] == "00") keywordsData[i]["uncertaintyend"] = 2;
    else if (endA[2] == "00") keywordsData[i]["uncertaintyend"] = 1;

    /* 3. populate vstart and vend. assign proper dates to events that automatically fall on 1st January
        start
          uncertainty == 2 → YYYY-01-01
          uncertainty == 1 → YYYY-MM-01
        end
          uncertainty == 2 → YYYY-12-31
          uncertainty == 1 → YYYY-MM-28
        */

    // gives all uncertain events actual dates values rather than placing it on 1st January

    if (keywordsData[i]["uncertaintystart"] == 2) {
      keywordsData[i]["vstart"] = startA[0] + "-01-01";
    } else if (keywordsData[i]["uncertaintystart"] == 1) {
      keywordsData[i]["vstart"] = startA[0] + "-" + startA[1] + "-01";
      keywordsData[i]["vend"] = startA[0] + "-" + startA[1] + "-28";
    } else keywordsData[i]["vstart"] = keywordsData[i]["start"];

    if (keywordsData[i]["uncertaintyend"] == 2) {
      keywordsData[i]["vend"] = +endA[0] + "-12-31";
      // else if (keywordsData[i]["uncertaintyend"] == 2) keywordsData[i]["vend"] = +endA[0] + 1 + "-01-01";
    }
    else if (keywordsData[i]["uncertaintyend"] == 1) {
      keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";
    } else keywordsData[i]["vend"] = keywordsData[i]["end"];

  // fix date ranges - 01, 03, 05, 07, 08, 10, 12 = 31
  // fix date ranges - 04, 06, 09, 11 = 30
  // else 28 (except leap years)

  if ((keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "01") || 
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "03") || 
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "05") || 
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "07") || 
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "08") || 
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "10") || 
  (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "12"))  {
 keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-31";
} else if ((keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "04") || 
          (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "06") ||
          (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "09") ||
          (keywordsData[i]["uncertaintyend"] == 1 && endA[1] == "11")) {
 keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-30";
} else if (keywordsData[i]["uncertaintyend"] == 1 && endA[1] =="02" && endA[0] % 4 === 0) {
 keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-29";
} 
//  else keywordsData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";

if (keywordsData[i]["uncertaintyend"] == 2) keywordsData[i]["vend"] = endA[0] + "-12-31"; // it is currently also doing this "-undefined-28"
};

keywordsData.forEach(function(d) {
    d.vstart = +parseDate(d.vstart);
    d.vend = +parseDate(d.vend);
  });

// var keywordsCount equals distinct strings seperated by ';' in d.people, d.places, d.works, d.artistic, and d.additional and ignore empty strings

var keywordsCount = [];

    keywordsData.forEach(function(d,i){
        var keywords = d.people.split(";");
        keywords.forEach(function(d,i){
            if (keywordsCount.indexOf(d) == -1 && d != "") keywordsCount.push(d);
        });
        var keywords = d.places.split(";");
        keywords.forEach(function(d,i){
            if (keywordsCount.indexOf(d) == -1 && d != "") keywordsCount.push(d);
        });
        var keywords = d.works.split(";");
        keywords.forEach(function(d,i){
            if (keywordsCount.indexOf(d) == -1 && d != "") keywordsCount.push(d);
        });
        var keywords = d.artistic.split(";");
        keywords.forEach(function(d,i){
            if (keywordsCount.indexOf(d) == -1 && d != "") keywordsCount.push(d);
        });
        var keywords = d.additional.split(";");
        keywords.forEach(function(d,i){
            if (keywordsCount.indexOf(d) == -1 && d != "") keywordsCount.push(d);
        });
    });

    console.log(keywordsCount);

//scaling for timeline

//scale for width of timeline

    var dateStart = d3.min(keywordsData, function(d) { return d.vstart; });
    var dateEnd = d3.max(keywordsData, function(d) { return d.vend; });

    var dateRange = d3.timeYear.range(dateStart, dateEnd);

    var dateRangeLength = dateRange.length;

    console.log(dateRangeLength); //number of years

    //scale for number of years and width of timeline
    var xScale = d3.scaleLinear()
        .domain([0, dateRangeLength]) //number of years
        .range([0, width]); //width of timeline

    //scale for height of timeline

var yScale = d3.scaleLinear()
    .domain([0, keywordsCount.length])  //number of distinct keywords
    .range([0, height]);    //height of timeline

    // append svg to chart

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("g");

// create timeline for events in d.vstart and v.vend



    var backgroundTimelineG = svg.append("g").classed("backgroundTimelineG", true)

    var timeLine = backgroundTimelineG.append("line")
        .attr("x1", 500)
        .attr("y1", 0) //to be fixed later
        .attr("x2", 500)
        .attr("y2", height) //to be fixed later
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");
    
        var lineLength = timeLine.node().getTotalLength()

        var timeScaleStart = d3.scaleLinear()
        .domain(d3.extent(keywordsData, function(d){
        return d.vstart;
      }))
        .range([0, lineLength]);

        var timeScaleEnd = d3.scaleLinear()
        .domain(d3.extent(keywordsData, function(d){
        return d.vend;
        }))
        .range([0, lineLength]);

        const circleG = svg.append("g").classed("circleG", true)

        let circles = circleG.selectAll("g")

        .data(function (d) {
            return keywordsData.filter(function (d) {
              return d.uncertaintystart === 0 && d.end === "" && d.start.includes("/") == false && d.start.includes(",") == false && d.start != "" //took out some data points that create errors for now
            });
          })
        .join("g")
        .append("circle")
        .classed("circles", true)
      .classed("cinema", function (d) {
        if (d.category1 == true && d.category2 == false && d.category3 == false) 
        {
        return true;
      } return false;
      })
      .classed("biography", function (d) {
        if (d.category2 == true && d.category1 == false && d.category3 == false)
        {
        return true;
      } return false;
      })
      .classed("writing", function (d) {
        if (d.category3 == true && d.category1 == false && d.category2 == false)
        {
        return true;
      } return false;
      })
      .classed("cinebio", function (d) {
        if (d.category1 == true && d.category2 == true && d.category3 == false)
        {
        return true;
      } return false;
      })
      .classed("biowrit", function (d) {
        if (d.category1 == false && d.category2 == true && d.category3 == true)
        {
        return true;
      } return false;
      })
      .classed("cinewrit", function (d) {
        if (d.category1 == true && d.category2 == false && d.category3 == true)
        {
        return true;
      } return false;
      })
      .classed("allcat", function (d) {
        if (d.category1 == true && d.category2 == true && d.category3 == true)
        {
        return true;
      } return false;
      })
      .attr("cx", function(d,i){

        // linePer is the position of cirlce/data on timeline
        
        var linePerStart = timeScaleStart(d.vstart),
            posOnLineStart = timeLine.node().getPointAtLength(linePerStart);
      
            d.linePerStart = linePerStart; // % distance on the timeline
            d.cx = posOnLineStart.x; // x postion on the timeline
            d.cy = posOnLineStart.y; // y position on the timeline

        return d.cx;
      })
      .attr("cy", function(d){
        return d.cy;
      })
      .attr("r", 5) // radius of circle
      .attr("opacity", 1)

      const pathG = svg.append("g").classed("pathG", true)

      for (let i = 0; i < keywordsData.length; i++) {

        if (keywordsData[i].vend != "") {
            d3.select(".pathG").append("g").classed("pathGs", true)
          .append("line")
          .data(keywordsData)
          .classed("cinema", function () {
            if (keywordsData[i].category1 == true && keywordsData[i].category2 == false && keywordsData[i].category3 == false) 
            {
            return true;
          } return false;
          })
          .classed("biography", function () {
            if (keywordsData[i].category2 == true && keywordsData[i].category1 == false && keywordsData[i].category3 == false)
            {
            return true;
          } return false;
          })
          .classed("writing", function () {
            if (keywordsData[i].category3 == true && keywordsData[i].category1 == false && keywordsData[i].category2 == false)
            {
            return true;
          } return false;
          })
          .classed("cinebio", function () {
            if (keywordsData[i].category1 == true && keywordsData[i].category2 == true && keywordsData[i].category3 == false)
            {
            return true;
          } return false;
          })
          .classed("biowrit", function () {
            if (keywordsData[i].category1 == false && keywordsData[i].category2 == true && keywordsData[i].category3 == true)
            {
            return true;
          } return false;
          })
          .classed("cinewrit", function () {
            if (keywordsData[i].category1 == true && keywordsData[i].category2 == false && keywordsData[i].category3 == true)
            {
            return true;
          } return false;
          })
          .classed("allcat", function () {
            if (keywordsData[i].category1 == true && keywordsData[i].category2 == true && keywordsData[i].category3 == true)
            {
            return true;
          } return false;
          })
          .attr("x1", 500)
            .attr("y1", function(d,i){

            // linePer is the position of cirlce/data on timeline
            
            var linePerStart = timeScaleStart(d.vstart),
                posOnLineStart = timeLine.node().getPointAtLength(linePerStart);
          
                d.linePerStart = linePerStart; // % distance on the timeline
                d.cx = posOnLineStart.x; // x postion on the timeline
                d.cy = posOnLineStart.y; // y position on the timeline
    
            return d.cy;
          })
            .attr("x2", 500)
            .attr("y2", function(d,i){

                // linePer is the position of cirlce/data on timeline
                
                var linePerStart = timeScaleEnd(d.vend),
                    posOnLineStart = timeLine.node().getPointAtLength(linePerStart);
              
                    d.linePerStart = linePerStart; // % distance on the timeline
                    d.cx = posOnLineStart.x; // x postion on the timeline
                    d.cy = posOnLineStart.y; // y position on the timeline
        
                return d.cy;
              })
            .attr("stroke", "black")

}






      }

  })
