import React, { useEffect } from 'react'
import { useState } from 'react';

// inspiré de https://tailwind-elements.com/docs/standard/components/button-group/

const Reseaux = ({itinerairesDataMAJ, setItinerairesDataMAJ}) => {
    const [selectSeason, setSeason] = useState(1); // 1 = Saisonnier, 2 = 4 saisons

    useEffect(() => {
        if (selectSeason === 1) {
          document.getElementById('btn-saisonnier').classList.add('bg-blue-500');
          document.getElementById('btn-saisonnier').classList.add('text-white');
          document.getElementById('btn-saisonnier').classList.remove('text-blue-600');
          document.getElementById('btn-4-saisons').classList.add('text-blue-600');
          document.getElementById('btn-4-saisons').classList.remove('bg-blue-500');
          document.getElementById('btn-4-saisons').classList.remove('text-white');
        } else {
            document.getElementById('btn-saisonnier').classList.remove('bg-blue-500');
            document.getElementById('btn-saisonnier').classList.remove('text-white');
            document.getElementById('btn-saisonnier').classList.add('text-blue-600');
            document.getElementById('btn-4-saisons').classList.remove('text-blue-600');
            document.getElementById('btn-4-saisons').classList.add('bg-blue-500');
            document.getElementById('btn-4-saisons').classList.add('text-white');
        }
    }, [selectSeason]);

    const handleSeasonChange = (e) => {
      if (e.target.value === '1') {
        setSeason(1);
      } else {
        setSeason(2);
      }
      setItinerairesDataMAJ({saison4: e.target.value, typeVoies: itinerairesDataMAJ.typeVoies});
    };

  
    return (
      <>
        <h3 className="text-l font-bold">Réseaux</h3>
        <div className="py-5">
          <div className="inline-flex" role="group">
            <button
              id="btn-saisonnier"
              type="button"
              className={`inline-block rounded-l border-2 border-blue-500 px-6 pb-[6px] pt-2 text-xs uppercase leading-normal text-blue-600 ease-in-out hover:underline hover:text-white hover:bg-blue-600`}
              data-te-ripple-init
              data-te-ripple-color="light"
              value="1"
              onClick={handleSeasonChange}
            >
              Saisonnier
            </button>
            <button
              id="btn-4-saisons"
              type="button"
              className={`-ml-0.5 inline-block border-2 border-blue-500 px-6 pb-[6px] pt-2 text-xs uppercase leading-normal text-blue-600 ease-in-out hover:underline hover:text-white hover:bg-blue-600`}
              data-te-ripple-init
              data-te-ripple-color="light"
              value="2"
              onClick={handleSeasonChange}
            >
              4 saisons
            </button>
          </div>
        </div>
      </>
    );
  };  
export default Reseaux