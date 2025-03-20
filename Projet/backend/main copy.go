package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"github.com/google/uuid"

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

type User struct {
	Username    string
	Password 	string
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

func checkUsername(username string) (bool, error) {
	var exists bool

	// Requête SQL pour vérifier si le film avec l'ID existe
	query := "SELECT EXISTS(SELECT 1 FROM users WHERE user_id = $1 LIMIT 1);"

	// Exécuter la requête
	err := db.QueryRow(query, username).Scan(&exists)
	if err != nil {
		log.Error("Erreur lors de la vérification de l'existence du pseudo:", err)
		return nil, err
	}

	return !exists, nil
}

func createAccount(db *sql.DB, user User) (string, error) {
    insertQuery := `
        INSERT INTO users (user_id, username, password)
        VALUES ($1, $2, $3)
    `

    // Vérifier si le nom d'utilisateur est disponible
    nameAvailable := checkUsername(user.Username)
    if !nameAvailable {
        return "Username not available", nil
    }

    // Générer un UUID pour le user_id
    uuid := generateUUID()

    // Exécuter la requête d'insertion
    _, err := db.Exec(insertQuery, uuid, user.Username, user.Password)
    if err != nil {
        return "Error", err
    }

    return "OK", nil
}


func getAccount(db *sql.DB, user User) (string, error) {
    var user_id string

    // Requête pour récupérer l'ID de l'utilisateur
    query := "SELECT user_id FROM users WHERE username = $1 AND password = $2;"

    // Exécuter la requête
    err := db.QueryRow(query, user.Username, user.Password).Scan(&user_id)
    if err != nil {
        return "", err
    }

    return user_id, nil
}

func deleteAccount(db *sql.DB, id string) (string, error) {
    deleteQuery := "DELETE FROM users WHERE user_id = $1;"

    // Exécuter la requête de suppression
    res, err := db.Exec(deleteQuery, id)
    if err != nil {
        return "Error", err
    }

    // Vérifier si des lignes ont été supprimées
    rowsAffected, err := res.RowsAffected()
    if err != nil {
        return "Error", err
    }

    if rowsAffected == 0 {
        return "No user found with the provided ID", nil
    }

    return "User deleted successfully", nil
}

func getUserById(w http.ResponseWriter, r *http.Request) {

	usernameStr := r.URL.Query().Get("username")
	if categoryIdStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	passwordStr := r.URL.Query().Get("password")
	if categoryIdStr == "" {
		http.Error(w, "Paramètre 'password' manquant", http.StatusBadRequest)
		return
	}

	// Récupérer l'utilisateur' depuis la db
	user, err := getAccount(db, usernameStr, passwordStr)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération de l'utilisateur", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération de l'utilisateur:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func main() {
	db, err := connectToDB()
	if err != nil {
		http.Error(w, "Erreur de connexion à la base de données", http.StatusInternalServerError)
		log.Println("Erreur de connexion à la base de données:", err)
		return
	}
	defer db.Close()

	// Définir les routes
	http.HandleFunc("/", homeHandler)       // Route pour l'accueil
	http.HandleFunc("/about", aboutHandler) // Route pour 'À propos'
	http.HandleFunc("/contact", contactHandler) // Route pour 'Contact'

	// Définir les routes pour user
	http.HandleFunc("/users/getById", getUserById)  // Route pour récuperer un utilisateur par son id
	http.HandleFunc("/users/create", createUser) 	// Route pour créer un utilisateur
	http.HandleFund("/users/delete", deleteUser) 	// Route pour supprimer un utilisateur


	// Définir le port d'écoute
	port := ":8080"
	fmt.Printf("Serveur démarré sur http://localhost%s\n", port)

	// Démarrer le serveur HTTP
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Erreur lors du démarrage du serveur : ", err)
	}
}
