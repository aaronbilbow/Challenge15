// Import Leaflet and create a map
const map = L.map('map').setView([0, 0], 3); // Set the initial view

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Define depth ranges and corresponding colors
const depthRanges = [-11, 9, 29, 49, 69, 89];
const colors = ['#0000FF', '#CC0099', '#FFFF00', '#22FF44', '#FF6600', '#FF0000'];
// Function to determine marker color based on depth
function getColor(d) {
    for (let i = 0; i < depthRanges.length - 1; i++) {
        if (d >= depthRanges[i] && d < depthRanges[i + 1]) {
            return colors[i];
        }
    }
    // If the depth is outside all defined ranges, return the color for the last range.
    return colors[colors.length - 1];
}
// Fetch earthquake data from the selected USGS GeoJSON URL
const geoJSONURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
fetch(geoJSONURL)
    .then(response => response.json())
    .then(data => {
        // Loop through the earthquake data and create markers
        data.features.forEach(feature => {
            const coordinates = feature.geometry.coordinates;
            const magnitude = feature.properties.mag;
            const depth = coordinates[2];

            // Define marker size and color based on magnitude and depth
            const markerSize = magnitude * 6;
            const markerColor = getColor(depth);

            // Create a marker with a popup
            const marker = L.circleMarker([coordinates[1], coordinates[0]], {
                radius: markerSize,
                fillColor: markerColor,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5,
            }).addTo(map);

            // Add a popup with earthquake information
            marker.bindPopup(`
                <strong>Location:</strong> ${feature.properties.place}<br>
                <strong>Magnitude:</strong> ${magnitude}<br>
                <strong>Depth:</strong> ${depth} km <br>
                <strong>Co-Oridnates:</strong> ${coordinates}<br>

            `);
        });

        // Create a legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'legend-box');
            div.innerHTML = '<b>Legend</b><br>';

            for (let i = 0; i < depthRanges.length - 1; i++) {
                const color = colors[i];
                const range = `${depthRanges[i] + 1}-${depthRanges[i + 1]}`;

                // Add the legend content to the div
                div.innerHTML +=
                    `<i style="background:${color}; width: 20px; height: 20px; display: inline-block;"></i> ${range} km<br>`;
            }

            // Handle the range for depths of 91km and above
            const lastColor = colors[colors.length -1];
            const lastRange = `${depthRanges[depthRanges.length - 1] + 1}km +`;
            div.innerHTML += `<i style="background:${lastColor}; width: 20px; height: 20px; display: inline-block;"></i> ${lastRange}<br>`;

            return div;
        };

        // Add the legend to the map
        legend.addTo(map);



    });
