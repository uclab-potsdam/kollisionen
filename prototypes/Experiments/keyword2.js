//link to the data
var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup

// const width = 1500 //width of the svg sidebar is 350px - needs to be adjusted to allow for the width of the sidebar
const width = innerWidth - 350 //width of the svg sidebar is 350px - needs to be adjusted to allow for the width of the sidebar
const height = 8250
const margin = {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100
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
    .range([350,width-200])

console.log(new Date("1926-01-22"))
console.log(timelineXScale(new Date(1926)))

  let timelinesG = d3.select("#chart").select("svg").selectAll(".timelines")
  .data(keywordsCountFiltered)//.filter(function(d,i){return i < 200}))
  .join("g")
  .classed("backgroundTimelineG", true)

  timelinesG.append("text")
  .text(function(d){return d})
  .attr("x", 350)
  .attr("y", function(d,i){return 10+i*20})
  .style("text-anchor", "end")

  timelinesG.append("line")
  .attr("x1", 350)  //start of timeline
  .attr("y1", function(d,i){return 10+i*20})
  .attr("x2", width-200)  //end of timeline
  .attr("y2", function(d,i){return 10+i*20})
  .attr("stroke", "white")
  .attr("stroke-width", 3)

// circles for timeline

  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineNodes").append("g")
    .data(keywordsData.filter(function (d) {
      if(d.uncertaintystart === 0 && d.vend === ""){
   return (d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
    }}))
    .join("circle")
    .classed("circles", true)
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

//symbol for keyword categories

// var symbolPlaces = d3.symbol()
//   .type(d3.symbolTriangle)
//   .size(15);

// var symbolPeople = d3.symbol()
//   .type(d3.symbolDiamond)
//   .size(15);

//   var symbolWorks = d3.symbol()
//   .type(d3.symbolWye)
//   .size(15);

//   var symbolArtistic = d3.symbol()
//   .type(d3.symbolSquare)
//   .size(15);

//   var symbolAdditional = d3.symbol()
//   .type(d3.symbolCross)
//   .size(15);

//   var pathDataPlaces = symbolPlaces();
//   var pathDataPeople = symbolPeople();
//   var pathDataWorks = symbolWorks();
//   var pathDataArtistic = symbolArtistic();
//   var pathDataAdditional = symbolAdditional();


//   timelinesG.each(function(D,I){
//     d3.select(this).selectAll(".timelineNodes").append("g")
//     .data(keywordsData.filter(function (d) {
//       if(d.uncertaintystart === 0 && d.vend === ""){
//    return (d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
//     }}))
//     .join("path")
//     .attr("transform", function(d,i){
//       let date = new Date (d.vstart)
//       return "translate(" + timelineXScale(date) + "," + (10+I*20) + ")"})
//     // .attr("d", pathDataPeople)
//     .attr("d", function(d,i){
//             if(d.places){
//               return pathDataPlaces
//             } else if(d.people){
//               return pathDataPeople
//             } else if(d.works){
//               return pathDataWorks
//             } else if(d.artistic){
//               return pathDataArtistic
//             } else if(d.additional){
//               return pathDataAdditional
//             }
//              })
//     .classed("biography", function (d) {
//       if (d.category2 == true && d.category1 == false && d.category3 == false)
//       {
//       return true;
//     } else{return false}
//     })
//     .classed("writing", function (d) {
//       if (d.category3 == true && d.category1 == false && d.category2 == false)
//       {
//       return true;
//     } else{return false}
//     })
//     .classed("cinebio", function (d) {
//       if (d.category1 == true && d.category2 == true && d.category3 == false)
//       {
//       return true;
//     }  else{return false}
//     })
//     .classed("biowrit", function (d) {
//       if (d.category1 == false && d.category2 == true && d.category3 == true)
//       {
//       return true;
//     }  else{return false}
//     })
//     .classed("cinewrit", function (d) {
//       if (d.category1 == true && d.category2 == false && d.category3 == true)
//       {
//       return true;
//     }  else{return false}
//     })
//     .classed("allcat", function (d) {
//       if (d.category1 == true && d.category2 == true && d.category3 == true)
//       {
//       return true;
//     }  else{return false}
//     })
//   })



  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineLines").append("g")
    .data(keywordsData.filter(function (d) {
      if (d.vend.includes("-")) {
   return (d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != ""//took out some data points that create errors for now

    } }))
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
                // console.log(date + "-" + timelineXScale(date))
                  return timelineXScale(date)})
                .attr("y1", function(){return 10+I*20})
                .attr("x2", function(d,i){
                  let date = new Date (d.vend)
                // console.log(date + "-" + timelineXScale(date))
                // console.log(d.vend + "-" +date + "-" + timelineXScale(date))
                  return timelineXScale(date)})
                .attr("y2", function(){return 10+I*20})

        })


            //tooltip
    var tooltip = d3.select("body")
    .append('div')
    .attr('class', 'tooltip')
    .style('display', 'none');

  var sidebar = d3.select("#sidebar")
    .append('div')
    .attr('class', 'sidebar');

        





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
  let b = d.vstart

  if (a == null || a === '' || a === false) {
    return temporalSwap(b)}
      else {
    }
  if (a !== null || a !== '' || a !== false) {
    return '';
  }};

