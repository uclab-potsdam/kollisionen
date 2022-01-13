//link to the data
var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup

const width = window.innerWidth
const height = 50000
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

for (let i = 0; i < keywordsData.length; i++) {

  // category 1=Cinema and Theatre, category 2=Biography and Personality, category 3=Writing and Teaching, category 4=Graphic Art, category 5=Apartment
  //categories sorted into separate categories to aid with styling later

  if (keywordsData[i]["category"].includes("Cinema and Theatre")) keywordsData[i]["category1"] = true;
  if (keywordsData[i]["category"].includes("Biography and Personality")) keywordsData[i]["category2"] = true;
  if (keywordsData[i]["category"].includes("Writing and Teaching")) keywordsData[i]["category3"] = true;
  if (keywordsData[i]["category"].includes("Graphic Art")) keywordsData[i]["category4"] = true;
  if (keywordsData[i]["category"].includes("Apartment")) keywordsData[i]["category5"] = true;

};

// keywordsData.forEach(function(d) {
//     d.vstart = +parseDate(d.vstart);
//     d.vend = +parseDate(d.vend);
//   });

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

    var keywordsCountFiltered = [];

    for (let i = 0; i < keywordsCount.length; i++) {
      var count = 0;
      for (let j = 0; j < keywordsData.length; j++) {
        if (keywordsData[j]["people"].includes(keywordsCount[i]) ||
        keywordsData[j]["places"].includes(keywordsCount[i]) ||
        keywordsData[j]["works"].includes(keywordsCount[i]) ||
        keywordsData[j]["artistic"].includes(keywordsCount[i]) ||
        keywordsData[j]["additional"].includes(keywordsCount[i])) count++;
      }
      if (count > 1) keywordsCountFiltered.push(keywordsCount[i]);
    };

    console.log(keywordsCountFiltered);

//scale for width of timeline

    var dateStart = d3.min(keywordsData, function(d) { return d.vstart; });
    var dateEnd = d3.max(keywordsData, function(d) { return d.vend; });

    var dateRange = d3.timeYear.range(dateStart, dateEnd);

    var dateRangeLength = dateRange.length;

    console.log(dateRangeLength); //number of years

    // append svg to chart

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("g");

    var yScale = d3.scaleLinear()
    .domain([0, keywordsCountFiltered.length])  //number of distinct keywords
    .range([0, height]);    //height of timeline

//

// for(let i = 0; i < keywordsCountFiltered.length; i++) {
//
//     var backgroundTimelineG = svg.append("g").classed("backgroundTimelineG", true)
//
//     var timeLine = backgroundTimelineG.append("line")
//         .attr("x1", 100)  //start of timeline
//         .attr("y1", yScale(i))
//         .attr("x2", width)  //end of timeline
//         .attr("y2", yScale(i))
//         .attr("stroke", "white")
//         .attr("stroke-width", 1)
//         // .attr("stroke-dasharray", "5,5");
//
// };

  const timelineXScale = d3.scaleTime()
    .domain([new Date("1897-01-01"), new Date("1975-01-01")])
    .range([100,width-100])

