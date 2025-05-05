import React, { useState, useEffect } from "react";
import PageSelector from "./subComponents/PageSelector";
import { useNavigate } from "react-router-dom";

interface Film {
  id: number;
  title: string;
  release_date: string;
  poster: string;
  average_rate: number;
}

// On ajoute "#" pour la catégorie spéciale "Autres"
const Letters = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default function Alphabetic() {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [nbPages, setNbPages] = useState<number>(1);

  useEffect(() => {
    if (selectedLetter) {
      fetch(`https://pc3r.onrender.com/films/getByAlphabetLetter?letter=${selectedLetter}&page=${pageNumber}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Films récupérés :", data);
          setFilms(data.films);
          setNbPages(data.nbPages);
        })
        .catch((err) => console.error("Erreur lors de la récupération des films :", err));
    }
  }, [selectedLetter, pageNumber]);

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setPageNumber(1); // Réinitialise la pagination
  };

  return (
    <div className="categories-container">
      <div className="content">
        <h1>Ordre alphabétique</h1>
      </div>

      <div className="categories-list">
        {Letters.map((letter) => (
          <div
            key={letter}
            className={selectedLetter === letter ? "category-item-selected" : "category-item"}
            onClick={() => handleLetterClick(letter)}
          >
            {letter === "#" ? "Autres" : letter}
          </div>
        ))}
      </div>

      <div className="films-list">
        {films.map((film) => (
          <div key={film.id} className="film-card" onClick={() => navigate(`/film/${film.id.toString()}`)}>
            <img src={"data:image/jpeg;base64," + film.poster} alt={film.title} className="film-poster" />
            <h3>{film.title}</h3>
            <p>Sortie : {new Date(film.release_date).toLocaleDateString("fr-FR")}</p>
            <p>Note moyenne : {film.average_rate}</p>
          </div>
        ))}
      </div>

      {selectedLetter && nbPages > 1 && (
        <PageSelector
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          nbPages={nbPages}
        />
      )}
    </div>
  );
}
