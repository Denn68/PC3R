import requests
import psycopg2
from psycopg2 import Error

# Ta clé API TMDb
api_key = "7b69381946b3a49fc73a1da79e332a9f"

# Informations de connexion à ta base de données PostgreSQL
db_config = {
    'host': 'localhost',  # Adresse de ton serveur PostgreSQL
    'user': 'postgres',   # Utilisateur PostgreSQL
    'password': 'pc3rfilms',  # Ton mot de passe PostgreSQL
    'database': 'filmdb'  # Le nom de ta base de données
}

# Fonction pour récupérer les catégories de films
def get_all_categories(api_key):
    url = f"https://api.themoviedb.org/3/genre/movie/list?api_key={api_key}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data['genres']
    else:
        print(f"Erreur: {response.status_code}")
        return []

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

# Fonction pour insérer les catégories dans la base de données
def insert_categories_to_db(categories):
    connection = None
    try:
        # Connexion à la base de données PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Insérer les catégories dans la table categories
        insert_category_query = """
            INSERT INTO categories (id, name)
            VALUES (%s, %s)
            ON CONFLICT (id) DO NOTHING;
        """
        
        for category in categories:
            category_data = (category['id'], category['name'])
            cursor.execute(insert_category_query, category_data)
        
        connection.commit()
        print("Catégories insérées dans la base de données.\n")
    
    except Error as e:
        print(f"Erreur lors de l'insertion dans la base de données : {e}")
    
    finally:
        if connection:
            cursor.close()
            connection.close()

# Fonction pour insérer un film dans la base de données
def insert_movie_to_db(movie):
    connection = None
    try:
        print("Insertion film\n")
        # Connexion à la base de données PostgreSQL
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Insérer le film dans la table films et récupérer l'id
        insert_movie_query = """
            INSERT INTO films (title, overview, release_date, poster_path, average_rate, vote_count)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (title) DO NOTHING
            RETURNING id;
        """

        movie_data = (
            movie['title'], 
            movie['overview'], 
            movie['release_date'], 
            movie['poster_path'],
            movie.get('vote_average', 0),
            movie.get('vote_count', 0)
        )

        cursor.execute(insert_movie_query, movie_data)
        movie_id = cursor.fetchone()

        if movie_id:
            movie_id = movie_id[0]  # L'ID généré
        else:
            # Le film existait déjà, on le récupère avec une requête SELECT
            cursor.execute("SELECT id FROM films WHERE title = %s;", (movie['title'],))
            movie_id = cursor.fetchone()[0]

        connection.commit()
        
        print("Insertion avec catégorie.\n")

        # Insérer les catégories dans la table film_categories
        # Récupérer les genres à partir de l'API
        genre_ids = movie.get('genre_ids', [])
        for genre_id in genre_ids:
            # Insérer dans film_categories (on suppose que les catégories existent déjà dans ta DB)
            insert_category_query = """
                INSERT INTO film_categories (film_id, category_id)
                SELECT %s, %s
                WHERE EXISTS (SELECT 1 FROM categories WHERE id = %s);
            """
            cursor.execute(insert_category_query, (movie_id, genre_id, genre_id))
        
        connection.commit()
        print(f"Film '{movie['title']}' inséré dans la base de données.\n")
    
    except Error as e:
        print(f"Erreur lors de l'insertion dans la base de données : {e}")
    
    finally:
        if connection:
            cursor.close()
            connection.close()
            
# Récupérer toutes les catégories de films
categories = get_all_categories(api_key)
# Afficher les catégories récupérées et les insérer dans la base de données
for category in categories:
    print(f"Category ID: {category['id']}, Name: {category['name']}")
    # Insérer la catégorie dans la base de données
    insert_categories_to_db([category])

# Récupérer tous les films populaires
movies = get_all_popular_movies(api_key)

# Afficher les titres des films récupérés et les insérer dans la base de données
for movie in movies:
    print(f"Title: {movie['title']}")
    print(f"Overview: {movie['overview']}")
    print(f"Release Date: {movie['release_date']}")
    print('-' * 50)
    print(f"Vote : {movie.get('vote_average', 0)}")

    # Insérer le film dans la base de données
    insert_movie_to_db(movie)
