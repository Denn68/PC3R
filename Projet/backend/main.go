package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

var db *sql.DB



// Structure pour stocker une catégorie
type Category struct {
	Id int `json:"id"`
	Name string `json:"name"`
}

type FilmPreviews struct {
    Id          int  `json:"id"` 
    Title       string  `json:"title"`
    ReleaseDate string  `json:"release_date"`
    Poster      []byte  `json:"poster"`
    AverageRate float64 `json:"average_rate"`
    NbRate      int     `json:"nb_rate"`
}

// Structure pour une note
type Rate struct {
	Username string `json:"username"` 
	FilmTitle int `json:"film_title"` 
	Rating int `json:"rating"` 
	Notice string `json:"notice"` 
	RatedAt time.Time `json:"rated_at"`
}

// Structure pour stocker un film
type Film struct {
	Id          int  `json:"id"` 
    Title       string  `json:"title"`
    ReleaseDate string  `json:"release_date"`
    Poster      []byte  `json:"poster"`
    AverageRate float64 `json:"average_rate"`
    NbRate      int     `json:"nb_rate"`
	Categories []string  `json:"categories"`
	Overview string `json:"overview"`
	Rates []Rate `json:"rates"`
}

// Fonction pour établir la connexion à la base de données
func connectToDB() (*sql.DB, error) {
	connStr := "user=postgres dbname=filmsdb password=ton_mot_de_passe host=localhost sslmode=disable"
	// Connexion à la base de données PostgreSQL
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Tester la connexion à la base de données
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}

