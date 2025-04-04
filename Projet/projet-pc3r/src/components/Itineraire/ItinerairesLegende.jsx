export const ItenerairesLegende = ({closeModal}) => {
	
  	return (
    	<div>
			<h2 className="text-3xl font-bold text-center pt-5">Légende</h2>
			<div className="w-full h-1 bg-gray-300 my-3"></div>
			<ul>
      			<li>
					<div className="flex items-center">
						<div className="w-12 h-3 bg-cyan-400 rounded-full mr-2"></div>
						<p>
							<span className="font-bold">Le REV</span>
							<br/>Ensemble de pistes cyclables protégées qui relie
							<br/>divers points d'intérêt sur l'île de Montréal.
						</p>
					</div>
					<br/>
					<div className="flex items-center">
						<div className="w-12 h-3 bg-lime-500 rounded-full mr-2"></div>
						<p>
							<span className="font-bold">Voie partagée</span>
							<br/>Des pistes cyclables délimitées ou des rues partagées
							<br/>par les cyclistes et les automobilistes.
						</p>
					</div>
					<br/>
					<div className="flex items-center">
						<div className="w-12 h-3 bg-green-800 rounded-full mr-2"></div>
						<p>
							<span className="font-bold">Voie protégée</span>
							<br/>Une voie distincte, séparée d'un élément physique
							<br/>de la circulation motorisée.
						</p>
					</div>
					<br/>
					<div className="flex items-center">
						<div className="w-12 h-3 bg-fuchsia-500 rounded-full mr-2"></div>
						<p>
							<span className="font-bold">Sentier polyvalent</span>
							<br/>Un chemin en dehors de route ou le long de celle-ci,
							<br/>où les piétons et les cyclistes peuvent circuler.
						</p>
					</div>
      			</li>
    		</ul>
			<div className="w-full h-1 bg-gray-300 my-3"></div>
			<button
				onClick={closeModal}
				className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center absolute bottom-5 right-5`}
			>Fermer</button>
		</div>
  	)
}

export default ItenerairesLegende;