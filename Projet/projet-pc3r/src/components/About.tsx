import React from "react";

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h1>À Propos du projet</h1>
      <p className="about-text">
        La mobilité urbaine est une nécessité pour les citoyens et citoyennes de notre ville. <br />
        Notre mission est de vous procurer le plus d'informations pour mieux planifier vos déplacements à l'intérieur de la ville.
      </p>
      <img
        className="about-image"
        src="/assets/a-propos.jpg"
        alt="vélo de proche"
      />
      <p>
        Photo de Tony,{" "}
        <a
          href="https://www.pexels.com/photo/black-mountain-bicycle-990113/"
          className="about-link"
          aria-label="Voir sur Pexels"
          target="_blank"
          rel="noreferrer"
        >
          Voir sur Pexels
        </a>
      </p>
      <p className="about-text">
        Nous vous proposons une série d'informations qu'on souhaite vous être utile pour vos déplacements quotidiens en vélo. <br />
        On vous encourage fortement à penser à planifier vos déplacements à l'avance et à limiter votre empreinte carbonique <br />
        tout en vous gardant en forme!
      </p>
      <div className="about-spacing"></div>
    </div>
  );
};

export default About;
