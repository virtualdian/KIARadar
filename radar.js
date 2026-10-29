// The MIT License (MIT)

// Copyright (c) 2017 Zalando SE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// Aangepast van de Wigo4it Duurzaamheidsradar (https://github.com/wigo4it/duurzaamheidsradar):
// vijf groepen (taartpunten) in plaats van vier kwadranten.

function radar_visualization(config) {

  const style = getComputedStyle(document.documentElement);

  config.svg_id = "radar";
  config.width = 1500;
  config.height = 1080;
  config.colors = {
    background: style.getPropertyValue('--kleur-achtergrond'),
    text: style.getPropertyValue('--kleur-tekst'),
    grid: style.getPropertyValue('--kleur-raster'),
    inactive: "#ddd",
    doing: style.getPropertyValue('--kleur-doing'),
    ongoing: style.getPropertyValue('--kleur-ongoing'),
    planning: style.getPropertyValue('--kleur-planning'),
    undoing: style.getPropertyValue('--kleur-undoing')
  };

  // groepen, met de klok mee vanaf linksboven
  config.quadrants = [
    { name: "Bestuur & Governance" },          //linksboven
    { name: "Mens & Gedrag" },                 //rechtsboven
    { name: "Collecties & Informatiebeheer" }, //rechts
    { name: "Infrastructuur & Hosting" },      //onder
    { name: "Digitale Diensten & Systemen" }   //links
  ];

  config.rings = [
    { name: "DOING", color: config.colors.doing, textColor: "white" },
    { name: "ONGOING", color: config.colors.ongoing, textColor: "black" },
    { name: "PLANNING", color: config.colors.planning, textColor: "white" },
    { name: "UNDOING", color: config.colors.undoing, textColor: "white" }
  ];
  config.print_layout = true;
  config.links_in_new_tabs = false;

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  var seed = 42;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function random_between(min, max) {
    return min + random() * (max - min);
  }

  function normal_between(min, max) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  // vijf taartpunten van 72 graden; de eerste begint op -162 graden (linksboven),
  // zodat er een grens precies op 12 uur ligt. radial_min / radial_max zijn veelvouden van PI
  const sector_count = config.quadrants.length;
  const quadrants = [];
  for (var q = 0; q < sector_count; q++) {
    quadrants.push({
      radial_min: -0.9 + q * 2 / sector_count,
      radial_max: -0.9 + (q + 1) * 2 / sector_count
    });
  }

  const rings = [
    { radius: 130 },
    { radius: 220 },
    { radius: 310 },
    { radius: 400 }
  ];

  const center = { x: config.width / 2, y: 480 };

  const title_offset =
    { x: -720, y: -460 };

  const footer_offset =
    { x: -720, y: 580 };

  // columns: 2 = ringen 0+1 en 2+3 onder elkaar, 4 = elke ring een eigen kolom
  const legend_offset = [
    { x: -720, y: -330, columns: 2 }, //linksboven
    { x: 430, y: -330, columns: 2 },  //rechtsboven
    { x: 430, y: 110, columns: 2 },   //rechtsonder
    { x: -310, y: 470, columns: 4 },  //onder
    { x: -720, y: 110, columns: 2 }   //linksonder
  ];

  function polar(cartesian) {
    var x = cartesian.x;
    var y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y)
    }
  }

  function cartesian(polar) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t)
    }
  }

  function bounded_interval(value, min, max) {
    var low = Math.min(min, max);
    var high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  // houd een punt binnen de straal en de hoek van een taartpunt (15px marge tot de grenzen)
  function bounded_segment(polar, t_min, t_max, r_min, r_max) {
    var r = bounded_interval(polar.r, r_min, r_max);
    var t_mid = (t_min + t_max) / 2;
    var half = (t_max - t_min) / 2 - Math.asin(Math.min(1, 15 / r));
    var delta = Math.atan2(Math.sin(polar.t - t_mid), Math.cos(polar.t - t_mid));
    return {
      t: t_mid + bounded_interval(delta, -half, half),
      r: r
    }
  }

  function segment(quadrant, ring) {
    var polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : rings[ring - 1].radius
    };
    var polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: rings[ring].radius
    };
    function clip(d) {
      return cartesian(bounded_segment(polar(d), polar_min.t, polar_max.t, polar_min.r + 15, polar_max.r - 15));
    }
    return {
      clipx: function (d) {
        d.x = clip(d).x; // adjust data too!
        return d.x;
      },
      clipy: function (d) {
        d.y = clip(d).y; // adjust data too!
        return d.y;
      },
      random: function () {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r)
        });
      }
    }
  }

  // position each entry randomly in its segment
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    entry.segment = segment(entry.quadrant, entry.ring);
    var point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color = entry.active || config.print_layout ?
      config.rings[entry.ring].color : config.colors.inactive;
    entry.textColor = config.rings[entry.ring].textColor;
  }

  // partition entries according to segments
  var segmented = new Array(sector_count);
  for (var quadrant = 0; quadrant < sector_count; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 4; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  // assign unique sequential id to each entry
  var id = 1;
  for (var quadrant = 0; quadrant < sector_count; quadrant++) {
    for (var ring = 0; ring < 4; ring++) {
      var entries = segmented[quadrant][ring];
      for (var i = 0; i < entries.length; i++) {
        entries[i].id = "" + id++;
      }
    }
  }

  function translate(x, y) {
    return "translate(" + x + "," + y + ")";
  }


  // schaalbaar via viewBox, zodat de radar ook op kleinere schermen past
  var svg = d3.select("svg#" + config.svg_id)
    .style("background-color", config.colors.background)
    .attr("viewBox", "0 0 " + config.width + " " + config.height)
    .style("width", "100%")
    .style("max-width", config.width + "px")
    .style("height", "auto");

  var radar = svg.append("g");
  radar.attr("transform", translate(center.x, center.y));

  var grid = radar.append("g");

  // draw grid lines: een spaak per grens tussen de taartpunten
  for (var q = 0; q < sector_count; q++) {
    var spoke = cartesian({ t: quadrants[q].radial_min * Math.PI, r: rings[3].radius });
    grid.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", spoke.x).attr("y2", spoke.y)
      .style("stroke", config.colors.grid)
      .style("stroke-width", 2);
  }

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  var defs = grid.append("defs");
  var filter = defs.append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood")
    .attr("flood-color", config.colors.text);
  filter.append("feComposite")
    .attr("in", "SourceGraphic");

  // draw rings
  for (var i = 0; i < rings.length; i++) {
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid)
      .style("stroke-width", 2);
    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("y", -rings[i].radius + 32)
        .attr("text-anchor", "middle")
        .style("fill", config.rings[i].color)
        .style("opacity", 0.75) //doorzichtigheid van de tekst in de ring
        .style("text-transform", "uppercase")
        .style("font-family", "Open Sans")
        .style("font-size", "20px")
        .style("font-weight", "900")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }

  function legend_transform(quadrant, ring, index = null) {
    var offset = legend_offset[quadrant];
    var dy = (index == null ? -16 : index * 12);
    var dx;
    if (offset.columns === 4) {
      dx = ring * 160; // ruimte tussen de legenda's
    } else {
      dx = ring < 2 ? 0 : 150; // ruimte tussen de legenda's
      if (ring % 2 === 1) {
        dy = dy + 36 + segmented[quadrant][ring - 1].length * 12;
      }
    }
    return translate(
      offset.x + dx,
      offset.y + dy
    );
  }

  // draw title and legend (only in print layout)
  if (config.print_layout) {

    // title
    radar
      .append("text")
      .attr("transform", translate(title_offset.x, title_offset.y + 20))
      .text(config.title || "")
      .style("font-family", "Open Sans")
      .style("font-size", "14")
      .style("fill", config.colors.text)

    // footer
    radar.append("text")
      .attr("transform", translate(footer_offset.x, footer_offset.y))
      .text("■ nieuw (bijdrage sinds 1 juli 2026)   ▲ verplaatst")
      .attr("xml:space", "preserve")
      .style("font-family", "Open Sans")
      .style("font-size", "10px")
      .style("fill", config.colors.text);

    // legend
    var legend = radar.append("g");
    for (var quadrant = 0; quadrant < sector_count; quadrant++) {
      legend.append("text")
        .attr("transform", translate(
          legend_offset[quadrant].x,
          legend_offset[quadrant].y - 45
        ))
        .text(config.quadrants[quadrant].name)
        .style("font-family", "Open Sans")
        .style("font-size", "18px")
        .style("font-weight", "900")
        .style("fill", config.colors.text);
      for (var ring = 0; ring < 4; ring++) {
        legend.append("text")
          .attr("transform", legend_transform(quadrant, ring))
          .text(config.rings[ring].name)
          .style("font-family", "Open Sans")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", config.rings[ring].color);
        legend.selectAll(".legend" + quadrant + ring)
          .data(segmented[quadrant][ring])
          .enter()
          .append("a")
          .attr("href", function (d, i) {
            return d.link ? d.link : "#"; // stay on same page if no link was provided
          })
          // Add a target if (and only if) there is a link and we want new tabs
          .attr("target", function (d, i) {
            return (d.link && config.links_in_new_tabs) ? "_blank" : null;
          })
          .append("text")
          .attr("transform", function (d, i) { return legend_transform(quadrant, ring, i); })
          .attr("class", "legend" + quadrant + ring)
          .attr("id", function (d, i) { return "legendItem" + d.id; })
          .text(function (d, i) {
            // Define a function to truncate text to a maximum length
            function truncateText(text, maxLength) {
              if (text.length > maxLength) {
                return text.substring(0, maxLength - 3) + "..."; // Subtract 3 for the ellipsis
              } else {
                return text;
              }
            }

            const maxLength = 28; //maximale lengte van de tekst
            const displayText = d.id + ". " + d.label;
            return truncateText(displayText, maxLength);
          })
          .style("font-family", "Open Sans")
          .style("font-size", "11px")
          .attr("fill", config.colors.text)
          .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
          .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); });
      }
    }
  }

  // layer for entries
  var rink = radar.append("g")
    .attr("id", "rink");

  // rollover bubble (on top of everything else)
  var bubble = radar.append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect")
    .attr("rx", 4)
    .attr("ry", 4)
    .style("fill", config.colors.text);
  bubble.append("text")
    .style("font-family", "Open Sans")
    .style("font-size", "10px")
    .style("fill", config.colors.background);
  bubble.append("path")
    .attr("d", "M 0,0 10,0 5,8 z")
    .style("fill", config.colors.text);

  function showBubble(d) {
    if (d.active || config.print_layout) {
      var tooltip = d3.select("#bubble text")
        .text(d.label); //hoover text
      var bbox = tooltip.node().getBBox();
      d3.select("#bubble")
        .attr("transform", translate(d.x - bbox.width / 2, d.y - 16))
        .style("opacity", 1);
      d3.select("#bubble rect")
        .attr("x", -5)
        .attr("y", -bbox.height)
        .attr("width", bbox.width + 10)
        .attr("height", bbox.height + 4);
      d3.select("#bubble path")
        .attr("transform", translate(bbox.width / 2 - 5, 3));
    }
  }

  function hideBubble(d) {
    var bubble = d3.select("#bubble")
      .attr("transform", translate(0, 0))
      .style("opacity", 0);
  }

  function highlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    legendItem.setAttribute("filter", "url(#solid)");
    legendItem.setAttribute("fill", config.colors.background);
  }

  function unhighlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    legendItem.removeAttribute("filter");
    legendItem.setAttribute("fill", config.colors.text);
  }

  // draw blips on radar
  var blips = rink.selectAll(".blip")
    .data(config.entries)
    .enter()
    .append("g")
    .attr("class", "blip")
    .attr("transform", function (d, i) { return legend_transform(d.quadrant, d.ring, i); })
    .on("mouseover", function (d) { showBubble(d); highlightLegendItem(d); })
    .on("mouseout", function (d) { hideBubble(d); unhighlightLegendItem(d); });

  // configure each blip
  blips.each(function (d) {
    var blip = d3.select(this);

    // blip link
    if ((d.active || config.print_layout) && d.hasOwnProperty("link") && d.link) {
      blip = blip.append("a")
        .attr("xlink:href", d.link);

      if (config.links_in_new_tabs) {
        blip.attr("target", "_blank");
      }
    }

    // blip shape
    if (d.status == 1) {
      blip.append("rect") //nieuw (vierkant)
        .attr("x", -7)       // x-coordinate of the top-left corner
        .attr("y", -6)       // y-coordinate of the top-left corner
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d.color);
    } else if (d.status == 2) {
      blip.append("path")
        .attr("d", "M -11,5 11,5 0,-13 z") // verplaatst (driehoek)
        .style("fill", d.color);
    } else {
      blip.append("circle")
        .attr("r", 9)
        .attr("fill", d.color);
    }
    // blip text
    if (d.active || config.print_layout) {
      var blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
      blip.append("text")
        .text(blip_text)
        .attr("y", 3)
        .attr("text-anchor", "middle")
        .style("fill", d.textColor)
        .style("font-family", "Open Sans")
        .style("font-size", function (d) { return blip_text.length > 2 ? "8px" : "9px"; })
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  });

  // make sure that blips stay inside their segment
  function ticked() {
    blips.attr("transform", function (d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    })
  }

  // distribute blips, while avoiding collisions
  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force("collision", d3.forceCollide().radius(12).strength(0.85))
    .on("tick", ticked);
}
