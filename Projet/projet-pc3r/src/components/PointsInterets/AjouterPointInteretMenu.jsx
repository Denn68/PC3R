import React from 'react'
import { NavLink } from 'react-router-dom'

const AjouterPointInteretMenu = () => {
  return (
    <ul className="submenu">
      <div className='border-2 rounded-md border-black bg-white hover:underline'>
      <li className='p-2'><NavLink to="/ajouter_points_interet">Ajouter </NavLink>
        <i className="fa-regular fa-square-plus"></i>
      </li>
      </div>
    </ul>
  )
}

export default AjouterPointInteretMenu