console.log(new Date("1926-01-22"))
console.log(timelineXScale(new Date(1926)))


  let timelinesG = d3.select("#chart").select("svg").selectAll(".timelines")
  .data(keywordsCountFiltered)//.filter(function(d,i){return i < 200}))
  .join("g")
  .classed("backgroundTimelineG", true)

  timelinesG.append("text")
  .text(function(d){return d})
  .attr("x", 100)
  .attr("y", function(d,i){return 10+i*20})
  .style("text-anchor", "end")

  timelinesG.append("line")
  .attr("x1", 100)  //start of timeline
  .attr("y1", function(d,i){return 10+i*20})
  .attr("x2", width-100)  //end of timeline
  .attr("y2", function(d,i){return 10+i*20})
  .attr("stroke", "white")
  .attr("stroke-width", 3)

  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineNodes").append("g")
    .data(keywordsData.filter(function (d) {
   return d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D) && d.uncertaintystart === 0 && d.end === "" && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
     }))
    .join("circle")
    .attr("r",3)
    .attr("cx", function(d,i){
      let date = new Date (d.vstart)
    //console.log(date + "-" + timelineXScale(date))
      return timelineXScale(date)})
    .attr("cy", function(){return 10+I*20})
    .classed("cinema", function (d) {if (d.category1 == true && d.category2 == false && d.category3 == false)
    {return true}else{return false}})
    .classed("biography", function (d) {
      if (d.category2 == true && d.category1 == false && d.category3 == false)
      {
      return true;
    } else{return false}
    })
    .classed("writing", function (d) {
      if (d.category3 == true && d.category1 == false && d.category2 == false)
      {
      return true;
    } else{return false}
    })
    .classed("cinebio", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == false)
      {
      return true;
    }  else{return false}
    })
    .classed("biowrit", function (d) {
      if (d.category1 == false && d.category2 == true && d.category3 == true)
      {
      return true;
    }  else{return false}
    })
    .classed("cinewrit", function (d) {
      if (d.category1 == true && d.category2 == false && d.category3 == true)
      {
      return true;
    }  else{return false}
    })
    .classed("allcat", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == true)
      {
      return true;
    }  else{return false}
    })
  })

  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineLines").append("g")
    .data(keywordsData.filter(function (d) {
   return d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D) && d.vend != "" && d.vstart.includes("/") == false && d.vstart.includes(",") == false  //took out some data points that create errors for now
     }))
    .join("line")
    .attr("stroke-width", 3)
    .classed("biography", function (d) {
      if (d.category2 == true && d.category1 == false && d.category3 == false)
      {
      return true;
    } else{return false}
    })
    .classed("writing", function (d) {
      if (d.category3 == true && d.category1 == false && d.category2 == false)
      {
      return true;
    } else{return false}
    })
    .classed("cinebio", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == false)
      {
      return true;
    }  else{return false}
    })
    .classed("biowrit", function (d) {
      if (d.category1 == false && d.category2 == true && d.category3 == true)
      {
      return true;
    }  else{return false}
    })
    .classed("cinewrit", function (d) {
      if (d.category1 == true && d.category2 == false && d.category3 == true)
      {
      return true;
    }  else{return false}
    })
    .classed("allcat", function (d) {
      if (d.category1 == true && d.category2 == true && d.category3 == true)
      {
      return true;
    }  else{return false}
    })
                .attr("x1", function(d,i){
                  let date = new Date (d.vstart)
                //console.log(date + "-" + timelineXScale(date))
                  return timelineXScale(date)})
                .attr("y1", function(){return 10+I*20})
                .attr("x2", function(d,i){
                  let date = new Date (d.vend)
                //console.log(date + "-" + timelineXScale(date))
                  return timelineXScale(date)})
                .attr("y2", function(){return 10+I*20})
        
        })

        var tooltip = d3.select("#chart")
        .append('div')
        .attr('class', 'tooltip')
        .style('display', 'none');

        tooltip.append('div')
        .attr('class', 'date');
        tooltip.append('div')
        .attr('class', 'value');

        svg.selectAll("circle")
        .on('mouseover', function(d) {
            tooltip
                  .style('position', 'absolute')
                  .style('left', `${d3.event.pageX + 10}px`)
                  .style('top', `${d3.event.pageY + 20}px`)
                  .style('display', 'inline-block')
                  .style('opacity', '0.9')
                  .html(`
                    <span><b>${formatTime(d.vstart)}</b></span>
                    <br> <b>${d.title}</b> </span>`);
              })
        .on('mouseout', function(d) {
            d3.selectAll("rect")
            .style("fill", function(d){return color(d.number1);})
            .style("stroke", "none")

            tooltip.style('display', 'none');
            tooltip.style('opacity',0);
        });


// };

});



  // });
//for positioning the events on the timeline
