import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FilmSuggestion {
  id: number;
  title: string;
  release_date: string;
}

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<FilmSuggestion[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cacher la liste quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length === 0) {
      setFilteredSuggestions([]);
      setSearchTerm(value);
      return;
    }
    else {
      fetch(`https://pc3r.onrender.com/films/getByText?textInput=${value}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Données récupérées :", data);
          setFilteredSuggestions(data.map(
            (film: FilmSuggestion) => ({
              id: film.id,
              title: film.title,
              release_date: film.release_date,
            }))
          );
        })
        .catch((err) => console.error("Erreur lors de la récupération :", err));
      setSearchTerm(value);
    }
    const filtered = filteredSuggestions.filter((suggestion) =>
      suggestion.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  const handleSuggestionClick = (suggestion: FilmSuggestion) => {
    setSearchTerm(suggestion.title);
    setFilteredSuggestions([]);
    // Rediriger vers la page de détails du film
    navigate(`/film/${suggestion.id.toString()}`);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Rechercher un film..."
          className="search-input px-3 py-2 outline-none w-full"
          value={searchTerm}
          onChange={handleInputChange}
        />
        <button type="submit" className="search-btn px-3">
          <i className="fas fa-search text-gray-700"></i>
        </button>
      </form>

      {filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 left-0 top-full bg-white border border-gray-300 shadow-md w-full rounded-b-md max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="film-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.title} ({new Date(suggestion.release_date).toLocaleDateString("fr-FR")})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
