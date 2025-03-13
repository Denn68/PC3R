import requests
import psycopg2
from psycopg2 import Error

# Ta clé API TMDb
api_key = "7b69381946b3a49fc73a1da79e332a9f"

# Informations de connexion à ta base de données PostgreSQL
db_config = {
    'host': 'localhost',  # Adresse de ton serveur PostgreSQL
    'user': 'postgres',   # Utilisateur PostgreSQL
    'password': 'yourpassword',  # Ton mot de passe PostgreSQL
    'database': 'films_db'  # Le nom de ta base de données
}

# Fonction pour récupérer les films populaires
def get_all_popular_movies(api_key):
    all_movies = []
    page = 1
    while True:
        # URL de la requête pour les films populaires
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&page={page}"
        
        # Faire la requête HTTP
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            all_movies.extend(data['results'])  # Ajouter les films de cette page à la liste
            
            # Vérifier si nous avons atteint la dernière page
            if page >= 10:  # Limité à 10 pages (par exemple)
                break
            page += 1
        else:
            print(f"Erreur: {response.status_code}")
            break
            
    return all_movies

# Fonction pour insérer un film dans la base de données
def insert_movie_to_db(movie):
    try:
        # Connexion à la base de données PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Insérer le film dans la table films
        insert_movie_query = """
            INSERT INTO films (title, overview, release_date, category, poster_path)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (title) DO NOTHING;  # Pour éviter les doublons basés sur le titre
        """
        movie_data = (
            movie['title'], 
            movie['overview'], 
            movie['release_date'], 
            str(movie.get('genre_ids', [])),  # Catégorie : on peut l'encoder sous forme de texte (ex: liste de genres)
            movie['poster_path']
        )

        cursor.execute(insert_movie_query, movie_data)
        connection.commit()

        print(f"Film '{movie['title']}' inséré dans la base de données.")
    
    except Error as e:
        print(f"Erreur lors de l'insertion dans la base de données : {e}")
    
    finally:
        if connection:
            cursor.close()
            connection.close()

# Récupérer tous les films populaires
movies = get_all_popular_movies(api_key)

# Afficher les titres des films récupérés et les insérer dans la base de données
for movie in movies:
    print(f"Title: {movie['title']}")
    print(f"Overview: {movie['overview']}")
    print(f"Release Date: {movie['release_date']}")
    print('-' * 50)

    # Insérer le film dans la base de données
    insert_movie_to_db(movie)