//function to split keywords by comma

function stringSplit(data, keywordSplitter) {

 var kws = data.split(";")

 if (data == null || data === '' || data === false) {
      return '';
    } else {

      } if (kws.length > 1) { return keywordSplitter(kws.join(", ")) }

      else { return keywordSplitter(kws) }

  };

///tooltip for single day events

  svg.selectAll("circles")
    .on('mousemove', function (event, d) {

      // ///display same year nodes/arcs
      // var [year, month, day] = d.vstart.split('-', 3)
      // d3.selectAll("circles")
      // .style("opacity", function(D){if(D.vstart.includes(year) == true){return 1}else{ return 0}})

      // d3.selectAll("lines")
      // .style("opacity", function(D){if(D.vstart.includes(year) == true || D.vend.includes(year) == true){return 1}else{ return 0}})

      // d3.selectAll(".timeLabels")
      // .style("opacity", function(D){if(D == year){return 1}else{ return 0}})

      //tooltip
      tooltip
        .style('position', 'absolute')
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY + 10}px`)
        .style('display', 'inline-block')
        .style('opacity', '0.9')
        .html(`
              ${replaceTemporal(d, (vstart) => `<p class="date">${formatTime(d.vstart)}</p>`)}
              ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
              <p class="tooltip-title">${d.title}</p>`);
    })
    // .on("mouseover", function(event, d){if (soundtoggle == true){
    //   if (d.category1==true){playAudio(audio1)}
    //   else if(d.category2==true){playAudio(audio2)}
    //   else if(d.category3==true){playAudio(audio3)}
    //   else if(d.category4==true){playAudio(audio4)}
    //   else if(d.category5==true){playAudio(audio5)}
    // }})
    .on('click', function (event, d) {
      d3.select("#closedsidebar").style("display", "block")
/// sidebar for single day dates
      sidebar
        .style('display', 'block')
        .html(`
              ${replaceTemporal(d, (vstart) => `<p class="date">${formatTime(d.vstart)}</p>`)}
              ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
              ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
              ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
              ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
              ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
              ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
              ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
              ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
              ${stringSplit(d.image, (image) => `<p class="objects"><b>Additonal items: <br> </b><img src="images/objects/${image}.png" alt="${image}" width = "25%" height = "auto"  class="image"></p><br>`)}
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

      d3.selectAll(".circles")
      .style("opacity", 1)

      // d3.selectAll(".timelineLines")
      // .style("opacity", 1)

      // d3.selectAll(".timeLabels")
      // .style("opacity", function(D){if(D== firstYearforLabel || D == lastYearforLabel){return 1}else{return 0}})
    })
