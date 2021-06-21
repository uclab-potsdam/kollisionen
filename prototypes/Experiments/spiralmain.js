var width = 2000,
      height = 2000,
      start = 0,
      end = 2.25,
      numSpirals = 45
      margin = {top:50,bottom:50,left:50,right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal() // D3 Version 4
  .domain(1,20,300,4000,50000)
  .range(["#B8DE29","#238A8D","#55C667", '#A7226E','#440154']);;

    var r = d3.min([width, height]) / 2-20 ;

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([30, r]);

    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

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
        N = 274,
        barWidth = (spiralLength / N) - 1;
    var formatNum=d3.format(".2s")
//define data
 d3.csv('timeline.csv', function(error, someData) {
        if (error) throw error;

        // format the data
        someData.forEach(function(d) {
            d.idx = +d.idx;
            d.type = +d.type;
            d.number = +d.number;
          });


    var timeScale = d3.scaleLinear()
      .domain(d3.extent(someData, function(d){
        return d.idx;
      }))
      .range([0, spiralLength]);
    
    // yScale for the bar height
    var yScale = d3.scalePow().exponent(0.5)
      .domain(d3.extent(someData, d=> d.number))
      .range([0, (r / numSpirals)-10 ]);

    svg.selectAll("circle")
      .data(someData)
      .enter()
      .append("circle")
      .attr("cx", function(d,i){
        
        var linePer = timeScale(d.idx),
            posOnLine = path.node().getPointAtLength(linePer),
            angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
        d.linePer = linePer; // % distance are on the spiral
        d.cx = posOnLine.x; // x postion on the spiral
        d.cy = posOnLine.y; // y position on the spiral
        
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

        return d.cx;
      })
      .attr("cy", function(d){
        return d.cy;
      })
      .attr("r", d=>yScale(d.number1))
      .attr("opacity", 0.85)
      .style("fill", "#238A8D")
      .style("stroke", "#238A8D")
    .style("stroke-dasharray", ("1, 2"))
    .style("stroke-width", 1.2);
   
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
      })
   
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
                <span><b>${d.date}</b></span>
                <br> <b>${d.info}</b> </span>
                <br><span> Description ${d.hover}
                <span>Category  <b>${d.type}</b> <br><br>
</span>`);
          })
    .on('mouseout', function(d) {
        d3.selectAll("rect")
        .style("fill", function(d){return color(d.number);})
        .style("stroke", "none")

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });


 })
