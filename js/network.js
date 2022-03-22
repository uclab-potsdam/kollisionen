var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv'
// url = './minimal.csv' //local backup

const width = window.innerWidth
const height = window.innerHeight

var parseDate = d3.timeParse("%Y-%m-%d"); // further format to correctly position dates ()
var formatTime = d3.timeFormat("%e %B %Y"); //
var startParse = d3.timeParse("%Y-%m-%d %I:%M%p");
var endParse = d3.timeParse("%Y-%m-%d %I:%M%p");

let nodeScale = d3.scaleLinear()
  .domain([1, 300])
  .range([5, 100])

let edgeScale = d3.scaleLinear()
  .domain([1, 50])
  .range([0.5, 10])

let zoom = d3.zoom()
  .scaleExtent([1 / 3, 8])
  .on("zoom", zoomed)

function zoomed(event, d) {
  d3.select(".networkG").attr("transform", event.transform);
  //d3.selectAll("circle").attr("r", function(){return d3.select(this).attr("r")/event.transform.k})
}

let color = d3.scaleOrdinal(d3.schemeCategory10)

let tooltip = d3.select("body")
  .append('div')
  .attr('class', 'tooltip')
  .style('display', 'none');

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d, i) {
    return d.name;
  }).distance(100))
  .force("charge", d3.forceManyBody().strength(-20)) //how much should elements attract or repell each other?
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide(function(d) {
    return nodeScale(d.count) + 2
  }));


var svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", height);


let networkG = svg.append("g").classed("networkG", true)
svg.call(zoom)

let linkG = networkG.append("g").attr("class", "linkG")
let nodeG = networkG.append("g").attr("class", "nodeG")
let linkChildren = networkG.append("g").attr("class", "linkChildrenG")
let labelG = networkG.append("g").attr("class", "labelG")

