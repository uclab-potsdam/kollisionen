

var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup

let width = 1600;
let height = 800;

let nodeScale = d3.scaleLinear()
.domain([1,100])
.range([2,30])

let color =  d3.scaleOrdinal(d3.schemeCategory10)

let tooltip = d3.select("body")
  .append('div')
  .attr('class', 'tooltip')
  .style('display', 'none');

const simulation = d3.forceSimulation()
  // .force("link", d3.forceLink().id(function(d, i) {
  //   return d.name;
  // }))
  .force("charge", d3.forceManyBody().strength(2)) //how much should elements attract or repell each other?
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide(function(d){return nodeScale(d.count)+2}));


  var svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", height);


///load data and preprocessing- metadataschema
Promise.all([
  d3.csv(url), //data
])
  .then(([networkData]) => {
    console.log(networkData)

let nodes = []
let links = []

networkData.forEach(function(d,i){

let peopleNodes = d.people == "" ? [] : d.people.split(";")
let keywordNodes = d.keyword == "" ? [] : d.keyword.split(";")
let placesNodes = d.places == "" ? [] : d.places.split(";")
let worksNodes = d.works == "" ? [] : d.works.split(";")
let projectNodes = d.project == "" ? [] : d.project.split(";")
let artisticNodes = d.artistic == "" ? [] : d.artistic.split(";")

//add people to nodes
peopleNodes.forEach(function(D){
  if (nodes.filter(function(x){return x.name == D}).length == 0){
    nodes.push({
      name: D,
      count: 1,
      category: "people"
    })
  }else{
    nodes.filter(function(x){return x.name == D})[0].count++
  }
})

//add keywords to nodes
keywordNodes.forEach(function(D){
  if (nodes.filter(function(x){return x.name == D}).length == 0){
    nodes.push({
      name: D,
      count: 1,
      category: "keyword"
    })
  }else{
    nodes.filter(function(x){return x.name == D})[0].count++
  }
})

//add places to nodes
placesNodes.forEach(function(D){
  if (nodes.filter(function(x){return x.name == D}).length == 0){
    nodes.push({
      name: D,
      count: 1,
      category: "places"
    })
  }else{
    nodes.filter(function(x){return x.name == D})[0].count++
  }
})

//add works to nodes
worksNodes.forEach(function(D){
  if (nodes.filter(function(x){return x.name == D}).length == 0){
    nodes.push({
      name: D,
      count: 1,
      category: "works"
    })
  }else{
    nodes.filter(function(x){return x.name == D})[0].count++
  }
})

//add project to nodes
projectNodes.forEach(function(D){
  if (nodes.filter(function(x){return x.name == D}).length == 0){
    nodes.push({
      name: D,
      count: 1,
      category: "project"
    })
  }else{
    nodes.filter(function(x){return x.name == D})[0].count++
  }
})

//add artistic to nodes
artisticNodes.forEach(function(D){
  if (nodes.filter(function(x){return x.name == D}).length == 0){
    nodes.push({
      name: D,
      count: 1,
      category: "artistic"
    })
  }else{
    nodes.filter(function(x){return x.name == D})[0].count++
  }
})



let allNodes = [].concat(peopleNodes,keywordNodes, placesNodes, worksNodes, projectNodes, artisticNodes)

//create combinations of source+targets out of all "objects"
//https://stackoverflow.com/questions/43241174/javascript-generating-all-combinations-of-elements-in-a-single-array-in-pairs
allNodes.flatMap(
  function(v, i){return allNodes.slice(i+1).forEach(function(w){
    console.log( v + '+ ' + w )
    links.push({
      source: v,
      target: w,
      dateStart: d.start,
      dateEnd: d.end,
      source: d.title,
      description: d.description
    })
  }
  )}
)



})

console.log(links)
console.log(nodes)



simulation
  .nodes(nodes) //we use nodes from our json (look into the file to understand that)
  .on("tick", ticked)

// simulation
//   .force("link")
//   .links(links)

  svg.selectAll(".link") //we create lines based on the links data
    .data(links)
    .join("line")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr("class", "link")
    .style("stroke", function(d, i) {
      return "black"
    })
    .style("opacity", 0.5)


  svg.selectAll(".node") //we create nodes based on the links data
    .data(nodes)
    .join("circle")
    .classed("node", true)
    .attr("r", function(d){return nodeScale(d.count)})
    .style("stroke", "white")
    .style("stroke-width", 1)
    .style("fill", function(d) {
      return color(d.category)
    })
    .on("mousemove", function(event, d){
      tooltip
        .style('position', 'absolute')
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY + 10}px`)
        .style('display', 'inline-block')
        .style('opacity', '0.9')
        .html(function(){return `<p class="tooltip-title">${d.name}</p>`})
    })

    function ticked(d) {

    //  position the nodes based on the simulated x y
      d3.selectAll(".node")
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        })

        //also use the x, y of the links for the lines. x1 and y1 are for the source node, x2 and y2 for the target node
      // d3.selectAll(".link")
      //   .attr("x1", function(d) {
      //     return d.source.x
      //   })
      //   .attr("y1", function(d) {
      //     return d.source.y
      //   })
      //   .attr("x2", function(d) {
      //     return d.target.x
      //   })
      //   .attr("y2", function(d) {
      //     return d.target.y
      //   });

    }

});
