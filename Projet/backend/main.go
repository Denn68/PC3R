package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
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

type UserReturn struct {
	Id           string `json:"id"`
	MessageError string `json:"messageError"`
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

func methodHandler(method string, handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
			return
		}
		handler(w, r)
	}
}

func connectToDB() (*sql.DB, error) {
	connStr := "postgresql://filmdb_1s5v_user:MI2FmSsc1zWuyfGEmJEmf8fE69S3tNpp@dpg-d0bt4imuk2gs7384e86g-a/filmdb_1s5v"
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
	categories, err := getCategoriesFromDB(db)

	if err != nil {
		http.Error(w, "Erreur lors de la récupération des catégories", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func getFilmsByCategoriesFromDB(db *sql.DB, categoryId int, pageNumber int) ([]FilmPreviews, int, error) {
	const pageSize = 20
	offset := (pageNumber - 1) * pageSize

	// Compter le nombre total de films pour calculer le nombre de pages
	var totalFilms int
	err := db.QueryRow(`
		SELECT COUNT(*) 
		FROM film_categories 
		WHERE category_id = $1
	`, categoryId).Scan(&totalFilms)
	if err != nil {
		return nil, 0, err
	}
	nbPages := int(math.Ceil(float64(totalFilms) / float64(pageSize)))

	// Récupérer les films avec pagination
	rows, err := db.Query(`
		SELECT f.id, f.title, f.release_date, f.poster_path, f.average_rate, f.nb_rate
		FROM films f
		JOIN film_categories fc ON f.id = fc.film_id
		WHERE fc.category_id = $1
		ORDER BY f.release_date DESC
		LIMIT $2 OFFSET $3
	`, categoryId, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var films []FilmPreviews
	for rows.Next() {
		var film FilmPreviews
		var posterPath string

		err := rows.Scan(&film.Id, &film.Title, &film.ReleaseDate, &posterPath, &film.AverageRate, &film.NbRate)
		if err != nil {
			return nil, 0, err
		}

		film.Poster, err = fetchPoster(posterPath)
		if err != nil {
			return nil, 0, err
		}

		films = append(films, film)
	}

	return films, nbPages, nil
}

func getFilmsByCategories(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("category_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Paramètre 'category_id' invalide", http.StatusBadRequest)
		return
	}

	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		http.Error(w, "Paramètre 'page' manquant", http.StatusBadRequest)
		return
	}
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		http.Error(w, "Paramètre 'page' invalide", http.StatusBadRequest)
		return
	}

	films, nbPages, err := getFilmsByCategoriesFromDB(db, id, page)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		return
	}

	response := struct {
		Films   []FilmPreviews `json:"films"`
		NbPages int            `json:"nbPages"`
	}{
		Films:   films,
		NbPages: nbPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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
		var notice sql.NullString
		var userId string

		if err := ratingsRows.Scan(&userId, &r.Rating, &r.RatedAt, &notice); err != nil {
			return nil, err
		}
		r.FilmID = filmId

		err = db.QueryRow("SELECT username FROM users WHERE id = $1", userId).Scan(&r.Username)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, fmt.Errorf("utilisateur non trouvé")
			}
			return nil, err
		}

		if notice.Valid {
			r.Notice = notice.String
		} else {
			r.Notice = ""
		}

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

