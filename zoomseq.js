var width = 960,
    height = 960,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

var color = ["#769656","#2d7066", "#8c6d31","#7b4173","#393b79","#843c39"];


var partition = d3.partition();

var totalSize = 0;

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


var svg = d3.select("#chart").append("svg:svg")
    .attr("viewBox", [0, 0, width, height])
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", `translate(${width / 2},${height / 2})`);

d3.json("Caissa.json").then(function(root) {
  
    var root = d3.hierarchy(root.Openings);
        root.sum(function(d) {  return d.children==false ? d.size : 0; });
        svg.selectAll("path")
            .data(partition(root).descendants())
            .enter().append("svg:path")
            .filter(function (d) {return (d.x1 - d.x0) > 0.002})
            .attr("d", arc)
            .style("fill", function(d){return evenOdd(d)})
            .on("mouseover", mouseover)
            .on("click", click);

    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = root.value;

    // Basic setup of page elements.
    initializeBreadcrumbTrail();
}).then()

function fillColor(d){
    if (d.data.title == ""){return "#fff"}
    else if (d.data.title.includes("x")){return color[5]}
    else if (d.data.title.includes("B")){return color[1]}
    else if (d.data.title.includes("N")){return color[2]}
    else if (d.data.title.includes("Q")){return color[3]}
    else if (d.data.title.includes("O")){return color[4]}
    else{return color [0]}

};

function evenOdd(d){
    var shade = d3.hsl(fillColor(d))

    if (d.depth === 0) {shade = shade;}
    else if (d.depth % 2 === 0) {shade = shade.darker(0.5);}
    else {shade = shade.brighter(0.5);}
    
    shade = shade.darker(d.depth * 0.1);
    return shade;
};

function click(d) {
    svg.transition()
        .duration(750)
        .tween("scale", function() {
          var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
              yd = d3.interpolate(y.domain(), [d.y0, 1]),
              yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
          return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
        })
      .selectAll("path")
        .filter(function (d) {return (d.x1 - d.x0) > 0.002})
        .attrTween("d", function(d) { return function() { return arc(d); }; });
};

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  var parentage = (100 * d.value / (d.parent ? d.parent : d).value).toPrecision(3);
  var parentageString = d.value;
  if (parentage < 0.1) {
    parentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(`${percentageString}`);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, parentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  svg.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(750)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

// // Given a node in a partition layout, return an array of all of its ancestor
// // nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, parentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.title + d.depth; })
      
  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g")
      .attr("transform", function(d) {return `translate(${(d.depth - 1) * (b.w + b.s)}, 0)`;})

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return evenOdd(d); });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.data.title; });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(formatNumber(parentageString));

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "visible");

}