package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

// Structure pour stocker un film
type Film struct {
	ID       int
	Title    string
	Overview string
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

// Fonction pour récupérer les films depuis la base de données
func getFilmsFromDB(db *sql.DB) ([]Film, error) {
	// Requête SQL pour récupérer les films
	rows, err := db.Query("SELECT film_id, title, overview FROM films")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var films []Film

	// Parcours des résultats
	for rows.Next() {
		var film Film
		err := rows.Scan(&film.ID, &film.Title, &film.Overview)
		if err != nil {
			return nil, err
		}
		films = append(films, film)
	}

	return films, nil
}

// Fonction qui gère la route "/" et récupère les films de la base de données
func homeHandler(w http.ResponseWriter, r *http.Request) {
	// Connexion à la base de données
	db, err := connectToDB()
	if err != nil {
		http.Error(w, "Erreur de connexion à la base de données", http.StatusInternalServerError)
		log.Println("Erreur de connexion à la base de données:", err)
		return
	}
	defer db.Close()

	// Récupérer les films depuis la base de données
	films, err := getFilmsFromDB(db)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération des films:", err)
		return
	}
}

// Fonction qui gère la route "/about" et répond avec un message simple
func aboutHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Ceci est la page 'À propos'.")
}

// Fonction qui gère la route "/contact" et répond avec un message simple
func contactHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Ceci est la page 'Contact'.")
}

func main() {
	// Définir les routes
	http.HandleFunc("/", homeHandler)       // Route pour l'accueil
	http.HandleFunc("/about", aboutHandler) // Route pour 'À propos'
	http.HandleFunc("/contact", contactHandler) // Route pour 'Contact'

	// Définir le port d'écoute
	port := ":8080"
	fmt.Printf("Serveur démarré sur http://localhost%s\n", port)

	// Démarrer le serveur HTTP
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Erreur lors du démarrage du serveur : ", err)
	}
}