func getByAlphabetLetterFromDB(db *sql.DB, letter string, pageNumber int) ([]FilmPreviews, int, error) {
	const pageSize = 20
	offset := (pageNumber - 1) * pageSize

	var (
		rows       *sql.Rows
		totalFilms int
		err        error
	)

	if letter == "#" {
		// Comptage des films ne commençant PAS par une lettre (A-Z)
		err = db.QueryRow(`
			SELECT COUNT(*) 
			FROM films 
			WHERE LEFT(UPPER(title), 1) !~ '^[A-Z]'
		`).Scan(&totalFilms)
		if err != nil {
			return nil, 0, err
		}

		// Récupération des films correspondants
		rows, err = db.Query(`
			SELECT id, title, release_date, poster_path, average_rate, nb_rate
			FROM films 
			WHERE LEFT(UPPER(title), 1) !~ '^[A-Z]'
			ORDER BY title ASC
			LIMIT $1 OFFSET $2
		`, pageSize, offset)
	} else {
		// Comptage des films commençant par la lettre sélectionnée
		err = db.QueryRow(`
			SELECT COUNT(*) 
			FROM films 
			WHERE title ILIKE $1
		`, letter+"%").Scan(&totalFilms)
		if err != nil {
			return nil, 0, err
		}

		// Récupération des films correspondants
		rows, err = db.Query(`
			SELECT id, title, release_date, poster_path, average_rate, nb_rate
			FROM films 
			WHERE title ILIKE $1
			ORDER BY title ASC
			LIMIT $2 OFFSET $3
		`, letter+"%", pageSize, offset)
	}

	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	nbPages := int(math.Ceil(float64(totalFilms) / float64(pageSize)))
	var films []FilmPreviews

	for rows.Next() {
		var (
			film       FilmPreviews
			posterPath string
		)

		err := rows.Scan(&film.Id, &film.Title, &film.ReleaseDate, &posterPath, &film.AverageRate, &film.NbRate)
		if err != nil {
			return nil, 0, err
		}

		film.Poster, err = fetchPoster(posterPath)
		if err != nil {
			return nil, 0, err
		}

		films = append(films, film)
	}

	return films, nbPages, nil
}

func getByAlphabetLetter(w http.ResponseWriter, r *http.Request) {

	letter := r.URL.Query().Get("letter")
	if letter == "" {
		http.Error(w, "Paramètre 'letter' manquant", http.StatusBadRequest)
		return
	}

	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		http.Error(w, "Paramètre 'page' manquant", http.StatusBadRequest)
		return
	}
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		http.Error(w, "Paramètre 'page' invalide", http.StatusBadRequest)
		return
	}

	films, nbPages, err := getByAlphabetLetterFromDB(db, letter, page)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des films", http.StatusInternalServerError)
		return
	}

	response := struct {
		Films   []FilmPreviews `json:"films"`
		NbPages int            `json:"nbPages"`
	}{
		Films:   films,
		NbPages: nbPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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

func rateFilmFromDB(db *sql.DB, filmId int, username string, rating int, notice string) error {
	// Récupérer l'ID de l'utilisateur
	var userId string
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("utilisateur non trouvé")
		}
		return err
	}

	// Insérer la nouvelle note dans ratings
	_, err = db.Exec(`
		INSERT INTO ratings (user_id, film_id, rating, notice)
		VALUES ($1, $2, $3, $4)
	`, userId, filmId, rating, notice)
	if err != nil {
		return fmt.Errorf("erreur lors de l'insertion de la note : %v", err)
	}

	// Mettre à jour average_rate et nb_rate dans films
	_, err = db.Exec(`
		UPDATE films
		SET 
			average_rate = ROUND(((average_rate * nb_rate + $1) / (nb_rate + 1))::numeric, 1),
			nb_rate = nb_rate + 1
		WHERE id = $2
	`, rating, filmId)
	if err != nil {
		return fmt.Errorf("erreur lors de la mise à jour du film : %v", err)
	}

	return nil
}

func rateFilm(w http.ResponseWriter, r *http.Request) {

	filmIdStr := r.URL.Query().Get("film_id")
	filmId, err := strconv.Atoi(filmIdStr)
	if err != nil {
		http.Error(w, "Paramètre 'film_id' invalide", http.StatusBadRequest)
		return
	}

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	ratingStr := r.URL.Query().Get("rating")
	rating, err := strconv.Atoi(ratingStr)
	if err != nil {
		http.Error(w, "Paramètre 'rating' invalide", http.StatusBadRequest)
		return
	}

	noticeStr := r.URL.Query().Get("notice")

	err = rateFilmFromDB(db, filmId, usernameStr, rating, noticeStr)
	if err != nil {
		http.Error(w, "Erreur lors de la notation du film", http.StatusInternalServerError)
		log.Println("Erreur lors de la notation du film:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Film noté avec succès")
}

func checkIfRatedFromDB(db *sql.DB, filmId int, username string) (bool, error) {
	var userId string
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, fmt.Errorf("utilisateur non trouvé")
		}
		return false, err
	}

	var rated bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM ratings WHERE film_id = $1 AND user_id = $2)", filmId, userId).Scan(&rated)
	if err != nil {
		return false, err
	}

	return rated, nil
}