/// tooltip for spans
  // svg.selectAll(".timelineLines")
  //   .on('mousemove', function (event, d) {

  //     ///display same year nodes/arcs
  //     // var [year, month, day] = d.vstart.split('-', 3)
  //     // console.log(year)
  //     // d3.selectAll(".circles")
  //     // .style("opacity", function(D){if(D.vstart.includes(year) == true){return 1}else{ return 0}})

  //     d3.selectAll(".timelineLines")
  //     .style("opacity", function(D){if(D.vstart.includes(year) == true || D.vend.includes(year) == true){return 1}else{ return 0}})

  //     // d3.selectAll(".timeLabels")
  //     // .style("opacity", function(D){if(D == year){return 1}else{ return 0}})


  //     tooltip
  //       .style('position', 'absolute')
  //       .style('left', `${event.pageX + 5}px`)
  //       .style('top', `${event.pageY + 10}px`)
  //       .style('display', 'inline-block')
  //       .style('opacity', '0.9')
  //       .html(`
  //                   ${replaceTemporal(d, (vstart) => `<b><p class="date">${formatTime(d.vstart)}</b> to <b>${formatTime(d.vend)}</b></p>`)}
  //                   ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
  //                   <p class="tooltip-title">${d.title}</p>`);
  //   })
    .on('click', function (event, d) {
      d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
      sidebar
        .style('display', 'block')
        .html(`
        ${replaceTemporal(d, (vstart) => `<b><p class="date">${formatTime(d.vstart)}</b> to <b>${formatTime(d.vend)}</b></p>`)}
        ${conditionalReturn(d.displayTemporal, (displayTemporal) => `<p class="displayTemporal"><b>${displayTemporal}</b></p>`)}
        ${conditionalReturn(d.title, (title) => `<p class="title">${title}</p>`)}
        ${compareDescription(d, (description) => `<p class="description"><b>Description: </b>${description}</p>`)}
        ${stringSplit(d.people, (people) => `<p class="people"><b>People: </b>${people}</p>`)}
        ${stringSplit(d.places, (places) => `<p class="places"><b>Places: </b>${places}</p>`)}
        ${stringSplit(d.works, (works) => `<p class="works"<b><b>Works: </b>${works}</p>`)}
        ${stringSplit(d.artistic, (artistic) => `<p class="artistic"><b>Artistic concepts: </b>${artistic}</p>`)}
        ${stringSplit(d.additional, (additional) => `<p class="misc"><b>Misc: </b>${additional}</p>`)}
        ${conditionalReturn(d.image, (image) => `<p class="objects"><b>Additonal items: <br> </b><img src="images/objects/${image}.png" alt="${image} width = "25%" height = "auto" class="image"></p><br>`)}
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
    // .on("mouseover", function(event, d){if (soundtoggle == true){
    //   if (d.category1==true){playAudio(audio1)}
    //   else if(d.category2==true){playAudio(audio2)}
    //   else if(d.category3==true){playAudio(audio3)}
    //   else if(d.category4==true){playAudio(audio4)}
    //   else if(d.category5==true){playAudio(audio5)}
    // }})
    .on('mouseout', function (d) {
      tooltip.style('display', 'none');
      tooltip.style('opacity', 0);

      d3.selectAll(".circles")
      .style("opacity", 1)

      // d3.selectAll(".circles")
      // .style("opacity", 1)

      // d3.selectAll(".timeLabels")
      // .style("opacity", function(D){if(D== firstYearforLabel || D == lastYearforLabel){return 1}else{return 0}})

    });

    //closes sidebar using 'x'

    d3.selectAll("#closedsidebar")
      .on('click', function (d) {

        d3.select(".sidebar")
          .style("display", "none")

        d3.select("#closedsidebar").style("display", "none")

      });




// };

});




//for positioning the events on the timeline
