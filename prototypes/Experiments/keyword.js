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


// a scale for the x1 starting position of the line

var x1Scale = d3.scaleLinear()
    .domain([0, dateRangeLength])
    .range([0, height]);

// a scale for the x2 end position of the line

var x2Scale = d3.scaleLinear()
    .domain([0, dateRangeLength])
    .range([0, height]);

// a scale for the y1 starting position of the line

var y1Scale = d3.scaleLinear()
    .domain([0, dateRangeLength])
    .range([0, height]);

// a scale for the y2 end position of the line

var y2Scale = d3.scaleLinear()
    .domain([0, dateRangeLength])
    .range([width, height]);


// and x1, x2, y1, and y2 scale for creating lines for each row of data in keywordsCount


    //scale for height of timeline

var y1Scale = d3.scaleLinear()
    .domain([0, keywordsCount.length])  //number of distinct keywords
    .range([0, height]);    //height of timeline

var y2Scale = d3.scaleLinear()
    .domain([0, keywordsCount.length])
    .range([0, width]);

    // append svg to chart

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("g");

// create timeline for events in d.vstart and v.vend

for(let i = 0; i < keywordsCount.length; i++) {

    var backgroundTimelineG = svg.append("g").classed("backgroundTimelineG", true)

    var timeLine = backgroundTimelineG.append("line")
        .attr("x1", 100)  //start of timeline
        .attr("y1", y1Scale[i])
        // .attr("y1", 100) //to be fixed later needs to be linked to a y scale
        .attr("x2", width)  //end of timeline
        // y2 needs to be linked to a y scale 
        .attr("y2", -y1Scale[i])
        // .attr("y2", 100) //to be fixed later needs to be linked to a y scale
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");

};

    

// for positioning the events on the timeline

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

// create a timeline for each keyword in the keywordsCount array when it matches a keyword in keywordsData.people, keywordsData.places, keywordsData.works, keywordsData.artistic, keywordsData.additional but filtered only to show data matching that keyword

// for (let i = 0; i < keywordsCount.length; i++) {

// if (keywordsCount[i] == keywordsData[i].people.split(";") || keywordsData[i].places.split(";") || keywordsData[i].works.split(";") || keywordsData[i].artistic.split(";") || keywordsData[i].additional.split(";")) { 

//   // filter data to only show data matching that keyword

//filter has to match a keyword in keywordsData.people, keywordsData.places, keywordsData.works, keywordsData.artistic, keywordsData.additional to draw timeline

  // var filteredData = keywordsData.filter(function(d) {
  //   return d.people.split(;).includes(keywordsCount[i]) || d.places.split(;).includes(keywordsCount[i]) || d.works.split(;).includes(keywordsCount[i]) || d.artistic.split(;).includes(keywordsCount[i]) || d.additional.split(;)includes(keywordsCount[i]);
  // });

//5 timelines to show the potential varieties of distribution of keywords
//Que viva Mexico - 140
//Travels - 58
//Battleship Potempkin - 22
//Shakespeare - 6
//Dreams - 1

//Timeline 1 - Que viva Mexico

  // var filteredData = keywordsData.filter(function(d) {
  //   return d.people.includes("¡Que viva México!	") || d.places.includes("¡Que viva México!	") || d.works.includes("¡Que viva México!	") || d.artistic.includes("¡Que viva México!	") || d.additional.includes("¡Que viva México!	");
  // });

//   if(function (d) {
//     return keywordsData.filter(function (d) {
//       return d.uncertaintystart === 0 && d.end === "" && d.start.includes("/") == false && d.start.includes(",") == false && d.start != "" //took out some data points that create errors for now
//     });
//   }){
  

//         const circleG = svg.append("g").classed("circleG", true)

//         let circles = circleG.selectAll("g")