func getCategoriesFromDB(db *sql.DB) ([]Category, error) {
	// Requête SQL pour récupérer les catégories distinctes
	rows, err := db.Query("SELECT * FROM categories")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []Category

	// Parcours des résultats
	for rows.Next() {
		var category Category
		if err := rows.Scan(&category.Id, &category.Name); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	return categories, nil
}

// Fonction qui récupere toutes les catégories disponibles
func getCategories(w http.ResponseWriter, r *http.Request) {
	
	// Récupérer les catégories depuis la db
	categories, err := getCategoriesFromDB(db)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des catégories", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération des catégories:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les catégories en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(categories); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func fetchPoster(posterPath string) ([]byte, error) {
	baseURL := "https://image.tmdb.org/t/p/w500"
	fullURL := baseURL + posterPath

	resp, err := http.Get(fullURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erreur HTTP: %d", resp.StatusCode)
	}

	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return imageData, nil
}

func getFilmsByCategoriesFromDB(db *sql.DB, categoryId int) ([]FilmPreviews, error) {
	
	// Requête SQL pour récupérer les id de films par catégories
	rows, err := db.Query("SELECT film_id FROM film_categories WHERE category_id = $1", categoryId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var filmsPreviews []FilmPreviews
	for rows.Next() {
		var filmId int
		if err := rows.Scan(&filmId); err != nil {
			return nil, err
		}

		var posterPath string
		// Récupérer les infos du film
		var film FilmPreviews
		err := db.QueryRow("SELECT film_id, title, release_date, poster_path, average_rate, nb_rate FROM films WHERE film_id = $1", filmId).
			Scan(&film.Id, &film.Title, &film.ReleaseDate, &posterPath, &film.AverageRate, &film.NbRate)
		if err != nil {
			return nil, err
		}

		// Télécharger le poster
		film.Poster, err = fetchPoster(posterPath)
		if err != nil {
			return nil, err
		}

		filmsPreviews = append(filmsPreviews, film)
	}
	return filmsPreviews, nil
}

func getFilmsByCategories(w http.ResponseWriter, r *http.Request) {

	categoryIdStr := r.URL.Query().Get("category_id")
	if categoryIdStr == "" {
		http.Error(w, "Paramètre 'category_id' manquant", http.StatusBadRequest)
		return
	}

	// Convertir `category_id` en `int`
	categoryId, err := strconv.Atoi(categoryIdStr)
	if err != nil {
		http.Error(w, "Paramètre 'category_id' invalide", http.StatusBadRequest)
		return
	}

	// Récupérer les films depuis la db
	filmPreviews, err := getFilmsByCategoriesFromDB(db, categoryId)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération des films:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(filmPreviews); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func getFilmByIdFromDB(db *sql.DB, filmId int) ([]FilmPreviews, error) {
	
	var film Film
	var posterPath string

    query := `SELECT film_id, title, overview, release_date, poster_path, average_rate, nb_rate 
              FROM films WHERE film_id = $1`

		
    err := db.QueryRow(query, filmID).Scan(&film.ID, &film.Title, &film.Overview, 
                                           &film.ReleaseDate, &posterPath, 
                                           &film.AverageRate, &film.NbRate)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("Aucun film trouvé avec l'ID %d", filmID)
        }
        return nil, err
    }

	var posterPath string
	// Récupérer les infos du film
	var film FilmPreviews
	err := db.QueryRow("SELECT film_id, title, release_date, poster_path, average_rate, nb_rate FROM films WHERE film_id = $1", filmId).
		Scan(&film.Id, &film.Title, &film.ReleaseDate, &posterPath, &film.AverageRate, &film.NbRate)
	if err != nil {
		return nil, err
	}

	// Télécharger le poster
	film.Poster, err = fetchPoster(posterPath)
	if err != nil {
		return nil, err
	}

	// Requête SQL pour récupérer les id de catégories du film
	rows, err := db.Query("SELECT category_id FROM film_categories WHERE film_id = $1", filmId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Récuperer les catégories
	var categories []Category
	for rows.Next() {
		var categoryId int
		if err := rows.Scan(&categoryId); err != nil {
			return nil, err
		}

		// Récupérer les infos de la catégorie
		var category Category
		err := db.QueryRow("SELECT id, name FROM categories WHERE category_id = $1", categoryId).
			Scan(&category.Id, &category.Name)
		if err != nil {
			return nil, err
		}
		
		categories = append(categories, category)
	}

	film.Categories = categories

	
	// Requête SQL pour récupérer les avis sur le films
	rows, err := db.Query("SELECT user_id, rating, rated_at, notice FROM ratings WHERE film_id = $1", filmId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// TODO: Récuperer les notes
	// Récuperer les notes
	var ratings []Rate

	// Récuperer les catégories
	var categories []Category
	for rows.Next() {
		var categoryId int
		if err := rows.Scan(&categoryId); err != nil {
			return nil, err
		}

		// Récupérer les infos de la catégorie
		var category Category
		err := db.QueryRow("SELECT id, name FROM categories WHERE category_id = $1", categoryId).
			Scan(&category.Id, &category.Name)
		if err != nil {
			return nil, err
		}
		
		categories = append(categories, category)
	}

	return filmsPreviews, nil
}

func getFilmById(w http.ResponseWriter, r *http.Request) {

	categoryIdStr := r.URL.Query().Get("category_id")
	if categoryIdStr == "" {
		http.Error(w, "Paramètre 'category_id' manquant", http.StatusBadRequest)
		return
	}

	// Convertir `category_id` en `int`
	categoryId, err := strconv.Atoi(categoryIdStr)
	if err != nil {
		http.Error(w, "Paramètre 'category_id' invalide", http.StatusBadRequest)
		return
	}

	// Récupérer les films depuis la db
	filmPreviews, err := getFilmsByCategoriesFromDB(db, categoryId)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération des films:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(filmPreviews); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func main() {
	// Connexion à la base de données
	db, err := connectToDB()
	if err != nil {
		log.Fatal("Erreur de connexion à la base de données :", err)
	}
	defer db.Close()

	// Définir les routes
	http.HandleFunc("/categories", getCategories)       // Route pour récuperer les catégories
	http.HandleFunc("/categories/getFilms", getFilmsByCategories) // Route pour récuperer les films par catégorie
	http.HandleFund("/films/getById", getFilmById) // Route pour récuperer un film par son id

	// Définir le port d'écoute
	port := ":8080"
	fmt.Printf("Serveur démarré sur http://localhost%s\n", port)

	// Démarrer le serveur HTTP
	if err = http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Erreur lors du démarrage du serveur : ", err)
	}
}
