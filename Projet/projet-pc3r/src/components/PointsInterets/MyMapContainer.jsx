import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MyMapContainer = React.memo(({ selectedID, filtreArrondissement, isCarteOpen }) => {
    const [pointsInteret, setPointsInteret] = useState([]);
    const [currentPointInteret, setCurrentPointInteret] = useState(null); // Point d'intérêt sélectionné
    const mapRef = useRef(null);
    
    const blueIcon = L.icon({
        iconUrl: 'assets/blue_marker_icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    const redIcon = L.icon({
        iconUrl: 'assets/marker_icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

    // Get points of interest
    useEffect(() => {
        fetch(`http://localhost:8000/gti525/v1/pointsdinteret/tous`)
            .then((response) => response.json())
            .then((data) => {
                const filteredData = data.filter((pointInteret) => pointInteret.Arrondissement === filtreArrondissement);
                setPointsInteret(filteredData);
                setCurrentPointInteret(filteredData.filter((pointInteret) => pointInteret.ID === selectedID)[0]);
            });
    }, [filtreArrondissement, selectedID]);

    // Initialize the map
    useEffect(() => {
        let lon = -73.58781;
        let lat = 45.50884;
        if (currentPointInteret) {
            lon = currentPointInteret.Longitude;
            lat = currentPointInteret.Latitude;
        }
        if (!mapRef.current) {
            mapRef.current = L.map('map-container').setView([lat, lon], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 30,
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [currentPointInteret]);

    // Add markers to map
    useEffect(() => {
        if (mapRef.current) {
            // Clear existing markers
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    mapRef.current.removeLayer(layer);
                }
            });

            // Add new markers
            pointsInteret.forEach((point) => {
                L.marker([point.Latitude, point.Longitude], { icon: point.ID === selectedID ? redIcon : blueIcon })
                  .addTo(mapRef.current)
                  .bindPopup(point.ID.toString() + "\n" + point.Nom_parc_lieu);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pointsInteret, selectedID]);

    useEffect(() => {
        if (currentPointInteret && mapRef.current) {
            setTimeout(() => {
                mapRef.current.invalidateSize();
                mapRef.current.setView([currentPointInteret.Latitude, currentPointInteret.Longitude], 12);
            }, 100); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCarteOpen]);

    return (
        <div id="map-container" style={{ height: '500px', width: '800px' }}></div>
    );
});

export default MyMapContainer;