//         // .data(function (d) {
//         //     return keywordsData.filter(function (d) {
//         //       return d.uncertaintystart === 0 && d.end === "" && d.start.includes("/") == false && d.start.includes(",") == false && d.start != "" //took out some data points that create errors for now
//         //     });
//         //   })
//         // .data(function (d) {
//         //   return keywordsData.filter(function(d) {
//         //   return d.people.includes("¡Que viva México!") || d.places.includes("¡Que viva México!") || d.works.includes("¡Que viva México!") || d.artistic.includes("¡Que viva México!") || d.additional.includes("¡Que viva México!");
//         // });
//         // })
//         // .data(function (d) {
//         //   return keywordsData.filter(function(d) {
//         //   return d.people.includes("Travels") || d.places.includes("Travels") || d.works.includes("Travels") || d.artistic.includes("Travels") || d.additional.includes("Travels");
//         // });
//         // })
//         .data(function (d) {
//           return keywordsData.filter(function(d) {
//           return d.people.includes("General Line") || d.places.includes("General Line") || d.works.includes("General Line") || d.artistic.includes("General Line") || d.additional.includes("General Line");
//         });
//         })
// //         .data(function (d) {
// //           return keywordsData.filter(function(d) {
// // return d.people.split(";").includes(keywordsCount[i]) || d.places.split(";").includes(keywordsCount[i]) || d.works.split(";").includes(keywordsCount[i]) || d.artistic.split(";").includes(keywordsCount[i]) || d.additional.split(";").includes(keywordsCount[i]);

// //         });
// //         })
//         // .data(function (d) {
//         //   return keywordsData.filter(function(d) { if (keywordsCount[i] == d.people.split(";") || d.places.split(";") || d.works.split(";") || d.artistic.split(";") || d.additional.split(";")) {
//         //     return d.people.split(";") || d.places.split(";") || d.works.split(";") || d.artistic.split(";") || d.additional.split(";");
//         //   }
//         //   });
//         // })
//         .join("g")
//         .append("circle")
//         .classed("circles", true)
//       .classed("cinema", function (d) {
//         if (d.category1 == true && d.category2 == false && d.category3 == false) 
//         {
//         return true;
//       } return false;
//       })
//       .classed("biography", function (d) {
//         if (d.category2 == true && d.category1 == false && d.category3 == false)
//         {
//         return true;
//       } return false;
//       })
//       .classed("writing", function (d) {
//         if (d.category3 == true && d.category1 == false && d.category2 == false)
//         {
//         return true;
//       } return false;
//       })
//       .classed("cinebio", function (d) {
//         if (d.category1 == true && d.category2 == true && d.category3 == false)
//         {
//         return true;
//       } return false;
//       })
//       .classed("biowrit", function (d) {
//         if (d.category1 == false && d.category2 == true && d.category3 == true)
//         {
//         return true;
//       } return false;
//       })
//       .classed("cinewrit", function (d) {
//         if (d.category1 == true && d.category2 == false && d.category3 == true)
//         {
//         return true;
//       } return false;
//       })
//       .classed("allcat", function (d) {
//         if (d.category1 == true && d.category2 == true && d.category3 == true)
//         {
//         return true;
//       } return false;
//       })
//       .attr("cx", function(d,i){

//         // linePer is the position of cirlce/data on timeline
        
//         var linePerStart = timeScaleStart(d.vstart),
//             posOnLineStart = timeLine.node().getPointAtLength(linePerStart);
      
//             d.linePerStart = linePerStart; // % distance on the timeline
//             d.cx = posOnLineStart.x; // x postion on the timeline
//             d.cy = posOnLineStart.y; // y position on the timeline

//         return d.cx;
//       })
//       .attr("cy", function(d){
//         return d.cy;
//       })
//       .attr("r", 5) // radius of circle
//       .attr("opacity", 1)

//     };

//       const lineG = svg.append("g").classed("lineG", true)

//       for (let i = 0; i < keywordsData.length; i++) {

//         if (keywordsData[i].vend != "") {
//             d3.select(".lineG").append("g").classed("lineGs", true)
//           .append("line")
//           // .data(function (d) {
//           //   return keywordsData.filter(function(d) {
//           //   return d.people.includes("¡Que viva México!") || d.places.includes("¡Que viva México!") || d.works.includes("¡Que viva México!") || d.artistic.includes("¡Que viva México!") || d.additional.includes("¡Que viva México!");
//           // });
//           // })
//           // .data(function (d) {
//           //   return keywordsData.filter(function(d) {
//           //   return d.people.includes("Travels") || d.places.includes("Travels") || d.works.includes("Travels") || d.artistic.includes("Travels") || d.additional.includes("Travels");
//           // });
//           // })
//           .data(function (d) {
//             return keywordsData.filter(function(d) {
//             return d.people.includes("General Line") || d.places.includes("General Line") || d.works.includes("General Line") || d.artistic.includes("General Line") || d.additional.includes("General Line");
//           });
//           })
//           // .data(function (d) {
//           //   return keywordsData.filter(function(d) { if (keywordsCount[i] == d.people.split(";") || d.places.split(";") || d.works.split(";") || d.artistic.split(";") || d.additional.split(";")) {
//           //     return d.people.split(";") || d.places.split(";") || d.works.split(";") || d.artistic.split(";") || d.additional.split(";");
//           //   }
//           //   });
//           // })
//   //         .data(function (d) {
//   //           return keywordsData.filter(function(d) {
//   // return d.people.split(";").includes(keywordsCount[i]) || d.places.split(";").includes(keywordsCount[i]) || d.works.split(";").includes(keywordsCount[i]) || d.artistic.split(";").includes(keywordsCount[i]) || d.additional.split(";").includes(keywordsCount[i]);
  
