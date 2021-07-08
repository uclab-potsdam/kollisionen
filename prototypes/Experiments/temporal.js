var width = 1000,
    height = 1000,
    start = 0,
    end = 2.25,
    numSpirals = 78
    margin = {top:50,bottom:50,left:50,right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    var r = d3.min([width, height]) / 2-20 ;

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([30, r]);

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); // will become dynamic later 

    var points = d3.range(start, end + 0.02, (end - start) / 2000);

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke", ("6, 5"))
      .style("opacity",0.5);

    var spiralLength = path.node().getTotalLength(),
        N = 905, //will be dynamic later according to number of data points 
        barWidth = (spiralLength / N) - 1;
    //var formatNum=d3.format(".2s")

    var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
    var formatTime = d3.timeFormat("%e %B %Y");


//define data
// will be upated to have google sheet 
 d3.csv('minimal.csv', function(error, spiralData) {
        if (error) throw error;

        console.log(spiralData);

        // 1. add properties 'vstart' and 'vend' for inferred dates
        //    and uncertainty property
        for (let i = 0; i < spiralData.length; i++) {
          spiralData[i]["vstart"] = null;
          spiralData[i]["vend"] = null;
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
          
          if (spiralData[i]["uncertaintystart"]==2) startA[0]+"-01-01";
          

          if (uncertainty==2) {
            spiralData[i]["vstart"] = 
            spiralData[i]["vend"] = endA[0]+"-12-31";
          }
          else if (uncertainty==1) {
            spiralData[i]["vstart"] = startA[0]+"-"+startA[1]+"-01";
            spiralData[i]["vend"] = endA[0]+"-"+endA[1]+"-28";
          }
          else if (uncertainty==0) {
            spiralData[i]["vstart"] = spiralData[i]["start"];
            spiralData[i]["vend"] = spiralData[i]["end"];
          } 
        
        };

        
        console.log(spiralData);

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

    svg.selectAll("circle")
      .data(spiralData)
      .enter()
      .append("circle")
      .attr("cx", function(d,i){
        
        var linePer = timeScale(d.vstart),
            posOnLine = path.node().getPointAtLength(linePer),
            angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
        d.linePer = linePer; // % distance are on the spiral
        d.cx = posOnLine.x; // x postion on the spiral
        d.cy = posOnLine.y; // y position on the spiral
        
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 360 / Math.PI) - 90; //angle at the spiral position

        return d.cx;
      })
      .attr("cy", function(d){
        return d.cy;
      })
      .attr("r", "5")
      .attr("opacity", 0.85)
      .style("fill", "#238A8D")
      .style("stroke", "#238A8D");
    //.style("stroke-dasharray", ("1, 2"))
    //.style("stroke-width", 1.2);
   
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
                <span><b>${formatTime(d.start)}</b></span>
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
