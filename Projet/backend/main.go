package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	_ "github.com/lib/pq"
)

var db *sql.DB

type Category struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type FilmPreviews struct {
	Id          int     `json:"id"`
	Title       string  `json:"title"`
	ReleaseDate string  `json:"release_date"`
	Poster      []byte  `json:"poster"`
	AverageRate float64 `json:"average_rate"`
	NbRate      int     `json:"nb_rate"`
}

type Rate struct {
	Username string    `json:"username"`
	FilmID   int       `json:"film_id"`
	Rating   int       `json:"rating"`
	Notice   string    `json:"notice"`
	RatedAt  time.Time `json:"rated_at"`
}

type Film struct {
	Id          int      `json:"id"`
	Title       string   `json:"title"`
	ReleaseDate string   `json:"release_date"`
	Poster      []byte   `json:"poster"`
	AverageRate float64  `json:"average_rate"`
	NbRate      int      `json:"nb_rate"`
	Categories  []string `json:"categories"`
	Overview    string   `json:"overview"`
	Rates       []Rate   `json:"rates"`
}

type FilmByText struct {
	Id          int     `json:"id"`
	Title       string  `json:"title"`
	ReleaseDate string  `json:"release_date"`
	AverageRate float64 `json:"average_rate"`
}

func enableCors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Autoriser tous les domaines (pour le développement seulement)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Si c'est une requête préliminaire (preflight), on renvoie directement
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func connectToDB() (*sql.DB, error) {
	connStr := "user=postgres dbname=filmdb password=pc3rfilms host=localhost sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Println("Erreur de connexion à la base de données :", err)
		return nil, err
	}
	return db, db.Ping()
}

