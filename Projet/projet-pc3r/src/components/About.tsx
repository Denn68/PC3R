import React from "react";

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h1>À propos du projet</h1>
      <p className="about-text">
        Ce projet a été réalisé dans le cadre de l’UE <strong>PC3R</strong> (Programmation Concurrente, Réactive, Répartie et Réticulaire).<br />
        L’objectif est de développer un site web permettant aux utilisateurs de rechercher des films grâce à l’API <strong>TMDb</strong>, de les noter, et de laisser des avis.
      </p>
      <img
        className="about-image"
        src="/assets/movie-night.jpg"
        alt="Soirée cinéma"
      />
      <p>
        Photo de Tima Miroshnichenko,{" "}
        <a
          href="https://www.pexels.com/photo/people-watching-a-movie-7991318/"
          className="about-link"
          aria-label="Voir sur Pexels"
          target="_blank"
          rel="noreferrer"
        >
          Voir sur Pexels
        </a>
      </p>
      <p className="about-text">
        L’application permet aux cinéphiles de partager leurs opinions, de consulter les avis des autres utilisateurs, et de découvrir les films les mieux notés par la communauté.
        C’est un projet fullstack combinant front-end, back-end et base de données, avec une architecture réactive et répartie.
      </p>
      <div className="about-spacing"></div>
    </div>
  );
};

export default About;
