import React, { useState, useEffect } from "react";
import PageSelector from "./subComponents/PageSelector";

interface Category {
  id: number;
  name: string;
}

interface Film {
  id: number;
  title: string;
  release_date: string;
  poster: string;
  average_rate: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [nbPages, setNbPages] = useState<number>(1);

  useEffect(() => {
    fetch("https://pc3r.onrender.com/categories")
      .then((res) => res.json())
      .then((data) => {
        console.log("Données récupérées :", data);
        setCategories(data);
      })
      .catch((err) => console.error("Erreur lors de la récupération :", err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`https://pc3r.onrender.com/categories/getFilms?category_id=${selectedCategory.id}&page=${pageNumber}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Films récupérés :", data);
          setFilms(data.films);
          setNbPages(data.nbPages);
        })
        .catch((err) => console.error("Erreur lors de la récupération des films :", err));
    }
  }, [selectedCategory, pageNumber]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setPageNumber(1); // Reset page to 1 on category change
  };

  return (
    <div className="categories-container">
      <div className="content">
        <h1>Catégories<br /><span className="notice-count">Films triés par date de sortie</span></h1>
      </div>

      <div className="categories-list">
        {categories.map((category) => (
          <div
            key={category.id}
            className={selectedCategory?.id === category.id ? "category-item-selected" : "category-item"}
            onClick={() => handleCategoryClick(category)}
          >
            {category.name}
          </div>
        ))}
      </div>

      <div className="films-list">
        {films.map((film) => (
          <div key={film.id} className="film-card" onClick={() => window.location.href = `/film/${film.id}`}>
            <img src={"data:image/jpeg;base64," + film.poster} alt={film.title} className="film-poster" />
            <h3>{film.title}</h3>
            <p>Sortie : {new Date(film.release_date).toLocaleDateString("fr-FR")}</p>
            <p>Note moyenne : {film.average_rate}</p>
          </div>
        ))}
      </div>

      {selectedCategory && nbPages > 1 && (
        <PageSelector
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          nbPages={nbPages}
        />
      )}
    </div>
  );
}