func fetchPoster(posterPath string) ([]byte, error) {
	fullURL := "https://image.tmdb.org/t/p/w500" + posterPath
	resp, err := http.Get(fullURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

func getCategoriesFromDB(db *sql.DB) ([]Category, error) {
	fmt.Println("Récupération des catégories depuis la base de données")
	rows, err := db.Query("SELECT * FROM categories")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var c Category
		if err := rows.Scan(&c.Id, &c.Name); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

func getCategories(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Récupération des catégories")
	categories, err := getCategoriesFromDB(db)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des catégories", http.StatusInternalServerError)
		return
	}
	fmt.Println("Catégories récupérées avec succès")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func getFilmsByCategoriesFromDB(db *sql.DB, categoryId int) ([]FilmPreviews, error) {
	rows, err := db.Query("SELECT film_id FROM film_categories WHERE category_id = $1", categoryId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var films []FilmPreviews
	for rows.Next() {
		var filmId int
		if err := rows.Scan(&filmId); err != nil {
			return nil, err
		}

		var film FilmPreviews
		var posterPath string
		err := db.QueryRow("SELECT id, title, release_date, poster_path, average_rate, nb_rate FROM films WHERE id = $1", filmId).
			Scan(&film.Id, &film.Title, &film.ReleaseDate, &posterPath, &film.AverageRate, &film.NbRate)
		if err != nil {
			return nil, err
		}

		film.Poster, err = fetchPoster(posterPath)
		if err != nil {
			return nil, err
		}
		films = append(films, film)
	}
	return films, nil
}

func getFilmsByCategories(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("category_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Paramètre 'category_id' invalide", http.StatusBadRequest)
		return
	}

	films, err := getFilmsByCategoriesFromDB(db, id)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(films)
}

func getFilmByIdFromDB(db *sql.DB, filmId int) (*Film, error) {
	var film Film
	var posterPath string

	err := db.QueryRow(`SELECT id, title, overview, release_date, poster_path, average_rate, nb_rate FROM films WHERE id = $1`, filmId).
		Scan(&film.Id, &film.Title, &film.Overview, &film.ReleaseDate, &posterPath, &film.AverageRate, &film.NbRate)
	if err != nil {
		return nil, err
	}

	film.Poster, err = fetchPoster(posterPath)
	if err != nil {
		return nil, err
	}

	// Catégories
	rows, err := db.Query("SELECT c.name FROM film_categories fc JOIN categories c ON fc.category_id = c.id WHERE fc.film_id = $1", filmId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		film.Categories = append(film.Categories, name)
	}

	// Notes
	ratingsRows, err := db.Query("SELECT user_id, rating, rated_at, notice FROM ratings WHERE film_id = $1", filmId)
	if err != nil {
		return nil, err
	}
	defer ratingsRows.Close()

	for ratingsRows.Next() {
		var r Rate
		if err := ratingsRows.Scan(&r.Username, &r.Rating, &r.RatedAt, &r.Notice); err != nil {
			return nil, err
		}
		r.FilmID = filmId
		film.Rates = append(film.Rates, r)
	}

	return &film, nil
}

func getFilmById(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("film_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Paramètre 'film_id' invalide", http.StatusBadRequest)
		return
	}

	film, err := getFilmByIdFromDB(db, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Film non trouvé: %v", err), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(film)
}

func getFilmByTextFromDB(db *sql.DB, text string) ([]FilmByText, error) {
	// Requête pour récupérer les 10 premiers films commençant par le texte donné
	rows, err := db.Query("SELECT id, title, release_date, average_rate FROM films WHERE title ILIKE $1 LIMIT 10", "%"+text+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var films []FilmByText
	for rows.Next() {
		var film FilmByText
		if err := rows.Scan(&film.Id, &film.Title, &film.ReleaseDate, &film.AverageRate); err != nil {
			return nil, err
		}
		films = append(films, film)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return films, nil
}

func getFilmByText(w http.ResponseWriter, r *http.Request) {
	text := r.URL.Query().Get("textInput")
	if text == "" {
		http.Error(w, "Paramètre 'textInput' manquant", http.StatusBadRequest)
		return
	}

	films, err := getFilmByTextFromDB(db, text)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération des films:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(films)
}

func getAccountFromDB(db *sql.DB, username string, password string) (string, error) {
	var userId string
	var hashedPassword []byte

	// On récupère le hash et l'id
	err := db.QueryRow("SELECT id, password_hash FROM users WHERE username = $1", username).Scan(&userId, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("utilisateur non trouvé")
		}
		return "", err
	}

	// Comparaison du mot de passe saisi avec le hash
	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
	if err != nil {
		return "", fmt.Errorf("mot de passe incorrect")
	}

	return userId, nil
}

func getAccount(w http.ResponseWriter, r *http.Request) {

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	passwordStr := r.URL.Query().Get("password")
	if passwordStr == "" {
		http.Error(w, "Paramètre 'password' manquant", http.StatusBadRequest)
		return
	}

	// Récupérer l'utilisateur' depuis la db
	userId, err := getAccountFromDB(db, usernameStr, passwordStr)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération du compte", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération du compte:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(userId); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func checkUsernameFromDB(db *sql.DB, username string) (string, error) {
	rows, err := db.Query("SELECT id FROM users WHERE username = $1", username)
	if err != nil {
		return "", err
	}
	defer rows.Close()
	var userId string
	if rows.Next() {
		if err := rows.Scan(&userId); err != nil {
			return "", err
		}
	} else {
		return "Username disponible", nil
	}
	return "Username déjà pris", nil
}

func checkUsername(w http.ResponseWriter, r *http.Request) {

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	// Récupérer l'utilisateur' depuis la db
	result, err := checkUsernameFromDB(db, usernameStr)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération du compte", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération du compte:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(result); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func createUserFromDB(db *sql.DB, username string, password string) (string, error) {
	usernameAvailable, err := checkUsernameFromDB(db, username)
	if err != nil {
		return "", err
	}
	if usernameAvailable != "Username disponible" {
		return "", fmt.Errorf("nom d'utilisateur déjà pris")
	}

	// Hash du mot de passe
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	// Génération de l'UUID
	userId := uuid.New().String()

	insertQuery := `
		INSERT INTO users (id, username, password_hash)
		VALUES ($1, $2, $3)
	`
	_, err = db.Exec(insertQuery, userId, username, passwordHash)
	if err != nil {
		return "", err
	}
	return userId, nil
}

func createUser(w http.ResponseWriter, r *http.Request) {

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	passwordStr := r.URL.Query().Get("password")
	if passwordStr == "" {
		http.Error(w, "Paramètre 'password' manquant", http.StatusBadRequest)
		return
	}

	// Récupérer l'utilisateur' depuis la db
	userId, err := createUserFromDB(db, usernameStr, passwordStr)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération du compte", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération du compte:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(userId); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func deleteUserFromDB(db *sql.DB, username string, password string) (string, error) {
	var userId string
	var passwordHash []byte

	// Récupération de l'ID et du hash
	err := db.QueryRow("SELECT id, password_hash FROM users WHERE username = $1", username).Scan(&userId, &passwordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("utilisateur non trouvé")
		}
		return "", err
	}

	// Vérification du mot de passe avec bcrypt
	err = bcrypt.CompareHashAndPassword(passwordHash, []byte(password))
	if err != nil {
		return "", fmt.Errorf("mot de passe incorrect")
	}

	// Suppression (en cascade dans les autres tables)
	_, err = db.Exec("DELETE FROM users WHERE id = $1", userId)
	if err != nil {
		return "", err
	}

	return "Utilisateur supprimé avec succès", nil
}

func deleteUser(w http.ResponseWriter, r *http.Request) {

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	passwordStr := r.URL.Query().Get("password")
	if passwordStr == "" {
		http.Error(w, "Paramètre 'password' manquant", http.StatusBadRequest)
		return
	}

	// Récupérer l'utilisateur' depuis la db
	errorMessage, err := deleteUserFromDB(db, usernameStr, passwordStr)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération du compte", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération du compte:", err)
		return
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(errorMessage); err != nil {
		http.Error(w, "Erreur d'encodage JSON", http.StatusInternalServerError)
		log.Println("Erreur d'encodage JSON:", err)
	}
}

func main() {
	var err error
	db, err = connectToDB()
	if err != nil {
		log.Fatal("Erreur de connexion à la base de données :", err)
	}
	defer db.Close()

	http.HandleFunc("/categories", enableCors(getCategories))
	http.HandleFunc("/categories/getFilms", enableCors(getFilmsByCategories))
	http.HandleFunc("/films/getById", enableCors(getFilmById))     // corrigé
	http.HandleFunc("/films/getByText", enableCors(getFilmByText)) // corrigé

	// Définir les routes pour user
	http.HandleFunc("/users/getAccount", enableCors(getAccount))       // Route pour récuperer un compte
	http.HandleFunc("/users/checkUsername", enableCors(checkUsername)) // Route pour supprimer un utilisateur
	http.HandleFunc("/users/create", enableCors(createUser))           // Route pour créer un utilisateur
	http.HandleFunc("/users/delete", enableCors(deleteUser))           // Route pour supprimer un utilisateur

	port := ":8080"
	fmt.Println("Serveur démarré sur http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
