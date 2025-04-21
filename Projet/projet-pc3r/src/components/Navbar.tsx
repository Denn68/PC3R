import React from "react";
import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "./context/AuthContext";


const navLinkClasses = "text-neutral-500 hover:text-neutral-700 focus:text-neutral-700";
const navBarActiveFunc = ({ isActive }: { isActive: boolean }) =>
  isActive ? "active-nav-link " + navLinkClasses : navLinkClasses;

const Navbar: React.FC = () => {

  const { username } = useAuth();


  return (
    <nav className="navbar">
      <div className="flex items-center px-3">
        <NavLink to="/" className="logo">
          <i className="fas fa-home" style={{ fontSize: "28px", color: "#333" }}></i>
        </NavLink>
      </div>

      <div>
        <ul className="nav-list">
          <li className="nav-item">
            <SearchBar />
          </li>

          <li className="nav-item">
            <NavLink to="/itineraires" className={navBarActiveFunc}>
              Itinéraires
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/categories" className={navBarActiveFunc}>
              Catégories
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
          <NavLink to={username ? "/logout" : "/login"}>
            <span className="user-name">{username || "Connexion"}</span>
            <i className="fa-solid fa-user-ninja"></i>
          </NavLink>
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
