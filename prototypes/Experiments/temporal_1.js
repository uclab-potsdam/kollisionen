
    // specifying SVG

    var width = 1000,
    height = 1000,
    start = 0, //centre point
    end = 2, //outer of the spiral
    numSpirals = 77, //number of years in dataset
    // numAxis = 1,
    margin = {top:50,bottom:50,left:50,right:50};

    // Constructing the spiral: 

    // theta for the spiral

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // the r works out the space within which the spiral can take shape - the width and height is set above

    var r = d3.min([width, height]) / 2 - 40;

    // The radius of the spiral

    var radius = d3.scaleLinear()
                .domain([start, end]) 
                .range([40, r]);

    // inserts svg into the DOM

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); 

    // The path to draw the spiral needs data to inform it, points generates this, and is used in .datum(points) below

    var points = d3.range(start, end + 0.001, (end - start) / 1000)
    console.log(points);

    // this is the spiral, utilising the theta and radius generated above

    var spiral = d3.radialLine()
                .curve(d3.curveCardinal)
                .angle(theta)
                .radius(radius);



    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none") // do all style in css
      .style("stroke", "grey")
      .style("stroke", ("6, 5"))
      .style("opacity",0.2);

    //  computed value for the total length of the path in user units, this is important for mapping the data later

    // var spiralLength = path.node().getTotalLength()

    // for turning strings into dates

    var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
    var formatTime = d3.timeFormat("%e %B %Y"); //

//define data