func checkIfRated(w http.ResponseWriter, r *http.Request) {

	filmIdStr := r.URL.Query().Get("film_id")
	filmId, err := strconv.Atoi(filmIdStr)
	if err != nil {
		http.Error(w, "Paramètre 'film_id' invalide", http.StatusBadRequest)
		return
	}

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	rated, err := checkIfRatedFromDB(db, filmId, usernameStr)
	if err != nil {
		http.Error(w, "Erreur lors de la vérification de la note", http.StatusInternalServerError)
		log.Println("Erreur lors de la vérification de la note:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rated)
}

func getRatingFromDB(db *sql.DB, filmId int, username string) (int, bool, error) {
	var userId string
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userId)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, false, nil
		}
		return 0, false, err
	}

	var rating int
	err = db.QueryRow("SELECT rating FROM ratings WHERE film_id = $1 AND user_id = $2", filmId, userId).Scan(&rating)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, false, nil
		}
		return 0, false, err
	}

	return rating, true, nil
}

func getRating(w http.ResponseWriter, r *http.Request) {

	filmIdStr := r.URL.Query().Get("film_id")
	filmId, err := strconv.Atoi(filmIdStr)
	if err != nil {
		http.Error(w, "Paramètre 'film_id' invalide", http.StatusBadRequest)
		return
	}

	usernameStr := r.URL.Query().Get("username")
	if usernameStr == "" {
		http.Error(w, "Paramètre 'username' manquant", http.StatusBadRequest)
		return
	}

	rating, found, err := getRatingFromDB(db, filmId, usernameStr)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération de la note", http.StatusInternalServerError)
		log.Println("Erreur lors de la récupération de la note:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if !found {
		// Tu peux aussi envoyer null à la place de 0 si tu préfères
		w.Write([]byte("null"))
		return
	}
	json.NewEncoder(w).Encode(rating)
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
		if err.Error() != "utilisateur non trouvé" && err.Error() != "mot de passe incorrect" {
			http.Error(w, "Erreur lors de la récupération du compte", http.StatusInternalServerError)
			log.Println("Erreur lors de la récupération du compte:", err)
			return
		}
	}

	var userIdReturn UserReturn
	if userId == "" {
		userIdReturn.MessageError = err.Error()
	} else {
		userIdReturn.Id = userId
	}

	// Définir l'en-tête de réponse pour JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encoder les films en JSON et les envoyer dans la réponse
	if err := json.NewEncoder(w).Encode(userIdReturn); err != nil {
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

	http.HandleFunc("/categories", enableCors(methodHandler("GET", getCategories)))
	http.HandleFunc("/categories/getFilms", enableCors(methodHandler("GET", getFilmsByCategories)))

	http.HandleFunc("/films/getById", enableCors(methodHandler("GET", getFilmById)))
	http.HandleFunc("/films/getByAlphabetLetter", enableCors(methodHandler("GET", getByAlphabetLetter)))
	http.HandleFunc("/films/getByText", enableCors(methodHandler("GET", getFilmByText)))
	http.HandleFunc("/films/rate", enableCors(methodHandler("POST", rateFilm)))
	http.HandleFunc("/films/checkIfRated", enableCors(methodHandler("POST", checkIfRated)))
	http.HandleFunc("/films/getRating", enableCors(methodHandler("POST", getRating)))

	http.HandleFunc("/users/getAccount", enableCors(methodHandler("POST", getAccount)))
	http.HandleFunc("/users/checkUsername", enableCors(methodHandler("POST", checkUsername)))
	http.HandleFunc("/users/create", enableCors(methodHandler("POST", createUser)))
	http.HandleFunc("/users/delete", enableCors(methodHandler("DELETE", deleteUser)))

	port := ":8080"
	fmt.Println("Serveur démarré sur http://localhost" + port)
	err = http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal("Erreur lors du démarrage du serveur :", err)
	}
	log.Println("Serveur arrêté")
}
