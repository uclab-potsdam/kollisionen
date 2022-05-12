// https://observablehq.com/@arrran/timeline-eisenstein-1898-1974-categories@306
import define1 from "./e93997d5089d7165@2303.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["Sample data (1930-June, 1931) - Sheet1-2.csv",new URL("./files/c3d5d0e57d1c904fdc21804db875d25aa307e490c7259b5af1b9e63bc193778bac6eb58cda7f8175554c097d43f6fd7f5423625aa848e3f6835c360e91f68a2b",import.meta.url)],["KollisionenMetadata_v0.6 - Minimal.csv",new URL("./files/7be2da597bdb7319964db6658ddc6e9022ea09329fed80b5fd424acddea21ec3378e23c41902a7b9e62f4eb5b1c98a8622c43aeec6c60804ddd6b077b518207e",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Timeline Eisenstein (January 1898 to 1974)`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### https://observablehq.com/@didoesdigital/2020-timeline`
)});
  main.variable(observer("viewof title")).define("viewof title", ["text"], function(text){return(
text({title: "Chart title", placeholder: "Eisenstein in 1930 - June 1931", value: "Eisenstein in 1930 - June 1931"})
)});
  main.variable(observer("title")).define("title", ["Generators", "viewof title"], (G, _) => G.input(_));
  main.variable(observer("viewof subtitle")).define("viewof subtitle", ["text"], function(text){return(
text({title: "Chart subtitle", value: "Life Events of his travels, writings and meeting people"})
)});
  main.variable(observer("subtitle")).define("subtitle", ["Generators", "viewof subtitle"], (G, _) => G.input(_));
  main.variable(observer("viewof labelSeparation")).define("viewof labelSeparation", ["slider"], function(slider){return(
slider({
  min: 12, 
  max: 48,
  step: 2, 
  value: 24, 
  title: "Label separation",
})
)});
  main.variable(observer("labelSeparation")).define("labelSeparation", ["Generators", "viewof labelSeparation"], (G, _) => G.input(_));
  main.variable(observer("viewof eventsSelection")).define("viewof eventsSelection", ["radio"], function(radio){return(
radio({
  title: 'Category',
  description: 'Please select which events to show',
  options: [
    { label: 'Biography and Personality', value: 'biographyAndPersonality' },
    { label: 'Cinema and Theatre', value: 'cinemaAndTheatre' },
    { label: 'Writing and Teaching', value: 'writingAndTeaching' },
    { label: 'All', value: 'all' },

  ],
  value: 'biographyAndPersonality'
})
)});
  main.variable(observer("eventsSelection")).define("eventsSelection", ["Generators", "viewof eventsSelection"], (G, _) => G.input(_));
  main.variable(observer("viewof search")).define("viewof search", ["Search","keywords"], function(Search,keywords){return(
Search(keywords, {placeholder: "Search for keywords"})
)});
  main.variable(observer("search")).define("search", ["Generators", "viewof search"], (G, _) => G.input(_));
  main.variable(observer()).define(["search"], function(search){return(
search
)});
  main.variable(observer("DiDoesDigital2020Timeline")).define("DiDoesDigital2020Timeline", ["d3","DOM","params","width","title","subtitle","axis","halo","data","y","dodge","labelSeparation","html"], function(d3,DOM,params,width,title,subtitle,axis,halo,data,y,dodge,labelSeparation,html)
{
  const markerDefaultColor = "#c74327";
  const markerSelectedColor = "#c74327";
  const markerFadedColor = "#c74327";
  const markerPersonalColor = "#c74327";

  const labelDefaultColor = "#2c2b2c";
  const labelSelectedColor = "#2c2b2c";
  const labelFadedColor = "#d3d1d4";
  const labelPersonalColor = "#2c2b2c";
  
  const annotationDefaultColor = "#2c2b2c";
  const annotationPersonalColor = "#CADFF7";
  
  const svg = d3.select(DOM.svg(params.svg.width, params.svg.height))
    .attr("title", "Timeline of Melbourne in 2020")
    .attr("id", "timeline");
  
  const chartBackground = svg.append("rect")
    .attr("id", "chart-background")
    .attr("fill", "#fff") // fallback for CSS
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", params.svg.width)
    .attr("height", params.svg.height);

  const chartTitle = svg.append("g")
      .attr("class", "chart-title")
      .append("text")
          .attr("id", "title-text")
          .attr("text-anchor", "start")
          .attr("x", width >= params.smallScreenSize ? 96 : params.event.offset)
          .attr("y", 24)
          .attr("dy", "2em")
          .style("font-weight", "700")
          .style("font-size", "clamp(1.2rem, 4vw, 2.5rem)") // minimum, preferred, maximum
          .text(title);

  const chartSubtitle = svg.append("g")
      .attr("class", "chart-subtitle")
      .append("text")
          .attr("text-anchor", "start")
          .attr("x", width >= params.smallScreenSize ? 96 : params.event.offset)
          .attr("y", 24)
          .attr("dy", "5.5em")
          .style("font-weight", "600")
          .style("font-size", "clamp(1rem, 2.5vw, 1.25rem)") // minimum, preferred, maximum
          .text(subtitle);

  const byline = svg.append("g")
    .attr("transform", `translate(${width >= params.smallScreenSize ? params.plot.x * 0.4 : params.event.offset}, ${params.svg.height - (params.margin.bottom / 2)})`)
    .append("text")
      .attr("id", "byline")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "0.5em")
  
  
  const plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", `translate(${width >= params.smallScreenSize ? params.plot.x : params.smallScreenMargin.left}, ${params.plot.y})`);

  const gy = plot.append("g")
    .attr("id", "y-axis")
    .attr("class", "axis")
    .call(axis.y)
    .attr("aria-hidden", "true")
    .call(g => g.selectAll(".tick text").call(halo));
  
  const markers = plot.append("g")
    .attr("class", "markers")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("transform", d => `translate(0, ${y(d.date)})`)
      .attr("aria-hidden", "true")
      .attr("cx", 0.5)
      .attr("cy", (params.marker.radius / 2) + 0.5)
      .attr("fill", d => d.category === "Shared" ? markerDefaultColor : markerPersonalColor)
      .attr("stroke", d => d.category === "Shared" ? markerDefaultColor : markerPersonalColor)
      // .attr("stroke-width", 1)
      .attr("r", params.marker.radius);

  console.log('dates', data.map(d => ([d.date, y(d.date)])));
  const dodgedYValues = dodge(data.map(d => y(d.date)), labelSeparation);
  // const dodgedYValues = data.map(d => y(d.date)); // for debugging alignment

  const eventLabels = plot.append("g")
    .attr("class", "eventLabels")
    .selectAll("text")
    .data(d => d3.zip(
      data,
      dodgedYValues,
    ))
    .join("text")
      .attr("class", "event-title")
      .style("font-weight", "400")
      .style("fill", ([d]) => d.category === "Shared" ? labelDefaultColor : labelPersonalColor)
      .attr("x", width >= params.smallScreenSize ? params.event.offset : params.smallScreenEvent.offset)
      .attr("y", ([, y]) => y)
      .attr("dy", "0.35em");
    
  eventLabels.append("tspan")
      .text(([d]) => d.eventName);
  eventLabels.append("tspan")
      .text(([d]) => ` ${d.eventDescription} ${d3.timeFormat("%A, %e %B")(d.date)}`)
        .attr("x", width);
      // .text(([d]) => d.eventName);
  
  const tooltip = d3.create("div")
    .attr("class", "tooltip")
    .attr("aria-hidden", "true")
    .html(`
      <div class="tooltip-date">
        <span id="date"></span>
      </div>
      <div class="tooltip-name">
        <span id="name"></span>
      </div>
      <div class="tooltip-description">
        <span id="description"></span>
      </div>
    `);
  
  const rangeY = dodgedYValues.map(x => x + params.plot.y);
  const rangeY0 = rangeY[0];
  const fuzzyTextHeightAdjustment = 16
  
  svg.on("touchend mouseout", function(event) {
    markers
      .attr("fill", markerDefaultColor)
      .attr("stroke", markerDefaultColor);
    
    eventLabels
      .style("opacity", 1);
  });
  
  svg.on("touchmove mousemove", function(event) {
    const mouseY = d3.pointer(event,this)[1];
    const nearestEventY = rangeY.reduce((a, b) => Math.abs(b - mouseY) < Math.abs(a - mouseY) ? b : a);
    const dodgedIndex = rangeY.indexOf(nearestEventY);
    const dataEvent = data[dodgedIndex];

    if (mouseY >= rangeY0 - fuzzyTextHeightAdjustment) {

      eventLabels
        .filter((d, i) => i !== dodgedIndex)
        .style("opacity", 0.3);

      eventLabels
        .filter((d, i) => i === dodgedIndex)
        .style("opacity", 1);

      markers
        .filter((d, i) => i !== dodgedIndex)
        .attr("fill", markerFadedColor)
        .attr("stroke", markerFadedColor);

      markers
        .filter((d, i) => i === dodgedIndex)
        .attr("fill", markerDefaultColor)
        .attr("stroke", markerDefaultColor)
        .raise();
      
      tooltip.style("opacity", 1);
      tooltip.style("transform", `translate(${(width >= params.smallScreenSize ? params.plot.x + 8 : 0)}px, calc(-100% + ${nearestEventY}px))`);
      tooltip.select("#date")
        .text(d3.timeFormat("%A, %e %B")(dataEvent.date));
      tooltip.select("#name")
        .text(dataEvent.eventName);
      tooltip.select("#description")
        .text(dataEvent.eventDescription);
    }
  });

  svg.on("touchend mouseleave", () => tooltip.style("opacity", 0));

  return html`
    <figure style="max-width: 100%;">
      <div id="wrapper" class="wrapper">
        ${tooltip.node()}
        ${svg.node()}
      </div>
    </figure>
  </div>`;
  
  // return svg.node();
  // yield svg.node();
  // d3.selectAll(".event-name div").attr('class', 'teft');
}
);
  main.variable(observer("file")).define("file", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("KollisionenMetadata_v0.6 - Minimal.csv")
)});
  main.variable(observer("url")).define("url", function(){return(
"https://docs.google.com/spreadsheets/d/e/2PACX-1vTrU4i2RLTCar30bFgnvSLkjHvHlPjWLy3ec4UT9AsFsyTy2rbsjKquZgmhCqbsTZ4TLAnWv28Y3PnR/pub?gid=1387341329&single=true&output=csv"
)});
  main.variable(observer("kollisionen")).define("kollisionen", ["d3","url"], async function(d3,url)
{ // this is a JS Array of Objects; the key-value pairs consist of the column headers and the cell data
  let names =[];
  const spreadsheet = await d3.tsv(url).then(data => data.forEach(d => names.push(d))); // d3.tsv returns a Promise
  return names;
}
);
  main.variable(observer()).define(["d3","file"], async function(d3,file){return(
d3.csvParse(await file.text())
)});
  main.variable(observer("csv")).define("csv", ["file"], function(file){return(
file.text()
)});
  main.variable(observer("accessibleDataTable")).define("accessibleDataTable", ["render_data_table","data"], function(render_data_table,data){return(
render_data_table(data, {caption: "This data shows Eisenstein's life event from 1930 to June 1931", columns: ["Date", "Event", "Event description", "Category", "Keywords"], focusable: false})
)});
  main.variable(observer("render_data_table")).define("render_data_table", ["html","d3"], function(html,d3){return(
(data, options = {}) => {
  
  let caption = "";
  let ariaLabelledbyCaption = "";
  if (options.caption) {
    caption = `<caption id="caption">${options.caption}</caption>`;
    ariaLabelledbyCaption = `aria-labelledby="caption"`;
  }
  
  let theadRowHeaderCells;
  if (options.columns) {
    theadRowHeaderCells = options.columns.map((d) => {
      return `<th scope="col">${d}</th>`
    });
  }
  else {
    theadRowHeaderCells = Object.keys(data[0]).map((d, i) => {
      return `<th scope="col">${d}</th>`
    });
  }
  
  let focusable = 'tabindex="0"';
  if (options.focusable === false) {
    focusable = '';
  }
  
  return html`
  <div class="table-container" ${focusable} role="group" ${ariaLabelledbyCaption}>  
    <table>
      ${caption}
      <thead>
        <tr>${theadRowHeaderCells}</tr>
      <thead>
      <tbody>
        ${data.map(row => {
          return html`<tr>${Object.values(row).map((col, index) => {
            return index === 0 ? `<td>${d3.timeFormat("%A, %e %B")(col)}</td>`: `<td>${col}</td>`;
          })}</tr>`;
        })}
      </tbody>
    </table>
  </div>
`}
)});
  main.variable(observer("sourceData")).define("sourceData", ["d3","csv"], function(d3,csv)
{
  //const timeParser = d3.timeParse("%d %b %Y %I:%M%p");
  const timeParser = d3.timeParse("%Y-%m-%d %I:%M%p");
  const csvString = csv;
  const rowConversionFunction = ({
        "date": date,
        "info": eventName,
        "hover": eventDescription,
        "category": category,
        "keyword": keywords,
        
      }) => ({
        date: timeParser(date + " 06:00AM"), // adjusting to 6AM instead of midnight aligns first of month circles with axis tick markers
        eventName, 
        eventDescription,
        category,
        keywords,
      });
  return d3.csvParse(csvString, rowConversionFunction);

  // const extraPropertiesSource = {
  //   title: "My 2020 timeline",
  //   subtitle: "One Aussie's story"
  // };
  // return Object.assign(dataObjectTarget, extraPropertiesSource);
}
);
  main.variable(observer("data")).define("data", ["sourceData","eventsSelection"], function(sourceData,eventsSelection){return(
sourceData.filter(d => {
  if (eventsSelection === "biographyAndPersonality") { return d.category === "Biography and Personality"; }
  else if (eventsSelection === "cinemaAndTheatre") { return d.category === "Cinema and Theatre"; }
  else if (eventsSelection === "writingAndTeaching") { return d.category === "Writing and Teaching"; } 
  else { return true };
})
)});
  main.variable(observer("dodge")).define("dodge", ["d3"], function(d3){return(
function dodge(positions, separation = 10, maxiter = 10, maxerror = 1e-1) {
  positions = Array.from(positions);
  let n = positions.length;
  if (!(n > 1)) return positions;
  let index = d3.range(positions.length);
  for (let iter = 0; iter < maxiter; ++iter) {
    index.sort((i, j) => d3.ascending(positions[i], positions[j]));
    let error = 0;
    for (let i = 1; i < n; ++i) {
      let delta = positions[index[i]] - positions[index[i - 1]];
      if (delta < separation) {
        delta = (separation - delta) / 2;
        error = Math.max(error, delta);
        positions[index[i - 1]] -= delta;
        positions[index[i]] += delta;
      }
    }
    if (error < maxerror) break;
  }
  return positions;
}
)});
  main.variable(observer("y")).define("y", ["d3","data","params"], function(d3,data,params){return(
d3.scaleUtc()
  .domain(d3.extent(data, d => d.date))//.nice()
  .range([params.plot.y, params.plot.height])
)});
  main.variable(observer("axis")).define("axis", ["width","params","d3","y"], function(width,params,d3,y)
{
  const yAxis = width >= params.smallScreenSize ? 
        d3.axisRight(y)
            .tickPadding(-(params.margin.axisLeft))
            .tickSizeOuter(0)
            .tickSizeInner(-(params.margin.axisLeft))
        :
        d3.axisRight(y)
            .tickPadding(-(params.smallScreenMargin.axisLeft))
            .tickSizeOuter(0)
            .tickSizeInner(-(params.smallScreenMargin.axisLeft))
            .tickFormat(d3.timeFormat('%b'));

  return {y: yAxis};
}
);
  main.variable(observer("params")).define("params", ["width","data"], function(width,data)
{
  let output = {};
  
  output["smallScreenSize"] = 200;
  output["mediumScreenSize"] = 200;
  
  output["svg"] = {
    "width":  width,
    "height": data.length * 50 // Roughly relative to number of data points but doesn't factor in the full timeline scale such as clustering or spread out data
  };
  
  output["margin"] = {
    "top":    104,
    "right":  96,
    "bottom": 192,
    "left":   240,
    "axisLeft": 144,
  };
  
  output["plot"] = {
    "x":      output["margin"]["left"],
    "y":      output["margin"]["top"],
    "width":  output["svg"]["width"]  - output["margin"]["left"] - output["margin"]["right"],
    "height": output["svg"]["height"] - output["margin"]["top"]  - output["margin"]["bottom"]
  };
  
  output["smallScreenMargin"] = {
    "top":    60,
    "right":  8,
    "bottom": 192,
    "left":   8,
    "axisLeft": 144,
  };

  output["smallScreenPlot"] = {
    "x":      output["margin"]["left"],
    "y":      output["margin"]["top"],
    "width":  output["svg"]["width"]  - output["margin"]["left"] - output["margin"]["right"],
    "height": output["svg"]["height"] - output["margin"]["top"]  - output["margin"]["bottom"]
  };

  output["marker"] = {
    "radius": 4
  }
  
  output["date"] = {
    "offset": output["marker"]["radius"] * 2
  }

  output["event"] = {
    "offset": output["marker"]["radius"] * 6
  }

  output["smallScreenEvent"] = {
    "offset": output["marker"]["radius"] * 4
  }
  
  return output;
}
);
  main.variable(observer("halo")).define("halo", ["backgroundColor"], function(backgroundColor){return(
function halo(text) {
  text.clone(true)
      .each(function() { this.parentNode.insertBefore(this, this.previousSibling); })
      .attr("aria-hidden", "true")
      .attr("fill", "none")
      .attr("stroke", backgroundColor)
      .attr("stroke-width", 24)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .style("text-shadow", `-1px -1px 2px ${backgroundColor}, 1px 1px 2px ${backgroundColor}, -1px 1px 2px ${backgroundColor}, 1px -1px 2px ${backgroundColor}`);
}
)});
  main.variable(observer("backgroundColor")).define("backgroundColor", function(){return(
"#fdf5e6"
)});
  main.variable(observer("tooltipStyles")).define("tooltipStyles", ["html"], function(html){return(
html`
<style>
  .wrapper {
    position: relative;
  }

  .tooltip {
    background-color: #fff;
    border: 1px solid #c83f02;
    font-family: "Inconsolata", "Noto Sans", sans-serif;
    left: 0;
    max-width: 300px;
    opacity: 0;
    padding: calc(16px - 1px); /* border width adjustment */
    pointer-events: none;
    border-radius: 5px;
    position: absolute;
    top: -8px;
    transition: opacity 0.1s linear, transform 0.05s ease-in-out;
    z-index: 1;
  }

/*
  .tooltip:before {
    background-color: #fff;
    border-left-color: transparent;
    border-top-color: transparent;
    bottom: 0;
    content: '';
    height: 12px;
    left: 50%;
    position: absolute;
    transform-origin: center center;
    transform: translate(-50%, 50%) rotate(45deg);
    width: 12px;
    z-index: 1;
  }
*/

  .tooltip-date {
    margin-bottom: 0.2em;
    font-size: 0.7em;
    line-height: 1.2;
    font-weight: 400;
  }

  .tooltip-name {
    margin-bottom: 0.2em;
    font-size: 1em;
    line-height: 1.4;
    font-weight: 700;
  }

  .tooltip-description {
    margin-bottom: 0.2em;
    font-size: 0.8em;
    line-height: 1.4;
    font-weight: 400;
  }
</style>
`
)});
  main.variable(observer("typographyStyles")).define("typographyStyles", ["html","params"], function(html,params){return(
html`<style>
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700;800&display=swap');

text {
  fill: #3C3941;
  font: 400 16px/1.4 "Inconsolata", "Noto Sans", sans-serif;
}

.event-title {
  fill: #3C3941;
  font-size: 16px;
  line-height: 1.4;
  font-family: "Inconsolata", "Noto Sans", sans-serif;
}

.event-title:hover {
  cursor: default;
}

.event-description {
  fill: #3C3941;
  font: 400 16px/1.4 "Inconsolata", "Noto Sans", sans-serif;
  transform: translateY(1em);
}

#title {
  fill: #3C3941;
  font: 600 16px/1.4 "Inconsolata", "Noto Sans", sans-serif;
}

.axis text {
  font: 400 16px/1.4 "Inconsolata", "Noto Sans", sans-serif;
  fill: #676170;
}

@media (max-width: ${params.smallScreenSize}px) {
  text,
  .event-title,
  .event-description,
  #title,
  .axis text {
    font-size: 14px;
  }
}

</style>
`
)});
  main.variable(observer("chartStyles")).define("chartStyles", ["html","backgroundColor"], function(html,backgroundColor){return(
html`<style>
  #chart-background {
    fill: ${backgroundColor};
  }

  .tick line,
  .domain {
    stroke: #E2E0E5;
  }
`
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  const child2 = runtime.module(define1);
  main.import("text", child2);
  const child3 = runtime.module(define1);
  main.import("radio", child3);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  main.variable(observer("Inputs")).define("Inputs", ["require"], function(require){return(
require("@observablehq/inputs@0.7.17/dist/inputs.umd.min.js")
)});
  main.variable(observer("Search")).define("Search", ["Inputs"], function(Inputs){return(
Inputs.Search
)});
  main.variable(observer("keywords")).define("keywords", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("Sample data (1930-June, 1931) - Sheet1-2.csv").csv({typed: true})
)});
  return main;
}
