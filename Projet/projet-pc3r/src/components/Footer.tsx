import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="http://facebook.com"
            target="_blank"
            className="footer-link"
          >
            <i className="footer-icon fab fa-facebook"></i>
          </Link>
          <Link to="http://twitter.com"
            target="_blank"
            className="footer-link"
          >
            <i className="footer-icon fab fa-x-twitter"></i>
          </Link>
          <Link
            to="https://github.com/Denn68/PC3R"
            target="_blank"
            className="footer-link"
          >
            <i className="footer-icon fab fa-github"></i>
          </Link>
        </div>
        <div className="footer-text">
          © 2025 PC3R Groupe Marsso - Mougamadoubougary
        </div>
      </div>
    </footer>
  );
};

export default Footer;
