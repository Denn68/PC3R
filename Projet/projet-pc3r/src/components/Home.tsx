import React from "react";
import { NavLink } from "react-router-dom";

// Définir la fonction qui gère les classes de nav
const navLinkClasses = "nav-link";

const navBarActiveFunc = ({ isActive }: { isActive: boolean }) =>
  isActive ? "active-nav-link " + navLinkClasses : navLinkClasses;

export const Home: React.FC = () => (
  <div className="home-container">
    <h1>Home</h1>
    <img
      src="/assets/logo_website.jpg"
      alt="logo website"
    />
    <div className="nav-links">
      <NavLink to="/team" className={navBarActiveFunc}>
        Équipe
      </NavLink>
      <NavLink to="/about" className={navBarActiveFunc}>
        A propos
      </NavLink>
    </div>
  </div>
);

export default Home;
