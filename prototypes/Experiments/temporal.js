
    // specifying SVG

var width = 1000,
    height = 1000,
    start = 0,
    end = 2.25,
    numSpirals = 78,
    margin = {top:50,bottom:50,left:50,right:50};

    // Constructing the spiral: 

    // theta for the spiral

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // the r works out the space within which the spiral can take shape - the width and height is set above

    var r = d3.min([width, height]) / 2 - 40 ;

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

    var points = d3.range(start, end + 0.02, (end - start) / 2000);

    // this is the spiral, utilising the theta and radius generated above

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    // var spiralOne = function(d) { 
    //     const length = 569,
    //       spiral1 = d3
    //         .lineRadial()
    //         .angle((d, i) => (Math.PI / 10) * i) // d is empty (and ignored), i is the index // the higher the number the smoother the spiral, but this will also reduce the amount of spirals
    //         .radius((d, i) => (length - i) * 1); //should also be '1' but then it is too large for observable
      
    //     return spiral1 ({ length });
    //   }

    // and then the path drawing the spiral according to the specifications above

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke", ("6, 5"))
      .style("opacity",0.5);

    //  computed value for the total length of the path in user units, this is important for mapping the data later

    var spiralLength = path.node().getTotalLength();

    // for turning strings into dates

    var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
    var formatTime = d3.timeFormat("%e %B %Y"); //

//define data
// will need to be upated to have google sheet in future
 d3.csv('minimal.csv', function(error, spiralData) {
        if (error) throw error;

        console.log(spiralData);

        // 1. add properties 'vstart' and 'vend' for inferred dates
        //    and uncertainty property
        for (let i = 0; i < spiralData.length; i++) {
          spiralData[i]["vstart"] = spiralData[i]["start"];
          spiralData[i]["vend"] = spiralData[i]["end"];
          spiralData[i]["uncertaintystart"] = 0;
          spiralData[i]["uncertaintyend"] = 0;
        };
        
       
        for (let i = 0; i < spiralData.length; i++) {
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
          
           /* 3. populate vstart and vend. assign proper dates to events that automatically fall on 30th November 
          start
            uncertainty == 2 → YYYY-01-01
            uncertainty == 1 → YYYY-MM-01
          end
            uncertainty == 2 → YYYY-12-31
            uncertainty == 1 → YYYY-MM-28
          */
          
           // gives all uncertain events actual dates values rather than placing it on 30th November 
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

        
        // format the data
        spiralData.forEach(function(d) {
          // d.start needs to be just the certain single dates (0), and needs to filter out the uncertain dates (1 or 2). There are also 'ranges' that contain 
          
          // d.start = +parseDate(d.start);
          // d.end = +parseDate(d.end);
          d.vstart = +parseDate(d.vstart);
          d.vend = +parseDate(d.vend);
        });

        var timeScale = d3.scaleLinear()
          .domain(d3.extent(spiralData, function(d){
          return d.vstart;
        }))
        .range([0, spiralLength]);

        console.log(spiralData);



// The mapping of visual variables starts here

//certain events

    svg.selectAll("circle")
     // .data(spiralData)
      .data(function(d) {
        return spiralData.filter(function(d) { return d.uncertaintystart == 0 && d.uncertaintyend == 0; });
      })
      .enter()
      .append("circle")
      .attr("cx", function(d,i){

        // linePer is the position of cirlce/data on spiral
        
        var linePer = timeScale(d.vstart),
            posOnLine = path.node().getPointAtLength(linePer);
          //  angleOnLine = path.node().getPointAtLength(linePer);
      
        d.linePer = linePer; // % distance are on the spiral
        d.cx = posOnLine.x; // x postion on the spiral
        d.cy = posOnLine.y; // y position on the spiral
        
        // d.a not currently used, this is used for positioning date labels around the spiral

        // d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 360 / Math.PI) - 90; //angle at the spiral position

        return d.cx;
      })
      .attr("cy", function(d){
        return d.cy;
      })
      .attr("r", "5")
      .attr("opacity", 0.85)
      .style("fill", "#238A8D")
      //.style("stroke", "#238A8D");
   
//adding visual elements for vstart and vend: range of uncertain dates

var line = d3.line()
              .curve(d3.curveCardinal)
              .x(function(d,i){

                // linePer is the position of cirlce/data on spiral
                
                var linePer = timeScale(d.vstart),
                    posOnLine = path.node().getPointAtLength(linePer);
                  //  angleOnLine = path.node().getPointAtLength(linePer);
              
                d.linePer = linePer; // % distance are on the spiral
                d.x = posOnLine.x; // x postion on the spiral
                d.y = posOnLine.y; // y position on the spiral
                
                // d.a not currently used, this is used for positioning date labels around the spiral
        
                // d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 360 / Math.PI) - 90; //angle at the spiral position
        
                return d.x;
              })
              .y(function(d,i){

                // linePer is the position of cirlce/data on spiral
                
                var linePer = timeScale(d.vstart),
                    posOnLine = path.node().getPointAtLength(linePer);
                  //  angleOnLine = path.node().getPointAtLength(linePer);
              
                d.linePer = linePer; // % distance are on the spiral
                d.x = posOnLine.x; // x postion on the spiral
                d.y = posOnLine.y; // y position on the spiral
                
                // d.a not currently used, this is used for positioning date labels around the spiral
        
                // d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 360 / Math.PI) - 90; //angle at the spiral position
        
                return d.y;
              })
              .defined(d => d.vend !== 0);

    svg.selectAll("path")
    // .data(function(d) {
    //   return spiralData.filter(function(d) { return (d.vstart != 0) && (d.vend != 0); });
    //   })
    .data(function(d) {
      return spiralData.filter(function(d) { return d.uncertaintystart == 0 && d.uncertaintyend == 0; });
    })
      .enter()
      .append("path")
      .attr("d", line(spiralData))
      .style("stroke", "#238A8D")
      .attr("stroke-width", 2)
      .attr("fill", "none");

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



 })
