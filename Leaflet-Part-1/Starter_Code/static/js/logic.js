// Get JSON data from URL
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

fetch(url)
  .then(response => response.json())
  .then(data => {
    
    // Analyze and extract data 
    let earthquakeData = data.features;
    let earthquakeMarkers = [];

    for (let i = 0; i < earthquakeData.length; i++) {
      let earthquake = earthquakeData[i];
      let properties = earthquake.properties;
      let longitude = earthquake.geometry.coordinates[0];
      let latitude = earthquake.geometry.coordinates[1];
      let magnitude = properties.mag;
      let depth = properties.depth;
      let place = properties.place;
      // Change time format
      let time = new Date(properties.time).toLocaleString();
      earthquakeMarkers.push({ latitude, longitude, magnitude, depth, place, time });
    }

    // Create leaflet map
    let map = L.map("map").setView([earthquakeMarkers[0].latitude, earthquakeMarkers[0].longitude], 5);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // Add markers to the map
    for (let i = 0; i < earthquakeMarkers.length; i++) {
      let marker = earthquakeMarkers[i];
      let { latitude, longitude, magnitude, depth, place, time } = marker;

      // Set the marker size based on magnitude 
      let markerSize = magnitude * 2.5;

      // Set the marker color based on magnitude
      let magnitudeColor = markerColor(magnitude);

      L.circleMarker([latitude, longitude], {
        radius: markerSize,
        color: magnitudeColor,
        fillColor: magnitudeColor,
        fillOpacity: 0.85,
      })
      .bindPopup(`<b>Location:</b> ${place}<br><b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km<br><b>Time:</b> ${time}`)
      .addTo(map);
    }

    // Create legend 
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
      let div = L.DomUtil.create("div", "info legend");
      let magnitudes = [4.5, 5, 5.5, 6];
      let labels = [];

      // Add legend labels with color and magnitude 
      for (let i = 0; i < magnitudes.length; i++) {
        let magnitudeColor = markerColor(magnitudes[i]);
        labels.push(
          `<i style="background:${magnitudeColor}"></i> <span style="color:${magnitudeColor}">Magnitude ${magnitudes[i]}${magnitudes[i + 1] ? `&ndash;${magnitudes[i + 1]}` : "+"}</span>`
        );
      }
      div.innerHTML = labels.join("<br>");
      return div;
    };
    legend.addTo(map);
  })
  .catch(error => {
    console.error("Error fetching earthquake data:", error);
  });

// Function to change marker color based on magnitude
function markerColor(magnitude) {
  let color;

  if (magnitude >= 6) {
    color = "#6A0DAD";
  } else if (magnitude >= 5.5) {
    color = "darkorchid";
  } else if (magnitude >= 5) {
    color = "mediumpurple";
  } else {
    color = " #E6E6FA";
  }
  return color;
}
