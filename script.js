// v6 - kaip pridėti žvaiždes, remtis https://ofrohn.github.io/data/stars.6.json ir sukurti stars.json nepamiršti suformatuoti
var config = {
  datapath: "https://ofrohn.github.io/data/",
  projection: "orthographic",
  background: { fill: "black", stroke: "#000000", opacity: 1, width: 4 },
  stars: { show: false }, 
    dsos: { show: false }, // Show deep-sky objects
    mw: { show: false }, // Style for the Milky Way
    constellations: { names: false, lines: false }, // Show constellation names and lines
    lines: { // Configuration for various lines
          graticule: { show: true, stroke:"#9999cc", width: 1.0, opacity:.3 }, // Graticule lines
          equatorial: { show: true, stroke:"#aaaaaa", width: 1.5, opacity:.4 }, // Equatorial lines
          ecliptic: { show: true, stroke:"#66cc66", width: 1.5, opacity:.4 } // Ecliptic lines
        },
    width: innerWidth - 100 // Width of the display area
}


// Additional settings for the star map
var limitMagnitude = 6, // Magnitude limit for stars
    radius = 1.2, // Radius of stars
    starColor = d3.scale.linear()
     .domain([-1.5, 0, limitMagnitude+1]) // Color scale for stars based on magnitude
     .range(['white', 'white', 'black'])

// Adding a celestial object
Celestial.add({
  type: "json", // Data type
  file: "https://ofrohn.github.io/data/stars." + limitMagnitude + ".json", // File to load

  callback: function(error, json) {
    if (error) return console.warn(error); // Log errors
    // Load and transform the geoJSON data
    var stars = Celestial.getData(json, config.transform);

    // Add stars to the celestial container
    Celestial.container.selectAll(".astars")
       .data(stars.features)
       .enter().append("path")
       .attr("class", "astar");    
    // Redraw to display changes
    Celestial.redraw();
  },

  redraw: function() {
    Celestial.context.globalAlpha = 1; // Set global alpha
    var indexColor = "#fff", planet;

    // Draw stars
    Celestial.container.selectAll(".astar").each(function(d) {
      if (Celestial.clip(d.geometry.coordinates)) { // Check if point is visible
        var pt = Celestial.mapProjection(d.geometry.coordinates); // Get point coordinates

        indexColor = Celestial.starColor(d); // Get star color
        starColor.range([indexColor, indexColor, 'black']); // Set color range
        Celestial.context.fillStyle = starColor(d.properties.mag); // Set fill style
        Celestial.context.beginPath(); // Begin path
        Celestial.context.arc(pt[0], pt[1], radius, 0, 2 * Math.PI); // Draw circle
        Celestial.context.closePath(); // Close path
        Celestial.context.fill(); // Fill the path
      }
    });
}});

// Display the celestial map with the given configuration
Celestial.display(config);


// v7 - kaip pridėti planetas ir erdvėlaikį, kad matytųsi planetos ir saulė, galima pakeisti jų dydį
var config = {
  datapath: "https://ofrohn.github.io/data/",
  projection: "orthographic",
  background: { fill: "black", stroke: "#000000", opacity: 1, width: 4 },
  stars: { show: false }, 
    dsos: { show: false }, // Show deep-sky objects
    mw: { show: false }, // Style for the Milky Way
    constellations: { names: false, lines: false }, // Show constellation names and lines
    lines: { // Configuration for various lines
          graticule: { show: true, stroke:"#9999cc", width: 1.0, opacity:.3 }, // Graticule lines
          equatorial: { show: true, stroke:"#aaaaaa", width: 1.5, opacity:.4 }, // Equatorial lines
          ecliptic: { show: true, stroke:"#66cc66", width: 1.5, opacity:.4 } // Ecliptic lines
        },
    width: innerWidth - 100 // Width of the display area
}

// Planet colors
var planets = {
  sol: "#ff0", // Sun
  lun: "#fff", // Moon
  mer: "#e2e2e2", // Mercury
  ven: "#f5f5f0", // Venus
  mar: "#efd1af", // Mars
  jup: "#e6e1df", // Jupiter
  sat: "#eddebc" // Saturn
};

// Additional settings for the star map
var limitMagnitude = 6, // Magnitude limit for stars
    radius = 1.2, // Radius of stars
    starColor = d3.scale.linear()
     .domain([-1.5, 0, limitMagnitude+1]) // Color scale for stars based on magnitude
     .range(['white', 'white', 'black']),
    dt = new Date(); // Current date and time

