import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CarteCompteurs = ( {implantation, filtreNomCompteurs} ) => {

  //Montreal position
  const init_pos = [45.55, -73.561668]

  const [coordinates, setCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch coordinates from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/gti525/v1/compteurs?limite=1000&implantation=${implantation}&nom=${filtreNomCompteurs}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCoordinates(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [implantation, filtreNomCompteurs]);
  
  // Custom marker icon
  const customIcon = new Icon({
    iconUrl: 'assets/marker_icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  //inspired from https://www.youtube.com/watch?v=jD6813wGdBA&t=931s
  return (
    <div className='py-5 px-10'>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <MapContainer center={init_pos} zoom={10} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
  
          {/* Marekrs also change based on the implatation date */}
          {coordinates.data.map(coordinate => (
            <Marker
              position={[parseFloat(coordinate.Latitude), parseFloat(coordinate.Longitude)]}
              icon={customIcon}
              key={coordinate.id}
            >
              <Popup>
                <h2 className='font-bold'>
                  {coordinate.Nom}
                </h2>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
  
  };
export default CarteCompteurs