var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
    // url = './minimal.csv'

    d3.csv(url, function(error, spiralData) {
        if (error) throw error;

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
          
          if (spiralData[i]["start"].includes("00") && spiralData[i]["end"].includes(" ")) 				spiralData[i]["end"]=spiralData[i]["start"]; //duplicates columns with -00- to create ranges later

          var startA = spiralData[i]["start"].split("-");
          var endA = spiralData[i]["end"].split("-");

          /* 2. add 'uncertainty' levels:
          0: no uncertainty, e.g. 1898-01-23
          1: uncertainty in days, e.g. 1914-07-00
          2: uncertainty in months e.g. 1906-00-00
          */
          if (startA[1]=="00") spiralData[i]["uncertaintystart"] = 2;
          else if (startA[2]=="00") spiralData[i]["uncertaintystart"] = 1;
          if (endA[1]=="00") spiralData[i]["uncertaintyend"] = 2;
          else if (endA[2]=="00") spiralData[i]["uncertaintyend"] = 1;
          
           /* 3. populate vstart and vend. assign proper dates to events that automatically fall on 1st January 
          start
            uncertainty == 2 → YYYY-01-01
            uncertainty == 1 → YYYY-MM-01
          end
            uncertainty == 2 → YYYY-12-31
            uncertainty == 1 → YYYY-MM-28
          */
          
           // gives all uncertain events actual dates values rather than placing it on 1st January
          if (spiralData[i]["uncertaintystart"]==2) {
            spiralData[i]["vstart"] = startA[0]+"-01-01";
            spiralData[i]["vend"] = startA[0]+"-12-31";
          }
          else if (spiralData[i]["uncertaintystart"]==1) {
            spiralData[i]["vstart"] = startA[0]+"-"+startA[1]+"-01";
            spiralData[i]["vend"] = startA[0]+"-"+startA[1]+"-28";
          }
          else spiralData[i]["vstart"] = spiralData[i]["start"];

          if (spiralData[i]["uncertaintyend"]==2) spiralData[i]["vend"] = endA[0]+"-12-31";
          else if (spiralData[i]["uncertaintyend"]==1) spiralData[i]["vend"] = endA[0]+"-"+endA[1]+"-28";
          else spiralData[i]["vend"] = spiralData[i]["end"];

        };

        for (let i = 0; i < spiralData.length; i++) {
          
          // category 1=Cinema and Theatre, category 2=Biography and Personality, category 3=Writing and Teaching, category 4=Graphic Art, category 5=Apartment
          //categories sorted into separate categories to aid with styling later
					
					if (spiralData[i]["category"].includes("Cinema and Theatre")) 				spiralData[i]["category1"]=true;
					if (spiralData[i]["category"].includes("Biography and Personality")) 	spiralData[i]["category2"]=true;
					if (spiralData[i]["category"].includes("Writing and Teaching")) 			spiralData[i]["category3"]=true;
					if (spiralData[i]["category"].includes("Graphic Art")) 								spiralData[i]["category4"]=true;
					if (spiralData[i]["category"].includes("Apartment")) 									spiralData[i]["category5"]=true;
					
        };
  
        // // format the data
        // spiralData.forEach(function(d) {
        //   // d.start needs to be just the certain single dates (0), and needs to filter out the uncertain dates (1 or 2). There are also 'ranges' that contain 
          
        //   // d.start = +parseDate(d.start);
        //   // d.end = +parseDate(d.end);
        //   // d.vstart = +parseDate(d.vstart);
        //   // d.vend = +parseDate(d.vend);
        // });


// The mapping of visual variables starts here

//certain one day events

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
  .range([0, r-40]) 

var getRelativePositionInTheYear = function(month, day) {
  const date = new Date(startYearForRelativeScale, Math.max(month-1, 0), Math.max(1, day))
  return relativeInYearScale(date)
}

var getEventCoordinate = function(year, month, day) {
  const relativePositionInTheYear = getRelativePositionInTheYear(month, day)
  const absoluteRadius = absoluteRadiusScale(year)

  const emptyCenterRadius = 40
  const radius = emptyCenterRadius + absoluteRadius
  const topBasedAngle = 2 * Math.PI * relativePositionInTheYear
  return {
    'cx': radius * Math.sin(topBasedAngle),
    'cy': -radius * Math.cos(topBasedAngle)
  }
}
    svg.selectAll("circle.cat1")
      //.data(spiralData)
      .data(function(d) {
        return spiralData.filter(function(d) { return d.uncertaintystart === 0 && d.category1 == true});
      })
      .enter()
      .append("circle")
      // .attr("class","start")
			// .classed("category1", function(d){return d.category1;})
			// .classed("category2", function(d){return d.category2;})
			// .classed("category3", function(d){return d.category3;})
			// .classed("category4", function(d){return d.category4;})
			// .classed("category5", function(d){return d.category5;})			
      .attr("cx", function(d,i){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cx
      })
      .attr("cy", function(d){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cy
      })
      .attr("r", "5") // radius of circle 
      .attr("opacity", 0.85)
      .style("fill", "blue")
      // .style("stroke", "#000000")
      .exit();

      svg.selectAll("circle.cat2")
      //.data(spiralData)
      .data(function(d) {
        return spiralData.filter(function(d) { return d.uncertaintystart == 0 && d.category2 == true; });
      })
      .enter()
      .append("circle")
      // .attr("class","start")
			// .classed("category1", function(d){return d.category1;})
			// .classed("category2", function(d){return d.category2;})
			// .classed("category3", function(d){return d.category3;})
			// .classed("category4", function(d){return d.category4;})
			// .classed("category5", function(d){return d.category5;})			
      .attr("cx", function(d,i){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cx
      })
      .attr("cy", function(d){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cy
      })
      .attr("r", "4") // radius of circle 
      .attr("opacity", 0.85)
      .style("fill", "yellow")
      // .style("stroke", "#000000")
      .exit();

      svg.selectAll("circle.cat3")
      //.data(spiralData)
      .data(function(d) {
        return spiralData.filter(function(d) { return d.uncertaintystart == 0 && d.category3 == true; });
      })
      .enter()
      .append("circle")
      // .attr("class","start")
			// .classed("category1", function(d){return d.category1;})
			// .classed("category2", function(d){return d.category2;})
			// .classed("category3", function(d){return d.category3;})
			// .classed("category4", function(d){return d.category4;})
			// .classed("category5", function(d){return d.category5;})			
      .attr("cx", function(d,i){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cx
      })
      .attr("cy", function(d){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cy
      })
      .attr("r", "3") // radius of circle 
      .attr("opacity", 0.85)
      .style("fill", "red")
      // .style("stroke", "#000000")
      .exit();

      svg.selectAll("circle.cat4")
      //.data(spiralData)
      .data(function(d) {
        return spiralData.filter(function(d) { return d.uncertaintystart == 0 && d.category4 == true; });
      })
      .enter()
      .append("circle")
      // .attr("class","start")
			// .classed("category1", function(d){return d.category1;})
			// .classed("category2", function(d){return d.category2;})
			// .classed("category3", function(d){return d.category3;})
			// .classed("category4", function(d){return d.category4;})
			// .classed("category5", function(d){return d.category5;})			
      .attr("cx", function(d,i){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cx
      })
      .attr("cy", function(d){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cy
      })
      .attr("r", "2") // radius of circle 
      .attr("opacity", 0.85)
      .style("fill", "green")
      // .style("stroke", "#000000")
      .exit();

      svg.selectAll("circle.cat5")
      //.data(spiralData)
      .data(function(d) {
        return spiralData.filter(function(d) { return d.uncertaintystart == 0 && d.category5 == true; });
      })
      .enter()
      .append("circle")
      // .attr("class","start")
			// .classed("category1", function(d){return d.category1;})
			// .classed("category2", function(d){return d.category2;})
			// .classed("category3", function(d){return d.category3;})
			// .classed("category4", function(d){return d.category4;})
			// .classed("category5", function(d){return d.category5;})			
      .attr("cx", function(d,i){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cx
      })
      .attr("cy", function(d){
        var [year, month, day] = d.vstart.split('-', 3)
        var eventCoordinate = getEventCoordinate(year, month, day)
        return eventCoordinate.cy
      })
      .attr("r", "1") // radius of circle 
      .attr("opacity", 0.85)
      .style("fill", "purple")
      // .style("stroke", "#000000")
      .exit();

//adding visual elements for vstart and vend: range of uncertain dates

spiralData.forEach(function(d) {

  var [year, month, day] = d.vstart.split('-', 3)
  var eventCoordinate = getEventCoordinate(year, month, day)

  d.aStart = Math.atan2(eventCoordinate.cx, -eventCoordinate.cy);
  d.rStart = Math.hypot(eventCoordinate.cx, eventCoordinate.cy);
});

spiralData.forEach(function(d) {

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

      var numSpiralsThetaScale =  d3.scaleLinear()
      .domain([d3.min(spiralData, function(d) { return parseDate(d.vstart)}), d3.max(spiralData, function(d) { return parseDate(d.vend)})])
      .range([0, numSpirals]);

      //To test the scale works
      //console.log(numSpiralsThetaScale(-1260316080000))

      //-2270159280000

      /*
      Scale returns a value between 0 and 77: see manual test above for 24 Jan 1930 - returns '36.27049731995325' which would be from 1896 - 1930
      min because vstart contains ealiest date and max because vend contains latest date
      There needs be another step here: This works out this scale but it needs to then work it out for each line between vstart and vend and return a number
      e.g. 1906-01-01 -> 1908-12-31 = 3 numSpiralsTheta (roughly) as it equals 3 years

      Using this scale numSpiralsThetaScale(d.vend) - numSpiralsThetaScale(d.vstart) -> number of spirals needed
      */

    for (let i = 0; i < spiralData.length; i++) {

      var endSpiralTheta = numSpiralsThetaScale(parseDate(spiralData[i].vend));
      var startSpiralTheta = numSpiralsThetaScale(parseDate(spiralData[i].vstart))
      var numSpiralsTheta = endSpiralTheta - startSpiralTheta;

      //console.log(numSpiralsTheta);

      var radiusArc1 = d3.scaleLinear()
      .domain([start, end]) 
      .range([spiralData[i].rStart, spiralData[i].rEnd])
      
      //console.log(radiusArc1(2))

      var thetaArc = function(r) {
        return numSpiralsTheta * Math.PI * r;
      };      /*
              theta still needs to be used to guide the spiral but it needs to have a defined starting point for the spiral
              the numSpirals needs to be dynamic - based on a scale - to ascertain how much of a spiral is needs to draw between two points
              there also needs to be a way of adjusting the start point (the starting angle) - this is captured in 'aStart'
              */

      var spiralArcs = d3.radialLine()
      .curve(d3.curveCardinal) 
      .angle(thetaArc)
      .radius(radiusArc1)
      
      svg.append("path")
            .datum(points)
            .attr("id", "spiralArcs")
            .attr("d", spiralArcs)
            .style("fill", "none") // do all style in css?
            .style("stroke", "blue")
            .style("stroke", ("8, 5"))
            .style("opacity",1);

    };

    // add date labels

    // svg.selectAll("text")
    //   .data(spiralData)
    //   .enter()
    //   .append("text")
    //   .attr("dy", 10)
    //   .style("text-anchor", "start")
    //   .style("font", "10px arial")
    //   .append("textPath")
    //   // only add for the first of each month
    //   .filter(d=>d.first==1)
    //   .text(d=>d.year)
    //   // place text along spiral
    //   .attr("xlink:href", "#spiral")
    //   .style("fill", "grey")
    //   .attr("startOffset", function(d){
    //     return ((d.linePer / spiralLength) * 100) + "%";
    //   });
   
  //tooltip
   var tooltip = d3.select("#chart")
    .append('div')
    .attr('class', 'tooltip');

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
                <span><b>${d.vstart}</b></span>
                <br> <b>${d.title}</b> </span>`);
          })
          svg.selectAll("path")
          .on('mouseover', function(d) {
              tooltip
                    .style('position', 'absolute')
                    .style('left', `${d3.event.pageX + 10}px`)
                    .style('top', `${d3.event.pageY + 20}px`)
                    .style('display', 'inline-block')
                    .style('opacity', '0.9')
                    .html(`
                      <span><b>${d.vstart}</b></span>
                      <br> <b>${d.title}</b> </span>`);
                })    
    .on('mouseout', function(d) {
        d3.selectAll("rect")
        .style("fill", function(d){return color(d.number1);})
        .style("stroke", "none")

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });



 })