//   //         });
//   //         })
//           .classed("cinema", function () {
//             if (keywordsData[i].category1 == true && keywordsData[i].category2 == false && keywordsData[i].category3 == false) 
//             {
//             return true;
//           } return false;
//           })
//           .classed("biography", function () {
//             if (keywordsData[i].category2 == true && keywordsData[i].category1 == false && keywordsData[i].category3 == false)
//             {
//             return true;
//           } return false;
//           })
//           .classed("writing", function () {
//             if (keywordsData[i].category3 == true && keywordsData[i].category1 == false && keywordsData[i].category2 == false)
//             {
//             return true;
//           } return false;
//           })
//           .classed("cinebio", function () {
//             if (keywordsData[i].category1 == true && keywordsData[i].category2 == true && keywordsData[i].category3 == false)
//             {
//             return true;
//           } return false;
//           })
//           .classed("biowrit", function () {
//             if (keywordsData[i].category1 == false && keywordsData[i].category2 == true && keywordsData[i].category3 == true)
//             {
//             return true;
//           } return false;
//           })
//           .classed("cinewrit", function () {
//             if (keywordsData[i].category1 == true && keywordsData[i].category2 == false && keywordsData[i].category3 == true)
//             {
//             return true;
//           } return false;
//           })
//           .classed("allcat", function () {
//             if (keywordsData[i].category1 == true && keywordsData[i].category2 == true && keywordsData[i].category3 == true)
//             {
//             return true;
//           } return false;
//           })
//           .attr("x1", function(d,i){

//             // linePer is the position of cirlce/data on timeline
            
//             var linePerStart = timeScaleStart(d.vstart),
//                 posOnLineStart = timeLine.node().getPointAtLength(linePerStart);
          
//                 d.linePerStart = linePerStart; // % distance on the timeline
//                 d.cx = posOnLineStart.x; // x postion on the timeline
//                 d.cy = posOnLineStart.y; // y position on the timeline
    
//             return d.cx;
//           })
//             .attr("y1", function(d,i){

//             // linePer is the position of cirlce/data on timeline
            
//             var linePerStart = timeScaleStart(d.vstart),
//                 posOnLineStart = timeLine.node().getPointAtLength(linePerStart);
          
//                 d.linePerStart = linePerStart; // % distance on the timeline
//                 d.cx = posOnLineStart.x; // x postion on the timeline
//                 d.cy = posOnLineStart.y; // y position on the timeline
    
//             return d.cy;
//           })
//             .attr("x2", function(d,i){

//               // linePer is the position of cirlce/data on timeline
              
//               var linePerEnd = timeScaleEnd(d.vend),
//                   posOnLineEnd = timeLine.node().getPointAtLength(linePerEnd);
            
//                   d.linePerEnd = linePerEnd; // % distance on the timeline
//                   d.cx = posOnLineEnd.x; // x postion on the timeline
//                   d.cy = posOnLineEnd.y; // y position on the timeline
      
//               return d.cx;
//             })
//             .attr("y2", function(d,i){

//                 // linePer is the position of cirlce/data on timeline
                
//                 var linePerEnd = timeScaleEnd(d.vend),
//                     posOnLineEnd = timeLine.node().getPointAtLength(linePerEnd);
              
//                     d.linePerend = linePerEnd; // % distance on the timeline
//                     d.cx = posOnLineEnd.x; // x postion on the timeline
//                     d.cy = posOnLineEnd.y; // y position on the timeline
        
//                 return d.cy;
//               })

// }

// }



  }



 
      // }

  )
