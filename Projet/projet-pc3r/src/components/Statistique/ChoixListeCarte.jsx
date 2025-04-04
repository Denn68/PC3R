import React, { useEffect } from 'react'

const ChoixListeCarte = ( {choixListeCarte, setChoixListeCarte} ) => {

  useEffect(() => {
    if (choixListeCarte === 1) {
      document.getElementById('btn-liste-capteurs').classList.add('bg-blue-500');
      document.getElementById('btn-liste-capteurs').classList.add('text-white');
      document.getElementById('btn-liste-capteurs').classList.remove('text-blue-500');
      document.getElementById('btn-carte-capteurs').classList.add('text-blue-500');
      document.getElementById('btn-carte-capteurs').classList.remove('bg-blue-500');
      document.getElementById('btn-carte-capteurs').classList.remove('text-white');
    } else {
      document.getElementById('btn-liste-capteurs').classList.remove('bg-blue-500');
      document.getElementById('btn-liste-capteurs').classList.remove('text-white');
      document.getElementById('btn-liste-capteurs').classList.add('text-blue-500');
      document.getElementById('btn-carte-capteurs').classList.remove('text-blue-500');
      document.getElementById('btn-carte-capteurs').classList.add('bg-blue-500');
      document.getElementById('btn-carte-capteurs').classList.add('text-white');
    }
  }, [choixListeCarte]);

  return (
    <>
      <button
        type="button"
        id="btn-liste-capteurs"
        onClick={() => setChoixListeCarte(1)}
        className="mx-5 inline-block rounded-2xl border-2 border-blue-500 px-6 pb-[6px] pt-2 text-xs uppercase leading-normal text-blue-500 transition duration-150 ease-in-out hover:border-primary-600 hover:bg-blue-600 hover:text-white"
        data-te-ripple-init
      >
        Liste des capteurs
      </button>
      <button
        type="button"
        id="btn-carte-capteurs"
        onClick={() => setChoixListeCarte(2)}
        className="mx-5 inline-block rounded-2xl border-2 border-blue-500 px-6 pb-[6px] pt-2 text-xs uppercase leading-normal text-blue-500 transition duration-150 ease-in-out hover:border-primary-600 hover:bg-blue-600 hover:text-white"
        data-te-ripple-init
      >
        Carte
      </button>
    </>
  )
}

export default ChoixListeCarte