// Adding a celestial object
Celestial.add({
  type: "json", // Data type
  file: "https://ofrohn.github.io/data/stars." + limitMagnitude + ".json", // File to load

  callback: function(error, json) {
    if (error) return console.warn(error); // Log errors
    // Load and transform the geoJSON data
    var stars = Celestial.getData(json, config.transform);

    // Add stars to the celestial container
    Celestial.container.selectAll(".astars")
       .data(stars.features)
       .enter().append("path")
       .attr("class", "astar");    
    // Redraw to display changes
    Celestial.redraw();
  },

  redraw: function() {
    Celestial.context.globalAlpha = 1; // Set global alpha
    var indexColor = "#fff", planet;

    // Draw stars
    Celestial.container.selectAll(".astar").each(function(d) {
      if (Celestial.clip(d.geometry.coordinates)) { // Check if point is visible
        var pt = Celestial.mapProjection(d.geometry.coordinates); // Get point coordinates

        indexColor = Celestial.starColor(d); // Get star color
        starColor.range([indexColor, indexColor, 'black']); // Set color range
        Celestial.context.fillStyle = starColor(d.properties.mag); // Set fill style
        Celestial.context.beginPath(); // Begin path
        Celestial.context.arc(pt[0], pt[1], radius, 0, 2 * Math.PI); // Draw circle
        Celestial.context.closePath(); // Close path
        Celestial.context.fill(); // Fill the path
      }
    });

    // Draw planets
    if (!Celestial.origin) return;
    var o = Celestial.origin(dt).spherical();
    for (var key in planets) {
      var planet = Celestial.getPlanet(key, dt);
      if (!Celestial.clip(planet.ephemeris.pos)) continue;
      var pt = Celestial.mapProjection(planet.ephemeris.pos);
      if (key === "lun") {
        Celestial.symbol().type("crescent").size(110).age(planet.ephemeris.age).position(pt)(Celestial.context);
      } else {
        if (key === "sol") radius = 2;
        else radius = 1.2 - (planet.ephemeris.mag + 5) / 10;
        Celestial.context.fillStyle = planets[key];
        Celestial.context.beginPath();
        Celestial.context.arc(pt[0], pt[1], radius*2, 0, 2 * Math.PI);
        Celestial.context.closePath();
        Celestial.context.fill();
      }
    }
}});

// Display the celestial map with the given configuration
Celestial.display(config);

// Set the date for the celestial map
Celestial.date(dt);

// v8 - įjungiam viską
var config = {
  datapath: "https://ofrohn.github.io/data/",
  projection: "orthographic",
  background: { fill: "black", stroke: "#000000", opacity: 1, width: 4 },
  stars: { show: true }, 
    dsos: { show: true }, // Show deep-sky objects
    mw: { show: true }, // Style for the Milky Way
    constellations: { names: true, lines: true }, // Show constellation names and lines
    lines: { // Configuration for various lines
          graticule: { show: true, stroke:"#9999cc", width: 1.0, opacity:.3 }, // Graticule lines
          equatorial: { show: true, stroke:"#aaaaaa", width: 1.5, opacity:.4 }, // Equatorial lines
          ecliptic: { show: true, stroke:"#66cc66", width: 1.5, opacity:.4 } // Ecliptic lines
        },
    width: innerWidth - 100 // Width of the display area
}

// Planet colors
var planets = {
  sol: "#ff0", // Sun
  lun: "#fff", // Moon
  mer: "#e2e2e2", // Mercury
  ven: "#f5f5f0", // Venus
  mar: "#efd1af", // Mars
  jup: "#e6e1df", // Jupiter
  sat: "#eddebc" // Saturn
};

// Additional settings for the star map
var limitMagnitude = 6, // Magnitude limit for stars
    radius = 1.2, // Radius of stars
    starColor = d3.scale.linear()
     .domain([-1.5, 0, limitMagnitude+1]) // Color scale for stars based on magnitude
     .range(['white', 'white', 'black']),
    dt = new Date(); // Current date and time

// Adding a celestial object
Celestial.add({
  type: "json", // Data type
  file: "https://ofrohn.github.io/data/stars." + limitMagnitude + ".json", // File to load

  callback: function(error, json) {
    if (error) return console.warn(error); // Log errors
    // Load and transform the geoJSON data
    var stars = Celestial.getData(json, config.transform);

    // Add stars to the celestial container
    Celestial.container.selectAll(".astars")
       .data(stars.features)
       .enter().append("path")
       .attr("class", "astar");    
    // Redraw to display changes
    Celestial.redraw();
  },

  redraw: function() {
    Celestial.context.globalAlpha = 1; // Set global alpha
    var indexColor = "#fff", planet;

    // Draw stars
    Celestial.container.selectAll(".astar").each(function(d) {
      if (Celestial.clip(d.geometry.coordinates)) { // Check if point is visible
        var pt = Celestial.mapProjection(d.geometry.coordinates); // Get point coordinates

        indexColor = Celestial.starColor(d); // Get star color
        starColor.range([indexColor, indexColor, 'black']); // Set color range
        Celestial.context.fillStyle = starColor(d.properties.mag); // Set fill style
        Celestial.context.beginPath(); // Begin path
        Celestial.context.arc(pt[0], pt[1], radius, 0, 2 * Math.PI); // Draw circle
        Celestial.context.closePath(); // Close path
        Celestial.context.fill(); // Fill the path
      }
    });

    // Draw planets
    if (!Celestial.origin) return;
    var o = Celestial.origin(dt).spherical();
    for (var key in planets) {
      var planet = Celestial.getPlanet(key, dt);
      if (!Celestial.clip(planet.ephemeris.pos)) continue;
      var pt = Celestial.mapProjection(planet.ephemeris.pos);
      if (key === "lun") {
        Celestial.symbol().type("crescent").size(110).age(planet.ephemeris.age).position(pt)(Celestial.context);
      } else {
        if (key === "sol") radius = 2;
        else radius = 1.2 - (planet.ephemeris.mag + 5) / 10;
        Celestial.context.fillStyle = planets[key];
        Celestial.context.beginPath();
        Celestial.context.arc(pt[0], pt[1], radius*2, 0, 2 * Math.PI);
        Celestial.context.closePath();
        Celestial.context.fill();
      }
    }
}});

// Display the celestial map with the given configuration
Celestial.display(config);

// Set the date for the celestial map
Celestial.date(dt);
