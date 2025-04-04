import React from "react";
import { NavLink } from "react-router-dom";

// Typage des classes et de la fonction active
const navLinkClasses =
  "text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 hover:underline";

// Typage de la fonction navBarActiveFunc
const navBarActiveFunc = ({ isActive }: { isActive: boolean }) =>
  isActive ? "active-nav-link " + navLinkClasses : navLinkClasses;

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="flex items-center px-3">
        <a href="/" className="flex items-center">
          <span className="h-7 w-7">
            <i className="fas fa-home"></i>{" "}
          </span>
          <p className="brand-text">GTI525</p>
        </a>
      </div>
      <div className="flex-grow">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/itineraires" className={navBarActiveFunc}>
              Itinéraires
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/statistiques" className={navBarActiveFunc}>
              Statistiques
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/points_interet" className={navBarActiveFunc}>
              Points d'intérêt
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="flex items-center">
        <button className="user-btn">
          <i className="fa-solid fa-user-ninja"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
