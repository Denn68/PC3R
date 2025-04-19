package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	_ "github.com/lib/pq"
)

// Structure pour les films
type Movie struct {
	Title       string   `json:"title"`
	Overview    string   `json:"overview"`
	ReleaseDate string   `json:"release_date"`
	PosterPath  string   `json:"poster_path"`
	AverageRate float64	 `json:"average_rate"`
	NbNote      int 	 `json:"nb_note"`
}

// Structure pour la réponse API de TMDb
type TMDbResponse struct {
	Results []Movie `json:"results"`
}

var apiKey = "7b69381946b3a49fc73a1da79e332a9f"

// Informations de connexion à la base de données PostgreSQL
var dbConfig = "user=postgres password=yourpassword dbname=films_db host=localhost sslmode=disable"

// Fonction pour récupérer les films populaires depuis TMDb
func getAllPopularMovies(apiKey string) ([]Movie, error) {
	var allMovies []Movie
	page := 1

	for {
		url := fmt.Sprintf("https://api.themoviedb.org/3/movie/popular?api_key=%s&page=%d", apiKey, page)
		resp, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		if resp.StatusCode == 200 {
			var tmdbResponse TMDbResponse
			if err := json.NewDecoder(resp.Body).Decode(&tmdbResponse); err != nil {
				return nil, err
			}
			allMovies = append(allMovies, tmdbResponse.Results...)

			// Limiter à 10 pages comme dans l'exemple Python
			if page >= 10 {
				break
			}
			page++
		} else {
			return nil, fmt.Errorf("API error: %s", resp.Status)
		}
	}

	return allMovies, nil
}

// Fonction pour insérer un film dans la base de données PostgreSQL
func insertMovieToDB(db *sql.DB, movie Movie) error {
	insertQuery := `
		INSERT INTO films (title, overview, release_date, category, poster_path)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (title) DO NOTHING;
	`

	// Convertir les genre_ids en une chaîne de caractères
	genreIds := fmt.Sprintf("%v", movie.GenreIds)

	_, err := db.Exec(insertQuery, movie.Title, movie.Overview, movie.ReleaseDate, genreIds, movie.PosterPath)
	return err
}

func main() {
	// Connexion à la base de données PostgreSQL
	db, err := sql.Open("postgres", dbConfig)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Récupérer tous les films populaires
	movies, err := getAllPopularMovies(apiKey)
	if err != nil {
		log.Fatal(err)
	}

	// Afficher les titres des films et les insérer dans la base de données
	for _, movie := range movies {
		fmt.Printf("Title: %s\n", movie.Title)
		fmt.Printf("Overview: %s\n", movie.Overview)
		fmt.Printf("Release Date: %s\n", movie.ReleaseDate)
		fmt.Println(strings.Repeat("-", 50))

		// Insérer le film dans la base de données
		if err := insertMovieToDB(db, movie); err != nil {
			log.Printf("Erreur lors de l'insertion du film '%s': %v\n", movie.Title, err)
		} else {
			fmt.Printf("Film '%s' inséré dans la base de données.\n", movie.Title)
		}
	}
}
