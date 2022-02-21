//link to the data
var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup

var itemsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpZlBfSa0sBkPXXCdHykUFi5N2zPcclrda8iaYlbWoyzaWxDj7q3WEtmP7m8hrzk5ejAgjk-Id_zk9/pub?gid=1626158426&single=true&output=csv'

var urlSarraz = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1234220819&single=true&output=csv'

var urlPaul = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1752697880&single=true&output=csv'

var urlSokrates = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=196127159&single=true&output=csv'

var urlMei = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1779118710&single=true&output=csv'

var urlStraw = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=427715118&single=true&output=csv'

var urlMeyer = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=2142317381&single=true&output=csv'

var urlHighlights = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT3XiwLUS9uF0SIvV0QOOTGJv5FY077vEEIiShwtJkEcxDC-Dghp9JEycZxNDAplPetp73-ssUqZ8dv/pub?gid=0&single=true&output=csv'

// const width = 1500 //width of the svg sidebar is 350px - needs to be adjusted to allow for the width of the sidebar
const width = innerWidth - 420 //width of the svg sidebar is 350px - needs to be adjusted to allow for the width of the sidebar
const height = 22000
const margin = {
    top: 100,
    bottom: 100,
    left: 0,
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

keywordsData.forEach(function(d) {
//     d.vstart = +parseDate(d.vstart);
//     d.vend = +parseDate(d.vend);
d.vdateStart = +startParse(d.vstart  + " 00:01AM");
d.vdateEnd = +endParse(d.vend + " 23:59AM")
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

    //sort keywordsCountFiltered alphabetically

    keywordsCountFiltered.sort(); // alphabetically sort

    console.log(keywordsCountFiltered);

    //create array of objects with keyword and count

    var keywordsCountFilteredObjects = [];

    for (let i = 0; i < keywordsCountFiltered.length; i++) {
      var count = 0;
      for (let j = 0; j < keywordsData.length; j++) {
        if (keywordsData[j]["people"].includes(keywordsCountFiltered[i]) ||
        keywordsData[j]["places"].includes(keywordsCountFiltered[i]) ||
        keywordsData[j]["works"].includes(keywordsCountFiltered[i]) ||
        keywordsData[j]["artistic"].includes(keywordsCountFiltered[i]) ||
        keywordsData[j]["additional"].includes(keywordsCountFiltered[i])) count++;
      }

      keywordsCountFilteredObjects.push({"keyword":keywordsCountFiltered[i],"count":count});
    };

    console.log(keywordsCountFilteredObjects);

// sort keywordsCountFilteredObjects by count

    keywordsCountFilteredObjects.sort(function(a, b) {
      return b.count - a.count;
    });
    
    console.log(keywordsCountFilteredObjects);


// sort keywordsCountFiltered by the count from the sorted keywordsCountFilteredObjects

    var keywordsCountFilteredSorted = [];

    for (let i = 0; i < keywordsCountFilteredObjects.length; i++) {
      keywordsCountFilteredSorted.push(keywordsCountFilteredObjects[i]["keyword"]);
    };

    console.log(keywordsCountFilteredSorted);

    Promise.all([
      d3.csv(itemsUrl), //data
    ])
      .then(([itemsData]) => {
        console.log(itemsData);
      });

      for (let i = 0; i < keywordsData.length; i++) {

      if (keywordsData[i]["items"]) {
        keywordsData[i]["items"] = keywordsData[i]["items"].split(",");
      }
    };

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

// load the data for objects

    // la sarraz

    Promise.all([
      d3.csv(urlSarraz), //data
    ])
      .then(([sarrazData]) => {
        console.log(sarrazData);
      // });

      for (let i = 0; i <sarrazData.length; i++) {
        sarraz.push(sarrazData[i]["Event Identifier"]);
      }

    // paul robeson

            Promise.all([
      d3.csv(urlPaul), //data
    ])
      .then(([paulData]) => {
        console.log(paulData);
      // });

      let paul = [];
      for (let i = 0; i < paulData.length; i++) {
        paul.push(paulData[i]["Event Identifier"]);
      }
    
    // sokrates

            Promise.all([
      d3.csv(urlSokrates), //data
    ])
      .then(([sokratesData]) => {
        console.log(sokratesData);

// make an array of the "Event Identifier"s

  let sokrates = [];
  for (let i = 0; i < sokratesData.length; i++) {
    sokrates.push(sokratesData[i]["Event Identifier"]);
  }

      // });

    // mei lang-fang

            Promise.all([
      d3.csv(urlMei), //data
    ])
      .then(([meiData]) => {
        console.log(meiData);
      // });

      let mei = [];
  for (let i = 0; i < meiData.length; i++) {
    mei.push(meiData[i]["Event Identifier"]);
  }

    // straw horseman

            Promise.all([
      d3.csv(urlStraw), //data
    ])
      .then(([strawData]) => {
        console.log(strawData);
      // });

      let straw = [];
  for (let i = 0; i < strawData.length; i++) {
    straw.push(strawData[i]["Event Identifier"]);
  }

      // meyerhold

            Promise.all([
      d3.csv(urlMeyer), //data
    ])
      .then(([meyerholdData]) => {
        console.log(meyerholdData);
      // });

      let meyerhold = [];
  for (let i = 0; i < meyerholdData.length; i++) {
    meyerhold.push(meyerholdData[i]["Event Identifier"]);
  }

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

// tooltip setup

var tooltip = d3.select("body")
.append('div')
.data(keywordsData)
.attr('class', 'tooltip')
.style('display', 'none');

var sidebar = d3.select("#sidebar")
.append('div')
.attr('class', 'sidebar');

//Conditioning the data for the sidebar

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



  let timelinesG = d3.select("#chart").select("svg").selectAll(".timelines")
  .data(keywordsCount)//.filter(function(d,i){return i < 200})) // sort by count
  // .data(keywordsCountFiltered) //sort aphabetically
  .join("g")
  .classed("backgroundTimelineG", true)

  timelinesG.append("text")
  .text(function(d){
    if(d.length >= 20){return d.slice(0, 20) + "[…]"}
    else{return d}})
  .attr("x", 320)
  .attr("y", function(d,i){return 10+i*20})
  .style("text-anchor", "end")

  timelinesG.append("line")
  .attr("x1", 350)  //start of timeline
  .attr("y1", function(d,i){return 10+i*20})
  .attr("x2", width-200)  //end of timeline
  .attr("y2", function(d,i){return 10+i*20})
  // .attr("stroke", "white")
  // .attr("stroke-width", 3)
  .style("stroke", "grey")
  .style("stroke", ("6, 5"))
  .style("opacity", 0.05)

// fisheye effect

var fisheye = d3.fisheye
    .circular()
    .radius(10)

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
    //fisheye effect
    // .on('mouseover', function (event, d) {
    //   fisheye.focus(d3.select(this));

    //   d3.select(this).each(function(d) { d.fisheye = fisheye(d); })
    //         .attr("cx", function(d) { return d.fisheye.x; })
    //         .attr("cy", function(){return 10+I*20})
    //         .attr("r", function(d) { return d.fisheye.z * 0.3; });

    //         console.log(d)
    // })



    // .on('mouseout', function (event, d) {
    //   fisheye.focus(null);

    // })

      //tooltip
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

      .on('click', function (event, d) {
      d3.select("#closedsidebar").style("display", "block")
      sidebar
      .style('display', 'block')
      .html(`
            ${replaceTemporal(d, (vdateStart) => `<p class="date">${formatTime(d.vdateStart)}</p>`)}
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
  })
  .on('mouseout', function (d) {
    tooltip.style('display', 'none');
    tooltip.style('opacity', 0);

    d3.selectAll(".circles")
    .style("opacity", 1)
  });
  d3.selectAll("#closedsidebar")
    .on('click', function (d) {

      d3.select(".sidebar")
        .style("display", "none")

      d3.select("#closedsidebar").style("display", "none")

    });  
  })

  //spans

  timelinesG.each(function(D,I){
    d3.select(this).selectAll(".timelineLines").append("g")
    .data(keywordsData.filter(function (d) {
      if (d.vend.includes("-")) {
   return (d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != ""//took out some data points that create errors for now

    } }))
    .join("line")
    .classed("timelineLines", true)
    .attr("stroke-width", 6)
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
      .on('mouseout', function (d) {
        tooltip.style('display', 'none');
        tooltip.style('opacity', 0);

        d3.selectAll(".timelineLines")
        .style("opacity", 1)
      })
      d3.selectAll("#closedsidebar")
      .on('click', function (d) {

        d3.select(".sidebar")
          .style("display", "none")

        d3.select("#closedsidebar").style("display", "none")

      })
        })

//symbols for keyword categories

var symbolPeople = d3.symbol()
  .type(d3.symbolTriangle)
  .size(15);

var symbolPlaces = d3.symbol()
  .type(d3.symbolDiamond)
  .size(15);

  var symbolWorks = d3.symbol()
  .type(d3.symbolWye)
  .size(15);

  var symbolArtistic = d3.symbol()
  .type(d3.symbolSquare)
  .size(15);

  var symbolAdditional = d3.symbol()
  .type(d3.symbolCross)
  .size(15);

  var pathDataPlaces = symbolPlaces();
  var pathDataPeople = symbolPeople();
  var pathDataWorks = symbolWorks();
  var pathDataArtistic = symbolArtistic();
  var pathDataAdditional = symbolAdditional();

        timelinesG.each(function(D,I){
          d3.select(this).selectAll(".symbols").append("g")
          .data(keywordsData.filter(function (d) {
               return (d.people.includes(D) || d.places.includes(D) || d.works.includes(D) || d.artistic.includes(D) ||d.additional.includes(D)) && d.vstart.includes("/") == false && d.vstart.includes(",") == false && d.vstart != "" //took out some data points that create errors for now
                }))               
.join("path")
.attr("transform", function(d,i){
return "translate(340," + (10+I*20) + ")"})
.attr("d", function(d,i){
        if(d.places){
          return pathDataPlaces
        } else if(d.people){
          return pathDataPeople
        } else if(d.works){
          return pathDataWorks
        } else if(d.artistic){
          return pathDataArtistic
        } else if(d.additional){
          return pathDataAdditional
        }
         })
.attr("fill", "black")
.attr("stroke", "black")
.attr("stroke-width", 1)
.attr("opacity", 1)

})

///////////////////search


let nodes = []
let links = []

keywordsData.forEach(function(d, i) {

  let peopleNodes = d.people == "" ? [] : d.people.split(";")
  let placesNodes = d.places == "" ? [] : d.places.split(";")
  let worksNodes = d.works == "" ? [] : d.works.split(";")
  let artisticNodes = d.artistic == "" ? [] : d.artistic.split(";")
  let additionalNodes = d.additional == "" ? [] : d.additional.split(";")

  //add people to nodes
  peopleNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "people"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })


  //add places to nodes
  placesNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "places"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  //add works to nodes
  worksNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "works"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  //add artistic to nodes
  artisticNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "artistic"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  //add additional to nodes
  additionalNodes.forEach(function(D) {
    if (nodes.filter(function(x) {
        return x.name == D
      }).length == 0) {
      nodes.push({
        name: D,
        count: 1,
        category: "additional"
      })
    } else {
      nodes.filter(function(x) {
        return x.name == D
      })[0].count++
    }
  })

  let allNodes = [].concat(peopleNodes, placesNodes, worksNodes, artisticNodes, additionalNodes)

  //create combinations of source+targets out of all "objects"
  //https://stackoverflow.com/questions/43241174/javascript-generating-all-combinations-of-elements-in-a-single-array-in-pairs
  allNodes.flatMap(
    function(v, i) {
      return allNodes.slice(i + 1).forEach(function(w) {
        //  console.log( v + '+ ' + w )
        if (links.filter(function(D) {
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
          links.filter(function(D) {
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

nodes.sort(function(a, b) {
  return b.count - a.count;
})

///////////////////search



let searchDaten = [
{
text: "People",
children:[]
},
{
text: "Places",
children:[]
},
{
text: "Artistic",
children:[]
},
{
text: "Additional",
children:[]
},
{
text: "Works",
children:[]
},

];


nodes.filter(function(d){return d.category == "people"}).forEach(function(d,i){
searchDaten[0].children.push(
{id:i,
text:d.name + " ("+d.count+")",
name:d.name,
category: "people",
count:d.count,}
)
})

nodes.filter(function(d){return d.category == "places"}).forEach(function(d,i){
searchDaten[1].children.push(
{id:i,
  text:d.name + " ("+d.count+")",
  name:d.name,
  category: "places",
count:d.count,}
)
})

nodes.filter(function(d){return d.category == "artistic"}).forEach(function(d,i){
searchDaten[2].children.push(
{id:i,
  text:d.name + " ("+d.count+")",
  name:d.name,
  category: "artistic",
count:d.count,}
)
})

nodes.filter(function(d){return d.category == "additional"}).forEach(function(d,i){
searchDaten[3].children.push(
{id:i,
  text:d.name + " ("+d.count+")",
  name:d.name,
  category: "additional",
count:d.count,}
)
})

nodes.filter(function(d){return d.category == "works"}).forEach(function(d,i){
searchDaten[4].children.push(
{id:i,
  text:d.name + " ("+d.count+")",
  name:d.name,
  category: "works",
  count:d.count,}
)
})

////search
$("#search").select2({
data: searchDaten,
containerCssClass: "search",
selectOnClose: true,
placeholder: "Search events keywords",
allowClear: true

});


$("#search").on("select2-selecting", function(e) {
console.log(e.choice.name)
console.log(e.choice.category)

d3.selectAll("circle").classed("filteredout", function(d){
  if (e.choice.category == "people"){
    if(d.people.includes(e.choice.name)){return false}else{return true}
  }else if (e.choice.category == "places"){
      if(d.places.includes(e.choice.name)){return false}else{return true}
    }else if (e.choice.category == "artistic"){
        if(d.artistic.includes(e.choice.name)){return false}else{return true}
      }else if (e.choice.category == "additional"){
          if(d.additional.includes(e.choice.name)){return false}else{return true}
        }else if (e.choice.category == "works"){
            if(d.works.includes(e.choice.name)){return false}else{return true}
          }})

          d3.selectAll(".timelineLines").classed("filteredout", function(d){
            if (e.choice.category == "people"){
              if(d.people.includes(e.choice.name)){return false}else{return true}
            }else if (e.choice.category == "places"){
                if(d.places.includes(e.choice.name)){return false}else{return true}
              }else if (e.choice.category == "artistic"){
                  if(d.artistic.includes(e.choice.name)){return false}else{return true}
                }else if (e.choice.category == "additional"){
                    if(d.additional.includes(e.choice.name)){return false}else{return true}
                  }else if (e.choice.category == "works"){
                      if(d.works.includes(e.choice.name)){return false}else{return true}
                    }})

})


$("#search").on("select2-clearing", function(e) {
d3.selectAll(".timelineLines").classed("filteredout",false)
d3.selectAll("circle").classed("filteredout",false)
})

// filters and sorting

//timelines sorting options

// d3.select(".alphabetical")
// .on("click", function() {
//   if (d3.select(this).style("font-weight") != "bold") {
//     d3.selectAll(".filter").style("font-weight", 400)
//     d3.select(this).style("font-weight", "bold")
//     d3.selectAll(".timelineG").select("#chart").select("svg").selectAll(".timelines")
//   .data(keywordsCountFilteredSorted)//.filter(function(d,i){return i < 200})) // sort by count
//   // .data(keywordsCountFiltered) //sort aphabetically
//   .join("g")
//   .classed("backgroundTimelineG", true)
//   }else {
//     d3.select(this).style("font-weight", 400)
//   }
//   });

// d3.select("frequency").on("click", function() {

//   let timelinesG = d3.select("#chart").select("svg").selectAll(".timelines")
//   .data(keywordsCountFilteredSorted)
//   .join("g")
//   .classed("backgroundTimelineG", true)


// })

// d3.select("temporal").on("click", function() {

//   let timelinesG = d3.select("#chart").select("svg").selectAll(".timelines")
//   .data(keywordsCount)
//   .join("g")
//   .classed("backgroundTimelineG", true)


// })

// filter for categories

d3.select(".f_c").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.cinema").transition().style("opacity", "1")
    d3.selectAll("circle:not(.cinema)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".cinema").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(":not(.cinema)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

d3.select(".f_b").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.biography").transition().style("opacity", "1")
    d3.selectAll("circle:not(.biography)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".biography").transition().style("opacity", 1)
    d3.selectAll(".timelineLines").filter(":not(.biography)").transition().style("opacity", 0)

  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

d3.select(".f_w").on("click", function() {

  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.writing").transition().style("opacity", "1")
    d3.selectAll("circle:not(.writing)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".writing").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(":not(.writing)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

d3.select(".f_cw").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.cinewrit").transition().style("opacity", "1")
    d3.selectAll("circle:not(.cinewrit)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".cinewrit").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(":not(.cinewrit)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

d3.select(".f_cb").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.cinebio").transition().style("opacity", "1")
    d3.selectAll("circle:not(.cinebio)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".cinebio").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(":not(.cinebio)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

d3.select(".f_wb").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.biowrit").transition().style("opacity", "1")
    d3.selectAll("circle:not(.biowrit)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".biowrit").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(":not(.apartment)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

d3.select(".f_ac").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle.allacat").transition().style("opacity", "1")
    d3.selectAll("circle:not(.allcat)").transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(".allcat").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(":not(.allcat)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})
// };

// filters for entities

//people

d3.select(".triangle").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d) { return d.people != ""; }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d) { return d.people == ""; }).transition().style("opacity", "0")
    // d3.selectAll(".timelineLines").filter(".cinema").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").filter(":not(.cinema)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }

})

//places

d3.select(".diamond").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d) { return d.places != ""; }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d) { return d.places == ""; }).transition().style("opacity", "0")
    // d3.selectAll(".timelineLines").filter(".cinema").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").filter(":not(.cinema)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }

})

//works

d3.select(".threeprong").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d) { return d.works != ""; }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d) { return d.works == ""; }).transition().style("opacity", "0")
    // d3.selectAll(".timelineLines").filter(".cinema").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").filter(":not(.cinema)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }

})

//artistic concepts

d3.select(".square").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d) { return d.artistic != ""; }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d) { return d.artistic == ""; }).transition().style("opacity", "0")
    // d3.selectAll(".timelineLines").filter(".cinema").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").filter(":not(.cinema)").transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    // d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }

})

//additional

d3.select(".plus").on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d) { return d.additional != ""; }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d) { return d.additional == ""; }).transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(function(d) { return d.additional != ""; }).transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(function(d) { return d.additional == ""; }).transition().style("opacity", "0")
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }

})

// filters for VR objects

//sokrates

d3.select(".sokrates")
.on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d,i) {return sokrates.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d,i) {return sokrates.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.selectAll(".timelineLines").filter(function(d,i) {return sokrates.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll(".timelineLines").filter(function(d,i) {return sokrates.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
        .html(`
        ${`<p class="title">Postcard of Sokrates sculpture</p>`}
        ${`<p class="objects"><img src="images/objects/sokrates.png" alt="sokrates postcard" width = "100%" height = "auto" class="image"></p><br>`}
        ${`<p class="descrption">For Eisenstein Socrates symbolized the best way of teaching - by asking questions instead of giving answers.<br>
        Eisenstein loved teaching and implemented the "Socrates-Method"</p>`}
        `)
          .style('display', 'block')
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".timelineLines").transition().style("opacity", "1")
  }
})

// Mei Lanfang

d3.select(".mei_lanfang")
.on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d,i) {return mei.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d,i) {return mei.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return mei.includes(spiralData[i]["Event_ID"]) == true }).transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return mei.includes(spiralData[i]["Event_ID"]) == false }).transition().style("opacity", "0")
    d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
        .html(`
        ${`<p class="title">Mei Lanfang</p>`}
        ${`<p class="objects"><img src="images/objects/mei.png" alt="sokrates postcard" width = "100%" height = "auto" class="image"></p><br>`}
        ${`<p class="description">Eisenstein was facinated by Mei Lanfang...</p>`}
        `)
          .style('display', 'block')
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
  }
})

d3.select(".robeson")
.on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d,i) {return paul.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d,i) {return paul.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return paul.includes(spiralData[i]["Event_ID"]) == true }).transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return paul.includes(spiralData[i]["Event_ID"]) == false }).transition().style("opacity", "0")
    d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
        .html(`
        ${`<p class="title">Paul Robeson</p>`}
        ${`<p class="objects"><img src="images/objects/paul.png" alt="sokrates postcard" width = "100%" height = "auto" class="image"></p><br>`}
        ${`<p class="description">Eisenstein was facinated by Mei Lanfang...</p>`}
        `)
          .style('display', 'block')
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
  }
})

d3.select(".strawman")
.on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d,i) {return straw.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d,i) {return straw.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return straw.includes(spiralData[i]["Event_ID"]) == true }).transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return straw.includes(spiralData[i]["Event_ID"]) == false }).transition().style("opacity", "0")
    d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
        .html(`
        ${`<p class="title">Straw</p>`}
        ${`<p class="objects"><img src="images/objects/mei.png" alt="sokrates postcard" width = "100%" height = "auto" class="image"></p><br>`}
        ${`<p class="description">Eisenstein was facinated by Mei Lanfang...</p>`}
        `)
          .style('display', 'block')
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
  }
})

d3.select(".meyerhold")
.on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d,i) {return meyerhold.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d,i) {return meyerhold.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return meyerhold.includes(spiralData[i]["Event_ID"]) == true }).transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return meyerhold.includes(spiralData[i]["Event_ID"]) == false }).transition().style("opacity", "0")
    d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
        .html(`
        ${`<p class="title">Meyerhold</p>`}
        ${`<p class="objects"><img src="images/objects/mei.png" alt="sokrates postcard" width = "100%" height = "auto" class="image"></p><br>`}
        ${`<p class="descrption">Eisenstein was facinated by Mei Lanfang...</p>`}
        `)
          .style('display', 'block')
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
  }
})

d3.select(".sarraz")
.on("click", function() {
  if (d3.select(this).style("font-weight") != "bold") {
    d3.selectAll(".filter").style("font-weight", 400)
    d3.select(this).style("font-weight", "bold")
    d3.selectAll("circle").filter(function(d,i) {return sarraz.includes(d.Event_ID) == true }).transition().style("opacity", "1")
    d3.selectAll("circle").filter(function(d,i) {return sarraz.includes(d.Event_ID) == false }).transition().style("opacity", "0")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return sarraz.includes(spiralData[i]["Event_ID"]) == true }).transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").filter(function(d,i) {return sarraz.includes(spiralData[i]["Event_ID"]) == false }).transition().style("opacity", "0")
    d3.select("#closedsidebar").style("display", "block")
/// sidebar for spans
        sidebar
        .html(`
        ${`<p class="title">La Sarraz</p>`}
        ${`<p class="objects"><img src="images/objects/mei.png" alt="sokrates postcard" width = "100%" height = "auto" class="image"></p><br>`}
        ${`<p class="description">Eisenstein was facinated by Mei Lanfang...</p>`}
        `)
          .style('display', 'block')
  } else {
    d3.select(this).style("font-weight", 400)
    d3.selectAll("circle").transition().style("opacity", "1")
    d3.selectAll(".pathG").selectAll("path").transition().style("opacity", "1")
  }
})


      })
    })
  })
})
})
})

});
