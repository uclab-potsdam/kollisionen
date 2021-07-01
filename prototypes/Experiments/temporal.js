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
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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
      .style("stroke", "black")
      .style("stroke", ("6, 5"))
      .style("opacity",0.5);

    var spiralLength = path.node().getTotalLength(),
        N = 905,
        barWidth = (spiralLength / N) - 1;
    var formatNum=d3.format(".2s")

    var parseDate = d3.timeParse("%Y-%m-%d");
    var formatTime = d3.timeFormat("%e %B %Y");


//define data
 d3.csv('minimal.csv', function(error, someData) {
        if (error) throw error;

        // format the data
        someData.forEach(function(d) {
            d.date = +parseDate(d.start, d.end);
            d.start = +parseDate(d.start);
            d.end = +parseDate(d.end);
          });

// var uncertainDay = someData.filter(d => d.date)


// uncertainty == 2 => YYYY-01-01
// uncertainty == 1 => YYYY-MM-01

// uncertainty == 2 => YYYY-12-31
// uncertainty == 1 => YYYY-MM-28


// var uncertainMonth = someData.filter(d => {
// if (d.date === ("%Y-00-%d")) (return d.date == ("%Y--%d") )




// })

    var timeScale = d3.scaleLinear()
      .domain(d3.extent(someData, function(d){
        return d.date;
      }))
      .range([0, spiralLength]);

    svg.selectAll("circle")
      .data(someData)
      .enter()
      .append("circle")
      .attr("cx", function(d,i){
        
        var linePer = timeScale(d.date),
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

    svg.selectAll("text")
      .data(someData)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      // only add for the first of each month
      .filter(d=>d.first==1)
      .text(d=>d.year)
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", function(d){
        return ((d.linePer / spiralLength) * 100) + "%";
      });
   
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
                <span><b>${formatTime(d.date)}</b></span>
                <br> <b>${d.title}</b> </span>
                <br><span> ${d.description}
                <span><b>${d.category}</b> <br><br></span>`);
          })
    .on('mouseout', function(d) {
        d3.selectAll("rect")
        .style("fill", function(d){return color(d.number1);})
        .style("stroke", "none")

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });


 })