///load data and preprocessing- metadataschema
Promise.all([
    d3.csv(url), //data
  ])
  .then(([networkData]) => {
    console.log(networkData)

    for (let i = 0; i < networkData.length; i++) {
      networkData[i]["vstart"] = networkData[i]["start"];
      networkData[i]["vend"] = networkData[i]["end"];
      networkData[i]["uncertaintystart"] = 0;
      networkData[i]["uncertaintyend"] = 0;
      networkData[i]["category1"] = false;
      networkData[i]["category2"] = false;
      networkData[i]["category3"] = false;
      networkData[i]["category4"] = false;
      networkData[i]["category5"] = false;
    };

    for (let i = 0; i < networkData.length; i++) {

      var startA = networkData[i]["start"].split("-");

      if (startA[1] && startA[2] === "00" && networkData[i]["end"] === "") networkData[i]["end"] = networkData[i]["start"];

      var endA = networkData[i]["end"].split("-");
      // if (startA[1] && startA[2] == "00" && networkData[i]["end"] == "") networkData[i]["end"] = +startA[0] + 1 + "-01-01"; //duplicates where 'start' has a "-00-"" value to 'end' to create ranges

      /* 2. add 'uncertainty' levels:
      0: no uncertainty, e.g. 1898-01-23
      1: uncertainty in days, e.g. 1914-07-00
      2: uncertainty in months e.g. 1906-00-00
      */
      if (startA[1] == "00") networkData[i]["uncertaintystart"] = 2;
      else if (startA[2] == "00") networkData[i]["uncertaintystart"] = 1;
      if (endA[1] == "00") networkData[i]["uncertaintyend"] = 2;
      else if (endA[2] == "00") networkData[i]["uncertaintyend"] = 1;

      /* 3. populate vstart and vend. assign proper dates to events that automatically fall on 1st January
          start
            uncertainty == 2 → YYYY-01-01
            uncertainty == 1 → YYYY-MM-01
          end
            uncertainty == 2 → YYYY-12-31
            uncertainty == 1 → YYYY-MM-28
          */

      // gives all uncertain events actual dates values rather than placing it on 1st January

      if (networkData[i]["uncertaintystart"] == 2) {
        networkData[i]["vstart"] = startA[0] + "-01-01";
      } else if (networkData[i]["uncertaintystart"] == 1) {
        networkData[i]["vstart"] = startA[0] + "-" + startA[1] + "-01";
        networkData[i]["vend"] = startA[0] + "-" + startA[1] + "-28";
      } else networkData[i]["vstart"] = networkData[i]["start"];

      if (networkData[i]["uncertaintyend"] == 2) {
        networkData[i]["vend"] = +endA[0] + "-12-31";
        // else if (networkData[i]["uncertaintyend"] == 2) networkData[i]["vend"] = +endA[0] + 1 + "-01-01";
      } else if (networkData[i]["uncertaintyend"] == 1) {
        networkData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";
      } else networkData[i]["vend"] = networkData[i]["end"];

      // fix date ranges - 01, 03, 05, 07, 08, 10, 12 = 31
      // fix date ranges - 04, 06, 09, 11 = 30
      // else 28 (except leap years)

      if ((networkData[i]["uncertaintyend"] == 1 && endA[1] == "01") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "03") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "05") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "07") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "08") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "10") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "12")) {
        networkData[i]["vend"] = endA[0] + "-" + endA[1] + "-31";
      } else if ((networkData[i]["uncertaintyend"] == 1 && endA[1] == "04") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "06") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "09") ||
        (networkData[i]["uncertaintyend"] == 1 && endA[1] == "11")) {
        networkData[i]["vend"] = endA[0] + "-" + endA[1] + "-30";
      } else if (networkData[i]["uncertaintyend"] == 1 && endA[1] == "02" && endA[0] % 4 === 0) {
        networkData[i]["vend"] = endA[0] + "-" + endA[1] + "-29";
      }
      //  else networkData[i]["vend"] = endA[0] + "-" + endA[1] + "-28";

      if (networkData[i]["uncertaintyend"] == 2) networkData[i]["vend"] = endA[0] + "-12-31"; // it is currently also doing this "-undefined-28"
    };

    for (let i = 0; i < networkData.length; i++) {

      // category 1=Cinema and Theatre, category 2=Biography and Personality, category 3=Writing and Teaching, category 4=Graphic Art, category 5=Apartment
      //categories sorted into separate categories to aid with styling later

      if (networkData[i]["category"].includes("Cinema and Theatre")) networkData[i]["category1"] = true;
      if (networkData[i]["category"].includes("Biography and Personality")) networkData[i]["category2"] = true;
      if (networkData[i]["category"].includes("Writing and Teaching")) networkData[i]["category3"] = true;
      if (networkData[i]["category"].includes("Graphic Art")) networkData[i]["category4"] = true;
      if (networkData[i]["category"].includes("Apartment")) networkData[i]["category5"] = true;

    };

    // // format the data
    networkData.forEach(function(d) {
      //   // d.start = +parseDate(d.start);
      //   // d.end = +parseDate(d.end);
      d.vdateStart = +startParse(d.vstart + " 00:01AM");
      d.vdateEnd = +endParse(d.vend + " 23:59AM")
    });

    console.log(networkData)

    let nodes = []
    let links = []

    networkData.forEach(function(d, i) {

      let peopleNodes = d.people == "" ? [] : d.people.split(";")
      let placesNodes = d.places == "" ? [] : d.places.split(";")
      let worksNodes = d.works == "" ? [] : d.works.split(";")
      //let projectNodes = d.project == "" ? [] : d.project.split(";")
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

      // //add project to nodes
      // projectNodes.forEach(function(D){
      //   if (nodes.filter(function(x){return x.name == D}).length == 0){
      //     nodes.push({
      //       name: D,
      //       count: 1,
      //       category: "project"
      //     })
      //   }else{
      //     nodes.filter(function(x){return x.name == D})[0].count++
      //   }
      // })

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
  placeholder: "Search events based on keywords",
  allowClear: true

});

  $("#search").on("select2-selecting", function(e) {
    console.log(e.choice.name)
    console.log(e.choice.category)
    d3.select("#eventList").selectAll("li").classed("filteredin",false)

    if (e.choice.category == "people"){
      d3.select("#eventList").selectAll("li").style("display", function(d){
        if(d.people.includes(e.choice.name)){return "block"}else{return "none"}})
        .classed("filteredin", function(d){
          if(d.people.includes(e.choice.name)){return true}else{return false}})
    }else if (e.choice.category == "places"){
          d3.select("#eventList").selectAll("li").style("display", function(d){
            if(d.places.includes(e.choice.name)){return "block"}else{return "none"}})
            .classed("filteredin", function(d){
              if(d.places.includes(e.choice.name)){return true}else{return false}})
          }else if (e.choice.category == "artistic"){
                d3.select("#eventList").selectAll("li").style("display", function(d){
                  if(d.artistic.includes(e.choice.name)){return "block"}else{return "none"}})
                  .classed("filteredin", function(d){
                    if(d.artistic.includes(e.choice.name)){return true}else{return false}})
                  }else if (e.choice.category == "additional"){
                        d3.select("#eventList").selectAll("li").style("display", function(d){
                          if(d.additional.includes(e.choice.name)){return "block"}else{return "none"}})
                          .classed("filteredin", function(d){
                            if(d.additional.includes(e.choice.name)){return true}else{return false}})
                          }else if (e.choice.category == "works"){
                                d3.select("#eventList").selectAll("li").style("display", function(d){
                                  if(d.works.includes(e.choice.name)){return "block"}else{return "none"}})
                                  .classed("filteredin", function(d){
                                    if(d.works.includes(e.choice.name)){return true}else{return false}})
                              }


    itemSelection()
  })







    simulation
      .nodes(nodes) //we use nodes from our json (look into the file to understand that)
      .on("tick", ticked)

    simulation
      .force("link")
      .links(links)

    console.log(links)

    linkG.selectAll(".link") //we create lines based on the links data
      .data(links)
      .join("line")
      .style("fill", "none")
      .attr("stroke-width", function(d) {
        return edgeScale(d.children.length)
      })
      .attr("class", "link")
      .style("stroke", function(d, i) {
        if(d.children.length < 1){
          if (d.children[0].category.includes("Cinema and Theatre")== true && d.children[0].category.includes("Biography and Personality") == false && d.children[0].category.includes("Writing and Teaching") == false){
            return "#002fa7"
          }else if (d.children[0].category.includes("Cinema and Theatre")== false && d.children[0].category.includes("Biography and Personality") == true && d.children[0].category.includes("Writing and Teaching") == false){
              return "#fdd55c"
            }else if (d.children[0].category.includes("Cinema and Theatre")== false && d.children[0].category.includes("Biography and Personality") == false && d.children[0].category.includes("Writing and Teaching") == true){
                return "#ed563b"
              }else if (d.children[0].category.includes("Cinema and Theatre")== true && d.children[0].category.includes("Biography and Personality") == false && d.children[0].category.includes("Writing and Teaching") == true){
                  return "#774371"
                }else if (d.children[0].category.includes("Cinema and Theatre")== true && d.children[0].category.includes("Biography and Personality") == true && d.children[0].category.includes("Writing and Teaching") == false){
                    return "rgb(96, 167, 105)"
                  }else if (d.children[0].category.includes("Cinema and Theatre")== false && d.children[0].category.includes("Biography and Personality") == true && d.children[0].category.includes("Writing and Teaching") == true){
                      return "#f5964c"
                    }else{return "grey"}
        }else{return "black"
      }
      })
      .style("opacity", 0.2)
      .on("click", function(event, d, i) {
        unfoldingEdges(d, i)
      })


    // networkG.selectAll(".node") //we create nodes based on the links data
    //   .data(nodes)
    //   .join("circle")
    //   .classed("node", true)
    //   .attr("r", function(d){return nodeScale(d.count)})
    //   .style("stroke", "white")
    //   .style("stroke-width", 1)
    //   .style("fill", function(d) {
    //     return color(d.category)
    //   })

    const symbolScale = d3.scaleOrdinal()
      .domain(["people", "places", "artistic", "works", "additional"])
      .range([0, 2, 3, 5, 6])

    nodeG.selectAll(".nodeSymbol") //we create nodes based on the links data
      .data(nodes)
      .join("path")
      .classed("nodeSymbol", true)
      .attr('d', d3.symbol().type(function(d, i) {
        return d3.symbols[symbolScale(d.category)]
      }).size(function(d) {
        return nodeScale(d.count) * 5
      }))
      .on("mousemove", function(event, d) {
        tooltip
          .style('position', 'absolute')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY + 10}px`)
          .style('display', 'inline-block')
          .style('opacity', '0.9')
          .html(function() {
            return `<p class="tooltip-title">${d.name}</p><p class="tooltip-title">Category: ${d.category}</p><p class="tooltip-title">Occurences: ${d.count}</p>`
          })
      })
      .on("mouseout", function(event, d) {
        tooltip
          .style('position', 'absolute')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY + 10}px`)
          .style('display', 'none')
      })

    labelG.selectAll(".label") //we create nodes based on the links data
      .data(nodes)
      .join("text")
      .classed("label", true)
      .attr("dx", function(d) {
        return nodeScale(d.count) / 5 + 2
      })
      .attr("dy", function(d) {
        return nodeScale(d.count) / 5 + 2
      })
      .style("fill", "black")
      .text(function(d) {
        return d.name
      })
      .style("font-size", "6")


    //create Event List
    d3.select("#eventList").append("ul").selectAll("li")
      .data(networkData)
      .join("li")
      .classed("cinema", function(d){if(d.category == "Cinema and Theatre"){return true}})
      .classed("biography", function(d){console.log(d.category)
        if(d.category == "Biography and Personality"){
        return true}})
      .classed("writing", function(d){if(d.category == "Writing and Teaching"){return true}})
      .classed("cinewrit", function(d){if(d.category == "Cinema and Theatre;Writing and Teaching" || d.category== "Writing and Teaching;Cinema and Theatre"){return true}})
      .classed("cinebio", function(d){if(d.category == "Cinema and Theatre;Biography and Personality" || d.category == "Biography and Personality;Cinema and Theatre" ){return true}})
      .classed("biowrit", function(d){if(d.category == "Biography and Personality;Writing and Teaching" || d.category == "Writing and Teaching;Biography and Personality"){return true}})
      .classed("apartment", function(d){if(d.category == "Apartment"){return true}})
      .classed("graphic", function(d){if(d.category == "Graphic Art"){return true}})
      .classed("allcat", function(d){if(d.category == "Biography and Personality;Cinema and Theatre;Writing and Teaching"){return true}})
      .classed("filteredin",true)
      .text(function(d) {
        return d.title + " (" + d.start + "–" + d.end + ")"
      })


    //console.log(d3.select("#eventList").selectAll("li")
    //   .filter(function(d) {
    //     return d3.select(this).node().getBoundingClientRect().top >= 0 && d3.select(this).node().getBoundingClientRect().bottom <= (window.innerHeight || document.documentElement.clientHeight)
    //   })._groups[0].length
    //
    // )





    function itemSelection() {
      let firstItem = new Date(d3.select("#eventList").selectAll("li").filter(".filteredin")
        .filter(function(d) {
          return d3.select(this).node().getBoundingClientRect().top >= 0 && d3.select(this).node().getBoundingClientRect().bottom <= (window.innerHeight || document.documentElement.clientHeight)
        })._groups[0][0].__data__.vstart)

      let visibleItemCount = d3.select("#eventList").selectAll("li").filter(".filteredin")
        .filter(function(d) {
          return d3.select(this).node().getBoundingClientRect().top >= 0 && d3.select(this).node().getBoundingClientRect().bottom <= (window.innerHeight || document.documentElement.clientHeight)
        })._groups[0].length

      let lastItem = new Date(d3.select("#eventList").selectAll("li").filter(".filteredin")
        .filter(function(d) {
          return d3.select(this).node().getBoundingClientRect().top >= 0 && d3.select(this).node().getBoundingClientRect().bottom <= (window.innerHeight || document.documentElement.clientHeight)
        })._groups[0][visibleItemCount - 1].__data__.vstart)

     console.log(firstItem)
     console.log(lastItem)

      //d3.selectAll(".node").style("display", "none")
      d3.selectAll(".link").style("display", function(d) {
  //      console.log(d)
        if (d.children[0].dateStart >= firstItem && d.children[0].dateStart <= lastItem) {
          return "block"
        } else {
          return "none"
        }
      })

      ///get nodes with edges
      let connectedNodes = []

      d3.selectAll(".link").filter(function(d) {
          return d.children[0].dateStart >= firstItem && d.children[0].dateStart <= lastItem
        })
        .each(function(D, I) {
          if (connectedNodes.filter(function(x) {
              return x == D.source.name
            }).length == 0) {
            connectedNodes.push(
              D.source.name
            )
          }
          if (connectedNodes.filter(function(x) {
              return x == D.target.name
            }).length == 0) {
            connectedNodes.push(
              D.target.name
            )
          }
        })

      d3.selectAll(".nodeSymbol")
        .style("display", function(D, I) {
          if (connectedNodes.filter(function(d) {
              return d == D.name
            }).length > 0) {
            return "block"
          } else {
            return "none"
          }
        })

      d3.selectAll(".label")
        .style("display", function(D, I) {
          if (connectedNodes.filter(function(d) {
              return d == D.name
            }).length > 0) {
            return "block"
          } else {
            return "none"
          }
        })



      simulation
        .nodes(nodes.filter(function(D, I) {
          return connectedNodes.filter(function(d) {
            return d == D.name
          }).length > 0
        }))
        .on("tick", ticked)

      simulation
        .force("link")
        .links(links.filter(function(d) {
          return d.children[0].dateStart >= firstItem && d.children[0].dateStart <= lastItem
        }))

      simulation.alpha(1).restart();
    }








    d3.select("#eventList").on("scroll", itemSelection)

    itemSelection()



    function unfoldingEdges(d, i) {
      ///////edge unfolding start
      ////////////////////////////////////////////////

      //console.log(d)

      d3.selectAll(".link").transition().style("stroke", "#E3E3E2").style("opacity", 1)
      //  d3.select(this).transition().style("opacity", 0)


      let x1 = d.source.x //x Punkt A
      let y1 = d.source.y //y Punkt A
      let x2 = d.target.x //x Punkt B
      let y2 = d.target.y //y Punkt B
      let mx = (x1 + x2) / 2 // Mittelpunkt x zwischen x1 und x2
      let my = (y1 + y2) / 2 // Mittelpunkt y zwischen y1 und y2

      // //zoom.scaleBy(svg, 20)
      // zoom.translateTo(svg.transition().duration(500), mx, my)
      // setTimeout(function() {
      //   zoom.scaleTo(svg.transition().duration(500), 3)
      // }, 750);



      // d3.selectAll(".nodes")
      //   .classed("notedgerelevant", false)
      //   .filter(function(D) {
      //     return D.id != d._source.id || D.id != d._target.id
      //   })
      //   .classed("notedgerelevant", true)
      //   .transition().style("fill", "#D3D3D3")
      //   .attr("width", function(d, i) {
      //     return 3 / zoomlevel
      //   })
      //   .attr("height", function(d, i) {
      //     return 3 / zoomlevel
      //   })
      //
      //
      // d3.selectAll(".nodesOnTop").remove()
      //
      // d3.selectAll(".nodes").filter(function(D) {
      //     return D.id == d._source.id || D.id == d._target.id
      //   }).classed("notedgerelevant", false)
      //   .each(function(T) {
      //
      //       nodesOnTop.append("rect")
      //         .classed("nodesOnTop", true)
      //         .style("fill", function() {
      //           return color("Selection")
      //         })
      //         .attr("width", function() {
      //           return (zoomlevel >= 1) ? (nodeSize(T.connectivityClean) / zoomlevel) : nodeSize(T.connectivityClean)
      //         })
      //         .attr("height", function() {
      //           return (zoomlevel >= 1) ? (nodeSize(T.connectivityClean) / zoomlevel) : nodeSize(T.connectivityClean)
      //         })
      //         .attr("x", function() {
      //           return T.x - (zoomlevel >= 1) ? (nodeSize(T.connectivityClean) / zoomlevel) : nodeSize(T.connectivityClean) / 2;
      //         })
      //         .attr("y", function() {
      //           return T.y - (zoomlevel >= 1) ? (nodeSize(T.connectivityClean) / zoomlevel) : nodeSize(T.connectivityClean) / 2;
      //         })
      //         .attr("rx", function() {
      //           if (T.Label == "PerName") {
      //             return 1000 //height number because"If rx is greater than half of the width of the rectangle, then the browser will consider the value for rx as half of the width of the rectangle."
      //           } else {
      //             return 2
      //           }
      //         })
      //         .attr("connectivity", T.connectivityClean)
      //     }
      //   )
      //
      // d3.selectAll(".nodes").filter(function(D) {
      //   return D.id == d._source.id || D.id == d._target.id
      // }).transition().style("fill", "black").style("opacity", 1)

      d3.select(".linkChildrenG").selectAll(".linkChild")
        .data(d.children)
        .join("path")
        .style("fill", "none")
        .attr("stroke-width", function() {
          return 1 //(zoomlevel > 1) ? 1.5 / zoomlevel : 1.5
        })
        .attr("class", "linkChild")
        .style("stroke", function(D, I) {
        //  console.log(D)
          if (D.category.includes("Cinema and Theatre")== true && D.category.includes("Biography and Personality") == false && D.category.includes("Writing and Teaching") == false){
            return "#002fa7"
          }else if (D.category.includes("Cinema and Theatre")== false && D.category.includes("Biography and Personality") == true && D.category.includes("Writing and Teaching") == false){
              return "#fdd55c"
            }else if (D.category.includes("Cinema and Theatre")== false && D.category.includes("Biography and Personality") == false && D.category.includes("Writing and Teaching") == true){
                return "#ed563b"
              }else if (D.category.includes("Cinema and Theatre")== true && D.category.includes("Biography and Personality") == false && D.category.includes("Writing and Teaching") == true){
                  return "#774371"
                }else if (D.category.includes("Cinema and Theatre")== true && D.category.includes("Biography and Personality") == true && D.category.includes("Writing and Teaching") == false){
                    return "rgb(96, 167, 105)"
                  }else if (D.category.includes("Cinema and Theatre")== false && D.category.includes("Biography and Personality") == true && D.category.includes("Writing and Teaching") == true){
                      return "#f5964c"
                    }else{return "grey"}
        })
        .attr("d", function(D, I) {
          let x1 = d.source.x //x Punkt A
          let y1 = d.source.y //y Punkt A
          let A = [x1, y1]
          let x2 = d.target.x //x Punkt B
          let y2 = d.target.y //y Punkt B
          let B = [x2, y2]
          let mx = (x1 + x2) / 2 // Mittelpunkt x zwischen x1 und x2
          let my = (y1 + y2) / 2 // Mittelpunkt y zwischen y1 und y2
          let M = [mx, my] // Mittelpunkt zwischen A und B (hier verläuft das Lot hoehe)

          return "M" + d.source.x + " " + d.source.y +
            " C " + mx + " " + my + " " +
            mx + " " + my + " " +
            d.target.x + " " + d.target.y
        })
        .transition()
        .duration(800)
        .attr("d", function(D, I) {

          let x1 = d.source.x //x Punkt A
          let y1 = d.source.y //y Punkt A
          let A = [x1, y1]
          let x2 = d.target.x //x Punkt B
          let y2 = d.target.y //y Punkt B
          let B = [x2, y2]
          let mx = (x1 + x2) / 2 // Mittelpunkt x zwischen x1 und x2
          let my = (y1 + y2) / 2 // Mittelpunkt y zwischen y1 und y2
          let M = [mx, my] // Mittelpunkt zwischen A und B (hier verläuft das Lot hoehe)

          let hoehe // höhe des Ausschlags basierend auf I
          if (I % 2) { //gerade Zahl oder ungerade Zahl damit abwechselnd oben und unten die Kante ausschlägt
            hoehe = (I) * 3
          } else {
            hoehe = 3 + (I * 3)
          }



          let AM = Math.hypot(mx - x1, my -
            y1) //Funktion gibt die Quadratwurzel von der Summe der quadrierten Argumente zurück. Hier Berechnung der Kante von PunktA(x1y1) zu Mittelpunkt zwischen A und B (x2y2), weil dort die Höhe rechtwinklig zur Kante läuft
          let AP = Math.hypot(AM, hoehe) //Funktion gibt die Quadratwurzel von der Summe der quadrierten Argumente zurück: Kante A zu gesuchten Punkt
          let P = Intersect2Circles(A, AP, M, hoehe) //gesuchter Punkt

          let x3 //P[1][0] //x von P
          let y3 //= P[1][1] //y von OP

          if (I % 2) {
            x3 = P[0][0]
            y3 = P[0][1]
          } else {
            x3 = P[1][0]
            y3 = P[1][1]
          }

          //Pfad unter Nutzung von allen drei Punkten
          return "M" + d.source.x + " " + d.source.y +
            " C " + x3 + " " + y3 + " " +
            x3 + " " + y3 + " " +
            d.target.x + " " + d.target.y
        })




      ///////edge unfolding end
      ////////////////////////////////////////////////


    }

    //http://walter.bislins.ch/blog/index.asp?page=Schnittpunkte+zweier+Kreise+berechnen+%28JavaScript%29
    //Intersect2Circles function start: find point using 2 points and 2 edge lengths
    function Intersect2Circles(A, a, B, b) {
      // A, B = [ x, y ]
      // return = [ Q1, Q2 ] or [ Q ] or [] where Q = [ x, y ]
      var AB0 = B[0] - A[0];
      var AB1 = B[1] - A[1];
      var c = Math.sqrt(AB0 * AB0 + AB1 * AB1);
      if (c == 0) {
        // no distance between centers
        return [];
      }
      var x = (a * a + c * c - b * b) / (2 * c);
      var y = a * a - x * x;
      if (y < 0) {
        // no intersection
        return [];
      }
      if (y > 0) y = Math.sqrt(y);
      // compute unit vectors ex and ey
      var ex0 = AB0 / c;
      var ex1 = AB1 / c;
      var ey0 = -ex1;
      var ey1 = ex0;
      var Q1x = A[0] + x * ex0;
      var Q1y = A[1] + x * ex1;
      if (y == 0) {
        // one touch point
        return [
          [Q1x, Q1y]
        ];
      }
      // two intersections
      var Q2x = Q1x - y * ey0;
      var Q2y = Q1y - y * ey1;
      Q1x += y * ey0;
      Q1y += y * ey1;
      return [
        [Q1x, Q1y],
        [Q2x, Q2y]
      ];
    }
    //Intersect2Circles function end
    ////////////////////////////////


    function ticked(d) {
      //if (simulation.alpha() == 1) {
      //    simulation.stop()
      //  position the nodes based on the simulated x y
      d3.selectAll(".node")
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        })

      d3.selectAll(".label")
        .attr("x", function(d) {
          return d.x;
        })
        .attr("y", function(d) {
          return d.y;
        })

      d3.selectAll(".nodeSymbol")
        .attr("transform", function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        })


      //also use the x, y of the links for the lines. x1 and y1 are for the source node, x2 and y2 for the target node
      d3.selectAll(".link")
        .attr("x1", function(d) {
          return d.source.x
        })
        .attr("y1", function(d) {
          return d.source.y
        })
        .attr("x2", function(d) {
          return d.target.x
        })
        .attr("y2", function(d) {
          return d.target.y
        });
      //}
    }

  });
