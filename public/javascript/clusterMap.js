maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.HYBRID,  // Or any other style
    center: [104.9909, 12.5657],
    zoom: 7
});

// GeoJSON validation
// if (!campgrounds || !campgrounds.features || campgrounds.features.length === 0) {
//     console.error("Campgrounds data is invalid or empty.");
//     return ;
// }

// Log to debug GeoJSON structure
console.log("Campgrounds GeoJSON Data:", campgrounds);

map.on('load', function () {
    console.log("Map Loaded");

    // Adding geojson data with clustering
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    // Clusters layer
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                0, '#FF0000',
                20, '#FFA500',
                40, '#FFFF00',
                60, '#00FF00'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                25,
                20,
                30,
                40,
                35
            ]
        }
    });

    // Cluster count label
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // Unclustered point (individual markers)
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // When a cluster is clicked, zoom in
    map.on('click', 'clusters', async (e) => {
        try {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom
            });
        } catch (error) {
            console.error("Error expanding cluster: ", error);
        }
    });

    // When an unclustered point (individual campground) is clicked
    map.on('click', 'unclustered-point', function (e) {
        const featureProperties = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Debug unclustered point properties
        console.log("Feature Properties:", featureProperties);

        // Adjust coordinates for wraparound
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const isMobile = window.innerWidth < 768;
        const popupWidth = isMobile ? '200px' : '250px';

        // Add fallback values for undefined or null properties
        const popUpContent = `
            <div style="max-width: ${popupWidth};">
                <h4 style="color: #007BFF; font-size: 16px;">${featureProperties.title || 'No Title Available'}</h4>
                <p><strong>Location:</strong> ${featureProperties.location || 'No Location Provided'}</p>
                <p><strong>Description:</strong> ${featureProperties.description || 'No Description Available'}</p>
                <p><strong>Price per night:</strong> $${featureProperties.price || 'N/A'}</p>
                <a href="/campgrounds/${featureProperties.id || '#'}" class="btn btn-primary btn-sm">View Details</a>
            </div>
        `;

        const popup = new maptilersdk.Popup({ closeButton: true });
        popup.setLngLat(coordinates).setHTML(popUpContent).addTo(map);
    });

    // Change cursor style when hovering over a cluster
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });

    // Change cursor style when hovering over unclustered points
    map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
    });
});

// Dynamic data loading (if applicable)
// Replace `/api/campgrounds` with your actual API endpoint
fetch('/campgrounds')
    .then(response => response.json())
    .then(data => {
        map.getSource('campgrounds').setData(data);
        console.log("Campgrounds data loaded:", data);
    })
    .catch(error => console.error("Error loading campgrounds data:", error));
