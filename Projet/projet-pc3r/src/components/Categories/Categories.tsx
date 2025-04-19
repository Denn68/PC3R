import React, { useState, useEffect, use } from "react";
import PageSelector from "./../subComponents/PageSelector";

interface Category {
  id: number;
  name: string;
  // ajoute d'autres champs ici si besoin
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

  useEffect(() => {
    fetch("http://localhost:8080/categories")
      .then((res) => res.json())
      .then((data) => {
        console.log("Données récupérées :", data);
        setCategories(data);
      })
      .catch((err) => console.error("Erreur lors de la récupération :", err));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`http://localhost:8080/categories/getFilms?category_id=${selectedCategory.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Films récupérés :", data);
          setFilms(data);
        })
        .catch((err) => console.error("Erreur lors de la récupération des films :", err));
    }
  }, [selectedCategory]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="categories-container">
      <div className="content">
        <h1>Catégories</h1>
        {/* Tu peux ajouter d'autres contenus ici */}
      </div>

      <div className="categories-list">
        {categories.map((category) => (
          <div key={category.id} className={selectedCategory?.id === category.id ? "category-item-selected" : "category-item"} onClick={() => handleCategoryClick(category)}>
            {category.name}
          </div>
        ))}
      </div>

      <div className="films-list">
        {films.map((film) => (
          <div key={film.id} className="film-card">
            <img src={"data:image/jpeg;base64," + film.poster} alt={film.title} className="film-poster" />
            <h3>{film.title}</h3>
            <p>Sortie : {new Date(film.release_date).toLocaleDateString("fr-FR")}</p>
            <p>Note moyenne : {film.average_rate}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
