import React, {useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import Modal from 'react-modal';
import ItenerairesLegende from './ItinerairesLegende';


mapboxgl.accessToken = 'pk.eyJ1IjoibW91ZmVlcyIsImEiOiJjbG8yNmp2ZjAwNWE2MmtyM2QzMGxuNnNpIn0.yr4VRRrEZ6_BxHhjZUz11g';

export const ItenerairesCarte = ({itinerairesDataFiltred,itinerairesDataMAJ}) => {

	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	// Inspiré de => https://docs.mapbox.com/mapbox-gl-js/example/geojson-line/

	useEffect(() => {

		const map = new mapboxgl.Map({
		container: 'map',
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: 'mapbox://styles/mapbox/streets-v12',
		center: [-73.661645, 45.546783],
		zoom: 9.5
		});
		
		map.on('load', () => {
			map.addSource('route', {
				'type': 'geojson',
				'data': itinerairesDataFiltred // On met ici notre geojson
			});
			map.addLayer({
				'id': 'route',
				'type': 'line',
				'source': 'route',
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': ['get', 'COULEUR'], // On récupère la couleur de notre geojson grâce à la propriété COULEUR de chaque feature
					'line-width': 2
				}
			});
		});

		return () => {
			map.remove();
		};

	}, [itinerairesDataFiltred, itinerairesDataMAJ]);

  	return (
    	<div>
			<button onClick={openModal}>
			  	<i className="fa-solid fa-circle-info"></i>
			</button>

			<Modal
				isOpen={isModalOpen}
				onRequestClose={closeModal}
				contentLabel="Légende"
				className="border-2 border-solid p-5 bg-white rounded-l w-1/3 h-4/5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			>
				<ItenerairesLegende closeModal={closeModal}/>
			</Modal>
      		<div id="map" style={{ width: '100%', height: '500px' }}></div>
		</div>
  	)
}

export default ItenerairesCarte;